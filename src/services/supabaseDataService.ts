import { getSupabaseClient, ensureSupabaseAuthSession } from './supabaseClient';
import { Product, Category, Order, StoreSettings, UserProfile, Review, WishlistRecord } from '../types';

export function generateSecureUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * ============================================================================
 * SERVICIO CENTRALIZADO DE ACCESO A DATOS (CRUD) EN SUPABASE POSTGRESQL
 * ============================================================================
 * Implementa mapeo bidireccional entre la nomenclatura camelCase de TypeScript
 * y la nomenclatura snake_case del esquema relacional validado en PostgreSQL.
 * Respeta todas las políticas de Row Level Security (RLS).
 */

// ============================================================================
// 1. CATEGORÍAS (CATEGORIES)
// ============================================================================

export async function fetchCategoriesFromSupabase(): Promise<Category[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('⚠️ Supabase fetch categories error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.image_url || '',
      parentId: c.parent_id || undefined,
      sortOrder: c.sort_order ?? 0,
    }));
  } catch (err) {
    console.warn('⚠️ Error communicating with Supabase for categories:', err);
    return null;
  }
}

// ============================================================================
// 2. PRODUCTOS (PRODUCTS) - CRUD COMPLETO
// ============================================================================

export async function fetchProductsFromSupabase(): Promise<Product[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('products')
      .select('*, categories (id, name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ Supabase fetch products error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.categories?.name || 'General',
      categorySlug: p.categories?.slug || 'general',
      price: Number(p.price),
      costPrice: p.cost_price ? Number(p.cost_price) : undefined,
      stock: Number(p.stock),
      stockThreshold: Number(p.stock_threshold ?? 5),
      brand: p.brand || undefined,
      supplier: p.supplier || undefined,
      unitMeasure: p.unit_measure || 'unidad',
      batchNumber: p.batch_number || undefined,
      expirationDate: p.expiration_date || undefined,
      storageLocation: p.storage_location || undefined,
      imageUrl: p.image_url,
      galleryUrls: Array.isArray(p.gallery_urls) ? p.gallery_urls : [],
      description: p.description || '',
      specifications: p.specifications || undefined,
      rating: Number(p.rating ?? 5.0),
      reviewsCount: Number(p.reviews_count ?? 0),
      isFeatured: Boolean(p.is_featured),
      isNew: Boolean(p.is_new),
      createdAt: p.created_at,
    }));
  } catch (err) {
    console.warn('⚠️ Error communicating with Supabase for products:', err);
    return null;
  }
}

export async function insertProductToSupabase(
  product: Omit<Product, 'id' | 'createdAt'>,
  categoryId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    // Si no se proporciona categoryId directo, buscar por slug
    let resolvedCategoryId = categoryId;
    if (!resolvedCategoryId && product.categorySlug) {
      const { data: cat } = await client
        .from('categories')
        .select('id')
        .eq('slug', product.categorySlug)
        .single();
      resolvedCategoryId = cat?.id;
    }

    // Fallback a primera categoría si no encuentra
    if (!resolvedCategoryId) {
      const { data: anyCat } = await client.from('categories').select('id').limit(1).single();
      resolvedCategoryId = anyCat?.id;
    }

    // Si aún no hay categoría registrada en Supabase, crear una automáticamente para no bloquear la subida
    if (!resolvedCategoryId) {
      const categoryName = product.category || 'Belleza y Cuidado';
      const categorySlug = product.categorySlug || 'belleza-cuidado';
      const { data: createdCat } = await client
        .from('categories')
        .insert({
          name: categoryName,
          slug: categorySlug,
          sort_order: 1,
          is_active: true,
        })
        .select('id')
        .single();
      resolvedCategoryId = createdCat?.id;
    }

    if (!resolvedCategoryId) {
      return { success: false, error: 'No se encontró ni pudo crearse una categoría en la base de datos.' };
    }

    const payload = {
      sku: product.sku,
      name: product.name,
      category_id: resolvedCategoryId,
      price: product.price,
      cost_price: product.costPrice ?? null,
      stock: product.stock,
      stock_threshold: product.stockThreshold ?? 5,
      brand: product.brand ?? null,
      supplier: product.supplier ?? null,
      unit_measure: product.unitMeasure || 'unidad',
      batch_number: product.batchNumber ?? null,
      expiration_date: product.expirationDate ?? null,
      storage_location: product.storageLocation ?? null,
      image_url: product.imageUrl,
      gallery_urls: product.galleryUrls || [],
      description: product.description || '',
      specifications: product.specifications ?? null,
      rating: product.rating ?? 5.0,
      reviews_count: product.reviewsCount ?? 0,
      is_featured: product.isFeatured ?? false,
      is_new: product.isNew ?? false,
      is_active: true,
    };

    const { data, error } = await client
      .from('products')
      .upsert(payload, { onConflict: 'sku' })
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Error inserting product in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateProductInSupabase(
  productId: string,
  updates: Partial<Product>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const payload: Record<string, any> = {};

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.costPrice !== undefined) payload.cost_price = updates.costPrice;
    if (updates.stock !== undefined) payload.stock = updates.stock;
    if (updates.stockThreshold !== undefined) payload.stock_threshold = updates.stockThreshold;
    if (updates.brand !== undefined) payload.brand = updates.brand;
    if (updates.supplier !== undefined) payload.supplier = updates.supplier;
    if (updates.unitMeasure !== undefined) payload.unit_measure = updates.unitMeasure;
    if (updates.batchNumber !== undefined) payload.batch_number = updates.batchNumber;
    if (updates.expirationDate !== undefined) payload.expiration_date = updates.expirationDate;
    if (updates.storageLocation !== undefined) payload.storage_location = updates.storageLocation;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.galleryUrls !== undefined) payload.gallery_urls = updates.galleryUrls;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.specifications !== undefined) payload.specifications = updates.specifications;
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
    if (updates.isNew !== undefined) payload.is_new = updates.isNew;

    // Solo actualizar si el id es un UUID válido (de Supabase)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    
    let query = client.from('products').update(payload);
    if (isUuid) {
      query = query.eq('id', productId);
    } else {
      query = query.eq('sku', updates.sku || '');
    }

    const { error } = await query;
    if (error) {
      console.warn('⚠️ Error updating product in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateProductStockInSupabase(
  productId: string,
  sku: string,
  newStock: number
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    
    let query = client.from('products').update({ stock: Math.max(0, newStock) });
    if (isUuid) {
      query = query.eq('id', productId);
    } else {
      query = query.eq('sku', sku);
    }

    const { error } = await query;
    if (error) {
      console.warn('⚠️ Error updating stock in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteProductFromSupabase(
  productId: string,
  sku?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    
    // En e-commerce se recomienda soft-delete (is_active = false) para no romper pedidos históricos
    let query = client.from('products').update({ is_active: false });
    if (isUuid) {
      query = query.eq('id', productId);
    } else if (sku) {
      query = query.eq('sku', sku);
    } else {
      return { success: false, error: 'Identificador de producto no válido' };
    }

    const { error } = await query;
    if (error) {
      console.warn('⚠️ Error deleting product in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Sube o migra masivamente las categorías y productos actuales a la base de datos Supabase.
 * Útil para cargar el inventario inicial a un proyecto nuevo de Supabase.
 */
export async function exportLocalCatalogToSupabase(
  categories: Category[],
  products: Product[]
): Promise<{ success: boolean; categoriesUploaded: number; productsUploaded: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, categoriesUploaded: 0, productsUploaded: 0, error: 'Cliente de Supabase no configurado' };

  try {
    // 1. Subir/Upsert de categorías
    const categoryMap: Record<string, string> = {};

    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const { data: upsertedCat, error: catErr } = await client
        .from('categories')
        .upsert(
          {
            name: cat.name,
            slug: cat.slug,
            image_url: cat.imageUrl || null,
            sort_order: i + 1,
            is_active: true,
          },
          { onConflict: 'slug' }
        )
        .select('id, slug')
        .single();

      if (!catErr && upsertedCat) {
        categoryMap[upsertedCat.slug] = upsertedCat.id;
      }
    }

    // Si no pudimos recuperar todos los IDs por upsert, hacer select general
    const { data: allRemoteCats } = await client.from('categories').select('id, slug');
    if (allRemoteCats) {
      allRemoteCats.forEach((c: any) => {
        categoryMap[c.slug] = c.id;
      });
    }

    const fallbackCatId = Object.values(categoryMap)[0];
    if (!fallbackCatId) {
      return { 
        success: false, 
        categoriesUploaded: 0, 
        productsUploaded: 0, 
        error: 'No se pudieron registrar las categorías en la base de datos. Verifica que la tabla "categories" exista y tenga RLS permisivo.' 
      };
    }

    // 2. Subir/Upsert de productos por SKU
    let productsUploaded = 0;
    for (const p of products) {
      const resolvedCatId = categoryMap[p.categorySlug] || fallbackCatId;

      const { error: prodErr } = await client
        .from('products')
        .upsert(
          {
            sku: p.sku,
            name: p.name,
            category_id: resolvedCatId,
            price: p.price,
            cost_price: p.costPrice ?? null,
            stock: p.stock,
            stock_threshold: p.stockThreshold ?? 5,
            brand: p.brand ?? null,
            supplier: p.supplier ?? null,
            unit_measure: p.unitMeasure || 'unidad',
            batch_number: p.batchNumber ?? null,
            expiration_date: p.expirationDate ?? null,
            storage_location: p.storageLocation ?? null,
            image_url: p.imageUrl,
            gallery_urls: p.galleryUrls || [],
            description: p.description || '',
            specifications: p.specifications ?? null,
            rating: p.rating ?? 5.0,
            reviews_count: p.reviewsCount ?? 0,
            is_featured: p.isFeatured ?? false,
            is_new: p.isNew ?? false,
            is_active: true,
          },
          { onConflict: 'sku' }
        );

      if (!prodErr) {
        productsUploaded++;
      } else {
        console.warn(`⚠️ Advertencia al subir producto ${p.sku}:`, prodErr.message);
      }
    }

    return {
      success: true,
      categoriesUploaded: Object.keys(categoryMap).length,
      productsUploaded,
    };
  } catch (err: any) {
    return {
      success: false,
      categoriesUploaded: 0,
      productsUploaded: 0,
      error: err?.message || String(err),
    };
  }
}

// ============================================================================
// 3. PEDIDOS (ORDERS & ORDER_ITEMS) - CREACIÓN Y CONSULTA
// ============================================================================

export async function fetchOrdersFromSupabase(): Promise<Order[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    await ensureSupabaseAuthSession();
    const { data, error } = await client
      .from('orders')
      .select('*, order_items (*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ Supabase fetch orders error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((o: any) => ({
      id: o.order_number || o.id,
      id_usuario: o.user_id || null,
      userId: o.user_id || null,
      customer: o.customer_name,
      phone: o.customer_phone,
      email: o.customer_email || undefined,
      city: o.shipping_city,
      department: o.shipping_department,
      address: o.shipping_address,
      additionalInfo: o.shipping_notes || '',
      documentId: o.customer_document_id || '',
      date: new Date(o.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date(o.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      createdAt: o.created_at,
      subtotal: Number(o.subtotal),
      shippingFee: Number(o.shipping_fee),
      total: Number(o.total),
      status: o.status,
      carrier: o.carrier || undefined,
      tracking: o.tracking_number || undefined,
      receiptUrl: o.receipt_url || undefined,
      receiptBank: o.receipt_bank || undefined,
      receiptRef: o.receipt_ref || undefined,
      receiptVerified: Boolean(o.receipt_verified),
      notes: o.admin_notes || undefined,
      items: (o.order_items || []).map((it: any) => ({
        productId: it.product_id || '',
        productName: it.product_name,
        sku: it.sku,
        imageUrl: it.image_url || '',
        unitPrice: Number(it.unit_price),
        quantity: Number(it.quantity),
        totalPrice: Number(it.total_price),
      })),
    }));
  } catch (err) {
    console.warn('⚠️ Error communicating with Supabase for orders:', err);
    return null;
  }
}

export async function insertOrderToSupabase(
  order: Order
): Promise<{ success: boolean; data?: any; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    // Generate UUID for order so we can reference it in order_items without calling .select()
    const isOrderUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.id);
    const orderUuid = isOrderUuid ? order.id : generateSecureUuid();

    // 1. Insertar Cabecera de Orden
    const orderPayload = {
      id: orderUuid,
      order_number: order.id,
      user_id: order.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.userId) 
        ? order.userId 
        : null,
      customer_name: order.customer,
      customer_email: order.email || null,
      customer_phone: order.phone,
      customer_document_id: order.documentId || null,
      shipping_department: order.department,
      shipping_city: order.city,
      shipping_address: order.address,
      shipping_notes: order.additionalInfo || null,
      subtotal: order.subtotal,
      shipping_fee: order.shippingFee,
      total: order.total,
      status: order.status || 'pending',
      payment_method: 'transferencia_whatsapp',
      receipt_url: order.receiptUrl || null,
      receipt_bank: order.receiptBank || null,
      receipt_ref: order.receiptRef || null,
      receipt_verified: order.receiptVerified ?? false,
      carrier: order.carrier || null,
      tracking_number: order.tracking || null,
      admin_notes: order.notes || null,
    };

    const { error: orderError } = await client
      .from('orders')
      .insert(orderPayload);

    if (orderError) {
      console.warn('⚠️ Error inserting order in Supabase:', orderError.message);
      return { success: false, error: orderError.message };
    }

    // 2. Insertar Detalles de Orden (order_items)
    if (order.items && order.items.length > 0) {
      const itemsPayload = order.items.map((item) => ({
        id: generateSecureUuid(),
        order_id: orderUuid,
        product_id: item.productId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.productId)
          ? item.productId
          : null,
        product_name: item.productName,
        sku: item.sku,
        image_url: item.imageUrl || null,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        total_price: item.totalPrice,
      }));

      const { error: itemsError } = await client
        .from('order_items')
        .insert(itemsPayload);

      if (itemsError) {
        console.warn('⚠️ Error inserting order_items in Supabase:', itemsError.message);
      }
    }

    return { success: true, data: { id: orderUuid, order_number: order.id } };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateOrderStatusInSupabase(
  orderNumber: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const { error } = await client
      .from('orders')
      .update({ status: newStatus })
      .eq('order_number', orderNumber);

    if (error) {
      console.warn('⚠️ Error updating order status in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateOrderPaymentVerificationInSupabase(
  orderNumber: string,
  verified: boolean
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const { error } = await client
      .from('orders')
      .update({
        receipt_verified: verified,
        status: verified ? 'paid' : 'pending',
      })
      .eq('order_number', orderNumber);

    if (error) {
      console.warn('⚠️ Error verifying payment in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function updateOrderShippingInSupabase(
  orderNumber: string,
  carrier: string,
  trackingNumber: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const { error } = await client
      .from('orders')
      .update({
        carrier,
        tracking_number: trackingNumber,
        status: trackingNumber ? 'shipped' : 'paid',
      })
      .eq('order_number', orderNumber);

    if (error) {
      console.warn('⚠️ Error updating shipping in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteOrderFromSupabase(
  orderIdentifier: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderIdentifier);
    let orderUuid = isUuid ? orderIdentifier : null;

    if (!orderUuid) {
      const { data: foundOrder } = await client
        .from('orders')
        .select('id')
        .eq('order_number', orderIdentifier)
        .maybeSingle();
      if (foundOrder?.id) {
        orderUuid = foundOrder.id;
      }
    }

    if (orderUuid) {
      // Eliminar items asociados por su UUID
      await client.from('order_items').delete().eq('order_id', orderUuid);
      const { error } = await client.from('orders').delete().eq('id', orderUuid);
      if (error) {
        console.warn('⚠️ Error deleting order in Supabase:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    // Fallback: eliminar directamente por order_number
    await client.from('order_items').delete().eq('order_id', orderIdentifier);
    const { error } = await client
      .from('orders')
      .delete()
      .eq('order_number', orderIdentifier);

    if (error) {
      console.warn('⚠️ Error deleting order in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ============================================================================
// 4. CONFIGURACIÓN DE LA TIENDA (STORE_SETTINGS)
// ============================================================================

export async function fetchStoreSettingsFromSupabase(): Promise<StoreSettings | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('store_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      storeName: data.store_name || 'Mujer Latina',
      storeSlogan: data.store_slogan || 'Belleza que Empodera',
      whatsappNumber: data.whatsapp_number || '573108924110',
      whatsappDisplay: data.whatsapp_display || '+57 310 892 4110',
      supportEmail: data.support_email || 'contacto@mujerlatina.com',
      supportPhone: data.support_phone || '+57 (300) 123-4567',
      storeAddress: data.store_address || 'Calle 10 # 40-20, El Poblado',
      storeCity: data.store_city || 'Medellín',
      storeDepartment: data.store_department || 'Antioquia',
      businessHours: data.business_hours || 'Lunes a Sábado: 8:00 AM - 7:00 PM',
      standardShippingFee: Number(data.standard_shipping_fee ?? 15000),
      freeShippingThreshold: Number(data.free_shipping_threshold ?? 150000),
      bannerEnabled: Boolean(data.banner_enabled),
      bannerText: data.banner_text || '',
      instagramUrl: data.instagram_url || 'https://instagram.com/mujerlatina.col',
      tiktokUrl: data.tiktok_url || 'https://tiktok.com/@mujerlatina',
      facebookUrl: data.facebook_url || 'https://facebook.com/mujerlatinabeauty',
    };
  } catch (err) {
    console.warn('⚠️ Error fetching store settings from Supabase:', err);
    return null;
  }
}

export async function updateStoreSettingsInSupabase(
  settings: Partial<StoreSettings>
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const payload: Record<string, any> = {};

    if (settings.storeName !== undefined) payload.store_name = settings.storeName;
    if (settings.storeSlogan !== undefined) payload.store_slogan = settings.storeSlogan;
    if (settings.whatsappNumber !== undefined) payload.whatsapp_number = settings.whatsappNumber;
    if (settings.whatsappDisplay !== undefined) payload.whatsapp_display = settings.whatsappDisplay;
    if (settings.supportEmail !== undefined) payload.support_email = settings.supportEmail;
    if (settings.supportPhone !== undefined) payload.support_phone = settings.supportPhone;
    if (settings.storeAddress !== undefined) payload.store_address = settings.storeAddress;
    if (settings.storeCity !== undefined) payload.store_city = settings.storeCity;
    if (settings.storeDepartment !== undefined) payload.store_department = settings.storeDepartment;
    if (settings.businessHours !== undefined) payload.business_hours = settings.businessHours;
    if (settings.standardShippingFee !== undefined) payload.standard_shipping_fee = settings.standardShippingFee;
    if (settings.freeShippingThreshold !== undefined) payload.free_shipping_threshold = settings.freeShippingThreshold;
    if (settings.bannerEnabled !== undefined) payload.banner_enabled = settings.bannerEnabled;
    if (settings.bannerText !== undefined) payload.banner_text = settings.bannerText;
    if (settings.instagramUrl !== undefined) payload.instagram_url = settings.instagramUrl;
    if (settings.tiktokUrl !== undefined) payload.tiktok_url = settings.tiktokUrl;
    if (settings.facebookUrl !== undefined) payload.facebook_url = settings.facebookUrl;

    const { error } = await client
      .from('store_settings')
      .update(payload)
      .eq('id', 1);

    if (error) {
      console.warn('⚠️ Error updating store settings in Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ============================================================================
// 5. PERFILES (PROFILES) - CONSULTA Y ACTUALIZACIÓN
// ============================================================================

export async function fetchProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      role: data.role,
      status: data.status,
      documentType: data.document_type || undefined,
      documentNumber: data.document_number || undefined,
      phone: data.phone || undefined,
      department: data.department || undefined,
      city: data.city || undefined,
      address: data.address || undefined,
      avatarUrl: data.avatar_url || undefined,
      memberSince: new Date(data.created_at).getFullYear().toString(),
      createdAt: data.created_at,
    };
  } catch {
    return null;
  }
}

export async function upsertProfileToSupabase(
  profile: UserProfile
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    await ensureSupabaseAuthSession();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.id);
    const profileId = isUuid ? profile.id : generateSecureUuid();

    const payload: Record<string, any> = {
      id: profileId,
      email: profile.email.toLowerCase().trim(),
      full_name: profile.fullName,
      role: profile.role || 'customer',
      status: profile.status || 'active',
      document_type: profile.documentType || 'CC',
      document_number: profile.documentNumber || null,
      phone: profile.phone || null,
      department: profile.department || 'Tolima',
      city: profile.city || 'Mariquita',
      address: profile.address || 'Barrio Centro',
      avatar_url: profile.avatarUrl || null,
    };

    const { error } = await client
      .from('profiles')
      .upsert(payload, { onConflict: 'email' });

    if (error) {
      console.warn('⚠️ Advertencia al guardar perfil en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function fetchProfilesFromSupabase(): Promise<UserProfile[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    await ensureSupabaseAuthSession();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      email: d.email,
      fullName: d.full_name,
      role: d.role,
      status: d.status,
      documentType: d.document_type || undefined,
      documentNumber: d.document_number || undefined,
      phone: d.phone || undefined,
      department: d.department || undefined,
      city: d.city || undefined,
      address: d.address || undefined,
      avatarUrl: d.avatar_url || undefined,
      memberSince: new Date(d.created_at || Date.now()).getFullYear().toString(),
      createdAt: d.created_at,
    }));
  } catch {
    return null;
  }
}

export async function deleteProfileFromSupabase(
  userIdOrEmail: string,
  email?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    await ensureSupabaseAuthSession();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrEmail);
    const cleanEmail = (email || (!isUuid ? userIdOrEmail : '')).toLowerCase().trim();

    // Resolver UUID en profiles si existe por id o por email para desvincular llaves foráneas sin borrar pedidos/reseñas/favoritos
    let targetUuid: string | null = isUuid ? userIdOrEmail : null;
    if (!targetUuid && cleanEmail) {
      const { data: existingProfile } = await client
        .from('profiles')
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle();
      if (existingProfile?.id) {
        targetUuid = existingProfile.id;
      }
    }

    if (targetUuid) {
      // Desvincular user_id (SET NULL) para conservar pedidos, reseñas y favoritos intactos
      await client.from('orders').update({ user_id: null }).eq('user_id', targetUuid);
      await client.from('reviews').update({ user_id: null }).eq('user_id', targetUuid);
      await client.from('wishlist').update({ user_id: null }).eq('user_id', targetUuid);

      const { error: idErr } = await client.from('profiles').delete().eq('id', targetUuid);
      if (idErr) {
        console.warn('⚠️ Error al eliminar perfil por ID en Supabase:', idErr.message);
        return { success: false, error: idErr.message };
      }
    }

    if (cleanEmail) {
      const { error: emailErr } = await client.from('profiles').delete().eq('email', cleanEmail);
      if (emailErr) {
        console.warn('⚠️ Error al eliminar perfil por email en Supabase:', emailErr.message);
        return { success: false, error: emailErr.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ============================================================================
// 6. RESEÑAS DE PRODUCTO (REVIEWS)
// ============================================================================

export async function fetchReviewsFromSupabase(): Promise<Review[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    await ensureSupabaseAuthSession();
    const { data, error } = await client
      .from('reviews')
      .select('*, products(id, name, sku)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('⚠️ Error al consultar reviews en Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.products?.name,
      productSku: r.products?.sku,
      customerName: r.customer_name || 'Cliente Verificado',
      userEmail: r.user_email || undefined,
      rating: Number(r.rating || 5),
      comment: r.comment || '',
      createdAt: r.created_at,
      isVerifiedPurchase: Boolean(r.is_verified_purchase ?? true),
      isApproved: Boolean(r.is_approved ?? true),
    }));
  } catch (err) {
    console.warn('⚠️ Error communicating with Supabase for reviews:', err);
    return null;
  }
}

export async function insertReviewToSupabase(
  review: Review,
  fallbackProductSku?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    await ensureSupabaseAuthSession();
    let resolvedProductId = review.productId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedProductId);
    if (!isUuid) {
      const skuToSearch = review.productSku || fallbackProductSku;
      if (skuToSearch) {
        const { data: prod } = await client
          .from('products')
          .select('id')
          .eq('sku', skuToSearch)
          .maybeSingle();
        if (prod?.id) {
          resolvedProductId = prod.id;
        }
      }
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedProductId)) {
      const { data: anyProd } = await client.from('products').select('id').limit(1).maybeSingle();
      if (anyProd?.id) {
        resolvedProductId = anyProd.id;
      }
    }

    const isReviewUuid = review.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(review.id);
    const reviewId = isReviewUuid ? review.id : generateSecureUuid();

    const payload: any = {
      id: reviewId,
      product_id: resolvedProductId,
      customer_name: review.customerName,
      rating: Math.min(5, Math.max(1, review.rating)),
      comment: review.comment,
      is_approved: true,
      is_verified_purchase: review.isVerifiedPurchase ?? true,
    };

    const { error } = await client.from('reviews').insert(payload);
    if (error) {
      console.warn('⚠️ Error al insertar reseña en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: payload };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ============================================================================
// 7. LISTA DE DESEOS (WISHLIST_ITEMS)
// ============================================================================

export async function fetchWishlistFromSupabase(userId?: string): Promise<WishlistRecord[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    await ensureSupabaseAuthSession();
    let query = client.from('wishlist_items').select('*, products(id, name, sku, price, image_url)');
    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('⚠️ Error al consultar wishlist_items en Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) return null;

    return data.map((w: any) => ({
      id: w.id,
      userId: w.user_id,
      userEmail: w.user_email || undefined,
      userName: w.user_name || undefined,
      productId: w.product_id,
      productName: w.products?.name || 'Producto Mujer Latina',
      productSku: w.products?.sku,
      productPrice: Number(w.products?.price || 0),
      imageUrl: w.products?.image_url,
      addedAt: w.created_at || new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('⚠️ Error communicating with Supabase for wishlist_items:', err);
    return null;
  }
}

export async function insertWishlistToSupabase(
  item: WishlistRecord,
  fallbackProductSku?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    await ensureSupabaseAuthSession();
    let resolvedProductId = item.productId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedProductId);
    if (!isUuid) {
      const skuToSearch = item.productSku || fallbackProductSku;
      if (skuToSearch) {
        const { data: prod } = await client
          .from('products')
          .select('id')
          .eq('sku', skuToSearch)
          .maybeSingle();
        if (prod?.id) {
          resolvedProductId = prod.id;
        }
      }
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resolvedProductId)) {
      const { data: anyProd } = await client.from('products').select('id').limit(1).maybeSingle();
      if (anyProd?.id) {
        resolvedProductId = anyProd.id;
      }
    }

    const isUserUuid = item.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.userId);
    const isItemUuid = item.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
    const wishId = isItemUuid ? item.id : generateSecureUuid();

    const payload: any = {
      id: wishId,
      product_id: resolvedProductId,
      user_id: isUserUuid ? item.userId : null,
    };

    const { error } = await client.from('wishlist_items').insert(payload);
    if (error) {
      console.warn('⚠️ Error al insertar wishlist_item en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: payload };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

export async function deleteWishlistFromSupabase(
  productId: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    await ensureSupabaseAuthSession();
    let query = client.from('wishlist_items').delete();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    if (isUuid) {
      query = query.eq('product_id', productId);
    }
    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) {
      console.warn('⚠️ Error al eliminar wishlist_item en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

// ============================================================================
// 8. EXPORTACIONES MASIVAS Y SINCRONIZACIÓN DE BASE DE DATOS
// ============================================================================

export async function exportOrdersToSupabase(
  ordersList: Order[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Cliente de Supabase no configurado' };

  let successCount = 0;
  for (const ord of ordersList) {
    const res = await insertOrderToSupabase(ord);
    if (res.success) {
      successCount++;
    }
  }

  return { success: successCount > 0, count: successCount };
}

export async function exportProfilesToSupabase(
  profilesList: UserProfile[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Cliente de Supabase no configurado' };

  let successCount = 0;
  for (const prof of profilesList) {
    const res = await upsertProfileToSupabase(prof);
    if (res.success) {
      successCount++;
    }
  }

  return { success: successCount > 0, count: successCount };
}

export async function exportReviewsToSupabase(
  reviewsList: Review[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Cliente de Supabase no configurado' };

  let successCount = 0;
  for (const rev of reviewsList) {
    const res = await insertReviewToSupabase(rev);
    if (res.success) {
      successCount++;
    }
  }

  return { success: successCount > 0, count: successCount };
}

export async function exportWishlistToSupabase(
  items: WishlistRecord[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Cliente de Supabase no configurado' };

  let successCount = 0;
  for (const item of items) {
    const res = await insertWishlistToSupabase(item);
    if (res.success) {
      successCount++;
    }
  }

  return { success: successCount > 0, count: successCount };
}

export async function fetchSupabaseTableCounts(): Promise<{
  products: number;
  categories: number;
  orders: number;
  profiles: number;
  reviews: number;
  wishlist: number;
}> {
  const client = getSupabaseClient();
  if (!client) return { products: 0, categories: 0, orders: 0, profiles: 0, reviews: 0, wishlist: 0 };
  try {
    await ensureSupabaseAuthSession();
    const [p, c, o, pr, r, w] = await Promise.all([
      client.from('products').select('*', { count: 'exact', head: true }),
      client.from('categories').select('*', { count: 'exact', head: true }),
      client.from('orders').select('*', { count: 'exact', head: true }),
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('reviews').select('*', { count: 'exact', head: true }),
      client.from('wishlist_items').select('*', { count: 'exact', head: true }),
    ]);
    return {
      products: p.count ?? 0,
      categories: c.count ?? 0,
      orders: o.count ?? 0,
      profiles: pr.count ?? 0,
      reviews: r.count ?? 0,
      wishlist: w.count ?? 0,
    };
  } catch (e) {
    console.warn('Error fetching table counts:', e);
    return { products: 0, categories: 0, orders: 0, profiles: 0, reviews: 0, wishlist: 0 };
  }
}

import { getSupabaseClient } from './supabaseClient';
import { Product, Category, Order, StoreSettings, UserProfile } from '../types';

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
    // 1. Insertar Cabecera de Orden
    const orderPayload = {
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

    const { data: createdOrder, error: orderError } = await client
      .from('orders')
      .insert(orderPayload)
      .select('id, order_number')
      .single();

    if (orderError) {
      console.warn('⚠️ Error inserting order in Supabase:', orderError.message);
      return { success: false, error: orderError.message };
    }

    // 2. Insertar Detalles de Orden (order_items)
    if (order.items && order.items.length > 0 && createdOrder?.id) {
      const itemsPayload = order.items.map((item) => ({
        order_id: createdOrder.id,
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

    return { success: true, data: createdOrder };
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
    const payload: Record<string, any> = {
      email: profile.email.toLowerCase(),
      full_name: profile.fullName,
      role: profile.role || 'customer',
      status: profile.status || 'active',
      document_type: profile.documentType || null,
      document_number: profile.documentNumber || null,
      phone: profile.phone || null,
      department: profile.department || null,
      city: profile.city || null,
      address: profile.address || null,
      avatar_url: profile.avatarUrl || null,
    };

    // Si el ID es un UUID válido de Supabase, incluirlo en la clave primaria
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profile.id);
    if (isUuid) {
      payload.id = profile.id;
    }

    const { error } = await client
      .from('profiles')
      .upsert(payload, { onConflict: isUuid ? 'id' : 'email' });

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
  userIdOrEmail: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Cliente de Supabase no disponible' };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userIdOrEmail);
    const query = client.from('profiles').delete();
    const { error } = isUuid
      ? await query.eq('id', userIdOrEmail)
      : await query.eq('email', userIdOrEmail.toLowerCase().trim());

    if (error) {
      console.warn('⚠️ Error al eliminar perfil en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || String(err) };
  }
}

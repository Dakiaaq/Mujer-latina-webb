/**
 * Catálogo oficial de Departamentos y Municipios principales de Colombia
 * Utilizado para formularios de Registro, Perfil, Checkout y Despachos.
 */

export const COLOMBIA_LOCATIONS: Record<string, string[]> = {
  'Amazonas': ['Leticia', 'Puerto Nariño'],
  'Antioquia': [
    'Medellín',
    'Bello',
    'Itagüí',
    'Envigado',
    'Rionegro',
    'Sabaneta',
    'Apartadó',
    'Caldas',
    'Copacabana',
    'La Estrella',
    'Caucasia',
    'Marinilla',
    'Turbo',
    'Guarne',
    'Santa Rosa de Osos'
  ],
  'Arauca': ['Arauca', 'Saravena', 'Tame', 'Arauquita'],
  'Atlántico': [
    'Barranquilla',
    'Soledad',
    'Malambo',
    'Sabanalarga',
    'Puerto Colombia',
    'Galapa',
    'Baranoa'
  ],
  'Bogotá D.C.': ['Bogotá'],
  'Bolívar': [
    'Cartagena',
    'Magangué',
    'Turbaco',
    'Arjona',
    'El Carmen de Bolívar',
    'Mompós'
  ],
  'Boyacá': [
    'Tunja',
    'Duitama',
    'Sogamoso',
    'Chiquinquirá',
    'Villa de Leyva',
    'Paipa',
    'Puerto Boyacá',
    'Moniquirá'
  ],
  'Caldas': [
    'Manizales',
    'La Dorada',
    'Chinchiná',
    'Villamaría',
    'Riosucio',
    'Anserma',
    'Salamina'
  ],
  'Caquetá': ['Florencia', 'San Vicente del Caguán', 'Cartagena del Chairá'],
  'Casanare': ['Yopal', 'Aguazul', 'Villanueva', 'Tauramena', 'Paz de Ariporo'],
  'Cauca': [
    'Popayán',
    'Santander de Quilichao',
    'Puerto Tejada',
    'Patía',
    'Piendamó',
    'Guachené'
  ],
  'Cesar': [
    'Valledupar',
    'Aguachica',
    'Agustín Codazzi',
    'Bosconia',
    'La Jagua de Ibirico'
  ],
  'Chocó': ['Quibdó', 'Istmina', 'Condoto', 'Tadó', 'Acandí'],
  'Córdoba': [
    'Montería',
    'Cereté',
    'Sahagún',
    'Lorica',
    'Montelíbano',
    'Planeta Rica',
    'Ciénaga de Oro'
  ],
  'Cundinamarca': [
    'Soacha',
    'Chía',
    'Zipaquirá',
    'Facatativá',
    'Fusagasugá',
    'Mosquera',
    'Madrid',
    'Funza',
    'Girardot',
    'Cajicá',
    'Cota',
    'Tocancipá',
    'Sopó',
    'La Calera',
    'Tabio',
    'Tenjo',
    'Gachancipá',
    'Ubaté',
    'Villeta'
  ],
  'Guainía': ['Inírida'],
  'Guaviare': ['San José del Guaviare', 'El Retorno'],
  'Huila': [
    'Neiva',
    'Pitalito',
    'Garzón',
    'La Plata',
    'Campoalegre',
    'San Agustín',
    'Palermo'
  ],
  'La Guajira': [
    'Riohacha',
    'Maicao',
    'Uribia',
    'San Juan del Cesar',
    'Fonseca',
    'Manaure'
  ],
  'Magdalena': [
    'Santa Marta',
    'Ciénaga',
    'Fundación',
    'El Banco',
    'Plato',
    'Aracataca'
  ],
  'Meta': [
    'Villavicencio',
    'Acacías',
    'Granada',
    'Puerto López',
    'San Martín',
    'Cumaral'
  ],
  'Nariño': [
    'Pasto',
    'Tumaco',
    'Ipiales',
    'Túquerres',
    'La Unión',
    'Samaniego'
  ],
  'Norte de Santander': [
    'Cúcuta',
    'Ocaña',
    'Villa del Rosario',
    'Los Patios',
    'Pamplona',
    'Tibú'
  ],
  'Putumayo': ['Mocoa', 'Puerto Asís', 'Orito', 'Valle del Guamuez', 'Villagarzón'],
  'Quindío': [
    'Armenia',
    'Calarcá',
    'Montenegro',
    'La Tebaida',
    'Quimbaya',
    'Circasia',
    'Salento'
  ],
  'Risaralda': [
    'Pereira',
    'Dosquebradas',
    'Santa Rosa de Cabal',
    'La Virginia',
    'Belén de Umbría'
  ],
  'San Andrés y Providencia': ['San Andrés', 'Providencia'],
  'Santander': [
    'Bucaramanga',
    'Floridablanca',
    'Girón',
    'Piedecuesta',
    'Barrancabermeja',
    'San Gil',
    'Socorro',
    'Lebrija',
    'Barbosa',
    'Rionegro',
    'Málaga'
  ],
  'Sucre': [
    'Sincelejo',
    'Corozal',
    'San Marcos',
    'San Onofre',
    'Tolú',
    'Sampués'
  ],
  'Tolima': [
    'Ibagué',
    'Espinal',
    'Melgar',
    'Chaparral',
    'Mariquita',
    'Honda',
    'Líbano',
    'Flandes',
    'Fresno',
    'Guamo'
  ],
  'Valle del Cauca': [
    'Cali',
    'Buenaventura',
    'Palmira',
    'Tuluá',
    'Yumbo',
    'Cartago',
    'Jamundí',
    'Buga',
    'Candelaria',
    'Florida',
    'Pradera',
    'Zarzal',
    'Roldanillo',
    'Sevilla'
  ],
  'Vaupés': ['Mitú'],
  'Vichada': ['Puerto Carreño', 'La Primavera', 'Cumaribo'],
};

export const COLOMBIA_DEPARTMENTS: string[] = Object.keys(COLOMBIA_LOCATIONS).sort((a, b) =>
  a.localeCompare(b, 'es')
);

export function getCitiesForDepartment(departmentName: string): string[] {
  if (!departmentName) return [];
  const found = Object.keys(COLOMBIA_LOCATIONS).find(
    (dept) => dept.toLowerCase() === departmentName.toLowerCase().trim()
  );
  if (found && COLOMBIA_LOCATIONS[found]) {
    return [...COLOMBIA_LOCATIONS[found]].sort((a, b) => a.localeCompare(b, 'es'));
  }
  return [];
}

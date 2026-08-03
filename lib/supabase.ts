// Módulo de simulación de base de datos local para JF Equipos ERP (Modo MVP Estable)
const inventarioLocal = [
  { id: 1, codigo: 'EQ-001', nombre: 'Caminadora Profesional ProFit 5000', categoria: 'Cardio', precio: 18500.00, stock: 5, sucursal: 'Matriz Principal' },
  { id: 2, codigo: 'EQ-002', nombre: 'Bicicleta Estática de Spinning', categoria: 'Cardio', precio: 8900.00, stock: 8, sucursal: 'Matriz Principal' },
  { id: 3, codigo: 'EQ-003', nombre: 'Set de Mancuernas Hexagonales (1-10 kg)', categoria: 'Pesas libres', precio: 4500.00, stock: 12, sucursal: 'Sucursal Norte' },
  { id: 4, codigo: 'EQ-004', nombre: 'Rack Multifuncional de Fuerza', categoria: 'Fuerza', precio: 24000.00, stock: 3, sucursal: 'Matriz Principal' },
  { id: 5, codigo: 'EQ-005', nombre: 'Suplemento Proteína Whey 2kg', categoria: 'Suplementos', precio: 1250.00, stock: 25, sucursal: 'Sucursal Norte' }
];

export const supabase = {
  from: (tabla: string) => ({
    select: (query?: string) => ({
      order: async (columna: string, opciones?: any) => {
        if (tabla === 'inventario' || tabla === 'productos') {
          return { data: inventarioLocal, error: null };
        }
        return { data: [], error: null };
      }
    })
  })
};
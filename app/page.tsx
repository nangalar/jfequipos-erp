'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface ProductoCatalogo {
  id: number;
  claveInterna: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria: string;
  marca: string;
  modelo: string;
  manejaSerie: boolean;
  numeroSerie: string;
  paisOrigen: string;
  proveedor: string;
  precioCompra: number;
  noFacturaCompra: string;
  pedimentoReferencia: string;
  costoPromedio: number;
  ultimoCosto: number;
  precio: number;
  precioMayoreo: number;
  precioEspecial: number;
  iva: number;
  margenUtilidad: number;
  unidadMedida: string;
  color: string;
  capacidad: string;
  imagen: string;
  manejaGarantia: boolean;
  garantia: string;
  estatus: 'Activo' | 'Inactivo' | 'Descontinuado';
  fechaCreacion: string;
  ultimaModificacion: string;
  esRegalo?: boolean;
  esPaqueteDefinido?: boolean;
  componentesPaquete?: { productoId: number; nombre: string; precioLista: number; numeroSerie: string }[];
}

interface StockSucursal {
  productoId: number;
  sucursal: string;
  almacen: string;
  stockActual: number;
  exhibicion: number;
  apartados: number;
  transito: number;
  consignacion: number;
  danados: number;
  existenciaMinima: number;
  existenciaMaxima: number;
}

interface SerieValidacion {
  idInterno: string;
  sku: string;
  numeroSerie: string;
  estatus: 'Disponible' | 'Vendida';
}

interface MovimientoKardex {
  id: number;
  fecha: string;
  hora: string;
  usuario: string;
  sucursal: string;
  almacen: string;
  producto: string;
  cantidad: number;
  tipoMovimiento: 'Entrada' | 'Salida' | 'Venta' | 'Compra' | 'Transferencia' | 'Devolución' | 'Ajuste' | 'Dañado';
  existenciaAnterior: number;
  existenciaPosterior: number;
  costo: number;
  motivo: string;
  observaciones: string;
}

interface Cliente {
  id: number;
  nombreComercial: string;
  responsable: string;
  direccion: string;
  telefono: string;
  email: string;
  limiteCredito: number;
  diasCredito: number;
  saldoActualDeuda: number;
  bloqueadoCredito: boolean;
}

interface Proveedor {
  id: number;
  razonSocial: string;
  nombreComercial: string;
  rfc: string;
  direccion: string;
  contactos: string;
  telefonos: string;
  correos: string;
  banco: string;
  cuentaClabe: string;
  titularCuenta: string;
  moneda: string;
  diasCredito: number;
  limiteCredito: number;
  productosAsociados: string[];
  tiempoPromedioEntrega: string;
  estatus: 'Activo' | 'Inactivo';
}

interface GastoOperativo {
  id: number;
  folio: string;
  categoria: string;
  sucursal: string;
  responsable: string;
  proveedor: string;
  fecha: string;
  formaPago: string;
  importe: number;
  iva: number;
  total: number;
  documentoComprobatorio: string;
  centroCostos: string;
  autorizacion: string;
  estatus: 'Registrado' | 'En revisión' | 'Autorizado' | 'Pagado' | 'Cancelado';
  observaciones: string;
}

interface AbonoCxC {
  id: number;
  fechaAbono: string;
  monto: number;
  referencia: string;
  reciboFolio: string;
}

interface CuentaPorCobrar {
  id: number;
  folioVenta: string;
  clienteId: number;
  clienteNombre: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  estatus: 'Pendiente' | 'Parcial' | 'Pagada' | 'Vencida';
  promesaPago: string;
  recordatorioEnviado: boolean;
  notasCreditoAplicadas: number;
  abonos: AbonoCxC[];
}

interface AbonoCxP {
  id: number;
  fechaAbono: string;
  montoAbono: number;
  referencia: string;
}

interface CuentaPorPagar {
  id: number;
  folioFactura: string;
  proveedorId: number;
  proveedorNombre: string;
  ordenCompra: string;
  clasificacionGasto: string;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  fechaEmision: string;
  fechaVencimiento: string;
  moneda: string;
  estatus: 'Pendiente' | 'Parcialmente pagada' | 'Pagada' | 'Vencida' | 'Cancelada' | 'En revisión';
  comprobanteUrl: string;
  historialAbonos: AbonoCxP[];
}

interface AuditoriaItem {
  productoId: number;
  codigo: string;
  nombreProducto: string;
  existenciaTeorica: number;
  existenciaFisica: number;
  diferencia: number;
  tipoDiferencia: 'Exacto' | 'Faltante' | 'Sobrante' | 'Dañado';
  observaciones: string;
}

interface AuditoriaInventario {
  id: number;
  folio: string;
  tipoAlcance: 'Sucursal' | 'Almacén' | 'Categoría' | 'Ubicación' | 'Completa' | 'Conteo Cíclico';
  valorAlcance: string;
  responsable: string;
  fechaAuditoria: string;
  estadoBloqueo: boolean;
  estatus: 'En Proceso' | 'Pendiente Autorización' | 'Ajuste Aplicado' | 'Cancelada';
  observaciones: string;
  items: AuditoriaItem[];
}

interface ItemVenta {
  id: number;
  lineaId: string;
  productoIdCatalogo: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo: number;
  stock: number;
  sucursal: string;
  requiereSerie: boolean;
  numeroSerie: string;
  cantidadVendida: number;
  esRegalo: boolean;
  esPaqueteComponente: boolean;
  nombrePaqueteOrigen?: string;
  precioListaOriginal?: number;
  descuentoMontoFijo: number;
  fechaGarantia: string;
}

interface Cotizacion {
  folio: string;
  fechaCreacion: string;
  fechaExpiracion: string;
  cliente: string;
  sucursal: string;
  items: ItemVenta[];
  total: number;
  estatus: 'Pendiente' | 'Autorizada' | 'Expirada';
}

interface TicketGuardado {
  folio: string;
  fecha: string;
  cliente: string;
  metodoPago: string;
  sucursal: string;
  items: ItemVenta[];
  subtotalBruto: number;
  descuentoTotal: number;
  subtotalNeto: number;
  iva: number;
  total: number;
}

interface UsuarioSistema {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  sucursalId: number | null;
  activo: boolean;
}

interface RolPermisos {
  id?: number;
  nombreRol: string;
  modulosPermitidos: string[];
}

interface Sucursal {
  id: number;
  clave: string;
  nombre: string;
  tipo: 'Matriz' | 'Sucursal';
  direccion: string;
  estado: string;
  municipio: string;
  codigoPostal: string;
  telefono: string;
  responsable: string;
  correo: string;
  almacenPrincipal: string;
  estatus: 'Activa' | 'Inactiva';
  fechaAlta: string;
}

const LISTA_MODULOS_DISPONIBLES = [
  { id: 'inicio', nombre: '📊 Panel General' },
  { id: 'productos', nombre: '🏷️ Productos' },
  { id: 'inventario', nombre: '📦 Inventario / Kardex' },
  { id: 'sucursales', nombre: '🏢 Sucursales' },
  { id: 'clientes', nombre: '👥 Clientes' },
  { id: 'proveedores', nombre: '🏭 Proveedores' },
  { id: 'cxc', nombre: '📑 Cuentas por Cobrar' },
  { id: 'cxp', nombre: '💳 Cuentas por Pagar' },
  { id: 'gastos', nombre: '💸 Gastos Operativos' },
  { id: 'auditoria', nombre: '📋 Auditoría de Inventarios' },
  { id: 'cotizaciones', nombre: '📄 Cotizaciones (48h)' },
  { id: 'ventas', nombre: '💰 Ventas' },
  { id: 'reportes', nombre: '📈 Reportes Financieros' },
  { id: 'historial', nombre: '📋 Historial y Reimpresión' },
  { id: 'usuarios', nombre: '🔒 Gestión de Usuarios y Roles' }
];

export default function DashboardPage() {
  const [usuarioLogueado, setUsuarioLogueado] = useState<UsuarioSistema | null>(null);
  // Evita mostrar la pantalla de login antes de comprobar si existe una sesión guardada.
  const [sesionCargada, setSesionCargada] = useState<boolean>(false);
  const [emailLogin, setEmailLogin] = useState<string>('');
  const [passwordLogin, setPasswordLogin] = useState<string>('');
  const [vistaRecuperacion, setVistaRecuperacion] = useState<boolean>(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState<string>('');

  // Usuarios, roles y sucursales se cargan desde Supabase después de autenticar.
  // No se precargan usuarios operativos ni sucursales: el Administrador los crea en producción.
  const [usuariosSistema, setUsuariosSistema] = useState<UsuarioSistema[]>([]);

  const [rolesSistema, setRolesSistema] = useState<RolPermisos[]>([]);

  const [rolEditandoPermisos, setRolEditandoPermisos] = useState<RolPermisos | null>(null);
  const [modalPermisosAbierto, setModalPermisosAbierto] = useState<boolean>(false);

  const [moduloActivo, setModuloActivo] = useState<string>('inicio');
  const [menuMovilAbierto, setMenuMovilAbierto] = useState<boolean>(false);

  // Catálogo maestro de sucursales. Inicia vacío para que el cliente registre sus ubicaciones reales.
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [modalSucursalAbierto, setModalSucursalAbierto] = useState<boolean>(false);
  const [sucursalEditando, setSucursalEditando] = useState<Sucursal | null>(null);
  const [sClave, setSClave] = useState('');
  const [sNombre, setSNombre] = useState('');
  const [sTipo, setSTipo] = useState<Sucursal['tipo']>('Sucursal');
  const [sDireccion, setSDireccion] = useState('');
  const [sEstado, setSEstado] = useState('');
  const [sMunicipio, setSMunicipio] = useState('');
  const [sCodigoPostal, setSCodigoPostal] = useState('');
  const [sTelefono, setSTelefono] = useState('');
  const [sResponsable, setSResponsable] = useState('');
  const [sCorreo, setSCorreo] = useState('');
  const [sAlmacenPrincipal, setSAlmacenPrincipal] = useState('');
  const [sEstatus, setSEstatus] = useState<Sucursal['estatus']>('Activa');
  
  const [catalogoProductos, setCatalogoProductos] = useState<ProductoCatalogo[]>([]);
  const [inventarioSucursales, setInventarioSucursales] = useState<StockSucursal[]>([]);
  const [kardexMovimientos, setKardexMovimientos] = useState<MovimientoKardex[]>([]);
  // Se llenará con la importación del Excel. Permite validar que una serie corresponda al SKU vendido.
  const [seriesValidacion, setSeriesValidacion] = useState<SerieValidacion[]>([]);
  const [listaCategorias, setListaCategorias] = useState<string[]>(['Cardio', 'Pesas libres', 'Fuerza', 'Accesorios', 'Suplementos', 'Paquetes / Combos', 'Regalos']);
  const [nuevaCategoriaInput, setNuevaCategoriaInput] = useState<string>('');

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionadoPOS, setClienteSeleccionadoPOS] = useState<string>('');
  const [modalClienteAbierto, setModalClienteAbierto] = useState<boolean>(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const [cNombreComercial, setCNombreComercial] = useState('');
  const [cResponsable, setCResponsable] = useState('');
  const [cDireccion, setCDireccion] = useState('');
  const [cTelefono, setCTelefono] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cLimiteCredito, setCLimiteCredito] = useState('100000');
  const [cDiasCredito, setCDiasCredito] = useState('30');

  const [cuentasPorCobrar, setCuentasPorCobrar] = useState<CuentaPorCobrar[]>([]);

  const [modalAbonoCxCAbierto, setModalAbonoCxCAbierto] = useState<boolean>(false);
  const [cuentaCxCSeleccionada, setCuentaCxCSeleccionada] = useState<CuentaPorCobrar | null>(null);
  const [montoAbonoCxC, setMontoAbonoCxC] = useState<string>('');
  const [fechaAbonoCxC, setFechaAbonoCxC] = useState<string>(new Date().toISOString().split('T')[0]);
  const [refAbonoCxC, setRefAbonoCxC] = useState<string>('SPEI Cliente');

  const [modalNotaCreditoAbierto, setModalNotaCreditoAbierto] = useState<boolean>(false);
  const [montoNotaCredito, setMontoNotaCredito] = useState<string>('');

  const [modalPromesaAbierto, setModalPromesaAbierto] = useState<boolean>(false);
  const [textoPromesaInput, setTextoPromesaInput] = useState<string>('');

  const [modalAutorizacionAbierto, setModalAutorizacionAbierto] = useState<boolean>(false);
  const [clienteParaAutorizar, setClienteParaAutorizar] = useState<Cliente | null>(null);

  const [modalReciboAbierto, setModalReciboAbierto] = useState<boolean>(false);
  const [reciboUltimoGenerado, setReciboUltimoGenerado] = useState<any>(null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState<boolean>(false);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);

  const [pRazonSocial, setPRazonSocial] = useState('');
  const [pNombreComercial, setPNombreComercial] = useState('');
  const [pRfc, setPRfc] = useState('');
  const [pDireccion, setPDireccion] = useState('');
  const [pContactos, setPContactos] = useState('');
  const [pTelefonos, setPTelefonos] = useState('');
  const [pCorreos, setPCorreos] = useState('');
  const [pBanco, setPBanco] = useState('BBVA');
  const [pCuentaClabe, setPCuentaClabe] = useState('');
  const [pTitularCuenta, setPTitularCuenta] = useState('');
  const [pMoneda, setPMoneda] = useState('MXN');
  const [pDiasCredito, setPDiasCredito] = useState('30');
  const [pLimiteCredito, setPLimiteCredito] = useState('100000');
  const [pProductoSeleccionado, setPProductoSeleccionado] = useState('');
  const [pProductosAsociados, setPProductosAsociados] = useState<string[]>([]);
  const [pTiempoEntrega, setPTiempoEntrega] = useState('5 días');
  const [pEstatus, setPEstatus] = useState<'Activo' | 'Inactivo'>('Activo');

  // Estados Inventario / Kardex
  const [busquedaInventarioModal, setBusquedaInventarioModal] = useState<string>('');
  const [modalIngresoStockAbierto, setModalIngresoStockAbierto] = useState<boolean>(false);
  const [productoIngreso, setProductoIngreso] = useState<ProductoCatalogo | null>(null);
  const [cantIngreso, setCantIngreso] = useState<string>('10');
  const [minIngreso, setMinIngreso] = useState<string>('3');
  const [maxIngreso, setMaxIngreso] = useState<string>('50');
  const [sucursalIngreso, setSucursalIngreso] = useState<string>('');
  const [almacenIngreso, setAlmacenIngreso] = useState<string>('');
  const [motivoIngreso, setMotivoIngreso] = useState<string>('Compra a proveedor / Surtido inicial');
  const [fechaIngresoManual, setFechaIngresoManual] = useState<string>(new Date().toISOString().split('T')[0]);

  const [modalModificarStockAbierto, setModalModificarStockAbierto] = useState<boolean>(false);
  const [stockItemSeleccionado, setStockItemSeleccionado] = useState<StockSucursal | null>(null);
  const [tipoMovimientoMod, setTipoMovimientoMod] = useState<MovimientoKardex['tipoMovimiento']>('Transferencia');
  const [cantidadMod, setCantidadMod] = useState<string>('1');
  const [motivoMod, setMotivoMod] = useState<string>('');

  // Cámaras
  const [camaraAltaActiva, setCamaraAltaActiva] = useState<boolean>(false);
  const [camaraInventarioActiva, setCamaraInventarioActiva] = useState<boolean>(false);
  const [camaraAuditoriaActiva, setCamaraAuditoriaActiva] = useState<boolean>(false);
  const videoAltaRef = useRef<HTMLVideoElement | null>(null);
  const videoInventarioRef = useRef<HTMLVideoElement | null>(null);
  const videoAuditoriaRef = useRef<HTMLVideoElement | null>(null);

  const [modalNotifAbierto, setModalNotifAbierto] = useState<boolean>(false);
  const [mensajeNotif, setMensajeNotif] = useState<string>('');

  const [modalSerieAbierto, setModalSerieAbierto] = useState<boolean>(false);
  const [productoPendienteSerie, setProductoPendienteSerie] = useState<ProductoCatalogo | null>(null);
  const [esRegaloPendiente, setEsRegaloPendiente] = useState<boolean>(false);
  const [stockPendienteSerie, setStockPendienteSerie] = useState<number>(0);
  const [inputNumeroSerieFisico, setInputNumeroSerieFisico] = useState<string>('');
  const [lineaSerieEditandoId, setLineaSerieEditandoId] = useState<string | null>(null);
  const [cotizacionOrigenPOS, setCotizacionOrigenPOS] = useState<string | null>(null);

  const [gastos, setGastos] = useState<GastoOperativo[]>([]);
  const [modalGastoAbierto, setModalGastoAbierto] = useState<boolean>(false);

  const [gCat, setGCat] = useState('Mantenimiento y Refacciones');
  const [gSuc, setGSuc] = useState('');
  const [gResp, setGResp] = useState('');
  const [gProv, setGProv] = useState('');
  const [gFecha, setGFecha] = useState(new Date().toISOString().split('T')[0]);
  const [gFormaPago, setGFormaPago] = useState('Transferencia SPEI');
  const [gImporte, setGImporte] = useState('');
  const [gDoc, setGDoc] = useState('');
  const [gCentro, setGCentro] = useState('Operaciones');
  const [gAut, setGAut] = useState('Gerencia de Administración');
  const [gEstatus, setGEstatus] = useState<GastoOperativo['estatus']>('Autorizado');
  const [gObs, setGObs] = useState('');

  const [cuentasPorPagar, setCuentasPorPagar] = useState<CuentaPorPagar[]>([]);
  const [modalCxPAbierto, setModalCxPAbierto] = useState<boolean>(false);
  const [modalPagoAbierto, setModalPagoAbierto] = useState<boolean>(false);
  const [cuentaSeleccionadaPago, setCuentaSeleccionadaPago] = useState<CuentaPorPagar | null>(null);
  const [montoAbono, setMontoAbono] = useState<string>('');
  const [fechaAbonoInput, setFechaAbonoInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenciaAbonoInput, setReferenciaAbonoInput] = useState<string>('SPEI Banco');
  const [modalHistorialAbonosAbierto, setModalHistorialAbonosAbierto] = useState<boolean>(false);
  const [cuentaHistorialSeleccionada, setCuentaHistorialSeleccionada] = useState<CuentaPorPagar | null>(null);

  const [cxpFolio, setCxpFolio] = useState('');
  const [cxpProvId, setCxpProvId] = useState('');
  const [cxpOC, setCxpOC] = useState('');
  const [cxpGasto, setCxpGasto] = useState('Mantenimiento y Refacciones');
  const [cxpMonto, setCxpMonto] = useState('');
  const [cxpVencimiento, setCxpVencimiento] = useState('');

  // Auditoría
  const [auditorias, setAuditorias] = useState<AuditoriaInventario[]>([]);
  const [modalAuditoriaAbierto, setModalAuditoriaAbierto] = useState<boolean>(false);
  const [auditoriaSeleccionadaDetalle, setAuditoriaSeleccionadaDetalle] = useState<AuditoriaInventario | null>(null);
  const [codigoEscaneoAuditoria, setCodigoEscaneoAuditoria] = useState<string>('');
  const [audTipo, setAudTipo] = useState<AuditoriaInventario['tipoAlcance']>('Sucursal');
  const [audValor, setAudValor] = useState('');
  const [audResp, setAudResp] = useState('');
  const [audObs, setAudObs] = useState('');

  // Reportes
  const [fechaInicioReporte, setFechaInicioReporte] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [fechaFinReporte, setFechaFinReporte] = useState(new Date().toISOString().split('T')[0]);
  const [sucursalReporte, setSucursalReporte] = useState('Todas');
  const [categoriaReporte, setCategoriaReporte] = useState('Todas');

  const [sucursalActivaPOS, setSucursalActivaPOS] = useState<string>('');
  const [carrito, setCarrito] = useState<ItemVenta[]>([]);
  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string>('Efectivo');
  
  const [productoSeleccionadoEdicion, setProductoSeleccionadoEdicion] = useState<ProductoCatalogo | null>(null);
  const [modalAltaAbierto, setModalAltaAbierto] = useState<boolean>(false);

  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [modalSinStockAbierto, setModalSinStockAbierto] = useState<boolean>(false);
  const [mensajeSinStock, setMensajeSinStock] = useState<string>('');

  const [componentesSeleccionadosPaquete, setComponentesSeleccionadosPaquete] = useState<{ productoId: number; nombre: string; precioLista: number; numeroSerie: string }[]>([]);
  const [idProdParaPaquete, setIdProdParaPaquete] = useState<string>('');

  const [historialTickets, setHistorialTickets] = useState<TicketGuardado[]>([]);
  const [camaraActiva, setCamaraActiva] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ventaExitosa, setVentaExitosa] = useState<boolean>(false);
  const [ticketGenerado, setTicketGenerado] = useState<TicketGuardado | null>(null);

  const [fClave, setFClave] = useState('');
  const [fCodigo, setFCodigo] = useState('');
  const [fNombre, setFNombre] = useState('');
  const [fDesc, setFDesc] = useState('');
  const [fCat, setFCat] = useState('Cardio');
  const [fSubcat, setFSubcat] = useState('');
  const [fMarca, setFMarca] = useState('');
  const [fModelo, setFModelo] = useState('');
  const [fManejaSerie, setFManejaSerie] = useState(true);
  const [fSerie, setFSerie] = useState('');
  const [fPais, setFPais] = useState('México');
  const [fProv, setFProv] = useState('');
  const [fPCompra, setFPCompra] = useState('');
  const [fFactura, setFFactura] = useState('');
  const [fPedimento, setFPedimento] = useState('');
  const [fPVenta, setFPVenta] = useState('');
  const [fPMayoreo, setFPMayoreo] = useState('');
  const [fPEspecial, setFPEspecial] = useState('');
  const [fManejaGarantia, setFManejaGarantia] = useState(true);
  const [fGarantia, setFGarantia] = useState('1 Año');
  const [fUnidad, setFUnidad] = useState('Pieza');
  const [fColor, setFColor] = useState('');
  const [fCapacidad, setFCapacidad] = useState('');
  const [fEsRegalo, setFEsRegalo] = useState(false);
  const [fEsPaquete, setFEsPaquete] = useState(false);

  // Estados para Módulo de Gestión de Usuarios y Permisos
  const [nuevoNombreUsr, setNuevoNombreUsr] = useState('');
  const [nuevoEmailUsr, setNuevoEmailUsr] = useState('');
  const [nuevoPassUsr, setNuevoPassUsr] = useState('');
  const [nuevoRolUsr, setNuevoRolUsr] = useState('Operador / Ventas');
  const [nuevaSucursalUsrId, setNuevaSucursalUsrId] = useState<string>('');
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioSistema | null>(null);
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);

  const sucursalesActivas = sucursales.filter((s: Sucursal) => s.estatus === 'Activa');
  const usuarioEsAdministrador = usuarioLogueado?.rol === 'Administrador';
  const sucursalAsignadaUsuario = !usuarioEsAdministrador && usuarioLogueado?.sucursalId
    ? sucursales.find((s: Sucursal) => s.id === usuarioLogueado.sucursalId) || null
    : null;
  const nombreSucursalAsignadaUsuario = sucursalAsignadaUsuario?.nombre || '';
  const sucursalesPermitidasUsuario = usuarioEsAdministrador
    ? sucursalesActivas
    : sucursalesActivas.filter((s: Sucursal) => s.id === usuarioLogueado?.sucursalId);

  const puedeOperarSucursal = (nombreSucursal: string) => {
    if (!usuarioLogueado) return false;
    if (usuarioEsAdministrador) return true;
    return nombreSucursal === nombreSucursalAsignadaUsuario;
  };

  const inventarioVisibleUsuario = usuarioEsAdministrador
    ? inventarioSucursales
    : inventarioSucursales.filter((inv: StockSucursal) => inv.sucursal === nombreSucursalAsignadaUsuario);
  const kardexVisibleUsuario = usuarioEsAdministrador
    ? kardexMovimientos
    : kardexMovimientos.filter((mov: MovimientoKardex) => mov.sucursal === nombreSucursalAsignadaUsuario);
  const gastosVisiblesUsuario = usuarioEsAdministrador
    ? gastos
    : gastos.filter((g: GastoOperativo) => g.sucursal === nombreSucursalAsignadaUsuario);
  const auditoriasVisiblesUsuario = usuarioEsAdministrador
    ? auditorias
    : auditorias.filter((a: AuditoriaInventario) => a.tipoAlcance === 'Sucursal' && a.valorAlcance === nombreSucursalAsignadaUsuario);
  const cotizacionesVisiblesUsuario = usuarioEsAdministrador
    ? cotizaciones
    : cotizaciones.filter((c: Cotizacion) => c.sucursal === nombreSucursalAsignadaUsuario);
  const historialVisibleUsuario = usuarioEsAdministrador
    ? historialTickets
    : historialTickets.filter((t: TicketGuardado) => t.sucursal === nombreSucursalAsignadaUsuario);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (camaraActiva || camaraAltaActiva || camaraInventarioActiva || camaraAuditoriaActiva) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
          if (videoAltaRef.current) videoAltaRef.current.srcObject = s;
          if (videoInventarioRef.current) videoInventarioRef.current.srcObject = s;
          if (videoAuditoriaRef.current) videoAuditoriaRef.current.srcObject = s;
        })
        .catch(() => {
          setCamaraActiva(false);
          setCamaraAltaActiva(false);
          setCamaraInventarioActiva(false);
          setCamaraAuditoriaActiva(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
      }
      if (videoAltaRef.current && videoAltaRef.current.srcObject) {
        const s = videoAltaRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
      }
      if (videoInventarioRef.current && videoInventarioRef.current.srcObject) {
        const s = videoInventarioRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
      }
      if (videoAuditoriaRef.current && videoAuditoriaRef.current.srcObject) {
        const s = videoAuditoriaRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [camaraActiva, camaraAltaActiva, camaraInventarioActiva, camaraAuditoriaActiva]);

  // ============================================================
  // SUPABASE AUTH + CATÁLOGOS DE SEGURIDAD
  // ============================================================
  const mapearSucursalDb = (row: any): Sucursal => ({
    id: Number(row.id),
    clave: String(row.code || ''),
    nombre: String(row.name || ''),
    tipo: row.branch_type === 'Matriz' ? 'Matriz' : 'Sucursal',
    direccion: String(row.address || ''),
    estado: String(row.state || ''),
    municipio: String(row.municipality || ''),
    codigoPostal: String(row.postal_code || ''),
    telefono: String(row.phone || ''),
    responsable: String(row.manager || ''),
    correo: String(row.email || ''),
    almacenPrincipal: String(row.main_warehouse || ''),
    estatus: row.status === 'Inactiva' ? 'Inactiva' : 'Activa',
    fechaAlta: row.created_at ? String(row.created_at).slice(0, 10) : ''
  });

  const normalizarRolRelacion = (rel: any) => Array.isArray(rel) ? rel[0] : rel;

  const cargarCatalogosSeguridad = async (usr: UsuarioSistema) => {
    const [rolesResp, sucResp] = await Promise.all([
      supabase.from('roles').select('id, name, allowed_modules').order('id'),
      supabase.from('branches').select('*').order('name')
    ]);

    if (rolesResp.error) throw new Error(`No se pudieron cargar los roles: ${rolesResp.error.message}`);
    if (sucResp.error) throw new Error(`No se pudieron cargar las sucursales: ${sucResp.error.message}`);

    const rolesMapeados: RolPermisos[] = (rolesResp.data || []).map((r: any) => ({
      id: Number(r.id),
      nombreRol: String(r.name),
      modulosPermitidos: Array.isArray(r.allowed_modules) ? r.allowed_modules.map(String) : []
    }));
    setRolesSistema(rolesMapeados);

    const sucursalesMapeadas = (sucResp.data || []).map(mapearSucursalDb);
    setSucursales(sucursalesMapeadas);

    if (usr.rol === 'Administrador') {
      const { data: perfiles, error: perfilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, branch_id, active, roles(name)')
        .order('full_name');

      if (perfilesError) throw new Error(`No se pudieron cargar los usuarios: ${perfilesError.message}`);

      setUsuariosSistema((perfiles || []).map((p: any) => {
        const rolRel = normalizarRolRelacion(p.roles);
        return {
          id: String(p.id),
          nombre: String(p.full_name || ''),
          email: String(p.email || ''),
          password: '',
          rol: String(rolRel?.name || ''),
          sucursalId: p.branch_id == null ? null : Number(p.branch_id),
          activo: p.active !== false
        };
      }));
    } else {
      setUsuariosSistema([usr]);
    }
  };

  const cargarUsuarioDesdeSupabase = async (userId: string): Promise<UsuarioSistema> => {
    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, branch_id, active, roles(name)')
      .eq('id', userId)
      .single();

    if (error || !perfil) {
      throw new Error(error?.message || 'El usuario no tiene un perfil asignado en el ERP.');
    }

    const rolRel = normalizarRolRelacion((perfil as any).roles);
    const usr: UsuarioSistema = {
      id: String((perfil as any).id),
      nombre: String((perfil as any).full_name || ''),
      email: String((perfil as any).email || ''),
      password: '',
      rol: String(rolRel?.name || ''),
      sucursalId: (perfil as any).branch_id == null ? null : Number((perfil as any).branch_id),
      activo: (perfil as any).active !== false
    };

    if (!usr.activo) throw new Error('Este usuario se encuentra inactivo.');
    if (!usr.rol) throw new Error('Este usuario no tiene un rol asignado.');

    setUsuarioLogueado(usr);
    await cargarCatalogosSeguridad(usr);
    return usr;
  };

  useEffect(() => {
    let cancelado = false;

    const restaurarSesion = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!cancelado && data.session?.user) {
          await cargarUsuarioDesdeSupabase(data.session.user.id);
        }
      } catch (error: any) {
        console.error('No fue posible restaurar la sesión de Supabase:', error);
        await supabase.auth.signOut();
        if (!cancelado) setUsuarioLogueado(null);
      } finally {
        if (!cancelado) setSesionCargada(true);
      }
    };

    restaurarSesion();
    return () => { cancelado = true; };
  }, []);

  const iniciarSesionSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailLogin.trim().toLowerCase(),
        password: passwordLogin
      });
      if (error) throw error;
      if (!data.user) throw new Error('No se pudo obtener el usuario autenticado.');

      const usr = await cargarUsuarioDesdeSupabase(data.user.id);
      const rolRefLogin = rolesSistema.find(r => r.nombreRol === usr.rol);
      const primerModulo = usr.rol === 'Administrador'
        ? 'inicio'
        : (rolRefLogin?.modulosPermitidos.includes('inicio') ? 'inicio' : rolRefLogin?.modulosPermitidos[0] || 'ventas');
      setModuloActivo(primerModulo);
      setPasswordLogin('');
    } catch (error: any) {
      await supabase.auth.signOut();
      setUsuarioLogueado(null);
      alert(`No fue posible iniciar sesión: ${error?.message || String(error)}`);
    }
  };

  const enviarRecuperacionSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    const correo = emailRecuperacion.trim().toLowerCase();
    if (!correo) return;
    const redirectTo = `${window.location.origin}/auth/set-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(correo, { redirectTo });
    if (error) {
      alert(`No fue posible enviar el correo de recuperación: ${error.message}`);
      return;
    }
    alert('Si el correo está registrado, recibirá instrucciones para crear una nueva contraseña.');
    setVistaRecuperacion(false);
    setEmailRecuperacion('');
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    setUsuarioLogueado(null);
    setUsuariosSistema([]);
    setRolesSistema([]);
    setSucursales([]);
    setEmailLogin('');
    setPasswordLogin('');
    setModuloActivo('inicio');
    setMenuMovilAbierto(false);
  };

  // Mantiene sincronizados los selectores operativos con las sucursales que el usuario tiene autorizadas.
  useEffect(() => {
    const activas = sucursales.filter((s: Sucursal) => s.estatus === 'Activa');
    const disponibles = usuarioLogueado?.rol === 'Administrador'
      ? activas
      : activas.filter((s: Sucursal) => s.id === usuarioLogueado?.sucursalId);
    const primera = disponibles[0];

    if (!primera) {
      if (sucursalIngreso) setSucursalIngreso('');
      if (almacenIngreso) setAlmacenIngreso('');
      if (gSuc) setGSuc('');
      if (sucursalActivaPOS) setSucursalActivaPOS('');
      if (audValor) setAudValor('');
      if (sucursalReporte !== 'Todas') setSucursalReporte('Todas');
      return;
    }

    if (!sucursalIngreso || !disponibles.some(s => s.nombre === sucursalIngreso)) {
      setSucursalIngreso(primera.nombre);
      setAlmacenIngreso(primera.almacenPrincipal);
    }
    if (!gSuc || !disponibles.some(s => s.nombre === gSuc)) {
      setGSuc(primera.nombre);
    }
    if (!sucursalActivaPOS || !disponibles.some(s => s.nombre === sucursalActivaPOS)) {
      setSucursalActivaPOS(primera.nombre);
      setCarrito([]);
    }

    if (usuarioLogueado?.rol !== 'Administrador') {
      if (audTipo !== 'Sucursal') setAudTipo('Sucursal');
      if (audValor !== primera.nombre) setAudValor(primera.nombre);
      if (sucursalReporte !== primera.nombre) setSucursalReporte(primera.nombre);
    } else {
      if (audTipo === 'Sucursal' && (!audValor || !disponibles.some(s => s.nombre === audValor))) {
        setAudValor(primera.nombre);
      }
      if (sucursalReporte !== 'Todas' && !sucursales.some(s => s.nombre === sucursalReporte)) {
        setSucursalReporte('Todas');
      }
    }
  }, [sucursales, audTipo, usuarioLogueado?.id, usuarioLogueado?.rol, usuarioLogueado?.sucursalId]);

  const formatearMoneda = (valor: number) => {
    return `$${valor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
  };

  const obtenerStockSucursal = (productoId: number, sucursal: string) => {
    const reg = inventarioSucursales.find((i: StockSucursal) => i.productoId === productoId && i.sucursal === sucursal);
    return reg ? reg.stockActual : 0;
  };

  const registrarCategoriaNueva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCategoriaInput.trim()) return;
    if (!listaCategorias.includes(nuevaCategoriaInput.trim())) {
      setListaCategorias([...listaCategorias, nuevaCategoriaInput.trim()]);
      setFCat(nuevaCategoriaInput.trim());
      setNuevaCategoriaInput('');
      setMensajeNotif('Categoría registrada con éxito.');
      setModalNotifAbierto(true);
    }
  };

  const agregarComponenteAPaquete = () => {
    if (!idProdParaPaquete) return;
    const prodRef = catalogoProductos.find(p => p.id === Number(idProdParaPaquete));
    if (prodRef) {
      setComponentesSeleccionadosPaquete(prev => [
        ...prev,
        { productoId: prodRef.id, nombre: prodRef.nombre, precioLista: prodRef.precio, numeroSerie: prodRef.numeroSerie }
      ]);
      setIdProdParaPaquete('');
    }
  };

  const quitarComponentePaquete = (index: number) => {
    setComponentesSeleccionadosPaquete(prev => prev.filter((_, i) => i !== index));
  };

  const guardarCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cNombreComercial || !cResponsable) return;

    if (clienteEditando) {
      setClientes(prev => prev.map(c => c.id === clienteEditando.id ? {
        ...c,
        nombreComercial: cNombreComercial,
        responsable: cResponsable,
        direccion: cDireccion,
        telefono: cTelefono,
        email: cEmail,
        limiteCredito: Number(cLimiteCredito) || 100000,
        diasCredito: Number(cDiasCredito) || 30
      } : c));
      setClienteEditando(null);
      setMensajeNotif('¡Cliente actualizado con éxito!');
      setModalNotifAbierto(true);
    } else {
      const nuevoCliente: Cliente = {
        id: Date.now(),
        nombreComercial: cNombreComercial,
        responsable: cResponsable,
        direccion: cDireccion,
        telefono: cTelefono,
        email: cEmail,
        limiteCredito: Number(cLimiteCredito) || 100000,
        diasCredito: Number(cDiasCredito) || 30,
        saldoActualDeuda: 0,
        bloqueadoCredito: false
      };
      setClientes(prev => [nuevoCliente, ...prev]);
      setMensajeNotif('¡Cliente registrado con éxito!');
      setModalNotifAbierto(true);
    }

    setModalClienteAbierto(false);
    setCNombreComercial('');
    setCResponsable('');
    setCDireccion('');
    setCTelefono('');
    setCEmail('');
    setCLimiteCredito('100000');
    setCDiasCredito('30');
  };

  const abrirEdicionCliente = (cli: Cliente) => {
    setClienteEditando(cli);
    setCNombreComercial(cli.nombreComercial);
    setCResponsable(cli.responsable);
    setCDireccion(cli.direccion);
    setCTelefono(cli.telefono);
    setCEmail(cli.email);
    setCLimiteCredito(String(cli.limiteCredito || 100000));
    setCDiasCredito(String(cli.diasCredito || 30));
    setModalClienteAbierto(true);
  };

  const limpiarFormularioSucursal = () => {
    setSucursalEditando(null);
    setSClave('');
    setSNombre('');
    setSTipo('Sucursal');
    setSDireccion('');
    setSEstado('');
    setSMunicipio('');
    setSCodigoPostal('');
    setSTelefono('');
    setSResponsable('');
    setSCorreo('');
    setSAlmacenPrincipal('');
    setSEstatus('Activa');
  };

  const abrirNuevaSucursal = () => {
    limpiarFormularioSucursal();
    setModalSucursalAbierto(true);
  };

  const sucursalTieneMovimientos = (nombreSucursal: string) => {
    return (
      inventarioSucursales.some(inv => inv.sucursal === nombreSucursal) ||
      kardexMovimientos.some(k => k.sucursal === nombreSucursal) ||
      gastos.some(g => g.sucursal === nombreSucursal) ||
      cotizaciones.some(c => c.sucursal === nombreSucursal) ||
      historialTickets.some(t => t.items.some(item => item.sucursal === nombreSucursal))
    );
  };

  const abrirEdicionSucursal = (sucursal: Sucursal) => {
    setSucursalEditando(sucursal);
    setSClave(sucursal.clave);
    setSNombre(sucursal.nombre);
    setSTipo(sucursal.tipo);
    setSDireccion(sucursal.direccion);
    setSEstado(sucursal.estado);
    setSMunicipio(sucursal.municipio);
    setSCodigoPostal(sucursal.codigoPostal);
    setSTelefono(sucursal.telefono);
    setSResponsable(sucursal.responsable);
    setSCorreo(sucursal.correo);
    setSAlmacenPrincipal(sucursal.almacenPrincipal);
    setSEstatus(sucursal.estatus);
    setModalSucursalAbierto(true);
  };

  const guardarSucursal = async (e: React.FormEvent) => {
    e.preventDefault();

    const claveLimpia = sClave.trim().toUpperCase();
    const nombreLimpio = sNombre.trim();
    const almacenLimpio = sAlmacenPrincipal.trim();

    if (!claveLimpia || !nombreLimpio || !almacenLimpio) {
      setMensajeNotif('Clave, nombre de sucursal y almacén principal son obligatorios.');
      setModalNotifAbierto(true);
      return;
    }

    const claveDuplicada = sucursales.some(
      s => s.clave.toUpperCase() === claveLimpia && s.id !== sucursalEditando?.id
    );
    if (claveDuplicada) {
      setMensajeNotif(`Ya existe una sucursal con la clave "${claveLimpia}".`);
      setModalNotifAbierto(true);
      return;
    }

    const nombreDuplicado = sucursales.some(
      s => s.nombre.toLowerCase() === nombreLimpio.toLowerCase() && s.id !== sucursalEditando?.id
    );
    if (nombreDuplicado) {
      setMensajeNotif(`Ya existe una sucursal con el nombre "${nombreLimpio}".`);
      setModalNotifAbierto(true);
      return;
    }

    if (sucursalEditando && sucursalEditando.nombre !== nombreLimpio && sucursalTieneMovimientos(sucursalEditando.nombre)) {
      setMensajeNotif('No se puede cambiar el nombre de una sucursal que ya tiene inventario, ventas, gastos o movimientos. Puede editar sus demás datos o inactivarla.');
      setModalNotifAbierto(true);
      return;
    }

    const payload = {
      code: claveLimpia,
      name: nombreLimpio,
      branch_type: sTipo,
      address: sDireccion.trim(),
      state: sEstado.trim(),
      municipality: sMunicipio.trim(),
      postal_code: sCodigoPostal.trim(),
      phone: sTelefono.trim(),
      manager: sResponsable.trim(),
      email: sCorreo.trim(),
      main_warehouse: almacenLimpio,
      status: sEstatus
    };

    try {
      if (sucursalEditando) {
        const nombreAnterior = sucursalEditando.nombre;
        const { data, error } = await supabase
          .from('branches')
          .update(payload)
          .eq('id', sucursalEditando.id)
          .select('*')
          .single();
        if (error) throw error;
        const actualizada = mapearSucursalDb(data);
        setSucursales(prev => prev.map(s => s.id === actualizada.id ? actualizada : s));

        if (nombreAnterior !== nombreLimpio) {
          if (sucursalIngreso === nombreAnterior) setSucursalIngreso(nombreLimpio);
          if (gSuc === nombreAnterior) setGSuc(nombreLimpio);
          if (sucursalActivaPOS === nombreAnterior) setSucursalActivaPOS(nombreLimpio);
          if (audValor === nombreAnterior) setAudValor(nombreLimpio);
          if (sucursalReporte === nombreAnterior) setSucursalReporte(nombreLimpio);
        }
        if (sucursalIngreso === nombreLimpio) setAlmacenIngreso(almacenLimpio);
        setMensajeNotif(`Sucursal "${nombreLimpio}" actualizada y guardada en la base de datos.`);
      } else {
        const { data, error } = await supabase
          .from('branches')
          .insert(payload)
          .select('*')
          .single();
        if (error) throw error;
        const nuevaSucursal = mapearSucursalDb(data);
        setSucursales(prev => [nuevaSucursal, ...prev]);
        setMensajeNotif(`Sucursal "${nombreLimpio}" registrada en la base de datos.`);
      }

      setModalSucursalAbierto(false);
      limpiarFormularioSucursal();
      setModalNotifAbierto(true);
    } catch (error: any) {
      setMensajeNotif(`No fue posible guardar la sucursal: ${error?.message || String(error)}`);
      setModalNotifAbierto(true);
    }
  };

  const cambiarEstatusSucursal = async (sucursal: Sucursal) => {
    const nuevoEstatus: Sucursal['estatus'] = sucursal.estatus === 'Activa' ? 'Inactiva' : 'Activa';
    const { error } = await supabase.from('branches').update({ status: nuevoEstatus }).eq('id', sucursal.id);
    if (error) {
      setMensajeNotif(`No fue posible cambiar el estatus de la sucursal: ${error.message}`);
      setModalNotifAbierto(true);
      return;
    }
    setSucursales(prev => prev.map(s => s.id === sucursal.id ? { ...s, estatus: nuevoEstatus } : s));
    setMensajeNotif(
      nuevoEstatus === 'Activa'
        ? `Sucursal "${sucursal.nombre}" activada.`
        : `Sucursal "${sucursal.nombre}" inactivada. Su historial se conserva.`
    );
    setModalNotifAbierto(true);
  };

  const registrarMovimientoKardex = (
    prodNombre: string,
    suc: string,
    alm: string,
    cant: number,
    tipo: MovimientoKardex['tipoMovimiento'],
    existAnt: number,
    existPost: number,
    costoVal: number,
    motivoVal: string,
    obsVal: string
  ) => {
    const ahora = new Date();
    const nuevoMov: MovimientoKardex = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      fecha: fechaIngresoManual || ahora.toISOString().split('T')[0],
      hora: ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      usuario: usuarioLogueado ? usuarioLogueado.nombre : 'Sistema',
      sucursal: suc,
      almacen: alm,
      producto: prodNombre,
      cantidad: cant,
      tipoMovimiento: tipo,
      existenciaAnterior: existAnt,
      existenciaPosterior: existPost,
      costo: costoVal,
      motivo: motivoVal,
      observaciones: obsVal
    };
    setKardexMovimientos(prev => [nuevoMov, ...prev]);
  };

  const procesarIngresoInventario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoIngreso) return;
    if (!sucursalIngreso) {
      setMensajeNotif('Primero debe registrar y activar una sucursal para ingresar inventario.');
      setModalNotifAbierto(true);
      return;
    }
    if (!puedeOperarSucursal(sucursalIngreso)) {
      setMensajeNotif('No tiene permiso para registrar inventario en otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }
    const cant = Number(cantIngreso) || 0;
    const min = Number(minIngreso) || 3;
    const max = Number(maxIngreso) || 50;

    let existAnt = 0;
    let existPost = 0;

    setInventarioSucursales((prev: StockSucursal[]) => {
      const existe = prev.find((i: StockSucursal) => i.productoId === productoIngreso.id && i.sucursal === sucursalIngreso && i.almacen === almacenIngreso);
      if (existe) {
        existAnt = existe.stockActual;
        existPost = existAnt + cant;
        return prev.map((i: StockSucursal) => i.productoId === productoIngreso.id && i.sucursal === sucursalIngreso && i.almacen === almacenIngreso
          ? { ...i, stockActual: existPost, existenciaMinima: min, existenciaMaxima: max }
          : i
        );
      } else {
        existAnt = 0;
        existPost = cant;
        return [...prev, { productoId: productoIngreso.id, sucursal: sucursalIngreso, almacen: almacenIngreso, stockActual: cant, exhibicion: 0, apartados: 0, transito: 0, consignacion: 0, danados: 0, existenciaMinima: min, existenciaMaxima: max }];
      }
    });

    registrarMovimientoKardex(
      productoIngreso.nombre,
      sucursalIngreso,
      almacenIngreso,
      cant,
      'Entrada',
      existAnt,
      existPost,
      productoIngreso.costoPromedio || productoIngreso.precioCompra,
      motivoIngreso,
      `Fecha de registro: ${fechaIngresoManual}`
    );

    setModalIngresoStockAbierto(false);
    setProductoIngreso(null);
    setBusquedaInventarioModal('');
    setCamaraInventarioActiva(false);
    setMensajeNotif(`¡Entrada de ${cant} un. guardada con éxito el ${fechaIngresoManual}! Registrada en Kardex.`);
    setModalNotifAbierto(true);
  };

  const procesarModificacionStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockItemSeleccionado) return;
    if (!puedeOperarSucursal(stockItemSeleccionado.sucursal)) {
      setMensajeNotif('No tiene permiso para modificar inventario de otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }
    const cant = Number(cantidadMod) || 0;
    if (cant <= 0) return;

    const prodObj = catalogoProductos.find(p => p.id === stockItemSeleccionado.productoId);
    const prodNombre = prodObj ? prodObj.nombre : 'Producto';
    const existAnt = stockItemSeleccionado.stockActual;
    let existPost = existAnt;

    if (tipoMovimientoMod === 'Transferencia' || tipoMovimientoMod === 'Salida') {
      existPost = Math.max(0, existAnt - cant);
    } else if (tipoMovimientoMod === 'Devolución' || tipoMovimientoMod === 'Entrada') {
      existPost = existAnt + cant;
    } else if (tipoMovimientoMod === 'Dañado') {
      existPost = Math.max(0, existAnt - cant);
    }

    setInventarioSucursales(prev => prev.map(inv => {
      if (inv.productoId === stockItemSeleccionado.productoId && inv.sucursal === stockItemSeleccionado.sucursal && inv.almacen === stockItemSeleccionado.almacen) {
        let nuevosDanados = inv.danados;
        if (tipoMovimientoMod === 'Dañado') nuevosDanados += cant;
        return { ...inv, stockActual: existPost, danados: nuevosDanados };
      }
      return inv;
    }));

    registrarMovimientoKardex(
      prodNombre,
      stockItemSeleccionado.sucursal,
      stockItemSeleccionado.almacen,
      cant,
      tipoMovimientoMod,
      existAnt,
      existPost,
      prodObj ? prodObj.costoPromedio : 0,
      motivoMod,
      `Movimiento especial de inventario (${tipoMovimientoMod})`
    );

    setModalModificarStockAbierto(false);
    setStockItemSeleccionado(null);
    setMensajeNotif(`¡Movimiento (${tipoMovimientoMod}) de ${cant} unidades aplicado con éxito y guardado en Kardex!`);
    setModalNotifAbierto(true);
  };

  const registrarAuditoria = (e: React.FormEvent) => {
    e.preventDefault();

    const tipoAuditoriaAplicado: AuditoriaInventario['tipoAlcance'] = usuarioEsAdministrador ? audTipo : 'Sucursal';
    const valorAuditoriaAplicado = usuarioEsAdministrador ? audValor : nombreSucursalAsignadaUsuario;

    if (tipoAuditoriaAplicado === 'Sucursal' && !valorAuditoriaAplicado) {
      setMensajeNotif('Seleccione una sucursal activa antes de iniciar la auditoría.');
      setModalNotifAbierto(true);
      return;
    }
    if (tipoAuditoriaAplicado === 'Sucursal' && !puedeOperarSucursal(valorAuditoriaAplicado)) {
      setMensajeNotif('No tiene permiso para auditar otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }

    const itemsAuditoria: AuditoriaItem[] = catalogoProductos.map(prod => {
      const stockRef = obtenerStockSucursal(prod.id, valorAuditoriaAplicado);
      return {
        productoId: prod.id,
        codigo: prod.codigo,
        nombreProducto: prod.nombre,
        existenciaTeorica: stockRef,
        existenciaFisica: 0,
        diferencia: 0 - stockRef,
        tipoDiferencia: 'Faltante',
        observaciones: 'Pendiente de conteo físico'
      };
    });

    const nuevaAud: AuditoriaInventario = {
      id: Date.now(),
      folio: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      tipoAlcance: tipoAuditoriaAplicado,
      valorAlcance: valorAuditoriaAplicado,
      responsable: audResp,
      fechaAuditoria: new Date().toISOString().split('T')[0],
      estadoBloqueo: true,
      estatus: 'Pendiente Autorización',
      observaciones: audObs || 'Conteo cíclico y bloqueo de almacén activo.',
      items: itemsAuditoria
    };

    setAuditorias(prev => [nuevaAud, ...prev]);
    setModalAuditoriaAbierto(false);
    setAudObs('');
    setMensajeNotif(`¡Auditoría ${nuevaAud.folio} programada! El conteo físico inicia en 0 para cálculo de diferencias reales.`);
    setModalNotifAbierto(true);
  };


  const escanearProductoAuditoria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditoriaSeleccionadaDetalle || !codigoEscaneoAuditoria.trim()) return;

    const codigoBuscado = codigoEscaneoAuditoria.trim().toLowerCase();
    const itemsActualizados = auditoriaSeleccionadaDetalle.items.map(it => {
      if (it.codigo.toLowerCase() === codigoBuscado || it.nombreProducto.toLowerCase().includes(codigoBuscado)) {
        const nuevaFisica = it.existenciaFisica + 1;
        const dif = nuevaFisica - it.existenciaTeorica;
        let tipo: AuditoriaItem['tipoDiferencia'] = 'Exacto';
        if (dif < 0) tipo = 'Faltante';
        if (dif > 0) tipo = 'Sobrante';
        return {
          ...it,
          existenciaFisica: nuevaFisica,
          diferencia: dif,
          tipoDiferencia: tipo,
          observaciones: 'Escaneado vía Bluetooth / Teléfono / Cámara'
        };
      }
      return it;
    });

    const audModificada = { ...auditoriaSeleccionadaDetalle, items: itemsActualizados };
    setAuditoriaSeleccionadaDetalle(audModificada);
    setAuditorias(prev => prev.map(a => a.id === audModificada.id ? audModificada : a));
    setCodigoEscaneoAuditoria('');
  };

  const actualizarConteoManual = (productoId: number, nuevaFisicaStr: string) => {
    if (!auditoriaSeleccionadaDetalle) return;
    const fisicaNum = Number(nuevaFisicaStr) || 0;

    const itemsActualizados = auditoriaSeleccionadaDetalle.items.map(it => {
      if (it.productoId === productoId) {
        const dif = fisicaNum - it.existenciaTeorica;
        let tipo: AuditoriaItem['tipoDiferencia'] = 'Exacto';
        if (dif < 0) tipo = 'Faltante';
        if (dif > 0) tipo = 'Sobrante';
        return {
          ...it,
          existenciaFisica: fisicaNum,
          diferencia: dif,
          tipoDiferencia: tipo,
          observaciones: 'Conteo físico manual registrado'
        };
      }
      return it;
    });

    const audModificada = { ...auditoriaSeleccionadaDetalle, items: itemsActualizados };
    setAuditoriaSeleccionadaDetalle(audModificada);
    setAuditorias(prev => prev.map(a => a.id === audModificada.id ? audModificada : a));
  };

  const autorizarAjusteAuditoria = (audId: number) => {
    const audRef = auditorias.find(a => a.id === audId);
    if (!audRef) return;
    if (audRef.tipoAlcance === 'Sucursal' && !puedeOperarSucursal(audRef.valorAlcance)) {
      setMensajeNotif('No tiene permiso para aplicar ajustes de otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }

    setInventarioSucursales(prevInv => {
      return prevInv.map(inv => {
        const itemAud = audRef.items.find(it => it.productoId === inv.productoId && inv.sucursal === audRef.valorAlcance);
        if (itemAud) {
          const existAnt = inv.stockActual;
          const existPost = itemAud.existenciaFisica;
          if (existAnt !== existPost) {
            const prodObj = catalogoProductos.find(p => p.id === inv.productoId);
            registrarMovimientoKardex(
              prodObj ? prodObj.nombre : 'Producto',
              inv.sucursal,
              inv.almacen,
              Math.abs(existPost - existAnt),
              existPost > existAnt ? 'Entrada' : 'Salida',
              existAnt,
              existPost,
              prodObj ? prodObj.costoPromedio : 0,
              `Ajuste por Auditoría ${audRef.folio}`,
              'Autorizado y aplicado por Dirección / Administración.'
            );
          }
          return { ...inv, stockActual: itemAud.existenciaFisica };
        }
        return inv;
      });
    });

    setAuditorias(prev => prev.map(a => a.id === audId ? { ...a, estatus: 'Ajuste Aplicado', estadoBloqueo: false } : a));
    setMensajeNotif(`¡Ajustes de inventario autorizados por Gerencia y aplicados para la auditoría ${audRef.folio}! Almacén desbloqueado y registrado en Kardex.`);
    setModalNotifAbierto(true);
  };

  const registrarGastoOperativo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gImporte) return;
    if (!gSuc) {
      setMensajeNotif('Seleccione una sucursal activa para registrar el gasto.');
      setModalNotifAbierto(true);
      return;
    }
    if (!puedeOperarSucursal(gSuc)) {
      setMensajeNotif('No tiene permiso para registrar gastos en otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }

    const importeNum = Number(gImporte) || 0;
    const ivaCalc = importeNum * 0.16;
    const totalCalc = importeNum + ivaCalc;

    const nuevoGasto: GastoOperativo = {
      id: Date.now(),
      folio: `GASTO-${Math.floor(1000 + Math.random() * 9000)}`,
      categoria: gCat,
      sucursal: gSuc,
      responsable: gResp,
      proveedor: gProv,
      fecha: gFecha,
      formaPago: gFormaPago,
      importe: importeNum,
      iva: ivaCalc,
      total: totalCalc,
      documentoComprobatorio: gDoc,
      centroCostos: gCentro,
      autorizacion: gAut,
      estatus: gEstatus,
      observaciones: gObs
    };

    setGastos(prev => [nuevoGasto, ...prev]);
    setModalGastoAbierto(false);
    setGImporte('');
    setMensajeNotif('¡Gasto operativo registrado con éxito!');
    setModalNotifAbierto(true);
  };

  const registrarFacturaCxP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cxpMonto) return;

    const provObj = proveedores.find(p => p.id === Number(cxpProvId));
    const monto = Number(cxpMonto) || 0;
    const folioGenerado = cxpFolio.trim() !== '' ? cxpFolio.trim() : `GASTO-SIN-FAC-${Math.floor(1000 + Math.random() * 9000)}`;

    const nuevaCxP: CuentaPorPagar = {
      id: Date.now(),
      folioFactura: folioGenerado,
      proveedorId: provObj ? provObj.id : 1,
      proveedorNombre: provObj ? provObj.nombreComercial : 'Proveedor General',
      ordenCompra: cxpOC.trim() || 'OC-S/N',
      clasificacionGasto: cxpGasto,
      montoTotal: monto,
      montoPagado: 0.00,
      saldoPendiente: monto,
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: cxpVencimiento,
      moneda: 'MXN',
      estatus: 'Pendiente',
      comprobanteUrl: 'sin_comprobante.pdf',
      historialAbonos: []
    };

    setCuentasPorPagar(prev => [nuevaCxP, ...prev]);
    setModalCxPAbierto(false);
    setCxpFolio('');
    setCxpMonto('');
    setMensajeNotif('¡Factura o Gasto registrado en Cuentas por Pagar con éxito!');
    setModalNotifAbierto(true);
  };

  const realizarPagoCxP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cuentaSeleccionadaPago || !montoAbono || !fechaAbonoInput) return;

    const abono = Number(montoAbono) || 0;
    if (abono <= 0) return;

    const nuevoAbonoReg: AbonoCxP = {
      id: Date.now(),
      fechaAbono: fechaAbonoInput,
      montoAbono: abono,
      referencia: referenciaAbonoInput.trim() || 'Abono General'
    };

    setCuentasPorPagar(prev => prev.map(c => {
      if (c.id === cuentaSeleccionadaPago.id) {
        const nuevoPagado = c.montoPagado + abono;
        const nuevoSaldo = Math.max(0, c.montoTotal - nuevoPagado);
        let nuevoEstatus: CuentaPorPagar['estatus'] = c.estatus;

        if (nuevoSaldo === 0) {
          nuevoEstatus = 'Pagada';
        } else if (nuevoPagado > 0) {
          nuevoEstatus = 'Parcialmente pagada';
        }

        return {
          ...c,
          montoPagado: nuevoPagado,
          saldoPendiente: nuevoSaldo,
          estatus: nuevoEstatus,
          historialAbonos: [...(c.historialAbonos || []), nuevoAbonoReg]
        };
      }
      return c;
    }));

    setModalPagoAbierto(false);
    setCuentaSeleccionadaPago(null);
    setMontoAbono('');
    setReferenciaAbonoInput('SPEI Banco');
    setMensajeNotif(`¡Pago por ${formatearMoneda(abono)} con fecha ${fechaAbonoInput} registrado con éxito!`);
    setModalNotifAbierto(true);
  };

  const validarRFCValido = (rfcStr: string) => {
    const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A-Z\d])$/;
    return rfcRegex.test(rfcStr.toUpperCase().trim());
  };

  const guardarProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pRazonSocial || !pNombreComercial) return;

    if (!validarRFCValido(pRfc)) {
      setMensajeNotif('⚠️ Error: El RFC ingresado no tiene un formato válido para México (debe tener 12 o 13 caracteres alfanuméricos oficiales).');
      setModalNotifAbierto(true);
      return;
    }

    if (proveedorEditando) {
      setProveedores(prev => prev.map(p => p.id === proveedorEditando.id ? {
        ...p,
        razonSocial: pRazonSocial,
        nombreComercial: pNombreComercial,
        rfc: pRfc.toUpperCase().trim(),
        direccion: pDireccion,
        contactos: pContactos,
        telefonos: pTelefonos,
        correos: pCorreos,
        banco: pBanco,
        cuentaClabe: pCuentaClabe,
        titularCuenta: pTitularCuenta,
        moneda: pMoneda,
        diasCredito: Number(pDiasCredito) || 0,
        limiteCredito: Number(pLimiteCredito) || 0,
        productosAsociados: pProductosAsociados,
        tiempoPromedioEntrega: pTiempoEntrega,
        estatus: pEstatus
      } : p));
      setProveedorEditando(null);
      setMensajeNotif('¡Proveedor actualizado con éxito!');
      setModalNotifAbierto(true);
    } else {
      const nuevoProv: Proveedor = {
        id: Date.now(),
        razonSocial: pRazonSocial,
        nombreComercial: pNombreComercial,
        rfc: pRfc.toUpperCase().trim(),
        direccion: pDireccion,
        contactos: pContactos,
        telefonos: pTelefonos,
        correos: pCorreos,
        banco: pBanco,
        cuentaClabe: pCuentaClabe,
        titularCuenta: pTitularCuenta,
        moneda: pMoneda,
        diasCredito: Number(pDiasCredito) || 0,
        limiteCredito: Number(pLimiteCredito) || 0,
        productosAsociados: pProductosAsociados,
        tiempoPromedioEntrega: pTiempoEntrega,
        estatus: pEstatus
      };
      setProveedores(prev => [nuevoProv, ...prev]);
      setMensajeNotif('¡Proveedor registrado con éxito!');
      setModalNotifAbierto(true);
    }

    setModalProveedorAbierto(false);
    limpiarFormularioProveedor();
  };

  const abrirEdicionProveedor = (prov: Proveedor) => {
    setProveedorEditando(prov);
    setPRazonSocial(prov.razonSocial);
    setPNombreComercial(prov.nombreComercial);
    setPRfc(prov.rfc);
    setPDireccion(prov.direccion);
    setPContactos(prov.contactos);
    setPTelefonos(prov.telefonos);
    setPCorreos(prov.correos);
    setPBanco(prov.banco || 'BBVA');
    setPCuentaClabe(prov.cuentaClabe || '');
    setPTitularCuenta(prov.titularCuenta || '');
    setPMoneda(prov.moneda);
    setPDiasCredito(String(prov.diasCredito));
    setPLimiteCredito(String(prov.limiteCredito));
    setPProductosAsociados(prov.productosAsociados || []);
    setPTiempoEntrega(prov.tiempoPromedioEntrega);
    setPEstatus(prov.estatus);
    setModalProveedorAbierto(true);
  };

  const limpiarFormularioProveedor = () => {
    setPRazonSocial('');
    setPNombreComercial('');
    setPRfc('');
    setPDireccion('');
    setPContactos('');
    setPTelefonos('');
    setPCorreos('');
    setPBanco('BBVA');
    setPCuentaClabe('');
    setPTitularCuenta('');
    setPMoneda('MXN');
    setPDiasCredito('30');
    setPLimiteCredito('100000');
    setPProductosAsociados([]);
    setPTiempoEntrega('5 días');
    setPEstatus('Activo');
  };

  const agregarProductoAProveedor = () => {
    if (!pProductoSeleccionado) return;
    if (!pProductosAsociados.includes(pProductoSeleccionado)) {
      setPProductosAsociados([...pProductosAsociados, pProductoSeleccionado]);
      setPProductoSeleccionado('');
    }
  };

  const quitarProductoProveedor = (index: number) => {
    setPProductosAsociados(pProductosAsociados.filter((_, i) => i !== index));
  };

  const normalizarTextoCatalogo = (valor: string) =>
    valor.trim().toLocaleLowerCase('es-MX').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');

  const validarDuplicadoProducto = (codigo: string, nombre: string, excluirId?: number) => {
    const codigoNormalizado = codigo.trim().toUpperCase();
    const nombreNormalizado = normalizarTextoCatalogo(nombre);

    return catalogoProductos.find((p: ProductoCatalogo) => {
      if (excluirId && p.id === excluirId) return false;
      const mismoSku = p.codigo.trim().toUpperCase() === codigoNormalizado;
      const mismoNombre = normalizarTextoCatalogo(p.nombre) === nombreNormalizado;
      return mismoSku || mismoNombre;
    }) || null;
  };

  const registrarProductoCatalogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fCodigo || !fNombre || !fPVenta) return;

    const duplicado = validarDuplicadoProducto(fCodigo, fNombre);
    if (duplicado) {
      const mismoSku = duplicado.codigo.trim().toUpperCase() === fCodigo.trim().toUpperCase();
      const mismoNombre = normalizarTextoCatalogo(duplicado.nombre) === normalizarTextoCatalogo(fNombre);
      setMensajeNotif(`⚠️ No se puede registrar el producto. ${mismoSku ? `El SKU ${fCodigo.trim().toUpperCase()} ya existe` : ''}${mismoSku && mismoNombre ? ' y ' : ''}${mismoNombre ? `el nombre "${fNombre.trim()}" ya está registrado` : ''}. Edite el producto existente en lugar de crear un duplicado.`);
      setModalNotifAbierto(true);
      return;
    }

    const precioV = Number(fPVenta) || 0;
    const costoV = fPCompra ? Number(fPCompra) : precioV * 0.6;

    const nuevoProd: ProductoCatalogo = {
      id: Date.now(),
      claveInterna: fClave.trim() || `CLV-${Math.floor(1000 + Math.random() * 9000)}`,
      codigo: fCodigo.trim().toUpperCase(),
      nombre: fNombre.trim(),
      descripcion: fDesc.trim() || 'Sin descripción',
      categoria: fCat,
      subcategoria: fSubcat,
      marca: fMarca,
      modelo: fModelo,
      manejaSerie: fManejaSerie,
      // La serie física NO pertenece al SKU. Se captura al momento de vender la unidad.
      numeroSerie: 'N/A',
      paisOrigen: fPais,
      proveedor: fProv,
      precioCompra: costoV,
      noFacturaCompra: fFactura || 'SIN-FACTURA',
      pedimentoReferencia: fPedimento || 'SIN-PEDIMENTO',
      costoPromedio: costoV,
      ultimoCosto: costoV,
      precio: precioV,
      precioMayoreo: fPMayoreo ? Number(fPMayoreo) : precioV * 0.9,
      precioEspecial: fPEspecial ? Number(fPEspecial) : precioV * 0.85,
      iva: 16,
      margenUtilidad: 35,
      unidadMedida: fUnidad,
      color: fColor,
      capacidad: fCapacidad,
      imagen: '',
      manejaGarantia: fManejaGarantia,
      garantia: fManejaGarantia ? fGarantia : 'Sin garantía',
      estatus: 'Activo',
      fechaCreacion: new Date().toISOString().split('T')[0],
      ultimaModificacion: new Date().toISOString().split('T')[0],
      esRegalo: fEsRegalo,
      esPaqueteDefinido: fEsPaquete,
      componentesPaquete: fEsPaquete ? componentesSeleccionadosPaquete : undefined
    };

    setCatalogoProductos((prev: ProductoCatalogo[]) => [nuevoProd, ...prev]);
    setModalAltaAbierto(false);
    setComponentesSeleccionadosPaquete([]);
    setFClave('');
    setFCodigo('');
    setFNombre('');
    setFDesc('');
    setFPCompra('');
    setFPVenta('');
    setFSerie('');
    setMensajeNotif('¡Producto registrado con éxito!');
    setModalNotifAbierto(true);
  };

  const actualizarProductoCatalogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionadoEdicion) return;

    const duplicado = validarDuplicadoProducto(
      productoSeleccionadoEdicion.codigo,
      productoSeleccionadoEdicion.nombre,
      productoSeleccionadoEdicion.id
    );
    if (duplicado) {
      const mismoSku = duplicado.codigo.trim().toUpperCase() === productoSeleccionadoEdicion.codigo.trim().toUpperCase();
      const mismoNombre = normalizarTextoCatalogo(duplicado.nombre) === normalizarTextoCatalogo(productoSeleccionadoEdicion.nombre);
      setMensajeNotif(`⚠️ No se puede guardar la edición. ${mismoSku ? `El SKU ${productoSeleccionadoEdicion.codigo.trim().toUpperCase()} ya pertenece a otro producto` : ''}${mismoSku && mismoNombre ? ' y ' : ''}${mismoNombre ? `el nombre "${productoSeleccionadoEdicion.nombre.trim()}" ya pertenece a otro producto` : ''}.`);
      setModalNotifAbierto(true);
      return;
    }

    setCatalogoProductos((prev: ProductoCatalogo[]) =>
      prev.map((p: ProductoCatalogo) => (p.id === productoSeleccionadoEdicion.id ? productoSeleccionadoEdicion : p))
    );
    setProductoSeleccionadoEdicion(null);
    setMensajeNotif('¡Ficha técnica actualizada con éxito!');
    setModalNotifAbierto(true);
  };

  const eliminarProductoCatalogo = (producto: ProductoCatalogo) => {
    const stockRelacionado = inventarioSucursales
      .filter((inv: StockSucursal) => inv.productoId === producto.id)
      .reduce((acc: number, inv: StockSucursal) => acc + inv.stockActual + inv.exhibicion + inv.apartados + inv.transito + inv.consignacion + inv.danados, 0);

    if (stockRelacionado > 0) {
      setMensajeNotif(`No se puede eliminar "${producto.nombre}" porque todavía tiene existencias o movimientos de stock asociados. Primero deje sus existencias en cero.`);
      setModalNotifAbierto(true);
      return;
    }

    const usadoEnPaquete = catalogoProductos.some(
      (p: ProductoCatalogo) =>
        p.id !== producto.id &&
        p.esPaqueteDefinido &&
        p.componentesPaquete?.some((comp) => comp.productoId === producto.id)
    );

    if (usadoEnPaquete) {
      setMensajeNotif(`No se puede eliminar "${producto.nombre}" porque forma parte de un paquete registrado. Primero quite el producto de ese paquete.`);
      setModalNotifAbierto(true);
      return;
    }

    const confirmar = window.confirm(`¿Desea eliminar definitivamente el producto "${producto.nombre}"? Esta acción no se puede deshacer.`);
    if (!confirmar) return;

    setCatalogoProductos((prev: ProductoCatalogo[]) => prev.filter((p: ProductoCatalogo) => p.id !== producto.id));
    setInventarioSucursales((prev: StockSucursal[]) => prev.filter((inv: StockSucursal) => inv.productoId !== producto.id));
    setMensajeNotif(`Producto "${producto.nombre}" eliminado correctamente.`);
    setModalNotifAbierto(true);
  };

  const normalizarSerie = (serie: string) => serie.trim().toUpperCase();

  const calcularFechaGarantiaProducto = (producto: ProductoCatalogo) => {
    if (!producto.manejaGarantia) return 'Sin garantía';

    const fecha = new Date();
    const texto = (producto.garantia || '').toLowerCase().trim();
    const numero = Number((texto.match(/\d+/) || ['1'])[0]) || 1;

    if (texto.includes('mes')) {
      fecha.setMonth(fecha.getMonth() + numero);
    } else if (texto.includes('día') || texto.includes('dia')) {
      fecha.setDate(fecha.getDate() + numero);
    } else {
      // Si dice año/años o no se reconoce el formato, usamos años.
      fecha.setFullYear(fecha.getFullYear() + numero);
    }

    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  };

  const buscarSerieVendida = (serie: string) => {
    const objetivo = normalizarSerie(serie);
    if (!objetivo) return null;

    for (const ticket of historialTickets) {
      const item = ticket.items.find((it: ItemVenta) =>
        it.requiereSerie && normalizarSerie(it.numeroSerie || '') === objetivo
      );
      if (item) return { ticket, item };
    }
    return null;
  };

  const buscarSerieEnCotizacionPendiente = (serie: string, excluirFolio?: string | null) => {
    const objetivo = normalizarSerie(serie);
    if (!objetivo) return null;

    for (const cot of cotizaciones) {
      if (cot.estatus !== 'Pendiente') continue;
      if (excluirFolio && cot.folio === excluirFolio) continue;
      const item = cot.items.find((it: ItemVenta) =>
        it.requiereSerie && normalizarSerie(it.numeroSerie || '') === objetivo
      );
      if (item) return { cotizacion: cot, item };
    }
    return null;
  };

  const abrirCapturaSerieCarrito = (lineaId: string) => {
    const item = carrito.find((it: ItemVenta) => it.lineaId === lineaId);
    if (!item || !item.requiereSerie) return;

    const prod = catalogoProductos.find((p: ProductoCatalogo) => p.id === item.productoIdCatalogo) || null;
    setProductoPendienteSerie(prod);
    setLineaSerieEditandoId(lineaId);
    setInputNumeroSerieFisico(item.numeroSerie && item.numeroSerie !== 'PENDIENTE' ? item.numeroSerie : '');
    setModalSerieAbierto(true);
  };

  const handleEscaneoDirecto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sucursalActivaPOS) {
      setMensajeNotif('Seleccione una sucursal activa antes de agregar productos a la venta.');
      setModalNotifAbierto(true);
      return;
    }

    const termino = busquedaTexto.trim().toLowerCase();
    const prod = catalogoProductos.find(
      (p: ProductoCatalogo) =>
        p.codigo.toLowerCase() === termino ||
        p.claveInterna.toLowerCase() === termino ||
        p.nombre.toLowerCase() === termino
    );

    if (prod) {
      const stockDisp = obtenerStockSucursal(prod.id, sucursalActivaPOS);
      if (stockDisp <= 0 && !prod.esRegalo) {
        setMensajeSinStock(`El producto "${prod.nombre}" no cuenta con stock disponible en la sucursal ${sucursalActivaPOS}.`);
        setModalSinStockAbierto(true);
        setBusquedaTexto('');
        return;
      }

      if (prod.esPaqueteDefinido && prod.componentesPaquete) {
        agregarPaqueteAlCarrito(prod, stockDisp);
      } else {
        // Para productos serializados se agrega una unidad con serie PENDIENTE.
        // La serie real se captura cuando se prepara/cobra la venta.
        agregarAlCarrito(prod, prod.esRegalo || false, stockDisp, '');
      }
      setBusquedaTexto('');
    }
  };

  const confirmarNumeroSerieModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lineaSerieEditandoId) return;

    const serie = normalizarSerie(inputNumeroSerieFisico);
    if (!serie) {
      setMensajeNotif('Capture o escanee el número de serie físico del equipo antes de continuar.');
      setModalNotifAbierto(true);
      return;
    }

    const lineaActual = carrito.find((it: ItemVenta) => it.lineaId === lineaSerieEditandoId);
    if (!lineaActual) return;

    const duplicadaEnCarrito = carrito.find((it: ItemVenta) =>
      it.lineaId !== lineaSerieEditandoId &&
      it.requiereSerie &&
      normalizarSerie(it.numeroSerie || '') === serie
    );
    if (duplicadaEnCarrito) {
      setMensajeNotif(`⚠️ La serie ${serie} ya está asignada a otro artículo de esta misma venta.`);
      setModalNotifAbierto(true);
      return;
    }

    const ventaAnterior = buscarSerieVendida(serie);
    if (ventaAnterior) {
      setMensajeNotif(`⚠️ La serie ${serie} ya fue vendida anteriormente. Ticket: ${ventaAnterior.ticket.folio} | Cliente: ${ventaAnterior.ticket.cliente} | Fecha: ${ventaAnterior.ticket.fecha}. No puede utilizarse nuevamente.`);
      setModalNotifAbierto(true);
      return;
    }

    const cotizacionPendiente = buscarSerieEnCotizacionPendiente(serie, cotizacionOrigenPOS);
    if (cotizacionPendiente) {
      setMensajeNotif(`⚠️ La serie ${serie} ya está reservada en la cotización pendiente ${cotizacionPendiente.cotizacion.folio} para ${cotizacionPendiente.cotizacion.cliente}. No puede asignarse a otra operación mientras esa cotización siga pendiente.`);
      setModalNotifAbierto(true);
      return;
    }

    // Si ya existe un catálogo maestro de series (se cargará desde Excel), valida SKU ↔ serie.
    const seriesDelSku = seriesValidacion.filter((reg: SerieValidacion) =>
      reg.sku.trim().toUpperCase() === lineaActual.codigo.trim().toUpperCase()
    );
    if (seriesDelSku.length > 0) {
      const registroSerie = seriesDelSku.find((reg: SerieValidacion) => normalizarSerie(reg.numeroSerie) === serie);
      if (!registroSerie) {
        setMensajeNotif(`⚠️ La serie ${serie} no corresponde al SKU ${lineaActual.codigo}. Verifique físicamente el equipo que se entregará.`);
        setModalNotifAbierto(true);
        return;
      }
      if (registroSerie.estatus === 'Vendida') {
        setMensajeNotif(`⚠️ La serie ${serie} ya está marcada como VENDIDA en el catálogo maestro y no puede asignarse nuevamente.`);
        setModalNotifAbierto(true);
        return;
      }
    }

    setCarrito((prev: ItemVenta[]) => prev.map((it: ItemVenta) =>
      it.lineaId === lineaSerieEditandoId ? { ...it, numeroSerie: serie } : it
    ));

    setModalSerieAbierto(false);
    setLineaSerieEditandoId(null);
    setInputNumeroSerieFisico('');
    setProductoPendienteSerie(null);
  };

  const agregarAlCarrito = (producto: ProductoCatalogo, esRegalo: boolean = false, stockDisp: number, serieFisica: string = '') => {
    setVentaExitosa(false);
    setCarrito((prev: ItemVenta[]) => {
      const unidadesYaEnCarrito = prev
        .filter((item: ItemVenta) => item.id === producto.id && !item.esPaqueteComponente && item.sucursal === sucursalActivaPOS)
        .reduce((acc: number, item: ItemVenta) => acc + item.cantidadVendida, 0);

      if (!esRegalo && unidadesYaEnCarrito >= stockDisp) return prev;

      // Los artículos serializados deben permanecer en líneas independientes, una serie por unidad.
      if (!producto.manejaSerie) {
        const existe = prev.find((item: ItemVenta) =>
          item.id === producto.id &&
          !item.esPaqueteComponente &&
          !item.requiereSerie &&
          item.esRegalo === esRegalo &&
          item.sucursal === sucursalActivaPOS
        );

        if (existe) {
          return prev.map((item: ItemVenta) =>
            item.lineaId === existe.lineaId
              ? { ...item, cantidadVendida: item.cantidadVendida + 1 }
              : item
          );
        }
      }

      const nuevoItem: ItemVenta = {
        id: producto.id,
        lineaId: `${producto.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        productoIdCatalogo: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: esRegalo ? 0.00 : (producto.precio || 0),
        costo: producto.costoPromedio || producto.precioCompra || 0,
        stock: stockDisp,
        sucursal: sucursalActivaPOS,
        requiereSerie: producto.manejaSerie,
        numeroSerie: producto.manejaSerie ? normalizarSerie(serieFisica) : 'N/A',
        cantidadVendida: 1,
        esRegalo: Boolean(esRegalo),
        esPaqueteComponente: false,
        descuentoMontoFijo: 0.00,
        fechaGarantia: calcularFechaGarantiaProducto(producto)
      };
      return [...prev, nuevoItem];
    });
  };

  const agregarPaqueteAlCarrito = (paquete: ProductoCatalogo, stockDisp: number) => {
    if (stockDisp <= 0) {
      setMensajeSinStock(`El paquete "${paquete.nombre}" no cuenta con stock disponible en la sucursal ${sucursalActivaPOS}.`);
      setModalSinStockAbierto(true);
      return;
    }

    setVentaExitosa(false);
    if (!paquete.componentesPaquete) return;

    const paquetesYaEnCarrito = carrito
      .filter((it: ItemVenta) => it.nombrePaqueteOrigen === paquete.nombre && it.sucursal === sucursalActivaPOS)
      .length > 0
      ? 1
      : 0;
    if (paquetesYaEnCarrito >= stockDisp) {
      setMensajeSinStock(`No hay más existencias disponibles del paquete "${paquete.nombre}" en ${sucursalActivaPOS}.`);
      setModalSinStockAbierto(true);
      return;
    }
    
    const sumaLista = paquete.componentesPaquete.reduce((acc, c) => acc + (c.precioLista || 0), 0);
    const factorProporcional = sumaLista > 0 ? (paquete.precio || 0) / sumaLista : 1;

    setCarrito((prev: ItemVenta[]) => {
      const nuevoCarrito = [...prev];
      paquete.componentesPaquete!.forEach((comp) => {
        const precioProporcional = (comp.precioLista || 0) * factorProporcional;
        const prodComponente = catalogoProductos.find((p: ProductoCatalogo) => p.id === comp.productoId);
        const requiereSerie = Boolean(prodComponente?.manejaSerie);
        
        nuevoCarrito.push({
          id: paquete.id * 100 + comp.productoId,
          lineaId: `paq-${paquete.id}-${comp.productoId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          productoIdCatalogo: comp.productoId,
          codigo: prodComponente?.codigo || `${paquete.codigo}-${comp.productoId}`,
          nombre: comp.nombre,
          categoria: 'Paquetes / Combos',
          precio: precioProporcional,
          costo: prodComponente?.costoPromedio || prodComponente?.precioCompra || precioProporcional * 0.6,
          stock: stockDisp,
          sucursal: sucursalActivaPOS,
          requiereSerie,
          numeroSerie: requiereSerie ? '' : 'N/A',
          cantidadVendida: 1,
          esRegalo: false,
          esPaqueteComponente: true,
          nombrePaqueteOrigen: paquete.nombre,
          precioListaOriginal: comp.precioLista,
          descuentoMontoFijo: 0.00,
          fechaGarantia: prodComponente ? calcularFechaGarantiaProducto(prodComponente) : 'Sin garantía'
        });
      });
      return nuevoCarrito;
    });
  };

  const cambiarCantidad = (lineaId: string, delta: number) => {
    setCarrito((prev: ItemVenta[]) =>
      prev
        .map((item: ItemVenta) => {
          if (item.lineaId !== lineaId) return item;
          if (item.requiereSerie) return item;

          const nueva = item.cantidadVendida + delta;
          if (nueva > item.stock && !item.esRegalo) return item;
          return nueva > 0 ? { ...item, cantidadVendida: nueva } : null;
        })
        .filter(Boolean) as ItemVenta[]
    );
  };

  const quitarLineaCarrito = (lineaId: string) => {
    setCarrito((prev: ItemVenta[]) => prev.filter((item: ItemVenta) => item.lineaId !== lineaId));
  };

  const cambiarDescuentoMonto = (lineaId: string, valorTexto: string) => {
    const monto = valorTexto === '' ? 0.00 : Number(valorTexto);
    setCarrito((prev: ItemVenta[]) =>
      prev.map((item: ItemVenta) =>
        item.lineaId === lineaId
          ? { ...item, descuentoMontoFijo: Math.max(0.00, monto) }
          : item
      )
    );
  };

  const productosFiltrados = catalogoProductos.filter(
    (p: ProductoCatalogo) =>
      p.nombre.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
      p.categoria.toLowerCase().includes(busquedaTexto.toLowerCase())
  );

  const calcularSubtotalSinDescuento = () => {
    return carrito.reduce((acc: number, item: ItemVenta) => {
      if (item.esRegalo) return acc;
      const precioBase = item.esPaqueteComponente && item.precioListaOriginal ? item.precioListaOriginal : item.precio;
      return acc + (precioBase || 0) * (item.cantidadVendida || 0);
    }, 0);
  };

  const calcularTotalDescuentos = () => {
    return carrito.reduce((acc: number, item: ItemVenta) => {
      if (item.esRegalo) return acc;
      const descPaq = item.esPaqueteComponente && item.precioListaOriginal ? ((item.precioListaOriginal || 0) - (item.precio || 0)) * (item.cantidadVendida || 0) : 0;
      const descFijo = (item.descuentoMontoFijo || 0) * (item.cantidadVendida || 0);
      return acc + descPaq + descFijo;
    }, 0);
  };

  const calcularSubtotalNeto = () => {
    return Math.max(0.00, calcularSubtotalSinDescuento() - calcularTotalDescuentos());
  };

  const calcularTotal = () => {
    // Los precios capturados en el catálogo YA INCLUYEN IVA.
    // El IVA se obtiene únicamente como dato informativo y nunca se vuelve a sumar al total.
    const totalConIva = calcularSubtotalNeto();
    const ivaIncluido = totalConIva - (totalConIva / 1.16);
    return {
      subtotalBruto: calcularSubtotalSinDescuento(),
      descuentoTotal: calcularTotalDescuentos(),
      subtotalNeto: totalConIva,
      iva: ivaIncluido,
      total: totalConIva
    };
  };

  const cantidadItemsPorProducto = (items: ItemVenta[], productoId: number, sucursal: string) => {
    return items
      .filter((it: ItemVenta) => it.id === productoId && it.sucursal === sucursal && !it.esPaqueteComponente)
      .reduce((acc: number, it: ItemVenta) => acc + (it.cantidadVendida || 0), 0);
  };

  const generarCotizacion = () => {
    if (carrito.length === 0) return;
    if (!sucursalActivaPOS) {
      setMensajeNotif('Seleccione una sucursal activa antes de generar la cotización.');
      setModalNotifAbierto(true);
      return;
    }
    if (!puedeOperarSucursal(sucursalActivaPOS)) {
      setMensajeNotif('No tiene permiso para generar cotizaciones en otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }

    // Si se capturaron series antes de cotizar, deben ser únicas y no estar vendidas ni reservadas.
    const seriesCotizacion = carrito
      .filter((it: ItemVenta) => it.requiereSerie && normalizarSerie(it.numeroSerie || ''))
      .map((it: ItemVenta) => normalizarSerie(it.numeroSerie));

    const serieDuplicadaCot = seriesCotizacion.find((serie: string, index: number) => seriesCotizacion.indexOf(serie) !== index);
    if (serieDuplicadaCot) {
      setMensajeNotif(`⚠️ No se puede generar la cotización. La serie ${serieDuplicadaCot} está repetida dentro de la misma cotización.`);
      setModalNotifAbierto(true);
      return;
    }

    for (const serie of seriesCotizacion) {
      const ventaAnterior = buscarSerieVendida(serie);
      if (ventaAnterior) {
        setMensajeNotif(`⚠️ No se puede cotizar la serie ${serie} porque ya fue vendida en el ticket ${ventaAnterior.ticket.folio}.`);
        setModalNotifAbierto(true);
        return;
      }
      const cotPendiente = buscarSerieEnCotizacionPendiente(serie, cotizacionOrigenPOS);
      if (cotPendiente) {
        setMensajeNotif(`⚠️ No se puede cotizar la serie ${serie} porque ya está reservada en la cotización pendiente ${cotPendiente.cotizacion.folio}.`);
        setModalNotifAbierto(true);
        return;
      }
    }

    const { total } = calcularTotal();

    const ahora = new Date();
    const fechaCreacionStr = ahora.toLocaleString();
    const expiracionDate = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);

    // La cotización reserva cantidad, no números de serie físicos.
    setInventarioSucursales((prevInv: StockSucursal[]) =>
      prevInv.map((inv: StockSucursal) => {
        const cantidadReservada = cantidadItemsPorProducto(carrito, inv.productoId, sucursalActivaPOS);
        if (cantidadReservada > 0) {
          return { ...inv, stockActual: Math.max(0, inv.stockActual - cantidadReservada) };
        }
        return inv;
      })
    );

    const itemsCotizacion = carrito.map((it: ItemVenta) => ({
      ...it,
      // La serie no es obligatoria para cotizar. Si el usuario ya identificó físicamente
      // una unidad y capturó su serie, se conserva y queda reservada por esta cotización.
      numeroSerie: it.requiereSerie ? normalizarSerie(it.numeroSerie || '') : it.numeroSerie
    }));

    const nuevaCotizacion: Cotizacion = {
      folio: `COT-${Math.floor(100000 + Math.random() * 900000)}`,
      fechaCreacion: fechaCreacionStr,
      fechaExpiracion: expiracionDate.toLocaleString(),
      cliente: clienteSeleccionadoPOS,
      sucursal: sucursalActivaPOS,
      items: itemsCotizacion,
      total,
      estatus: 'Pendiente'
    };

    setCotizaciones(prev => [nuevaCotizacion, ...prev]);
    setCarrito([]);
    setCotizacionOrigenPOS(null);
    setMensajeNotif(`¡Cotización ${nuevaCotizacion.folio} generada con éxito! El inventario quedó reservado por 48 horas. Las series físicas se capturarán únicamente al concretar la venta.`);
    setModalNotifAbierto(true);
  };

  const autorizarCotizacion = (cot: Cotizacion) => {
    if (cot.estatus !== 'Pendiente') return;
    if (!puedeOperarSucursal(cot.sucursal)) {
      setMensajeNotif('No tiene permiso para autorizar cotizaciones de otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }

    const itemsParaVenta = cot.items.map((it: ItemVenta, index: number) => ({
      ...it,
      lineaId: it.lineaId || `cot-${cot.folio}-${index}-${Math.random().toString(36).slice(2, 8)}`,
      productoIdCatalogo: it.productoIdCatalogo || it.id,
      requiereSerie: Boolean(it.requiereSerie),
      // Si la cotización ya reservó una serie, se conserva al pasar a Venta.
      // Si no tenía serie, se captura físicamente antes de cobrar.
      numeroSerie: it.requiereSerie ? normalizarSerie(it.numeroSerie || '') : (it.numeroSerie || 'N/A')
    }));

    setCarrito(itemsParaVenta);
    setClienteSeleccionadoPOS(cot.cliente);
    setSucursalActivaPOS(cot.sucursal);
    setCotizacionOrigenPOS(cot.folio);
    setVentaExitosa(false);
    setModuloActivo('ventas');
    setMensajeNotif(`Cotización ${cot.folio} cargada en Ventas. El stock ya está reservado; capture las series físicas de los equipos y después presione Cobrar Directo.`);
    setModalNotifAbierto(true);
  };

  const expirarCotizacion = (cot: Cotizacion) => {
    if (cot.estatus !== 'Pendiente') return;
    if (!puedeOperarSucursal(cot.sucursal)) {
      setMensajeNotif('No tiene permiso para modificar cotizaciones de otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }

    setInventarioSucursales((prevInv: StockSucursal[]) =>
      prevInv.map((inv: StockSucursal) => {
        const cantidadRegresar = cantidadItemsPorProducto(cot.items, inv.productoId, cot.sucursal);
        if (cantidadRegresar > 0) {
          return { ...inv, stockActual: inv.stockActual + cantidadRegresar };
        }
        return inv;
      })
    );

    setCotizaciones(prev => prev.map(c => c.folio === cot.folio ? { ...c, estatus: 'Expirada' } : c));
    if (cotizacionOrigenPOS === cot.folio) {
      setCarrito([]);
      setCotizacionOrigenPOS(null);
    }
    setMensajeNotif(`La cotización ${cot.folio} ha expirado y el stock ha sido regresado al inventario.`);
    setModalNotifAbierto(true);
  };

  const procesarVenta = () => {
    if (carrito.length === 0) return;
    if (!sucursalActivaPOS) {
      setMensajeNotif('Seleccione una sucursal activa antes de cobrar la venta.');
      setModalNotifAbierto(true);
      return;
    }
    if (!puedeOperarSucursal(sucursalActivaPOS)) {
      setMensajeNotif('No tiene permiso para cobrar ventas en otra sucursal.');
      setModalNotifAbierto(true);
      return;
    }

    // 1) Toda unidad serializada debe tener una serie física antes del cobro.
    const lineaSinSerie = carrito.find((it: ItemVenta) => it.requiereSerie && !normalizarSerie(it.numeroSerie || ''));
    if (lineaSinSerie) {
      abrirCapturaSerieCarrito(lineaSinSerie.lineaId);
      setMensajeNotif(`El artículo "${lineaSinSerie.nombre}" requiere capturar o escanear su número de serie físico antes de cobrar.`);
      setModalNotifAbierto(true);
      return;
    }

    // 2) Validación defensiva: no repetir series en la misma venta.
    const seriesVenta = carrito
      .filter((it: ItemVenta) => it.requiereSerie)
      .map((it: ItemVenta) => normalizarSerie(it.numeroSerie));
    const serieDuplicada = seriesVenta.find((serie: string, index: number) => seriesVenta.indexOf(serie) !== index);
    if (serieDuplicada) {
      setMensajeNotif(`⚠️ La serie ${serieDuplicada} está repetida dentro de la venta. Corrija la serie antes de cobrar.`);
      setModalNotifAbierto(true);
      return;
    }

    // 3) No permitir vender nuevamente una serie ya vendida ni una serie reservada en otra cotización pendiente.
    for (const serie of seriesVenta) {
      const ventaAnterior = buscarSerieVendida(serie);
      if (ventaAnterior) {
        setMensajeNotif(`⚠️ La serie ${serie} ya fue vendida. Ticket: ${ventaAnterior.ticket.folio} | Cliente: ${ventaAnterior.ticket.cliente} | Fecha: ${ventaAnterior.ticket.fecha}.`);
        setModalNotifAbierto(true);
        return;
      }
      const cotPendiente = buscarSerieEnCotizacionPendiente(serie, cotizacionOrigenPOS);
      if (cotPendiente) {
        setMensajeNotif(`⚠️ La serie ${serie} está reservada en la cotización pendiente ${cotPendiente.cotizacion.folio}. No puede venderse en otra operación.`);
        setModalNotifAbierto(true);
        return;
      }
    }

    const { subtotalBruto, descuentoTotal, subtotalNeto, iva, total } = calcularTotal();
    const folioTicket = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const clienteObj = clientes.find(c => c.nombreComercial === clienteSeleccionadoPOS);
    if (metodoPagoSeleccionado === 'Crédito' && clienteObj) {
      const nuevaDeudaTotal = clienteObj.saldoActualDeuda + total;
      if (nuevaDeudaTotal > clienteObj.limiteCredito && !clienteObj.bloqueadoCredito) {
        setClienteParaAutorizar(clienteObj);
        setModalAutorizacionAbierto(true);
        return;
      }
      if (clienteObj.bloqueadoCredito) {
        setMensajeNotif(`⚠️ Venta BLOQUEADA: El cliente "${clienteObj.nombreComercial}" ha excedido su límite de crédito o tiene adeudos vencidos.`);
        setModalNotifAbierto(true);
        return;
      }
    }

    // Una venta proveniente de cotización NO vuelve a descontar inventario: ya estaba reservado.
    if (!cotizacionOrigenPOS) {
      setInventarioSucursales((prevInv: StockSucursal[]) =>
        prevInv.map((inv: StockSucursal) => {
          const cantidadVendida = cantidadItemsPorProducto(carrito, inv.productoId, sucursalActivaPOS);
          if (cantidadVendida > 0) {
            const existAnt = inv.stockActual;
            const existPost = Math.max(0, existAnt - cantidadVendida);
            const prodObj = catalogoProductos.find(p => p.id === inv.productoId);
            registrarMovimientoKardex(
              prodObj ? prodObj.nombre : 'Producto',
              inv.sucursal,
              inv.almacen,
              cantidadVendida,
              'Venta',
              existAnt,
              existPost,
              prodObj ? prodObj.costoPromedio : 0,
              `Venta POS ${folioTicket}`,
              `Cliente: ${clienteSeleccionadoPOS}`
            );
            return { ...inv, stockActual: existPost };
          }
          return inv;
        })
      );
    } else {
      // Aunque el stock ya estaba reservado, registramos la salida definitiva en Kardex.
      const productosProcesados = new Set<number>();
      carrito.forEach((it: ItemVenta) => {
        if (it.esPaqueteComponente || productosProcesados.has(it.id)) return;
        productosProcesados.add(it.id);
        const cantidadVendida = cantidadItemsPorProducto(carrito, it.id, sucursalActivaPOS);
        const inv = inventarioSucursales.find((x: StockSucursal) => x.productoId === it.id && x.sucursal === sucursalActivaPOS);
        const prodObj = catalogoProductos.find(p => p.id === it.id);
        registrarMovimientoKardex(
          prodObj ? prodObj.nombre : it.nombre,
          sucursalActivaPOS,
          inv?.almacen || '',
          cantidadVendida,
          'Venta',
          (inv?.stockActual || 0) + cantidadVendida,
          inv?.stockActual || 0,
          prodObj ? prodObj.costoPromedio : 0,
          `Venta desde ${cotizacionOrigenPOS} / ${folioTicket}`,
          `Cliente: ${clienteSeleccionadoPOS}`
        );
      });
    }

    if (metodoPagoSeleccionado === 'Crédito' && clienteObj) {
      const fechaHoyStr = new Date().toISOString().split('T')[0];
      const diasCred = clienteObj.diasCredito || 30;
      const vencDate = new Date();
      vencDate.setDate(vencDate.getDate() + diasCred);
      const vencStr = vencDate.toISOString().split('T')[0];

      const nuevaCxC: CuentaPorCobrar = {
        id: Date.now(),
        folioVenta: folioTicket,
        clienteId: clienteObj.id,
        clienteNombre: clienteObj.nombreComercial,
        fechaEmision: fechaHoyStr,
        fechaVencimiento: vencStr,
        montoTotal: total,
        montoPagado: 0.00,
        saldoPendiente: total,
        estatus: 'Pendiente',
        promesaPago: 'Sin promesa registrada',
        recordatorioEnviado: false,
        notasCreditoAplicadas: 0.00,
        abonos: []
      };

      setCuentasPorCobrar(prev => [nuevaCxC, ...prev]);
      setClientes(prev => prev.map(cl => cl.id === clienteObj.id ? { ...cl, saldoActualDeuda: cl.saldoActualDeuda + total } : cl));
    }

    const ticketInfo: TicketGuardado = {
      folio: folioTicket,
      fecha: new Date().toLocaleString(),
      cliente: clienteSeleccionadoPOS,
      metodoPago: metodoPagoSeleccionado,
      sucursal: sucursalActivaPOS,
      items: carrito.map((it: ItemVenta) => ({
        ...it,
        numeroSerie: it.requiereSerie ? normalizarSerie(it.numeroSerie) : 'N/A'
      })),
      subtotalBruto,
      descuentoTotal,
      subtotalNeto,
      iva,
      total
    };

    setTicketGenerado(ticketInfo);
    setHistorialTickets((prev: TicketGuardado[]) => [ticketInfo, ...prev]);
    if (seriesVenta.length > 0) {
      setSeriesValidacion((prev: SerieValidacion[]) => prev.map((reg: SerieValidacion) =>
        seriesVenta.includes(normalizarSerie(reg.numeroSerie)) ? { ...reg, estatus: 'Vendida' } : reg
      ));
    }
    setVentaExitosa(true);

    if (cotizacionOrigenPOS) {
      setCotizaciones(prev => prev.map(c => c.folio === cotizacionOrigenPOS ? { ...c, estatus: 'Autorizada' } : c));
      setCotizacionOrigenPOS(null);
    }

    setCarrito([]);
  };

  const ejecutarDescargaTicketPDF = (ticket: TicketGuardado) => {
    const ventanaImpresion = window.open('', '_blank', 'width=450,height=600');
    if (!ventanaImpresion) {
      alert('Por favor permita las ventanas emergentes (pop-ups) para descargar el PDF del ticket.');
      return;
    }

    let htmlContenido = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Venta - ${ticket.folio}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; padding: 15px; width: 320px; margin: 0 auto; }
            h2, h3 { text-align: center; margin: 5px 0; }
            .linea { border-bottom: 1px dashed #000; margin: 10px 0; }
            .flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            @media print {
              body { width: 100%; }
            }
          </style>
        </head>
        <body>
          <h2>JF EQUIPOS S.A. DE C.V.</h2>
          <h3>TICKET DE VENTA Y GARANTÍA</h3>
          <div class="linea"></div>
          <p><strong>Folio:</strong> ${ticket.folio}</p>
          <p><strong>Cliente:</strong> ${ticket.cliente}</p>
          <p><strong>Fecha:</strong> ${ticket.fecha}</p>
          <p><strong>Método de Pago:</strong> ${ticket.metodoPago}</p>
          <div class="linea"></div>
          <strong>DESCRIPCIÓN DE ARTÍCULOS:</strong><br><br>
    `;

    ticket.items.forEach((it, idx) => {
      const unitFinal = it.esRegalo ? 0.00 : Math.max(0.00, (it.precio || 0) - (it.descuentoMontoFijo || 0));
      htmlContenido += `
        <div>${idx + 1}. ${it.cantidadVendida}x ${it.nombre}</div>
        <div class="flex"><span>Precio:</span><span>${formatearMoneda(unitFinal * it.cantidadVendida)}</span></div>
        ${it.requiereSerie && it.numeroSerie ? `<div>📌 N/S: ${it.numeroSerie}</div>` : ''}
        ${it.fechaGarantia !== 'Sin garantía' ? `<div>🛡️ Garantía: ${it.fechaGarantia}</div>` : ''}
        <br>
      `;
    });

    htmlContenido += `
          <div class="linea"></div>
          <div class="flex"><span>Subtotal Bruto:</span><span>${formatearMoneda(ticket.subtotalBruto)}</span></div>
          <div class="flex"><span>Descuentos:</span><span>-${formatearMoneda(ticket.descuentoTotal)}</span></div>
          <div class="flex"><span>IVA incluido (16%):</span><span>${formatearMoneda(ticket.iva)}</span></div>
          <div class="linea"></div>
          <div class="flex bold" style="font-size: 14px;"><span>TOTAL A PAGAR:</span><span>${formatearMoneda(ticket.total)}</span></div>
          <div class="linea"></div>
          <p style="text-align: center;">¡Gracias por su preferencia!<br>Conserve este ticket para cualquier aclaración o garantía.</p>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    ventanaImpresion.document.write(htmlContenido);
    ventanaImpresion.document.close();
    setTicketGenerado(null);
    setVentaExitosa(false);
  };

  const convertirFechaTicket = (fecha: string) => {
    const fechaConvertida = new Date(fecha);
    return Number.isNaN(fechaConvertida.getTime()) ? null : fechaConvertida;
  };

  const ahora = new Date();
  const ventasDelDia = historialVisibleUsuario
    .filter((ticket: TicketGuardado) => {
      const fechaTicket = convertirFechaTicket(ticket.fecha);
      return fechaTicket &&
        fechaTicket.getFullYear() === ahora.getFullYear() &&
        fechaTicket.getMonth() === ahora.getMonth() &&
        fechaTicket.getDate() === ahora.getDate();
    })
    .reduce((acc: number, ticket: TicketGuardado) => acc + ticket.total, 0);

  const ventasDelMes = historialVisibleUsuario
    .filter((ticket: TicketGuardado) => {
      const fechaTicket = convertirFechaTicket(ticket.fecha);
      return fechaTicket &&
        fechaTicket.getFullYear() === ahora.getFullYear() &&
        fechaTicket.getMonth() === ahora.getMonth();
    })
    .reduce((acc: number, ticket: TicketGuardado) => acc + ticket.total, 0);

  const mapaProductosVendidos = new Map<string, { nombre: string; cat: string; qty: number; total: number }>();
  historialVisibleUsuario.forEach((ticket: TicketGuardado) => {
    ticket.items.forEach((item: ItemVenta) => {
      if (item.esRegalo) return;
      const actual = mapaProductosVendidos.get(item.nombre) || {
        nombre: item.nombre,
        cat: item.categoria,
        qty: 0,
        total: 0
      };
      actual.qty += item.cantidadVendida;
      actual.total += (item.precio * item.cantidadVendida) - (item.descuentoMontoFijo || 0);
      mapaProductosVendidos.set(item.nombre, actual);
    });
  });
  const resumenProductosVendidos: { nombre: string; cat: string; qty: number; total: number }[] =
    [...mapaProductosVendidos.values()]
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

  const mapaMejoresClientes = new Map<string, { cliente: string; compras: number; total: number }>();
  historialVisibleUsuario.forEach((ticket: TicketGuardado) => {
    const nombreCliente = ticket.cliente || 'Público General';
    const actual = mapaMejoresClientes.get(nombreCliente) || {
      cliente: nombreCliente,
      compras: 0,
      total: 0
    };
    actual.compras += 1;
    actual.total += ticket.total;
    mapaMejoresClientes.set(nombreCliente, actual);
  });
  const resumenMejoresClientes: { cliente: string; compras: number; total: number }[] =
    [...mapaMejoresClientes.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

  const inicioReporte = fechaInicioReporte ? new Date(`${fechaInicioReporte}T00:00:00`) : null;
  const finReporte = fechaFinReporte ? new Date(`${fechaFinReporte}T23:59:59`) : null;
  const sucursalReporteEfectiva = usuarioEsAdministrador ? sucursalReporte : nombreSucursalAsignadaUsuario;

  const ticketsPeriodoReporte = historialTickets.filter((ticket: TicketGuardado) => {
    const fechaTicket = convertirFechaTicket(ticket.fecha);
    if (!fechaTicket) return false;
    if (inicioReporte && fechaTicket < inicioReporte) return false;
    if (finReporte && fechaTicket > finReporte) return false;
    if (sucursalReporteEfectiva !== 'Todas' && ticket.sucursal !== sucursalReporteEfectiva) return false;
    if (categoriaReporte !== 'Todas' && !ticket.items.some(item => item.categoria === categoriaReporte)) return false;
    return true;
  });

  const ventasPeriodoReporte = ticketsPeriodoReporte.reduce((acc: number, ticket: TicketGuardado) => acc + ticket.total, 0);
  const efectivoPeriodoReporte = ticketsPeriodoReporte
    .filter((ticket: TicketGuardado) => ticket.metodoPago.toLowerCase().includes('efectivo'))
    .reduce((acc: number, ticket: TicketGuardado) => acc + ticket.total, 0);
  const bancosPeriodoReporte = ticketsPeriodoReporte
    .filter((ticket: TicketGuardado) => !ticket.metodoPago.toLowerCase().includes('efectivo'))
    .reduce((acc: number, ticket: TicketGuardado) => acc + ticket.total, 0);
  const costoVentasPeriodo = ticketsPeriodoReporte.reduce(
    (acc: number, ticket: TicketGuardado) =>
      acc + ticket.items.reduce((suma: number, item: ItemVenta) => suma + (item.costo * item.cantidadVendida), 0),
    0
  );
  const gastosPeriodoReporte = gastos
    .filter((gasto: GastoOperativo) => {
      if (!gasto.fecha) return true;
      const fechaGasto = new Date(`${gasto.fecha}T12:00:00`);
      if (inicioReporte && fechaGasto < inicioReporte) return false;
      if (finReporte && fechaGasto > finReporte) return false;
      if (sucursalReporteEfectiva !== 'Todas' && gasto.sucursal !== sucursalReporteEfectiva) return false;
      return true;
    })
    .reduce((acc: number, gasto: GastoOperativo) => acc + gasto.total, 0);
  const utilidadNetaPeriodo = ventasPeriodoReporte - costoVentasPeriodo - gastosPeriodoReporte;

  const exportarExcelReporte = () => {
    const contenidoCSV = `Reporte Financiero (Del ${fechaInicioReporte} al ${fechaFinReporte})\nSucursal,Ventas Periodo,Gastos Op.,Efectivo Caja,Bancos,Utilidad Neta\n${sucursalReporteEfectiva}, ${ventasPeriodoReporte.toFixed(2)}, ${gastosPeriodoReporte.toFixed(2)}, ${efectivoPeriodoReporte.toFixed(2)}, ${bancosPeriodoReporte.toFixed(2)}, ${utilidadNetaPeriodo.toFixed(2)}`;
    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Reporte_Financiero_${fechaInicioReporte}_al_${fechaFinReporte}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMensajeNotif('¡Reporte exportado a Excel / CSV con éxito!');
    setModalNotifAbierto(true);
  };

  const exportarPDFReporte = () => {
    setMensajeNotif('Generando documento PDF ejecutivo para Dirección y Administración...');
    setModalNotifAbierto(true);
    window.print();
  };

  const limpiarFormularioUsuario = () => {
    setUsuarioEditando(null);
    setNuevoNombreUsr('');
    setNuevoEmailUsr('');
    setNuevoPassUsr('');
    setNuevoRolUsr('Operador / Ventas');
    setNuevaSucursalUsrId('');
  };

  const abrirNuevoUsuario = () => {
    limpiarFormularioUsuario();
    setModalUsuarioAbierto(true);
  };

  const abrirEditarUsuario = (usuario: UsuarioSistema) => {
    setUsuarioEditando(usuario);
    setNuevoNombreUsr(usuario.nombre);
    setNuevoEmailUsr(usuario.email);
    setNuevoPassUsr('');
    setNuevoRolUsr(usuario.rol);
    setNuevaSucursalUsrId(usuario.sucursalId ? String(usuario.sucursalId) : '');
    setModalUsuarioAbierto(true);
  };

  const llamarApiUsuarios = async (method: 'POST' | 'PATCH', body: any) => {
    const { data: sesionData } = await supabase.auth.getSession();
    const token = sesionData.session?.access_token;
    if (!token) throw new Error('La sesión del Administrador no está disponible.');

    const resp = await fetch('/api/admin/users', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const resultado = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(resultado?.error || 'No fue posible completar la operación de usuario.');
    return resultado;
  };

  const guardarUsuarioSistema = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombreUsr.trim() || !nuevoEmailUsr.trim()) return;
    if (!usuarioEditando && nuevoPassUsr.trim().length < 8) {
      setMensajeNotif('La contraseña temporal debe tener al menos 8 caracteres.');
      setModalNotifAbierto(true);
      return;
    }
    if (usuarioEditando && nuevoPassUsr.trim() && nuevoPassUsr.trim().length < 8) {
      setMensajeNotif('Si desea cambiar la contraseña, debe tener al menos 8 caracteres.');
      setModalNotifAbierto(true);
      return;
    }

    const rolAdministrador = nuevoRolUsr === 'Administrador';
    const sucursalIdSeleccionada = rolAdministrador ? null : Number(nuevaSucursalUsrId);

    if (!rolAdministrador) {
      if (!sucursalIdSeleccionada) {
        setMensajeNotif('Debe asignar una sucursal activa a este usuario.');
        setModalNotifAbierto(true);
        return;
      }
      const sucursalValida = sucursalesActivas.find(s => s.id === sucursalIdSeleccionada);
      if (!sucursalValida) {
        setMensajeNotif('La sucursal seleccionada no está activa.');
        setModalNotifAbierto(true);
        return;
      }
    }

    const correoNormalizado = nuevoEmailUsr.trim().toLowerCase();
    const correoDuplicado = usuariosSistema.some(u =>
      u.email.toLowerCase() === correoNormalizado && u.id !== usuarioEditando?.id
    );
    if (correoDuplicado) {
      setMensajeNotif('Ya existe un usuario registrado con ese correo electrónico.');
      setModalNotifAbierto(true);
      return;
    }

    try {
      if (usuarioEditando) {
        await llamarApiUsuarios('PATCH', {
          id: usuarioEditando.id,
          fullName: nuevoNombreUsr.trim(),
          email: correoNormalizado,
          password: nuevoPassUsr.trim() || undefined,
          roleName: nuevoRolUsr,
          branchId: sucursalIdSeleccionada,
          active: usuarioEditando.activo
        });
        setMensajeNotif('¡Usuario actualizado en Supabase!');
      } else {
        await llamarApiUsuarios('POST', {
          fullName: nuevoNombreUsr.trim(),
          email: correoNormalizado,
          password: nuevoPassUsr.trim(),
          roleName: nuevoRolUsr,
          branchId: sucursalIdSeleccionada
        });
        setMensajeNotif('¡Usuario creado en Supabase Auth y en el ERP!');
      }

      if (usuarioLogueado) await cargarCatalogosSeguridad(usuarioLogueado);
      setModalUsuarioAbierto(false);
      limpiarFormularioUsuario();
      setModalNotifAbierto(true);
    } catch (error: any) {
      setMensajeNotif(`No fue posible guardar el usuario: ${error?.message || String(error)}`);
      setModalNotifAbierto(true);
    }
  };

  const cambiarEstatusUsuario = async (usuario: UsuarioSistema) => {
    try {
      await llamarApiUsuarios('PATCH', {
        id: usuario.id,
        fullName: usuario.nombre,
        email: usuario.email,
        roleName: usuario.rol,
        branchId: usuario.sucursalId,
        active: !usuario.activo
      });
      setUsuariosSistema(prev => prev.map(u => u.id === usuario.id ? { ...u, activo: !u.activo } : u));
    } catch (error: any) {
      setMensajeNotif(`No fue posible cambiar el estatus del usuario: ${error?.message || String(error)}`);
      setModalNotifAbierto(true);
    }
  };

  const guardarPermisosRol = async () => {
    if (!rolEditandoPermisos) return;
    if (rolEditandoPermisos.nombreRol === 'Administrador') {
      setMensajeNotif('El rol Administrador conserva acceso global a todos los módulos.');
      setModalNotifAbierto(true);
      return;
    }
    const { error } = await supabase
      .from('roles')
      .update({ allowed_modules: rolEditandoPermisos.modulosPermitidos })
      .eq('name', rolEditandoPermisos.nombreRol);
    if (error) {
      setMensajeNotif(`No fue posible guardar los permisos: ${error.message}`);
      setModalNotifAbierto(true);
      return;
    }
    setRolesSistema(prev => prev.map(r => r.nombreRol === rolEditandoPermisos.nombreRol ? rolEditandoPermisos : r));
    setModalPermisosAbierto(false);
    setMensajeNotif(`Permisos de ${rolEditandoPermisos.nombreRol} guardados en la base de datos.`);
    setModalNotifAbierto(true);
  };

  // Verificación de permisos por rol basado en el usuario logueado
  const verificarPermisoModulo = (modulo: string) => {
    if (!usuarioLogueado) return false;
    if (usuarioLogueado.rol === 'Administrador') return true;
    const rolRef = rolesSistema.find(r => r.nombreRol === usuarioLogueado.rol);
    return rolRef ? rolRef.modulosPermitidos.includes(modulo) : false;
  };

  const { subtotalBruto, descuentoTotal, subtotalNeto, iva, total } = calcularTotal();

  // Mientras Supabase comprueba la sesión evitamos el "parpadeo" de la pantalla de login.
  if (!sesionCargada) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-blue-400 font-black text-xl tracking-wider">JF EQUIPOS ERP</div>
          <div className="text-slate-500 text-xs mt-2">Restaurando sesión...</div>
        </div>
      </div>
    );
  }

  // Pantalla de Autenticación / Login
  if (!usuarioLogueado) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black text-blue-400 tracking-wider">JF EQUIPOS ERP</h1>
            <p className="text-xs text-slate-500 mt-1">Control Administrativo y Operativo</p>
          </div>

          {!vistaRecuperacion ? (
            <form onSubmit={iniciarSesionSupabase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Correo Electrónico:</label>
                <input
                  type="email"
                  value={emailLogin}
                  onChange={(e) => setEmailLogin(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Contraseña:</label>
                <input
                  type="password"
                  value={passwordLogin}
                  onChange={(e) => setPasswordLogin(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg cursor-pointer">
                Iniciar Sesión
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setVistaRecuperacion(true)} className="text-xs text-blue-400 hover:underline cursor-pointer">
                  ¿Olvidaste tu contraseña? Recupérala aquí
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={enviarRecuperacionSupabase} className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
                Ingrese el correo electrónico asociado a su cuenta para recibir instrucciones de recuperación de contraseña.
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Correo Electrónico de Recuperación:</label>
                <input
                  type="email"
                  value={emailRecuperacion}
                  onChange={(e) => setEmailRecuperacion(e.target.value)}
                  required
                  placeholder="usuario@jfequipos.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm"
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg cursor-pointer">
                Enviar Enlace de Recuperación
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setVistaRecuperacion(false)} className="text-xs text-slate-400 hover:underline cursor-pointer">
                  Volver al Inicio de Sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* MENÚ MÓVIL */}
      {menuMovilAbierto && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMenuMovilAbierto(false)}
            className="absolute inset-0 bg-black/70 w-full h-full cursor-pointer"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[86%] max-w-xs bg-slate-900 border-r border-slate-700 shadow-2xl flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-black text-blue-400 tracking-wider">JF EQUIPOS</h1>
                <p className="text-xs text-slate-500 mt-1">Rol: <span className="text-amber-400 font-bold">{usuarioLogueado.rol}</span></p>
                <p className="text-[10px] text-slate-500 mt-1">Sucursal: <span className="text-emerald-400 font-bold">{usuarioEsAdministrador ? 'Todas' : (nombreSucursalAsignadaUsuario || 'Sin asignar')}</span></p>
              </div>
              <button type="button" onClick={() => setMenuMovilAbierto(false)} className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm cursor-pointer">✕</button>
            </div>

            <nav className="p-3 space-y-1.5 overflow-y-auto flex-1">
              {LISTA_MODULOS_DISPONIBLES
                .filter((mod) => verificarPermisoModulo(mod.id) && (mod.id !== 'usuarios' || usuarioLogueado.rol === 'Administrador'))
                .map((mod) => (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => { setModuloActivo(mod.id); setMenuMovilAbierto(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl font-medium text-sm cursor-pointer ${moduloActivo === mod.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:bg-slate-800'}`}
                  >
                    {mod.nombre}
                  </button>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button type="button" onClick={cerrarSesion} className="w-full bg-red-950/60 border border-red-800 text-red-300 font-bold py-3 rounded-xl text-xs cursor-pointer">
                Cerrar Sesión ({usuarioLogueado.nombre})
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Sidebar Corporativo Dinámico por Roles */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-blue-400 tracking-wider">JF EQUIPOS</h1>
              <p className="text-xs text-slate-500 mt-1">Rol: <span className="text-amber-400 font-bold">{usuarioLogueado.rol}</span></p>
              <p className="text-[10px] text-slate-500 mt-1">
                Sucursal: <span className="text-emerald-400 font-bold">{usuarioEsAdministrador ? 'Todas' : (nombreSucursalAsignadaUsuario || 'Sin asignar')}</span>
              </p>
            </div>
          </div>
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {verificarPermisoModulo('inicio') && (
              <button type="button" onClick={() => setModuloActivo('inicio')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'inicio' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>📊 Panel General</button>
            )}
            {verificarPermisoModulo('productos') && (
              <button type="button" onClick={() => setModuloActivo('productos')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'productos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🏷️ Productos</button>
            )}
            {verificarPermisoModulo('inventario') && (
              <button type="button" onClick={() => setModuloActivo('inventario')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'inventario' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>📦 Inventario / Kardex</button>
            )}
            {verificarPermisoModulo('sucursales') && (
              <button type="button" onClick={() => setModuloActivo('sucursales')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'sucursales' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🏢 Sucursales</button>
            )}
            {verificarPermisoModulo('clientes') && (
              <button type="button" onClick={() => setModuloActivo('clientes')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'clientes' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>👥 Clientes</button>
            )}
            {verificarPermisoModulo('proveedores') && (
              <button type="button" onClick={() => setModuloActivo('proveedores')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'proveedores' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🏭 Proveedores</button>
            )}
            {verificarPermisoModulo('cxc') && (
              <button type="button" onClick={() => setModuloActivo('cxc')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'cxc' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>📑 Cuentas por Cobrar</button>
            )}
            {verificarPermisoModulo('cxp') && (
              <button type="button" onClick={() => setModuloActivo('cxp')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'cxp' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>💳 Cuentas por Pagar</button>
            )}
            {verificarPermisoModulo('gastos') && (
              <button type="button" onClick={() => setModuloActivo('gastos')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'gastos' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>💸 Gastos Operativos</button>
            )}
            {verificarPermisoModulo('auditoria') && (
              <button type="button" onClick={() => setModuloActivo('auditoria')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'auditoria' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>📋 Auditoría de Inventarios</button>
            )}
            {verificarPermisoModulo('cotizaciones') && (
              <button type="button" onClick={() => setModuloActivo('cotizaciones')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'cotizaciones' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>📄 Cotizaciones (48h)</button>
            )}
            {verificarPermisoModulo('ventas') && (
              <button type="button" onClick={() => setModuloActivo('ventas')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'ventas' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>💰 Ventas</button>
            )}
            {verificarPermisoModulo('reportes') && (
              <button type="button" onClick={() => setModuloActivo('reportes')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'reportes' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>📈 Reportes Financieros</button>
            )}
            {verificarPermisoModulo('historial') && (
              <button type="button" onClick={() => setModuloActivo('historial')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'historial' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>📋 Historial y Reimpresión</button>
            )}
            {usuarioLogueado.rol === 'Administrador' && (
              <button type="button" onClick={() => setModuloActivo('usuarios')} className={`w-full text-left px-4 py-2.5 rounded-xl font-medium text-xs cursor-pointer ${moduloActivo === 'usuarios' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>🔒 Gestión de Usuarios y Roles</button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button type="button" onClick={cerrarSesion} className="w-full bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold py-2 rounded-xl text-xs cursor-pointer">
            Cerrar Sesión ({usuarioLogueado.nombre})
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="min-h-16 bg-slate-900/50 border-b border-slate-800 px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMenuMovilAbierto(true)}
              className="md:hidden shrink-0 bg-blue-600 hover:bg-blue-500 text-white w-10 h-10 rounded-xl font-bold text-lg cursor-pointer"
              aria-label="Abrir menú"
            >
              ☰
            </button>
            <h2 className="text-sm sm:text-base md:text-lg font-bold text-white capitalize truncate">
              Módulo: {moduloActivo === 'inicio' ? 'Panel General' : moduloActivo === 'cxc' ? 'Cuentas por Cobrar (CxC)' : moduloActivo === 'cxp' ? 'Cuentas por Pagar' : moduloActivo === 'gastos' ? 'Gastos Operativos' : moduloActivo === 'reportes' ? 'Reportes Financieros' : moduloActivo === 'auditoria' ? 'Auditoría de Inventarios' : moduloActivo === 'inventario' ? 'Inventario y Kardex' : moduloActivo === 'sucursales' ? 'Administración de Sucursales' : moduloActivo === 'usuarios' ? 'Gestión de Usuarios y Roles' : moduloActivo}
            </h2>
          </div>
          <span className="hidden sm:inline-flex shrink-0 text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-medium">MXN · IVA incluido</span>
        </header>

        <div className="p-4 md:p-8 overflow-y-auto flex-1">
          {/* PANEL GENERAL */}
          {moduloActivo === 'inicio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Ventas del Día</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatearMoneda(ventasDelDia)}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Ventas del Mes</p>
                  <h3 className="text-2xl font-black text-blue-400 mt-2">{formatearMoneda(ventasDelMes)}</h3>
                </div>
                {usuarioEsAdministrador ? (
                  <>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Cuentas por Pagar</p>
                      <h3 className="text-2xl font-black text-amber-400 mt-2">
                        {formatearMoneda(cuentasPorPagar.reduce((acc, c) => acc + c.saldoPendiente, 0))}
                      </h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Vencimientos Próximos</p>
                      <h3 className="text-2xl font-black text-red-400 mt-2">
                        {cuentasPorPagar.filter(c => new Date(c.fechaVencimiento) < new Date()).length} Facturas
                      </h3>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Sucursal Asignada</p>
                      <h3 className="text-lg font-black text-emerald-400 mt-2">{nombreSucursalAsignadaUsuario || 'Sin asignar'}</h3>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <p className="text-xs font-semibold text-slate-400 uppercase">Tickets Registrados</p>
                      <h3 className="text-2xl font-black text-purple-400 mt-2">{historialVisibleUsuario.length}</h3>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">🔥 Los 5 Productos Más Vendidos</h4>
                  <div className="space-y-2">
                    {resumenProductosVendidos.length === 0 ? (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 text-center">
                        Aún no hay ventas registradas.
                      </div>
                    ) : resumenProductosVendidos.map((p, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-white block">{idx + 1}. {p.nombre}</strong>
                          <span className="text-[10px] text-slate-400">Categoría: {p.cat} | Vendidos: {p.qty} un.</span>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold">{formatearMoneda(p.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">⭐ Los 5 Mejores Clientes</h4>
                  <div className="space-y-2">
                    {resumenMejoresClientes.length === 0 ? (
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 text-center">
                        Aún no hay clientes con ventas registradas.
                      </div>
                    ) : resumenMejoresClientes.map((cl, idx) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                        <div>
                          <strong className="text-white block">{idx + 1}. {cl.cliente}</strong>
                          <span className="text-[10px] text-slate-400">Total transacciones: {cl.compras} órdenes</span>
                        </div>
                        <span className="font-mono text-purple-400 font-bold">{formatearMoneda(cl.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE ADMINISTRACIÓN DE SUCURSALES */}
          {moduloActivo === 'sucursales' && verificarPermisoModulo('sucursales') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Administración de Sucursales</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    Registre las sucursales reales de JF Equipos. Las sucursales activas se utilizan automáticamente en Inventario, Ventas, Gastos, Auditorías y Reportes.
                  </p>
                </div>
                <button type="button" onClick={abrirNuevaSucursal} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg text-xs cursor-pointer">
                  + Registrar Nueva Sucursal
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Sucursales Registradas</p>
                  <h4 className="text-2xl font-black text-blue-400 mt-1">{sucursales.length}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Sucursales Activas</p>
                  <h4 className="text-2xl font-black text-emerald-400 mt-1">{sucursalesActivas.length}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Sucursales Inactivas</p>
                  <h4 className="text-2xl font-black text-amber-400 mt-1">{sucursales.filter(s => s.estatus === 'Inactiva').length}</h4>
                </div>
              </div>

              {sucursales.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <div className="text-4xl">🏢</div>
                  <h4 className="text-white font-bold">Todavía no hay sucursales registradas</h4>
                  <p className="text-slate-500 text-xs max-w-xl mx-auto">
                    Registre primero la matriz o sucursal principal. Después aparecerá automáticamente como opción en los módulos operativos.
                  </p>
                  <button type="button" onClick={abrirNuevaSucursal} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">
                    Registrar Primera Sucursal
                  </button>
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/60">
                          <th className="p-4">Clave</th>
                          <th className="p-4">Sucursal</th>
                          <th className="p-4">Ubicación</th>
                          <th className="p-4">Responsable / Contacto</th>
                          <th className="p-4">Almacén Principal</th>
                          <th className="p-4 text-center">Estatus</th>
                          <th className="p-4 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {sucursales.map((sucursal: Sucursal) => (
                          <tr key={sucursal.id} className="hover:bg-slate-800/40">
                            <td className="p-4 font-mono text-blue-400 font-bold">{sucursal.clave}</td>
                            <td className="p-4">
                              <strong className="text-white block">{sucursal.nombre}</strong>
                              <span className="text-[10px] text-slate-400">{sucursal.tipo} · Alta: {sucursal.fechaAlta}</span>
                            </td>
                            <td className="p-4 text-slate-300">
                              <span className="block">{sucursal.direccion || 'Sin dirección capturada'}</span>
                              <span className="text-[10px] text-slate-500">{[sucursal.municipio, sucursal.estado, sucursal.codigoPostal].filter(Boolean).join(', ') || 'Ubicación pendiente'}</span>
                            </td>
                            <td className="p-4 text-slate-300">
                              <strong className="text-white block">{sucursal.responsable || 'Sin responsable'}</strong>
                              <span className="text-[10px] block">{sucursal.telefono || 'Sin teléfono'}</span>
                              <span className="text-[10px] text-blue-400">{sucursal.correo || 'Sin correo'}</span>
                            </td>
                            <td className="p-4 text-amber-400 font-semibold">{sucursal.almacenPrincipal}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${sucursal.estatus === 'Activa' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>{sucursal.estatus}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap justify-center gap-2">
                                <button type="button" onClick={() => abrirEdicionSucursal(sucursal)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer">✏️ Editar</button>
                                <button type="button" onClick={() => cambiarEstatusSucursal(sucursal)} className={`font-bold px-3 py-1.5 rounded-lg cursor-pointer ${sucursal.estatus === 'Activa' ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-emerald-700 hover:bg-emerald-600 text-white'}`}>
                                  {sucursal.estatus === 'Activa' ? '⏸ Inactivar' : '▶ Activar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {modalSucursalAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-blue-400">{sucursalEditando ? '✏️ Editar Sucursal' : '🏢 Registrar Nueva Sucursal'}</h3>
                        <p className="text-[10px] text-slate-500 mt-1">Los campos marcados con * son obligatorios.</p>
                      </div>
                      <button type="button" onClick={() => { setModalSucursalAbierto(false); limpiarFormularioSucursal(); }} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    {sucursalEditando && sucursalTieneMovimientos(sucursalEditando.nombre) && (
                      <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-3 text-xs text-amber-300">
                        Esta sucursal ya tiene historial operativo. Su nombre queda protegido para conservar la trazabilidad de inventario, ventas y movimientos.
                      </div>
                    )}

                    <form onSubmit={guardarSucursal} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Clave de Sucursal *</label>
                        <input type="text" value={sClave} onChange={(e) => setSClave(e.target.value.toUpperCase())} placeholder="Ej. SUC-001" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Tipo *</label>
                        <select value={sTipo} onChange={(e) => setSTipo(e.target.value as Sucursal['tipo'])} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          <option value="Matriz">Matriz</option>
                          <option value="Sucursal">Sucursal</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-400 mb-1">Nombre de la Sucursal *</label>
                        <input type="text" value={sNombre} onChange={(e) => setSNombre(e.target.value)} placeholder="Ej. JF Equipos Nezahualcóyotl" required disabled={Boolean(sucursalEditando && sucursalTieneMovimientos(sucursalEditando.nombre))} className={`w-full border rounded-xl px-3 py-2 text-white ${sucursalEditando && sucursalTieneMovimientos(sucursalEditando.nombre) ? 'bg-slate-800 border-slate-700 text-slate-400 cursor-not-allowed' : 'bg-slate-950 border-slate-700'}`} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-slate-400 mb-1">Dirección</label>
                        <input type="text" value={sDireccion} onChange={(e) => setSDireccion(e.target.value)} placeholder="Calle, número y colonia" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Estado</label>
                        <input type="text" value={sEstado} onChange={(e) => setSEstado(e.target.value)} placeholder="Estado de México" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Ciudad / Municipio</label>
                        <input type="text" value={sMunicipio} onChange={(e) => setSMunicipio(e.target.value)} placeholder="Nezahualcóyotl" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Código Postal</label>
                        <input type="text" value={sCodigoPostal} onChange={(e) => setSCodigoPostal(e.target.value)} placeholder="00000" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Teléfono</label>
                        <input type="text" value={sTelefono} onChange={(e) => setSTelefono(e.target.value)} placeholder="55 0000 0000" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Responsable</label>
                        <input type="text" value={sResponsable} onChange={(e) => setSResponsable(e.target.value)} placeholder="Nombre del responsable" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Correo</label>
                        <input type="email" value={sCorreo} onChange={(e) => setSCorreo(e.target.value)} placeholder="sucursal@empresa.com" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Almacén Principal *</label>
                        <input type="text" value={sAlmacenPrincipal} onChange={(e) => setSAlmacenPrincipal(e.target.value)} placeholder="Ej. Almacén General" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Estatus *</label>
                        <select value={sEstatus} onChange={(e) => setSEstatus(e.target.value as Sucursal['estatus'])} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          <option value="Activa">Activa</option>
                          <option value="Inactiva">Inactiva</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-slate-800">
                        <button type="button" onClick={() => { setModalSucursalAbierto(false); limpiarFormularioSucursal(); }} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">{sucursalEditando ? 'Guardar Cambios' : 'Registrar Sucursal'}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MÓDULO DE GESTIÓN DE USUARIOS Y ROLES CON EDICIÓN DE PERMISOS */}
          {moduloActivo === 'usuarios' && usuarioLogueado.rol === 'Administrador' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Módulo de Gestión de Usuarios y Permisos por Roles</h3>
                  <p className="text-slate-400 text-sm mt-1">Cree usuarios, asigne su sucursal de trabajo, defina roles y edite dinámicamente qué módulos puede ver cada rol en el sistema.</p>
                </div>
                <button type="button" onClick={abrirNuevoUsuario} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">
                  + Registrar Nuevo Usuario
                </button>
              </div>

              {/* MODAL NUEVO / EDITAR USUARIO */}
              {modalUsuarioAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-emerald-500 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-emerald-400">
                        👤 {usuarioEditando ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
                      </h3>
                      <button type="button" onClick={() => { setModalUsuarioAbierto(false); limpiarFormularioUsuario(); }} className="text-red-400 text-xs font-bold cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={guardarUsuarioSistema} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Nombre Completo *</label>
                        <input type="text" value={nuevoNombreUsr} onChange={(e) => setNuevoNombreUsr(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Correo Electrónico *</label>
                        <input type="email" value={nuevoEmailUsr} onChange={(e) => setNuevoEmailUsr(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">{usuarioEditando ? 'Nueva contraseña (opcional)' : 'Contraseña temporal *'}</label>
                        <input type="password" value={nuevoPassUsr} onChange={(e) => setNuevoPassUsr(e.target.value)} required={!usuarioEditando} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Rol Asignado *</label>
                        <select
                          value={nuevoRolUsr}
                          onChange={(e) => {
                            const rol = e.target.value;
                            setNuevoRolUsr(rol);
                            if (rol === 'Administrador') setNuevaSucursalUsrId('');
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                        >
                          {rolesSistema.map((r, i) => <option key={i} value={r.nombreRol}>{r.nombreRol}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Sucursal asignada *</label>
                        {nuevoRolUsr === 'Administrador' ? (
                          <div className="w-full bg-blue-950/30 border border-blue-800 rounded-xl px-3 py-2 text-blue-300 font-semibold">
                            Acceso a todas las sucursales
                          </div>
                        ) : (
                          <>
                            <select
                              value={nuevaSucursalUsrId}
                              onChange={(e) => setNuevaSucursalUsrId(e.target.value)}
                              required
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            >
                              <option value="">-- Seleccione sucursal --</option>
                              {sucursalesActivas.map((s: Sucursal) => (
                                <option key={s.id} value={s.id}>{s.clave} - {s.nombre}</option>
                              ))}
                            </select>
                            {sucursalesActivas.length === 0 && (
                              <p className="text-[10px] text-amber-400 mt-1">Primero debe registrar una sucursal activa.</p>
                            )}
                          </>
                        )}
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] text-slate-400">
                        <strong className="text-white">Seguridad:</strong> el rol define qué módulos puede usar; la sucursal define qué información puede ver y operar. Los usuarios no administradores quedan bloqueados a su sucursal asignada.
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => { setModalUsuarioAbierto(false); limpiarFormularioUsuario(); }} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">
                          {usuarioEditando ? 'Actualizar Usuario' : 'Guardar Usuario'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL EDITAR PERMISOS DEL ROL */}
              {modalPermisosAbierto && rolEditandoPermisos && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">🛡️ Editar Permisos para el Rol: {rolEditandoPermisos.nombreRol}</h3>
                      <button type="button" onClick={() => setModalPermisosAbierto(false)} className="text-red-400 text-xs font-bold cursor-pointer">✕ Cerrar</button>
                    </div>

                    <p className="text-xs text-slate-400">Seleccione o deseleccione los módulos que este rol tiene permitido visualizar y operar:</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {LISTA_MODULOS_DISPONIBLES.map((mod) => {
                        const tienePermiso = rolEditandoPermisos.modulosPermitidos.includes(mod.id);
                        return (
                          <label key={mod.id} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer ${tienePermiso ? 'bg-blue-950/40 border-blue-600 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                            <input
                              type="checkbox"
                              checked={tienePermiso}
                              onChange={(e) => {
                                const permitidosActuales = [...rolEditandoPermisos.modulosPermitidos];
                                let nuevosPermisos = [];
                                if (e.target.checked) {
                                  nuevosPermisos = [...permitidosActuales, mod.id];
                                } else {
                                  nuevosPermisos = permitidosActuales.filter(m => m !== mod.id);
                                }
                                setRolEditandoPermisos({ ...rolEditandoPermisos, modulosPermitidos: nuevosPermisos });
                              }}
                              className="w-4 h-4 accent-blue-600"
                            />
                            {mod.nombre}
                          </label>
                        );
                      })}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                      <button type="button" onClick={() => setModalPermisosAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl text-xs cursor-pointer">Cancelar</button>
                      <button type="button" onClick={guardarPermisosRol} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">Guardar Permisos</button>
                    </div>
                  </div>
                </div>
              )}

              {/* LISTADO DE USUARIOS Y ROLES CON BOTÓN DE EDITAR PERMISOS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">👥 Usuarios Registrados en el Sistema</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/50">
                          <th className="p-3">Nombre</th>
                          <th className="p-3">Correo</th>
                          <th className="p-3">Rol</th>
                          <th className="p-3">Sucursal</th>
                          <th className="p-3 text-center">Estado</th>
                          <th className="p-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {usuariosSistema.map((u) => {
                          const sucursalUsr = u.sucursalId ? sucursales.find(s => s.id === u.sucursalId) : null;
                          return (
                            <tr key={u.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-bold text-white">{u.nombre}</td>
                              <td className="p-3 font-mono text-slate-300">{u.email}</td>
                              <td className="p-3 text-amber-400 font-bold">{u.rol}</td>
                              <td className="p-3">
                                {u.rol === 'Administrador' ? (
                                  <span className="text-blue-400 font-bold">Todas</span>
                                ) : (
                                  <span className={sucursalUsr?.estatus === 'Activa' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                    {sucursalUsr ? sucursalUsr.nombre : 'Sin asignar'}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <button type="button" onClick={() => cambiarEstatusUsuario(u)} className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer ${u.activo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                                  {u.activo ? 'Activo' : 'Inactivo'}
                                </button>
                              </td>
                              <td className="p-3 text-center">
                                <button type="button" onClick={() => abrirEditarUsuario(u)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg font-bold cursor-pointer">
                                  ✏️ Editar
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">🛡️ Permisos por Roles (Editable)</h4>
                  <div className="space-y-3">
                    {rolesSistema.map((rol, idx) => (
                      <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <strong className="text-blue-400 text-sm">{rol.nombreRol}</strong>
                          <button type="button" onClick={() => { setRolEditandoPermisos(rol); setModalPermisosAbierto(true); }} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded-lg cursor-pointer">
                            ✏️ Editar Permisos
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">Módulos permitidos: {rol.modulosPermitidos.length}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rol.modulosPermitidos.map((mod, i) => (
                            <span key={i} className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                              {mod}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE PRODUCTOS */}
          {moduloActivo === 'productos' && verificarPermisoModulo('productos') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Productos</h3>
                  <p className="text-slate-400 text-sm mt-1">Crea productos, paquetes multiproducto con precio independiente, categorías personalizadas y edita los 30 parámetros técnicos.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAltaAbierto(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg text-sm cursor-pointer"
                >
                  + Dar de Alta Nuevo Producto
                </button>
              </div>

              {/* Registro Rápido de Categorías */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <span className="text-xs font-semibold text-slate-300">Gestión de Categorías Disponibles:</span>
                <form onSubmit={registrarCategoriaNueva} className="flex gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Nueva categoría (ej. Crossfit)"
                    value={nuevaCategoriaInput}
                    onChange={(e) => setNuevaCategoriaInput(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold cursor-pointer">+ Agregar Categoría</button>
                </form>
              </div>

              {/* MODAL DE ALTA DE PRODUCTO */}
              {modalAltaAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-2">
                      <h3 className="text-lg font-bold text-blue-400">+ Nuevo Producto (Ficha de 30 Parámetros)</h3>
                      <button type="button" onClick={() => setModalAltaAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    {camaraAltaActiva && (
                      <div className="bg-purple-950/40 border border-purple-800 rounded-2xl p-4 flex flex-col items-center space-y-2">
                        <p className="text-xs font-semibold text-purple-300">Visor de Cámara / Escáner Activo</p>
                        <video ref={videoAltaRef} autoPlay playsInline className="w-full max-w-md h-40 bg-black rounded-xl border border-purple-900 object-cover"></video>
                        <button type="button" onClick={() => setCamaraAltaActiva(false)} className="text-xs bg-red-900 text-white px-3 py-1 rounded-lg cursor-pointer">Cerrar Visor</button>
                      </div>
                    )}

                    <form onSubmit={registrarProductoCatalogo} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">1. Clave interna</label>
                        <input type="text" placeholder="CLV-001" value={fClave} onChange={(e) => setFClave(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-slate-400">2. Código de barras *</label>
                          <button type="button" onClick={() => setCamaraAltaActiva(!camaraAltaActiva)} className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-bold cursor-pointer">📷 Escanear</button>
                        </div>
                        <input type="text" placeholder="EQ-001" value={fCodigo} onChange={(e) => setFCodigo(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">3. Nombre del Paquete o Producto *</label>
                        <input type="text" placeholder="Ej. Kit Gimnasio Pro" value={fNombre} onChange={(e) => setFNombre(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-slate-400 mb-1">4. Descripción</label>
                        <input type="text" placeholder="Detalle..." value={fDesc} onChange={(e) => setFDesc(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">5. Categoría</label>
                        <select value={fCat} onChange={(e) => setFCat(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          {listaCategorias.map((cat: string, i: number) => (
                            <option key={i} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">6. Subcategoría</label>
                        <input type="text" placeholder="Profesional" value={fSubcat} onChange={(e) => setFSubcat(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">7 y 8. Marca / Modelo</label>
                        <div className="flex gap-2">
                          <input type="text" placeholder="Marca" value={fMarca} onChange={(e) => setFMarca(e.target.value)} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white" />
                          <input type="text" placeholder="Modelo" value={fModelo} onChange={(e) => setFModelo(e.target.value)} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white" />
                        </div>
                      </div>

                      <div className="md:col-span-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span>9. ¿Maneja número de serie?</span>
                        <input type="checkbox" checked={fManejaSerie} onChange={(e) => setFManejaSerie(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      </div>
                      {fManejaSerie && (
                        <div className="md:col-span-3 bg-blue-950/30 border border-blue-800 rounded-xl p-3 text-blue-200">
                          <strong className="block text-xs">Número de serie por unidad</strong>
                          <span className="text-[11px] text-slate-300">No se asigna una serie al SKU en el catálogo. La serie física se captura o escanea al concretar cada venta, para validar la unidad entregada y su garantía.</span>
                        </div>
                      )}

                      <div className="md:col-span-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                        <span>27. ¿Incluye Garantía?</span>
                        <input type="checkbox" checked={fManejaGarantia} onChange={(e) => setFManejaGarantia(e.target.checked)} className="w-4 h-4 accent-blue-600" />
                      </div>
                      {fManejaGarantia && (
                        <div className="md:col-span-3">
                          <label className="block text-slate-400 mb-1">Garantía</label>
                          <input type="text" placeholder="1 Año" value={fGarantia} onChange={(e) => setFGarantia(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                        </div>
                      )}

                      <div className="md:col-span-3 grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={fEsRegalo} onChange={(e) => setFEsRegalo(e.target.checked)} className="w-4 h-4 accent-amber-500" />
                          <span className="text-amber-400 font-bold">🎁 Es Artículo de Regalo / Cortesía</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={fEsPaquete} onChange={(e) => setFEsPaquete(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                          <span className="text-blue-400 font-bold">📦 Es un Paquete Promocional</span>
                        </label>
                      </div>

                      {fEsPaquete && (
                        <div className="md:col-span-3 bg-blue-950/40 border border-blue-800/80 p-4 rounded-xl space-y-3">
                          <span className="text-blue-300 font-bold block">📦 Seleccionar Productos Distintos para integrar al Paquete:</span>
                          <div className="flex gap-2">
                            <select
                              value={idProdParaPaquete}
                              onChange={(e) => setIdProdParaPaquete(e.target.value)}
                              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                            >
                              <option value="">-- Seleccionar producto del catálogo --</option>
                              {catalogoProductos.filter((p: ProductoCatalogo) => !p.esPaqueteDefinido).map((p: ProductoCatalogo) => (
                                <option key={p.id} value={p.id}>{p.nombre} (Lista: ${p.precio.toLocaleString()} MXN)</option>
                              ))}
                            </select>
                            <button type="button" onClick={agregarComponenteAPaquete} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">+ Agregar</button>
                          </div>

                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {componentesSeleccionadosPaquete.map((comp: { productoId: number; nombre: string; precioLista: number; numeroSerie: string }, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-slate-950 p-2 rounded-lg border border-slate-800 text-xs">
                                <span className="text-white">🔹 {comp.nombre} (Valor lista: ${comp.precioLista.toFixed(2)} MXN)</span>
                                <button type="button" onClick={() => quitarComponentePaquete(idx)} className="text-red-400 font-bold text-xs px-2 py-0.5 bg-red-950 rounded cursor-pointer">✕ Quitar</button>
                              </div>
                            ))}
                            {componentesSeleccionadosPaquete.length === 0 && (
                              <p className="text-[11px] text-slate-400 italic">No hay productos agregados al paquete todavía.</p>
                            )}
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-slate-400 mb-1">12. Precio de compra</label>
                        <input type="number" step="0.01" placeholder="9000.00" value={fPCompra} onChange={(e) => setFPCompra(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">16. Precio de Venta *</label>
                        <input type="number" step="0.01" placeholder="15000.00" value={fPVenta} onChange={(e) => setFPVenta(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">23. Unidad de medida</label>
                        <input type="text" placeholder="Pieza o Paquete" value={fUnidad} onChange={(e) => setFUnidad(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>

                      <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={() => setModalAltaAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer">Guardar Producto o Paquete</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL DE EDICIÓN DE FICHA TÉCNICA (30 PARÁMETROS) */}
              {productoSeleccionadoEdicion && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-purple-500/60 rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-lg font-bold text-purple-400">✏️ Editar / Ficha Técnica (30 Parámetros)</h3>
                        <p className="text-xs text-slate-400 font-mono">SKU: {productoSeleccionadoEdicion.codigo}</p>
                      </div>
                      <button type="button" onClick={() => setProductoSeleccionadoEdicion(null)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={actualizarProductoCatalogo} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">1. Clave interna</label>
                        <input type="text" value={productoSeleccionadoEdicion.claveInterna} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, claveInterna: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">2. Código / SKU</label>
                        <input type="text" value={productoSeleccionadoEdicion.codigo} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, codigo: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">3. Nombre</label>
                        <input type="text" value={productoSeleccionadoEdicion.nombre} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, nombre: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-slate-400 mb-1">4. Descripción</label>
                        <input type="text" value={productoSeleccionadoEdicion.descripcion} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, descripcion: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">5. Categoría</label>
                        <input type="text" value={productoSeleccionadoEdicion.categoria} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, categoria: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">6. Subcategoría</label>
                        <input type="text" value={productoSeleccionadoEdicion.subcategoria} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, subcategoria: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">7 y 8. Marca / Modelo</label>
                        <div className="flex gap-2">
                          <input type="text" value={productoSeleccionadoEdicion.marca} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, marca: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white" />
                          <input type="text" value={productoSeleccionadoEdicion.modelo} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, modelo: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white" />
                        </div>
                      </div>
                      <div className="md:col-span-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <label className="flex items-center justify-between gap-3 text-slate-300">
                          <span><strong>9. ¿Maneja número de serie?</strong><br /><span className="text-[10px] text-slate-500">La serie se asigna a la unidad únicamente al momento de la venta.</span></span>
                          <input type="checkbox" checked={productoSeleccionadoEdicion.manejaSerie} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, manejaSerie: e.target.checked, numeroSerie: 'N/A'})} className="w-4 h-4 accent-blue-600" />
                        </label>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">10. País de Origen</label>
                        <input type="text" value={productoSeleccionadoEdicion.paisOrigen} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, paisOrigen: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">11. Proveedor</label>
                        <input type="text" value={productoSeleccionadoEdicion.proveedor} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, proveedor: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">12. Precio de Compra</label>
                        <input type="number" step="0.01" value={productoSeleccionadoEdicion.precioCompra} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, precioCompra: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">13. No. Factura</label>
                        <input type="text" value={productoSeleccionadoEdicion.noFacturaCompra} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, noFacturaCompra: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">14. Pedimento</label>
                        <input type="text" value={productoSeleccionadoEdicion.pedimentoReferencia} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, pedimentoReferencia: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">15. Costo Promedio</label>
                        <input type="number" step="0.01" value={productoSeleccionadoEdicion.costoPromedio} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, costoPromedio: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">16. Precio Venta</label>
                        <input type="number" step="0.01" value={productoSeleccionadoEdicion.precio} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, precio: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">17. Precio Mayoreo</label>
                        <input type="number" step="0.01" value={productoSeleccionadoEdicion.precioMayoreo} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, precioMayoreo: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">18. Precio Especial</label>
                        <input type="number" step="0.01" value={productoSeleccionadoEdicion.precioEspecial} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, precioEspecial: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">19. IVA (%)</label>
                        <input type="number" value={productoSeleccionadoEdicion.iva} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, iva: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">20. Margen Utilidad</label>
                        <input type="number" value={productoSeleccionadoEdicion.margenUtilidad} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, margenUtilidad: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">21 y 22. Unidad / Color</label>
                        <div className="flex gap-2">
                          <input type="text" value={productoSeleccionadoEdicion.unidadMedida} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, unidadMedida: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white" />
                          <input type="text" value={productoSeleccionadoEdicion.color} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, color: e.target.value})} className="w-1/2 bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">23, 24, 25. Capacidad / Garantía / Estatus</label>
                        <input type="text" value={productoSeleccionadoEdicion.capacidad} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, capacidad: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white mb-1" />
                        <input type="text" value={productoSeleccionadoEdicion.garantia} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, garantia: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white" />
                      </div>

                      <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={() => setProductoSeleccionadoEdicion(null)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl">Cancelar</button>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer">Actualizar 30 Parámetros</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Listado de Productos */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                        <th className="p-4">SKU / Clave</th>
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Precio Venta</th>
                        <th className="p-4 text-center">Acciones (30 Parámetros)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {catalogoProductos.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-xs text-slate-500">
                            No hay productos registrados. Use “Dar de Alta Nuevo Producto” para crear el primero.
                          </td>
                        </tr>
                      )}
                      {catalogoProductos.map((prod: ProductoCatalogo) => (
                        <tr key={prod.id} className="hover:bg-slate-800/40">
                          <td className="p-4 font-mono text-blue-400 text-xs">{prod.codigo}</td>
                          <td className="p-4 font-medium text-white text-xs">
                            {prod.nombre}
                            {prod.esRegalo && <span className="ml-2 text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded">Regalo</span>}
                            {prod.esPaqueteDefinido && <span className="ml-2 text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded">Paquete</span>}
                          </td>
                          <td className="p-4"><span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-xs">{prod.categoria}</span></td>
                          <td className="p-4 font-semibold text-emerald-400 text-xs">{formatearMoneda(prod.precio || 0)}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <button type="button" onClick={() => setProductoSeleccionadoEdicion(prod)} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow inline-flex items-center gap-1 cursor-pointer">
                                ✏️ Editar / Ficha Completa
                              </button>
                              <button type="button" onClick={() => eliminarProductoCatalogo(prod)} className="bg-red-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow inline-flex items-center gap-1 cursor-pointer">
                                🗑️ Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE INVENTARIO Y KARDEX */}
          {moduloActivo === 'inventario' && verificarPermisoModulo('inventario') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Módulo de Inventario y Kardex</h3>
                  <p className="text-slate-400 text-sm mt-1">Control de existencias por almacén, sucursal, ubicaciones especiales, costos y registro inalterable en Kardex.</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    if (sucursalesActivas.length === 0) {
                      setMensajeNotif('Primero registre una sucursal activa. Lo llevaré al módulo de Sucursales.');
                      setModalNotifAbierto(true);
                      setModuloActivo('sucursales');
                      return;
                    }
                    setModalIngresoStockAbierto(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg text-xs flex items-center gap-2 cursor-pointer"
                >
                  + Registrar Entrada o Movimiento
                </button>
              </div>

              {/* MODAL INGRESO / ENTRADA DE INVENTARIO */}
              {modalIngresoStockAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">📦 Registrar Entrada / Movimiento en Almacén</h3>
                      <button type="button" onClick={() => { setModalIngresoStockAbierto(false); setProductoIngreso(null); setCamaraInventarioActiva(false); }} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    {camaraInventarioActiva && (
                      <div className="bg-purple-950/40 border border-purple-800 rounded-2xl p-4 flex flex-col items-center space-y-2">
                        <p className="text-xs font-semibold text-purple-300">Visor de Cámara / Escáner Activo</p>
                        <video ref={videoInventarioRef} autoPlay playsInline className="w-full max-w-md h-40 bg-black rounded-xl border border-purple-900 object-cover"></video>
                        <button type="button" onClick={() => setCamaraInventarioActiva(false)} className="text-xs bg-red-900 text-white px-3 py-1 rounded-lg cursor-pointer">Cerrar Visor</button>
                      </div>
                    )}

                    {!productoIngreso ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs text-slate-400">Escriba o escanee código de barras / SKU:</label>
                          <button type="button" onClick={() => setCamaraInventarioActiva(!camaraInventarioActiva)} className="text-[10px] bg-purple-600 text-white px-2.5 py-1 rounded font-bold cursor-pointer">📷 Escanear con Cámara</button>
                        </div>
                        <input
                          type="text"
                          placeholder="Ej. EQ-001 o Caminadora..."
                          value={busquedaInventarioModal}
                          onChange={(e) => {
                            setBusquedaInventarioModal(e.target.value);
                            const encontrado = catalogoProductos.find(p => p.codigo.toLowerCase() === e.target.value.trim().toLowerCase() || p.nombre.toLowerCase().includes(e.target.value.trim().toLowerCase()));
                            if (encontrado) {
                              setProductoIngreso(encontrado);
                            }
                          }}
                          className="w-full bg-slate-950 border border-blue-600 rounded-xl px-4 py-3 text-sm text-white font-mono"
                          autoFocus
                        />
                        <div className="max-h-40 overflow-y-auto space-y-1 pt-2">
                          {catalogoProductos.filter((p: ProductoCatalogo) => p.nombre.toLowerCase().includes(busquedaInventarioModal.toLowerCase()) || p.codigo.toLowerCase().includes(busquedaInventarioModal.toLowerCase())).map((p: ProductoCatalogo) => (
                            <div key={p.id} onClick={() => setProductoIngreso(p)} className="p-2 hover:bg-slate-800 rounded-xl cursor-pointer flex justify-between text-xs">
                              <span className="text-white font-bold">{p.nombre}</span>
                              <span className="text-blue-400 font-mono">{p.codigo}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={procesarIngresoInventario} className="space-y-3 text-xs">
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <span className="text-slate-400 block text-[10px]">Producto reconocido:</span>
                          <strong className="text-white text-sm">{productoIngreso.nombre}</strong>
                          <span className="text-blue-400 font-mono block text-[11px]">SKU: {productoIngreso.codigo}</span>
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">📅 Fecha de Ingreso:</label>
                          <input type="date" value={fechaIngresoManual} onChange={(e) => setFechaIngresoManual(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Sucursal:</label>
                          {usuarioEsAdministrador ? (
                            <select
                              value={sucursalIngreso}
                              onChange={(e) => {
                                const nombre = e.target.value;
                                setSucursalIngreso(nombre);
                                const sucursalRef = sucursales.find(s => s.nombre === nombre);
                                if (sucursalRef) setAlmacenIngreso(sucursalRef.almacenPrincipal);
                              }}
                              required
                              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                            >
                              <option value="">-- Seleccione sucursal --</option>
                              {sucursalesPermitidasUsuario.map((s: Sucursal) => (
                                <option key={s.id} value={s.nombre}>{s.nombre}</option>
                              ))}
                            </select>
                          ) : (
                            <div className="w-full bg-slate-950 border border-emerald-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">
                              {nombreSucursalAsignadaUsuario || 'Sin sucursal asignada'}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Almacén / Ubicación:</label>
                          <input
                            type="text"
                            value={almacenIngreso}
                            onChange={(e) => setAlmacenIngreso(e.target.value)}
                            placeholder="Almacén principal o ubicación interna"
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Cantidad a ingresar:</label>
                          <input type="number" min="1" value={cantIngreso} onChange={(e) => setCantIngreso(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Motivo del movimiento (Kardex):</label>
                          <input type="text" value={motivoIngreso} onChange={(e) => setMotivoIngreso(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => setProductoIngreso(null)} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Atrás</button>
                          <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Guardar Entrada en Kardex</button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* MODAL MODIFICAR / SALIDA / MERMA / TRANSFERENCIA STOCK */}
              {modalModificarStockAbierto && stockItemSeleccionado && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-amber-500/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-amber-400">🔄 Modificar / Salida de Inventario</h3>
                      <button type="button" onClick={() => setModalModificarStockAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={procesarModificacionStock} className="space-y-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block text-[10px]">Ubicación y Stock Actual:</span>
                        <strong className="text-white text-sm">{stockItemSeleccionado.sucursal} ({stockItemSeleccionado.almacen})</strong>
                        <p className="text-emerald-400 font-mono font-bold">Stock Actual: {stockItemSeleccionado.stockActual} unidades</p>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Tipo de Movimiento / Salida *</label>
                        <select value={tipoMovimientoMod} onChange={(e: any) => setTipoMovimientoMod(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          <option value="Transferencia">🔄 Transferencia a otra sucursal</option>
                          <option value="Dañado">⚠️ Producto Dañado / Merma</option>
                          <option value="Salida">📤 Salida general de almacén</option>
                          <option value="Devolución">↩️ Devolución</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Cantidad *</label>
                        <input type="number" min="1" max={stockItemSeleccionado.stockActual} value={cantidadMod} onChange={(e) => setCantidadMod(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Motivo / Observación (Kardex) *</label>
                        <input type="text" value={motivoMod} onChange={(e) => setMotivoMod(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalModificarStockAbierto(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Aplicar Movimiento</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TABLA DE EXISTENCIAS POR SUCURSAL Y ALMACÉN CON BOTÓN DE MODIFICAR */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">📦 Existencias por Almacén y Ubicaciones (Acciones de Salida/Traspaso)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                        <th className="p-4">Producto</th>
                        <th className="p-4">Sucursal / Almacén</th>
                        <th className="p-4 text-center">Stock Actual</th>
                        <th className="p-4 text-center">Dañados</th>
                        <th className="p-4 text-center">Costo Promedio</th>
                        <th className="p-4 text-center">Acción / Salida / Traspaso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {inventarioVisibleUsuario.map((inv: StockSucursal, idx: number) => {
                        const prod = catalogoProductos.find(p => p.id === inv.productoId);
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-4 font-medium text-white text-xs">{prod ? prod.nombre : 'Producto Desconocido'}</td>
                            <td className="p-4 text-xs">
                              <span className="font-bold text-amber-400 block">{inv.sucursal}</span>
                              <span className="text-[10px] text-slate-400">{inv.almacen}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-emerald-400 text-center text-xs">{inv.stockActual} un.</td>
                            <td className="p-4 font-mono text-xs text-center text-red-400">{inv.danados} un.</td>
                            <td className="p-4 font-mono text-xs text-center text-emerald-400">{formatearMoneda(prod ? prod.costoPromedio : 0)}</td>
                            <td className="p-4 text-center">
                              <button type="button" onClick={() => { setStockItemSeleccionado(inv); setModalModificarStockAbierto(true); }} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow cursor-pointer">
                                🔄 Modificar / Salida / Merma
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABLA DE KARDEX INALTERABLE */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 space-y-4">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">📋 Kardex Oficial e Historial de Movimientos</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/50">
                        <th className="p-3">Fecha / Hora</th>
                        <th className="p-3">Usuario</th>
                        <th className="p-3">Sucursal / Almacén</th>
                        <th className="p-3">Producto</th>
                        <th className="p-3 text-center">Tipo</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-center">Ant. ➔ Post.</th>
                        <th className="p-3">Costo / Motivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {kardexVisibleUsuario.map((k) => (
                        <tr key={k.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono text-slate-400">
                            {k.fecha} {k.hora}
                          </td>
                          <td className="p-3 text-slate-300">{k.usuario}</td>
                          <td className="p-3">
                            <span className="font-bold text-white block">{k.sucursal}</span>
                            <span className="text-[10px] text-slate-400">{k.almacen}</span>
                          </td>
                          <td className="p-3 font-medium text-white">{k.producto}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${k.tipoMovimiento === 'Entrada' || k.tipoMovimiento === 'Compra' ? 'bg-emerald-950 text-emerald-400' : k.tipoMovimiento === 'Salida' || k.tipoMovimiento === 'Venta' ? 'bg-blue-950 text-blue-400' : 'bg-red-950 text-red-400'}`}>
                              {k.tipoMovimiento}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-white">{k.cantidad}</td>
                          <td className="p-3 text-center font-mono text-amber-400">{k.existenciaAnterior} ➔ {k.existenciaPosterior}</td>
                          <td className="p-3">
                            <span className="text-emerald-400 font-mono font-bold block">{formatearMoneda(k.costo)}</span>
                            <span className="text-[10px] text-slate-400">{k.motivo} ({k.observaciones})</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE CLIENTES */}
          {moduloActivo === 'clientes' && verificarPermisoModulo('clientes') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Módulo de Clientes</h3>
                  <p className="text-slate-400 text-sm mt-1">Registro y administración de la cartera de clientes corporativos con opción de edición.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setClienteEditando(null);
                    setCNombreComercial('');
                    setCResponsable('');
                    setCDireccion('');
                    setCTelefono('');
                    setCEmail('');
                    setCLimiteCredito('100000');
                    setCDiasCredito('30');
                    setModalClienteAbierto(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg text-sm cursor-pointer"
                >
                  + Registrar Nuevo Cliente
                </button>
              </div>

              {/* MODAL CLIENTE */}
              {modalClienteAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">{clienteEditando ? '✏️ Editar Datos de Cliente' : '+ Registrar Nuevo Cliente'}</h3>
                      <button type="button" onClick={() => setModalClienteAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={guardarCliente} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Nombre Comercial *</label>
                        <input type="text" placeholder="Gimnasio ProFit" value={cNombreComercial} onChange={(e) => setCNombreComercial(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Responsable *</label>
                        <input type="text" placeholder="Lic. Ricardo" value={cResponsable} onChange={(e) => setCResponsable(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Dirección</label>
                        <input type="text" placeholder="Av. Insurgentes..." value={cDireccion} onChange={(e) => setCDireccion(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Teléfono</label>
                        <input type="text" placeholder="55-1234-5678" value={cTelefono} onChange={(e) => setCTelefono(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Email</label>
                        <input type="email" placeholder="correo@cliente.com" value={cEmail} onChange={(e) => setCEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 mb-1">Límite de Crédito ($)</label>
                          <input type="number" step="0.01" value={cLimiteCredito} onChange={(e) => setCLimiteCredito(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Días de Crédito</label>
                          <input type="number" value={cDiasCredito} onChange={(e) => setCDiasCredito(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalClienteAbierto(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Guardar Cliente</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Tabla de Clientes con Botón de Edición */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                        <th className="p-4">Nombre Comercial</th>
                        <th className="p-4">Responsable</th>
                        <th className="p-4">Límite / Días Crédito</th>
                        <th className="p-4">Deuda Actual</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {clientes.map((c: Cliente) => (
                        <tr key={c.id} className="hover:bg-slate-800/40">
                          <td className="p-4 font-bold text-white text-xs">
                            {c.nombreComercial}
                            {c.bloqueadoCredito && <span className="ml-2 text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded font-bold">Bloqueado</span>}
                          </td>
                          <td className="p-4 text-slate-300 text-xs">{c.responsable}</td>
                          <td className="p-4 text-slate-300 font-mono text-xs">${c.limiteCredito?.toLocaleString()} MXN / {c.diasCredito || 30} días</td>
                          <td className="p-4 font-mono font-bold text-amber-400 text-xs">${c.saldoActualDeuda?.toLocaleString()} MXN</td>
                          <td className="p-4 text-center">
                            <button type="button" onClick={() => abrirEdicionCliente(c)} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow inline-flex items-center gap-1 mx-auto cursor-pointer">
                              ✏️ Editar Cliente
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE PROVEEDORES */}
          {moduloActivo === 'proveedores' && verificarPermisoModulo('proveedores') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Módulo de Proveedores</h3>
                  <p className="text-slate-400 text-sm mt-1">Gestión corporativa con validación de RFC de México, cuenta CLABE bancaria y catálogo de productos desplegable.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setProveedorEditando(null); limpiarFormularioProveedor(); setModalProveedorAbierto(true); }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg text-sm cursor-pointer"
                >
                  + Agregar Nuevo Proveedor
                </button>
              </div>

              {/* MODAL PROVEEDOR */}
              {modalProveedorAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
                      <h3 className="text-lg font-bold text-blue-400">{proveedorEditando ? '✏️ Editar Proveedor' : '+ Agregar Nuevo Proveedor'}</h3>
                      <button type="button" onClick={() => setModalProveedorAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={guardarProveedor} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Razón Social *</label>
                        <input type="text" placeholder="Global Fitness S.A." value={pRazonSocial} onChange={(e) => setPRazonSocial(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Nombre Comercial *</label>
                        <input type="text" placeholder="Global Fitness" value={pNombreComercial} onChange={(e) => setPNombreComercial(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">RFC (Válido para México) *</label>
                        <input type="text" placeholder="GFC990312ABC" value={pRfc} onChange={(e) => setPRfc(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase" />
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-slate-400 mb-1">Dirección</label>
                        <input type="text" placeholder="Av. Industrial 500, CDMX" value={pDireccion} onChange={(e) => setPDireccion(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Contactos</label>
                        <input type="text" placeholder="Lic. Roberto Gómez" value={pContactos} onChange={(e) => setPContactos(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Teléfonos</label>
                        <input type="text" placeholder="55-1234-5678" value={pTelefonos} onChange={(e) => setPTelefonos(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Correos</label>
                        <input type="email" placeholder="ventas@proveedor.com" value={pCorreos} onChange={(e) => setPCorreos(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>

                      {/* Datos Bancarios: Banco, CLABE, Titular */}
                      <div>
                        <label className="block text-slate-400 mb-1">Banco *</label>
                        <select value={pBanco} onChange={(e) => setPBanco(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          <option value="BBVA">BBVA</option>
                          <option value="Santander">Santander</option>
                          <option value="Banorte">Banorte</option>
                          <option value="Citibanamex">Citibanamex</option>
                          <option value="HSBC">HSBC</option>
                          <option value="Scotiabank">Scotiabank</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Cuenta CLABE (18 dígitos) *</label>
                        <input type="text" placeholder="012180001234567890" maxLength={18} value={pCuentaClabe} onChange={(e) => setPCuentaClabe(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Titular de la Cuenta *</label>
                        <input type="text" placeholder="Razón social o titular" value={pTitularCuenta} onChange={(e) => setPTitularCuenta(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Moneda</label>
                        <select value={pMoneda} onChange={(e) => setPMoneda(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          <option value="MXN">MXN (Pesos)</option>
                          <option value="USD">USD (Dólares)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Límite de crédito ($)</label>
                        <input type="number" step="0.01" placeholder="100000.00" value={pLimiteCredito} onChange={(e) => setPLimiteCredito(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Tiempo promedio entrega</label>
                        <input type="text" placeholder="5 días" value={pTiempoEntrega} onChange={(e) => setPTiempoEntrega(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>

                      {/* Catálogo de Productos Desplegable */}
                      <div className="md:col-span-3 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                        <label className="block text-slate-300 font-bold">📦 Catálogo de Productos Suministrados (Seleccionar de lista):</label>
                        <div className="flex gap-2">
                          <select
                            value={pProductoSeleccionado}
                            onChange={(e) => setPProductoSeleccionado(e.target.value)}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
                          >
                            <option value="">-- Seleccionar producto del catálogo maestro --</option>
                            {catalogoProductos.map(prod => (
                              <option key={prod.id} value={prod.nombre}>{prod.nombre} (SKU: {prod.codigo})</option>
                            ))}
                          </select>
                          <button type="button" onClick={agregarProductoAProveedor} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">+ Enlistar</button>
                        </div>

                        <div className="space-y-1 max-h-28 overflow-y-auto pt-1">
                          {pProductosAsociados.map((prodAsoc, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs">
                              <span className="text-emerald-400 font-medium">✓ {prodAsoc}</span>
                              <button type="button" onClick={() => quitarProductoProveedor(idx)} className="text-red-400 font-bold text-xs px-2 py-0.5 bg-red-950 rounded cursor-pointer">✕ Quitar</button>
                            </div>
                          ))}
                          {pProductosAsociados.length === 0 && (
                            <p className="text-[11px] text-slate-400 italic">No hay productos enlazados a este proveedor todavía.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Estatus</label>
                        <select value={pEstatus} onChange={(e: any) => setPEstatus(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          <option value="Activo">Activo</option>
                          <option value="Inactivo">Inactivo</option>
                        </select>
                      </div>

                      <div className="md:col-span-3 flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button type="button" onClick={() => setModalProveedorAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl shadow cursor-pointer">Guardar Proveedor</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Listado de Proveedores */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                        <th className="p-4">Nombre Comercial</th>
                        <th className="p-4">RFC</th>
                        <th className="p-4">Datos Bancarios (CLABE / Banco)</th>
                        <th className="p-4">Productos Suministrados</th>
                        <th className="p-4 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {proveedores.map((prov: Proveedor) => (
                        <tr key={prov.id} className="hover:bg-slate-800/40">
                          <td className="p-4 font-bold text-white text-xs">{prov.nombreComercial}</td>
                          <td className="p-4 font-mono text-blue-400 text-xs">{prov.rfc}</td>
                          <td className="p-4 text-slate-300 text-xs">
                            <span className="font-mono text-amber-400 block">{prov.banco}: {prov.cuentaClabe}</span>
                            <span className="text-[10px] text-slate-400">Titular: {prov.titularCuenta}</span>
                          </td>
                          <td className="p-4 text-xs text-slate-300 max-w-xs truncate">
                            {prov.productosAsociados ? prov.productosAsociados.join(', ') : 'Ninguno'}
                          </td>
                          <td className="p-4 text-center">
                            <button type="button" onClick={() => abrirEdicionProveedor(prov)} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow inline-flex items-center gap-1 mx-auto cursor-pointer">
                              ✏️ Editar Proveedor
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE CUENTAS POR COBRAR (CxC) */}
          {moduloActivo === 'cxc' && verificarPermisoModulo('cxc') && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Módulo de Cuentas por Cobrar (CxC)</h3>
                <p className="text-slate-400 text-sm mt-1">Gestión completa de ventas a crédito, límites, días, estado de cuenta, pagos parciales, aplicación, saldos, antigüedad de saldos, vencidos, recordatorios, promesas, notas de crédito, bloqueos, autorizaciones y recibos.</p>
              </div>

              {/* MODAL REGISTRAR ABONO / PAGO PARCIAL Y APLICACIÓN DE PAGOS */}
              {modalAbonoCxCAbierto && cuentaCxCSeleccionada && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-emerald-400">💵 Aplicación de Pagos / Abono Parcial</h3>
                      <button type="button" onClick={() => setModalAbonoCxCAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const montoNum = Number(montoAbonoCxC) || 0;
                      if (montoNum <= 0) return;

                      const nuevoAbono: AbonoCxC = {
                        id: Date.now(),
                        fechaAbono: fechaAbonoCxC,
                        monto: montoNum,
                        referencia: refAbonoCxC,
                        reciboFolio: `REC-${Math.floor(1000 + Math.random() * 9000)}`
                      };

                      setCuentasPorCobrar(prev => prev.map(c => {
                        if (c.id === cuentaCxCSeleccionada.id) {
                          const nuevoPagado = c.montoPagado + montoNum;
                          const nuevoSaldo = Math.max(0, c.montoTotal - nuevoPagado);
                          return {
                            ...c,
                            montoPagado: nuevoPagado,
                            saldoPendiente: nuevoSaldo,
                            estatus: nuevoSaldo === 0 ? 'Pagada' : 'Parcial',
                            abonos: [...c.abonos, nuevoAbono]
                          };
                        }
                        return c;
                      }));

                      setClientes(prev => prev.map(cl => {
                        if (cl.nombreComercial === cuentaCxCSeleccionada.clienteNombre) {
                          return { ...cl, saldoActualDeuda: Math.max(0, cl.saldoActualDeuda - montoNum) };
                        }
                        return cl;
                      }));

                      setReciboUltimoGenerado({ ...nuevoAbono, folioVenta: cuentaCxCSeleccionada.folioVenta, cliente: cuentaCxCSeleccionada.clienteNombre });
                      setModalAbonoCxCAbierto(false);
                      setMontoAbonoCxC('');
                      setModalReciboAbierto(true);
                    }} className="space-y-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <p className="text-slate-400">Cliente: <strong className="text-white">{cuentaCxCSeleccionada.clienteNombre}</strong></p>
                        <p className="text-slate-400">Folio Venta: <strong className="text-blue-400 font-mono">{cuentaCxCSeleccionada.folioVenta}</strong></p>
                        <p className="text-slate-400">Saldo Pendiente: <strong className="text-amber-400 font-mono">{formatearMoneda(cuentaCxCSeleccionada.saldoPendiente)}</strong></p>
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">📅 Fecha del Pago *</label>
                        <input type="date" value={fechaAbonoCxC} onChange={(e) => setFechaAbonoCxC(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Monto del Pago Parcial *</label>
                        <input type="number" step="0.01" max={cuentaCxCSeleccionada.saldoPendiente} value={montoAbonoCxC} onChange={(e) => setMontoAbonoCxC(e.target.value)} required className="w-full bg-slate-950 border border-emerald-600 rounded-xl px-3 py-2 text-white font-mono text-sm" autoFocus />
                      </div>

                      <div>
                        <label className="block text-slate-400 mb-1">Referencia / Aplicación Bancaria</label>
                        <input type="text" value={refAbonoCxC} onChange={(e) => setRefAbonoCxC(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalAbonoCxCAbierto(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Aplicar y Generar Recibo</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL RECIBO DE PAGO OFICIAL */}
              {modalReciboAbierto && reciboUltimoGenerado && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-emerald-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                    <h3 className="text-lg font-bold text-emerald-400">🧾 Recibo de Pago Oficial</h3>
                    <div className="bg-slate-950 p-4 rounded-xl text-left space-y-2 text-xs font-mono">
                      <p className="text-white font-bold">Folio Recibo: {reciboUltimoGenerado.reciboFolio}</p>
                      <p className="text-slate-300">Cliente: {reciboUltimoGenerado.cliente}</p>
                      <p className="text-slate-300">Venta Ref: {reciboUltimoGenerado.folioVenta}</p>
                      <p className="text-slate-300">Fecha: {reciboUltimoGenerado.fechaAbono}</p>
                      <p className="text-emerald-400 font-bold text-sm">Monto Recibido: {formatearMoneda(reciboUltimoGenerado.monto)}</p>
                      <p className="text-slate-400">Ref: {reciboUltimoGenerado.referencia}</p>
                    </div>
                    <button type="button" onClick={() => { setModalReciboAbierto(false); setMensajeNotif('¡Recibo de pago guardado e impreso con éxito!'); setModalNotifAbierto(true); }} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-xs w-full cursor-pointer">Aceptar / Imprimir Recibo</button>
                  </div>
                </div>
              )}

              {/* MODAL PROMESA DE PAGO */}
              {modalPromesaAbierto && cuentaCxCSeleccionada && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">📌 Registrar Promesa de Pago</h3>
                      <button type="button" onClick={() => setModalPromesaAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setCuentasPorCobrar(prev => prev.map(c => c.id === cuentaCxCSeleccionada.id ? { ...c, promesaPago: textoPromesaInput } : c));
                      setModalPromesaAbierto(false);
                      setMensajeNotif('¡Promesa de pago registrada con éxito!');
                      setModalNotifAbierto(true);
                    }} className="space-y-3 text-xs">
                      <textarea
                        value={textoPromesaInput}
                        onChange={(e) => setTextoPromesaInput(e.target.value)}
                        placeholder="Escriba detalle de la promesa de pago..."
                        required
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
                      ></textarea>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalPromesaAbierto(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Guardar Promesa</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL NOTA DE CRÉDITO */}
              {modalNotaCreditoAbierto && cuentaCxCSeleccionada && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-purple-500/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-purple-400">📄 Aplicar Nota de Crédito</h3>
                      <button type="button" onClick={() => setModalNotaCreditoAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cerrar</button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const montoNC = Number(montoNotaCredito) || 0;
                      if (montoNC <= 0) return;

                      setCuentasPorCobrar(prev => prev.map(c => {
                        if (c.id === cuentaCxCSeleccionada.id) {
                          const nuevoSaldo = Math.max(0, c.saldoPendiente - montoNC);
                          return {
                            ...c,
                            notasCreditoAplicadas: c.notasCreditoAplicadas + montoNC,
                            saldoPendiente: nuevoSaldo,
                            estatus: nuevoSaldo === 0 ? 'Pagada' : c.estatus
                          };
                        }
                        return c;
                      }));

                      setModalNotaCreditoAbierto(false);
                      setMontoNotaCredito('');
                      setMensajeNotif(`¡Nota de crédito por ${formatearMoneda(montoNC)} aplicada con éxito a la cuenta!`);
                      setModalNotifAbierto(true);
                    }} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Monto de la Nota de Crédito *</label>
                        <input type="number" step="0.01" max={cuentaCxCSeleccionada.saldoPendiente} value={montoNotaCredito} onChange={(e) => setMontoNotaCredito(e.target.value)} required className="w-full bg-slate-950 border border-purple-600 rounded-xl px-3 py-2 text-white font-mono text-sm" autoFocus />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalNotaCreditoAbierto(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Aplicar Nota</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL AUTORIZACIÓN ESPECIAL GERENCIAL */}
              {modalAutorizacionAbierto && clienteParaAutorizar && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-amber-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                    <h3 className="text-lg font-bold text-amber-400">🔒 Autorización Especial Gerencial</h3>
                    <p className="text-xs text-slate-300">
                      El cliente <strong className="text-white">{clienteParaAutorizar.nombreComercial}</strong> excede su límite de crédito o presenta adeudos vencidos. ¿Desea desbloquear temporalmente el crédito y autorizar la venta?
                    </p>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setModalAutorizacionAbierto(false)} className="flex-1 bg-slate-800 text-slate-300 py-2 rounded-xl text-xs cursor-pointer">Cancelar</button>
                      <button type="button" onClick={() => {
                        setClientes(prev => prev.map(cl => cl.id === clienteParaAutorizar.id ? { ...cl, bloqueadoCredito: false } : cl));
                        setModalAutorizacionAbierto(false);
                        setMensajeNotif(`¡Autorización especial concedida para "${clienteParaAutorizar.nombreComercial}"! Ya puede proceder al cobro.`);
                        setModalNotifAbierto(true);
                      }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs cursor-pointer">Autorizar Venta</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla General de Cuentas por Cobrar con Estados de Cuenta y Antigüedad */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Cartera Vencida</p>
                    <h4 className="text-xl font-black text-red-400 mt-1">
                      {formatearMoneda(cuentasPorCobrar.filter(c => c.estatus === 'Vencida').reduce((acc, c) => acc + c.saldoPendiente, 0))}
                    </h4>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Total Créditos Pendientes</p>
                    <h4 className="text-xl font-black text-amber-400 mt-1">
                      {formatearMoneda(cuentasPorCobrar.filter(c => c.estatus !== 'Pagada').reduce((acc, c) => acc + c.saldoPendiente, 0))}
                    </h4>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Cuentas Registradas</p>
                    <h4 className="text-xl font-black text-blue-400 mt-1">{cuentasPorCobrar.length}</h4>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Clientes Vencidos / Bloqueados</p>
                    <h4 className="text-xl font-black text-purple-400 mt-1">
                      {clientes.filter(c => c.bloqueadoCredito).length} Clientes
                    </h4>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase bg-slate-950/50">
                        <th className="p-3">Folio Venta</th>
                        <th className="p-3">Cliente</th>
                        <th className="p-3">Límite / Días Crédito</th>
                        <th className="p-3">Emisión ➔ Venc.</th>
                        <th className="p-3">Saldo Pendiente</th>
                        <th className="p-3 text-center">Estatus (Antigüedad)</th>
                        <th className="p-3">Promesa de Pago</th>
                        <th className="p-3 text-center">Acciones de Cobro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cuentasPorCobrar.map((cxc) => {
                        const cliRef = clientes.find(c => c.nombreComercial === cxc.clienteNombre);
                        return (
                          <tr key={cxc.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-blue-400 font-bold">{cxc.folioVenta}</td>
                            <td className="p-3 font-bold text-white">
                              {cxc.clienteNombre}
                              <span className="block text-[10px] text-slate-400 font-normal">Estado de cuenta verificado</span>
                            </td>
                            <td className="p-3 font-mono text-slate-300">
                              ${cliRef?.limiteCredito?.toLocaleString() || '100,000'} <br />
                              <span className="text-[10px] text-amber-400">{cliRef?.diasCredito || 30} días</span>
                            </td>
                            <td className="p-3 font-mono text-slate-300">{cxc.fechaEmision} ➔ {cxc.fechaVencimiento}</td>
                            <td className="p-3 font-bold text-amber-400">{formatearMoneda(cxc.saldoPendiente)}</td>
                            <td className="p-3 text-center">
                              {cxc.estatus === 'Vencida' && <span className="bg-red-950 text-red-400 border border-red-800 px-2 py-0.5 rounded font-bold animate-pulse">⚠️ Vencida</span>}
                              {cxc.estatus === 'Parcial' && <span className="bg-blue-950 text-blue-400 px-2 py-0.5 rounded font-bold">⏳ Parcial</span>}
                              {cxc.estatus === 'Pendiente' && <span className="bg-amber-950 text-amber-400 px-2 py-0.5 rounded font-bold">⏱️ Pendiente</span>}
                              {cxc.estatus === 'Pagada' && <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold">✓ Pagada</span>}
                            </td>
                            <td className="p-3 text-slate-400 italic max-w-xs truncate">{cxc.promesaPago}</td>
                            <td className="p-3 text-center flex items-center justify-center gap-1.5 flex-wrap">
                              {cxc.estatus !== 'Pagada' && (
                                <button type="button" onClick={() => { setCuentaCxCSeleccionada(cxc); setMontoAbonoCxC(String(cxc.saldoPendiente)); setModalAbonoCxCAbierto(true); }} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">
                                  💵 Abonar
                                </button>
                              )}
                              <button type="button" onClick={() => { setCuentaCxCSeleccionada(cxc); setTextoPromesaInput(cxc.promesaPago); setModalPromesaAbierto(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">
                                📌 Promesa
                              </button>
                              <button type="button" onClick={() => { setCuentaCxCSeleccionada(cxc); setModalNotaCreditoAbierto(true); }} className="bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">
                                📄 Nota Cr.
                              </button>
                              <button type="button" onClick={() => { setMensajeNotif(`📧 Recordatorio de cobro enviado por correo y WhatsApp a "${cxc.clienteNombre}".`); setModalNotifAbierto(true); }} className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded font-bold cursor-pointer" title="Enviar recordatorio de cobro">
                                🔔 Recordar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE CUENTAS POR PAGAR */}
          {moduloActivo === 'cxp' && verificarPermisoModulo('cxp') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Cuentas por Pagar</h3>
                  <p className="text-slate-400 text-sm mt-1">Registra facturas, vencimientos, pagos parciales y consulta el historial de abonos.</p>
                </div>
                <button type="button" onClick={() => setModalCxPAbierto(true)} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">
                  + Registrar Factura / CxP
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] uppercase text-slate-400 font-semibold">Saldo por Pagar</p>
                  <h4 className="text-xl font-black text-amber-400 mt-1">{formatearMoneda(cuentasPorPagar.reduce((acc, c) => acc + c.saldoPendiente, 0))}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] uppercase text-slate-400 font-semibold">Cuentas Registradas</p>
                  <h4 className="text-xl font-black text-blue-400 mt-1">{cuentasPorPagar.length}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] uppercase text-slate-400 font-semibold">Vencidas</p>
                  <h4 className="text-xl font-black text-red-400 mt-1">{cuentasPorPagar.filter(c => c.estatus === 'Vencida' || (c.estatus !== 'Pagada' && c.fechaVencimiento && new Date(c.fechaVencimiento) < new Date())).length}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] uppercase text-slate-400 font-semibold">Pagadas</p>
                  <h4 className="text-xl font-black text-emerald-400 mt-1">{cuentasPorPagar.filter(c => c.estatus === 'Pagada').length}</h4>
                </div>
              </div>

              {modalCxPAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-amber-500/60 rounded-2xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-amber-400">Registrar Cuenta por Pagar</h3>
                      <button type="button" onClick={() => setModalCxPAbierto(false)} className="text-red-400 font-bold text-xs cursor-pointer">✕ Cerrar</button>
                    </div>
                    <form onSubmit={registrarFacturaCxP} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Folio de factura / documento</label>
                        <input type="text" value={cxpFolio} onChange={(e) => setCxpFolio(e.target.value)} placeholder="FAC-001 (opcional)" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Proveedor</label>
                        <select value={cxpProvId} onChange={(e) => setCxpProvId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                          <option value="">-- Proveedor general / sin seleccionar --</option>
                          {proveedores.filter(p => p.estatus === 'Activo').map(p => <option key={p.id} value={p.id}>{p.nombreComercial}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Orden de compra</label>
                        <input type="text" value={cxpOC} onChange={(e) => setCxpOC(e.target.value)} placeholder="OC-001" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Clasificación del gasto *</label>
                        <input type="text" value={cxpGasto} onChange={(e) => setCxpGasto(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Monto total *</label>
                        <input type="number" min="0" step="0.01" value={cxpMonto} onChange={(e) => setCxpMonto(e.target.value)} required placeholder="0.00" className="w-full bg-slate-950 border border-amber-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Fecha de vencimiento *</label>
                        <input type="date" value={cxpVencimiento} onChange={(e) => setCxpVencimiento(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalCxPAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar Cuenta</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {modalPagoAbierto && cuentaSeleccionadaPago && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-emerald-400">Registrar Pago / Abono</h3>
                      <button type="button" onClick={() => setModalPagoAbierto(false)} className="text-red-400 font-bold text-xs cursor-pointer">✕ Cerrar</button>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                      <p className="text-slate-400">Factura: <strong className="text-white">{cuentaSeleccionadaPago.folioFactura}</strong></p>
                      <p className="text-slate-400">Proveedor: <strong className="text-white">{cuentaSeleccionadaPago.proveedorNombre}</strong></p>
                      <p className="text-slate-400">Saldo pendiente: <strong className="text-amber-400">{formatearMoneda(cuentaSeleccionadaPago.saldoPendiente)}</strong></p>
                    </div>
                    <form onSubmit={realizarPagoCxP} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Fecha del pago *</label>
                        <input type="date" value={fechaAbonoInput} onChange={(e) => setFechaAbonoInput(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Monto *</label>
                        <input type="number" min="0.01" max={cuentaSeleccionadaPago.saldoPendiente} step="0.01" value={montoAbono} onChange={(e) => setMontoAbono(e.target.value)} required className="w-full bg-slate-950 border border-emerald-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Referencia</label>
                        <input type="text" value={referenciaAbonoInput} onChange={(e) => setReferenciaAbonoInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalPagoAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Registrar Pago</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {modalHistorialAbonosAbierto && cuentaHistorialSeleccionada && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">Historial de Abonos · {cuentaHistorialSeleccionada.folioFactura}</h3>
                      <button type="button" onClick={() => setModalHistorialAbonosAbierto(false)} className="text-red-400 font-bold text-xs cursor-pointer">✕ Cerrar</button>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {cuentaHistorialSeleccionada.historialAbonos.length === 0 ? (
                        <p className="text-xs text-slate-500 bg-slate-950 border border-slate-800 rounded-xl p-4">Todavía no hay abonos registrados.</p>
                      ) : cuentaHistorialSeleccionada.historialAbonos.map(ab => (
                        <div key={ab.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex justify-between gap-4">
                          <div><p className="text-white font-bold">{ab.fechaAbono}</p><p className="text-slate-400">{ab.referencia}</p></div>
                          <strong className="text-emerald-400">{formatearMoneda(ab.montoAbono)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {cuentasPorPagar.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-slate-400 font-semibold">No hay cuentas por pagar registradas.</p>
                    <p className="text-slate-500 text-xs mt-2">Usa “Registrar Factura / CxP” para capturar la primera.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead><tr className="bg-slate-950/60 text-slate-400 uppercase border-b border-slate-800">
                        <th className="p-3">Factura</th><th className="p-3">Proveedor</th><th className="p-3">Clasificación</th><th className="p-3">Vencimiento</th><th className="p-3">Total</th><th className="p-3">Pagado</th><th className="p-3">Saldo</th><th className="p-3">Estatus</th><th className="p-3 text-center">Acciones</th>
                      </tr></thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {cuentasPorPagar.map(cuenta => (
                          <tr key={cuenta.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-mono text-blue-400 font-bold">{cuenta.folioFactura}</td>
                            <td className="p-3 text-white font-semibold">{cuenta.proveedorNombre}</td>
                            <td className="p-3 text-slate-300">{cuenta.clasificacionGasto}</td>
                            <td className="p-3 text-slate-300 font-mono">{cuenta.fechaVencimiento}</td>
                            <td className="p-3 text-slate-300">{formatearMoneda(cuenta.montoTotal)}</td>
                            <td className="p-3 text-emerald-400">{formatearMoneda(cuenta.montoPagado)}</td>
                            <td className="p-3 text-amber-400 font-bold">{formatearMoneda(cuenta.saldoPendiente)}</td>
                            <td className="p-3"><span className={`px-2 py-1 rounded font-bold ${cuenta.estatus === 'Pagada' ? 'bg-emerald-950 text-emerald-400' : cuenta.estatus === 'Vencida' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'}`}>{cuenta.estatus}</span></td>
                            <td className="p-3 text-center"><div className="flex flex-wrap justify-center gap-1.5">
                              {cuenta.estatus !== 'Pagada' && <button type="button" onClick={() => { setCuentaSeleccionadaPago(cuenta); setMontoAbono(String(cuenta.saldoPendiente)); setModalPagoAbierto(true); }} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">💵 Pagar</button>}
                              <button type="button" onClick={() => { setCuentaHistorialSeleccionada(cuenta); setModalHistorialAbonosAbierto(true); }} className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">📋 Historial</button>
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MÓDULO DE GASTOS OPERATIVOS */}
          {moduloActivo === 'gastos' && verificarPermisoModulo('gastos') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Gastos Operativos</h3>
                  <p className="text-slate-400 text-sm mt-1">Control de gastos, comprobantes, centro de costos, autorización y estatus.</p>
                </div>
                <button type="button" onClick={() => setModalGastoAbierto(true)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">+ Registrar Gasto</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Total Gastos</p><h4 className="text-xl font-black text-purple-400 mt-1">{formatearMoneda(gastosVisiblesUsuario.reduce((acc, g) => acc + g.total, 0))}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Registros</p><h4 className="text-xl font-black text-blue-400 mt-1">{gastosVisiblesUsuario.length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Pagados</p><h4 className="text-xl font-black text-emerald-400 mt-1">{gastosVisiblesUsuario.filter(g => g.estatus === 'Pagado').length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Por Autorizar / Revisar</p><h4 className="text-xl font-black text-amber-400 mt-1">{gastosVisiblesUsuario.filter(g => g.estatus === 'Registrado' || g.estatus === 'En revisión').length}</h4></div>
              </div>

              {modalGastoAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-purple-500/60 rounded-2xl p-6 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3"><h3 className="text-base font-bold text-purple-400">Registrar Gasto Operativo</h3><button type="button" onClick={() => setModalGastoAbierto(false)} className="text-red-400 font-bold text-xs cursor-pointer">✕ Cerrar</button></div>
                    <form onSubmit={registrarGastoOperativo} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div><label className="block text-slate-400 mb-1">Categoría *</label><input type="text" value={gCat} onChange={(e) => setGCat(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div>
                        <label className="block text-slate-400 mb-1">Sucursal *</label>
                        {usuarioEsAdministrador ? (
                          <select value={gSuc} onChange={(e) => setGSuc(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                            <option value="">-- Seleccione sucursal --</option>
                            {sucursalesPermitidasUsuario.map((s: Sucursal) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                          </select>
                        ) : (
                          <div className="w-full bg-slate-950 border border-emerald-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">
                            {nombreSucursalAsignadaUsuario || 'Sin sucursal asignada'}
                          </div>
                        )}
                      </div>
                      <div><label className="block text-slate-400 mb-1">Responsable *</label><input type="text" value={gResp} onChange={(e) => setGResp(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div><label className="block text-slate-400 mb-1">Proveedor</label><input type="text" value={gProv} onChange={(e) => setGProv(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div><label className="block text-slate-400 mb-1">Fecha *</label><input type="date" value={gFecha} onChange={(e) => setGFecha(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div><label className="block text-slate-400 mb-1">Forma de pago *</label><select value={gFormaPago} onChange={(e) => setGFormaPago(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"><option>Transferencia SPEI</option><option>Efectivo</option><option>Tarjeta</option><option>Cheque</option><option>Otro</option></select></div>
                      <div><label className="block text-slate-400 mb-1">Importe antes de IVA *</label><input type="number" min="0" step="0.01" value={gImporte} onChange={(e) => setGImporte(e.target.value)} required placeholder="0.00" className="w-full bg-slate-950 border border-purple-700 rounded-xl px-3 py-2 text-white font-mono" /></div>
                      <div><label className="block text-slate-400 mb-1">Comprobante / referencia</label><input type="text" value={gDoc} onChange={(e) => setGDoc(e.target.value)} placeholder="Factura, ticket o archivo" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div><label className="block text-slate-400 mb-1">Centro de costos</label><input type="text" value={gCentro} onChange={(e) => setGCentro(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div><label className="block text-slate-400 mb-1">Autorización</label><input type="text" value={gAut} onChange={(e) => setGAut(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div><label className="block text-slate-400 mb-1">Estatus</label><select value={gEstatus} onChange={(e) => setGEstatus(e.target.value as GastoOperativo['estatus'])} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"><option value="Registrado">Registrado</option><option value="En revisión">En revisión</option><option value="Autorizado">Autorizado</option><option value="Pagado">Pagado</option><option value="Cancelado">Cancelado</option></select></div>
                      <div className="md:col-span-2"><label className="block text-slate-400 mb-1">Observaciones</label><textarea value={gObs} onChange={(e) => setGObs(e.target.value)} rows={2} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400">IVA calculado automáticamente al 16%. Total estimado: <strong className="text-emerald-400">{formatearMoneda((Number(gImporte) || 0) * 1.16)}</strong></div>
                      <div className="md:col-span-3 flex justify-end gap-3"><button type="button" onClick={() => setModalGastoAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button><button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar Gasto</button></div>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {gastos.length === 0 ? <div className="p-12 text-center"><p className="text-slate-400 font-semibold">No hay gastos operativos registrados.</p><p className="text-slate-500 text-xs mt-2">Usa “Registrar Gasto” para capturar el primero.</p></div> : (
                  <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-xs"><thead><tr className="bg-slate-950/60 text-slate-400 uppercase border-b border-slate-800"><th className="p-3">Folio</th><th className="p-3">Fecha</th><th className="p-3">Categoría</th><th className="p-3">Sucursal</th><th className="p-3">Responsable</th><th className="p-3">Importe</th><th className="p-3">IVA</th><th className="p-3">Total</th><th className="p-3">Estatus</th></tr></thead><tbody className="divide-y divide-slate-800/60">{gastosVisiblesUsuario.map(g => <tr key={g.id} className="hover:bg-slate-800/40"><td className="p-3 font-mono text-blue-400 font-bold">{g.folio}</td><td className="p-3 text-slate-300">{g.fecha}</td><td className="p-3 text-white font-semibold">{g.categoria}</td><td className="p-3 text-slate-300">{g.sucursal}</td><td className="p-3 text-slate-300">{g.responsable}</td><td className="p-3 text-slate-300">{formatearMoneda(g.importe)}</td><td className="p-3 text-slate-300">{formatearMoneda(g.iva)}</td><td className="p-3 text-emerald-400 font-bold">{formatearMoneda(g.total)}</td><td className="p-3 text-amber-400 font-bold">{g.estatus}</td></tr>)}</tbody></table></div>
                )}
              </div>
            </div>
          )}

          {/* MÓDULO DE AUDITORÍA DE INVENTARIOS */}
          {moduloActivo === 'auditoria' && verificarPermisoModulo('auditoria') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h3 className="text-xl font-bold text-white">Auditoría de Inventarios</h3><p className="text-slate-400 text-sm mt-1">Programa conteos, escanea códigos/SKU, captura existencias físicas y aplica ajustes autorizados al Kardex.</p></div>
                <button type="button" onClick={() => setModalAuditoriaAbierto(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">+ Programar Auditoría</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Auditorías</p><h4 className="text-xl font-black text-blue-400 mt-1">{auditoriasVisiblesUsuario.length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Pendientes</p><h4 className="text-xl font-black text-amber-400 mt-1">{auditoriasVisiblesUsuario.filter(a => a.estatus === 'Pendiente Autorización' || a.estatus === 'En Proceso').length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Ajustes Aplicados</p><h4 className="text-xl font-black text-emerald-400 mt-1">{auditoriasVisiblesUsuario.filter(a => a.estatus === 'Ajuste Aplicado').length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Productos Catalogados</p><h4 className="text-xl font-black text-purple-400 mt-1">{catalogoProductos.length}</h4></div>
              </div>

              {modalAuditoriaAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3"><h3 className="text-base font-bold text-blue-400">Programar Auditoría</h3><button type="button" onClick={() => setModalAuditoriaAbierto(false)} className="text-red-400 font-bold text-xs cursor-pointer">✕ Cerrar</button></div>
                    {catalogoProductos.length === 0 && <div className="bg-amber-950/40 border border-amber-800 text-amber-300 rounded-xl p-3 text-xs">Primero registra productos y existencias. La auditoría necesita un catálogo para generar el conteo.</div>}
                    <form onSubmit={registrarAuditoria} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Tipo de alcance</label>
                        {usuarioEsAdministrador ? (
                          <select value={audTipo} onChange={(e) => setAudTipo(e.target.value as AuditoriaInventario['tipoAlcance'])} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                            <option value="Sucursal">Sucursal</option><option value="Almacén">Almacén</option><option value="Categoría">Categoría</option><option value="Ubicación">Ubicación</option><option value="Completa">Completa</option><option value="Conteo Cíclico">Conteo Cíclico</option>
                          </select>
                        ) : (
                          <div className="w-full bg-slate-950 border border-emerald-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">Sucursal asignada</div>
                        )}
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Sucursal / valor del alcance *</label>
                        {usuarioEsAdministrador ? (
                          audTipo === 'Sucursal' ? (
                            <select value={audValor} onChange={(e) => setAudValor(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                              <option value="">-- Seleccione sucursal --</option>
                              {sucursalesPermitidasUsuario.map((s: Sucursal) => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                            </select>
                          ) : (
                            <input type="text" value={audValor} onChange={(e) => setAudValor(e.target.value)} required placeholder="Indique almacén, categoría o ubicación" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                          )
                        ) : (
                          <div className="w-full bg-slate-950 border border-emerald-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">{nombreSucursalAsignadaUsuario || 'Sin sucursal asignada'}</div>
                        )}
                      </div>
                      <div><label className="block text-slate-400 mb-1">Responsable *</label><input type="text" value={audResp} onChange={(e) => setAudResp(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div><label className="block text-slate-400 mb-1">Observaciones</label><input type="text" value={audObs} onChange={(e) => setAudObs(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" /></div>
                      <div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setModalAuditoriaAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button><button type="submit" disabled={catalogoProductos.length === 0} className={`font-bold px-5 py-2 rounded-xl ${catalogoProductos.length === 0 ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'}`}>Crear Auditoría</button></div>
                    </form>
                  </div>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {auditorias.length === 0 ? <div className="p-12 text-center"><p className="text-slate-400 font-semibold">No hay auditorías registradas.</p><p className="text-slate-500 text-xs mt-2">Cuando tengas productos, programa aquí el primer conteo físico.</p></div> : (
                  <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="bg-slate-950/60 text-slate-400 uppercase border-b border-slate-800"><th className="p-3">Folio</th><th className="p-3">Fecha</th><th className="p-3">Alcance</th><th className="p-3">Responsable</th><th className="p-3">Productos</th><th className="p-3">Estatus</th><th className="p-3 text-center">Acciones</th></tr></thead><tbody className="divide-y divide-slate-800/60">{auditoriasVisiblesUsuario.map(aud => <tr key={aud.id} className="hover:bg-slate-800/40"><td className="p-3 font-mono text-blue-400 font-bold">{aud.folio}</td><td className="p-3 text-slate-300">{aud.fechaAuditoria}</td><td className="p-3 text-white">{aud.tipoAlcance}: {aud.valorAlcance}</td><td className="p-3 text-slate-300">{aud.responsable}</td><td className="p-3 text-purple-400 font-bold">{aud.items.length}</td><td className="p-3 text-amber-400 font-bold">{aud.estatus}</td><td className="p-3 text-center"><div className="flex flex-wrap justify-center gap-1.5"><button type="button" onClick={() => setAuditoriaSeleccionadaDetalle(aud)} className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">🔎 Abrir Conteo</button>{aud.estatus !== 'Ajuste Aplicado' && <button type="button" onClick={() => autorizarAjusteAuditoria(aud.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">✓ Aplicar Ajuste</button>}</div></td></tr>)}</tbody></table></div>
                )}
              </div>

              {auditoriaSeleccionadaDetalle && (
                <div className="bg-slate-900 border border-blue-700 rounded-2xl p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col md:flex-row justify-between gap-3 md:items-center"><div><h4 className="text-white font-bold">Conteo físico · {auditoriaSeleccionadaDetalle.folio}</h4><p className="text-xs text-slate-400">Escanea el SKU/código o captura manualmente la existencia física.</p></div><button type="button" onClick={() => { setAuditoriaSeleccionadaDetalle(null); setCamaraAuditoriaActiva(false); }} className="bg-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs cursor-pointer">Cerrar detalle</button></div>

                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3">
                    <form onSubmit={escanearProductoAuditoria} className="flex gap-2"><input type="text" value={codigoEscaneoAuditoria} onChange={(e) => setCodigoEscaneoAuditoria(e.target.value)} placeholder="Escanear o escribir SKU / código" className="flex-1 bg-slate-950 border border-blue-700 rounded-xl px-3 py-2 text-white text-xs font-mono" /><button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">+ Contar 1</button></form>
                    <button type="button" onClick={() => setCamaraAuditoriaActiva(!camaraAuditoriaActiva)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">📷 {camaraAuditoriaActiva ? 'Apagar Cámara' : 'Abrir Cámara'}</button>
                  </div>
                  {camaraAuditoriaActiva && <div className="bg-purple-950/30 border border-purple-800 rounded-xl p-3 flex flex-col items-center gap-2"><video ref={videoAuditoriaRef} autoPlay playsInline className="w-full max-w-lg h-52 bg-black rounded-xl object-cover" /><p className="text-[10px] text-purple-300">El visor está activo. El código puede capturarse con lector Bluetooth o escribirse en el campo de escaneo.</p></div>}

                  <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="bg-slate-950/60 text-slate-400 uppercase"><th className="p-3">Código</th><th className="p-3">Producto</th><th className="p-3">Teórica</th><th className="p-3">Física</th><th className="p-3">Diferencia</th><th className="p-3">Resultado</th></tr></thead><tbody className="divide-y divide-slate-800/60">{auditoriaSeleccionadaDetalle.items.map(it => <tr key={it.productoId}><td className="p-3 font-mono text-blue-400">{it.codigo}</td><td className="p-3 text-white">{it.nombreProducto}</td><td className="p-3 text-slate-300">{it.existenciaTeorica}</td><td className="p-3"><input type="number" min="0" value={it.existenciaFisica} onChange={(e) => actualizarConteoManual(it.productoId, e.target.value)} className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-white font-mono" /></td><td className={`p-3 font-bold ${it.diferencia === 0 ? 'text-emerald-400' : it.diferencia < 0 ? 'text-red-400' : 'text-amber-400'}`}>{it.diferencia > 0 ? '+' : ''}{it.diferencia}</td><td className="p-3 text-slate-300">{it.tipoDiferencia}</td></tr>)}</tbody></table></div>
                </div>
              )}
            </div>
          )}

          {/* MÓDULO DE COTIZACIONES */}
          {moduloActivo === 'cotizaciones' && verificarPermisoModulo('cotizaciones') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h3 className="text-xl font-bold text-white">Cotizaciones con Reserva de 48 Horas</h3><p className="text-slate-400 text-sm mt-1">Las cotizaciones se generan desde Ventas y reservan temporalmente el inventario hasta autorizarse o expirar.</p></div>
                <button type="button" onClick={() => setModuloActivo('ventas')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">+ Crear desde Ventas</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Pendientes</p><h4 className="text-xl font-black text-amber-400 mt-1">{cotizacionesVisiblesUsuario.filter(c => c.estatus === 'Pendiente').length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Autorizadas</p><h4 className="text-xl font-black text-emerald-400 mt-1">{cotizacionesVisiblesUsuario.filter(c => c.estatus === 'Autorizada').length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Expiradas</p><h4 className="text-xl font-black text-red-400 mt-1">{cotizacionesVisiblesUsuario.filter(c => c.estatus === 'Expirada').length}</h4></div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4"><p className="text-[11px] uppercase text-slate-400 font-semibold">Valor Pendiente</p><h4 className="text-xl font-black text-blue-400 mt-1">{formatearMoneda(cotizacionesVisiblesUsuario.filter(c => c.estatus === 'Pendiente').reduce((acc, c) => acc + c.total, 0))}</h4></div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {cotizacionesVisiblesUsuario.length === 0 ? (
                  <div className="p-12 text-center"><p className="text-slate-400 font-semibold">Todavía no hay cotizaciones.</p><p className="text-slate-500 text-xs mt-2">Agrega productos al carrito en Ventas y selecciona “Generar Cotización (48h)”.</p><button type="button" onClick={() => setModuloActivo('ventas')} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">Ir a Ventas</button></div>
                ) : (
                  <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="bg-slate-950/60 text-slate-400 uppercase border-b border-slate-800"><th className="p-3">Folio</th><th className="p-3">Cliente</th><th className="p-3">Sucursal</th><th className="p-3">Creación</th><th className="p-3">Expira</th><th className="p-3">Productos</th><th className="p-3">Total</th><th className="p-3">Estatus</th><th className="p-3 text-center">Acciones</th></tr></thead><tbody className="divide-y divide-slate-800/60">{cotizacionesVisiblesUsuario.map(cot => <tr key={cot.folio} className="hover:bg-slate-800/40"><td className="p-3 font-mono text-blue-400 font-bold">{cot.folio}</td><td className="p-3 text-white font-semibold">{cot.cliente || 'Público general'}</td><td className="p-3 text-slate-300">{cot.sucursal}</td><td className="p-3 text-slate-300">{cot.fechaCreacion}</td><td className="p-3 text-slate-300">{cot.fechaExpiracion}</td><td className="p-3 text-purple-400 font-bold">{cot.items.reduce((acc, it) => acc + it.cantidadVendida, 0)}</td><td className="p-3 text-emerald-400 font-bold">{formatearMoneda(cot.total)}</td><td className="p-3"><span className={`px-2 py-1 rounded font-bold ${cot.estatus === 'Autorizada' ? 'bg-emerald-950 text-emerald-400' : cot.estatus === 'Expirada' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'}`}>{cot.estatus}</span></td><td className="p-3 text-center"><div className="flex flex-wrap justify-center gap-1.5">{cot.estatus === 'Pendiente' && <><button type="button" onClick={() => autorizarCotizacion(cot)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-bold cursor-pointer">✓ Autorizar</button><button type="button" onClick={() => expirarCotizacion(cot)} className="bg-red-700 hover:bg-red-600 text-white px-2.5 py-1 rounded font-bold cursor-pointer">⏱ Expirar</button></>}</div></td></tr>)}</tbody></table></div>
                )}
              </div>
            </div>
          )}

          {/* MÓDULO DE VENTAS (POS) CON OPCIÓN DE PAGO A CRÉDITO */}
          {moduloActivo === 'ventas' && verificarPermisoModulo('ventas') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Punto de Venta Profesional (MXN)</h3>
                  <p className="text-slate-400 text-sm">Venta activa para la sucursal: <span className="text-amber-400 font-bold">{sucursalActivaPOS}</span></p>
                  {cotizacionOrigenPOS && <p className="text-blue-400 text-xs mt-1 font-semibold">📄 Venta originada desde cotización reservada: {cotizacionOrigenPOS}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {usuarioEsAdministrador ? (
                    <select value={sucursalActivaPOS} onChange={(e) => { setSucursalActivaPOS(e.target.value); setCarrito([]); }} className="bg-slate-900 border border-amber-600 text-white text-xs rounded-xl px-3 py-2 font-semibold">
                      <option value="">-- Seleccione sucursal --</option>
                      {sucursalesPermitidasUsuario.map((s: Sucursal) => (
                        <option key={s.id} value={s.nombre}>{s.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs rounded-xl px-3 py-2 font-bold">
                      🏢 {nombreSucursalAsignadaUsuario || 'Sin sucursal asignada'}
                    </div>
                  )}
                  <button type="button" onClick={() => setCamaraActiva(!camaraActiva)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer">
                    📷 {camaraActiva ? 'Apagar Cámara' : 'Cámara Web'}
                  </button>
                </div>
              </div>

              {sucursalesActivas.length === 0 && (
                <div className="bg-amber-950/40 border border-amber-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="text-amber-300 font-bold text-sm">No hay sucursales activas.</p>
                    <p className="text-amber-200/70 text-xs">Registre una sucursal antes de capturar ventas o cotizaciones.</p>
                  </div>
                  <button type="button" onClick={() => setModuloActivo('sucursales')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">
                    Ir a Sucursales
                  </button>
                </div>
              )}

              {camaraActiva && (
                <div className="bg-purple-950/40 border border-purple-800 rounded-2xl p-4 flex flex-col items-center space-y-3">
                  <p className="text-xs font-semibold text-purple-300">Visor de Cámara Activo</p>
                  <video ref={videoRef} autoPlay playsInline className="w-full max-w-md h-56 bg-black rounded-xl border border-purple-900 object-cover"></video>
                  <button type="button" onClick={() => setCamaraActiva(false)} className="text-xs bg-red-900 text-white px-3 py-1 rounded-lg cursor-pointer">Cerrar Visor</button>
                </div>
              )}

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center">
                <form onSubmit={handleEscaneoDirecto} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="🔍 Escanee código de barras o escriba nombre..."
                    value={busquedaTexto}
                    onChange={(e) => setBusquedaTexto(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono"
                  />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold cursor-pointer">
                    Agregar
                  </button>
                </form>
              </div>

              {/* MODAL PARA CAPTURAR / VALIDAR NÚMERO DE SERIE FÍSICO */}
              {modalSerieAbierto && lineaSerieEditandoId && (() => {
                const itemSerie = carrito.find((it: ItemVenta) => it.lineaId === lineaSerieEditandoId);
                if (!itemSerie) return null;
                return (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">📌 Asignar Número de Serie Físico</h3>
                      <button type="button" onClick={() => { setModalSerieAbierto(false); setLineaSerieEditandoId(null); setInputNumeroSerieFisico(''); }} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cancelar</button>
                    </div>
                    <form onSubmit={confirmarNumeroSerieModal} className="space-y-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 block text-[10px]">Equipo físico que se entregará:</span>
                        <strong className="text-white text-sm">{itemSerie.nombre}</strong>
                        <span className="text-blue-400 font-mono block">SKU: {itemSerie.codigo}</span>
                        <span className="text-slate-500 block">Sucursal: {itemSerie.sucursal}</span>
                      </div>
                      <div className="bg-amber-950/30 border border-amber-800 rounded-xl p-3 text-[11px] text-amber-200">
                        Tome físicamente el equipo que se entregará y capture o escanee exactamente la serie de su placa. El sistema rechazará una serie repetida o ya vendida.
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Número de Serie Físico *</label>
                        <input
                          type="text"
                          value={inputNumeroSerieFisico}
                          onChange={(e) => setInputNumeroSerieFisico(e.target.value.toUpperCase())}
                          placeholder="Escanee o escriba la serie"
                          required
                          className="w-full bg-slate-950 border border-blue-600 rounded-xl px-4 py-3 text-sm text-white font-mono uppercase"
                          autoFocus
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => { setModalSerieAbierto(false); setLineaSerieEditandoId(null); setInputNumeroSerieFisico(''); }} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Validar y Asignar Serie</button>
                      </div>
                    </form>
                  </div>
                </div>
                );
              })()}

              {ventaExitosa && ticketGenerado && (
                <div className="bg-slate-900 border border-emerald-600 p-6 rounded-2xl space-y-4 shadow-2xl">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-emerald-400">✅ Venta Exitosa - Resumen Detallado</h4>
                      <p className="text-xs text-slate-400 font-mono">Folio: {ticketGenerado.folio} | Cliente: {ticketGenerado.cliente} | Pago: {ticketGenerado.metodoPago}</p>
                    </div>
                    <button type="button" onClick={() => ejecutarDescargaTicketPDF(ticketGenerado)} className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer">
                      📥 Descargar Ticket en PDF
                    </button>
                  </div>
                  <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <p className="text-slate-300 font-bold mb-2">Artículos Vendidos y Desglose Físico:</p>
                    {ticketGenerado.items.map((it, idx) => (
                      <div key={idx} className="border-b border-slate-900 pb-2 flex justify-between">
                        <div>
                          <strong className="text-white">{it.cantidadVendida}x {it.nombre}</strong>
                          {it.requiereSerie && <p className="text-blue-400 font-mono text-[11px]">📌 Serie Física: {it.numeroSerie}</p>}
                          <p className="text-purple-400 text-[10px]">🛡️ Garantía: {it.fechaGarantia}</p>
                        </div>
                        <span className="text-emerald-400 font-bold">{formatearMoneda(it.precio * it.cantidadVendida)}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-right font-bold text-white text-sm">
                      Total Cobrado: <span className="text-emerald-400">{formatearMoneda(ticketGenerado.total)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-h-[500px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                          <th className="p-3">Código</th>
                          <th className="p-3">Producto / Paquete</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3">Precio</th>
                          <th className="p-3 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {productosFiltrados.map((prod: ProductoCatalogo) => {
                          const stockSuc = obtenerStockSucursal(prod.id, sucursalActivaPOS);
                          return (
                            <tr key={prod.id} className="hover:bg-slate-800/40">
                              <td className="p-3 font-mono text-blue-400 text-xs">{prod.codigo}</td>
                              <td className="p-3 font-medium text-white text-xs">
                                {prod.nombre}
                                {prod.esPaqueteDefinido && <span className="ml-2 text-[10px] bg-blue-950 text-blue-400 px-2 py-0.5 rounded">Paquete</span>}
                              </td>
                              <td className="p-3 font-mono text-xs">{stockSuc} un.</td>
                              <td className="p-3 font-semibold text-emerald-400 text-xs">{formatearMoneda(prod.precio || 0)}</td>
                              <td className="p-3 text-center flex items-center justify-center gap-2">
                                {prod.esPaqueteDefinido ? (
                                  <button type="button" onClick={() => agregarPaqueteAlCarrito(prod, stockSuc)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">+ Paquete</button>
                                ) : (
                                  <>
                                    <button type="button" onClick={() => {
                                      if (stockSuc <= 0 && !prod.esRegalo) {
                                        setMensajeSinStock(`El producto "${prod.nombre}" no cuenta con stock disponible en ${sucursalActivaPOS}.`);
                                        setModalSinStockAbierto(true);
                                        return;
                                      }
                                      if (prod.esPaqueteDefinido && prod.componentesPaquete) {
                                        agregarPaqueteAlCarrito(prod, stockSuc);
                                      } else {
                                        agregarAlCarrito(prod, false, stockSuc, '');
                                      }
                                    }} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">+ Venta</button>
                                    <button type="button" onClick={() => {
                                      if (stockSuc <= 0) {
                                        setMensajeSinStock(`El producto "${prod.nombre}" no cuenta con stock disponible en ${sucursalActivaPOS}.`);
                                        setModalSinStockAbierto(true);
                                        return;
                                      }
                                      if (prod.esPaqueteDefinido && prod.componentesPaquete) {
                                        agregarPaqueteAlCarrito(prod, stockSuc);
                                      } else {
                                        agregarAlCarrito(prod, true, stockSuc, '');
                                      }
                                    }} className="bg-amber-600 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">🎁 Regalo</button>
                                  </>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 uppercase mb-4">Nota de Venta Actual</h4>
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-slate-400">Seleccionar Cliente</label>
                      </div>
                      <select
                        value={clienteSeleccionadoPOS}
                        onChange={(e) => setClienteSeleccionadoPOS(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-medium"
                      >
                        {clientes.map((c: Cliente) => (
                          <option key={c.id} value={c.nombreComercial}>{c.nombreComercial} ({c.responsable})</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs text-amber-400 font-semibold mb-1">💳 Método de Pago (Incluye Pagar a Crédito)</label>
                      <select value={metodoPagoSeleccionado} onChange={(e) => setMetodoPagoSeleccionado(e.target.value)} className="w-full bg-slate-950 border border-amber-600 rounded-xl px-3 py-2 text-sm text-white font-medium">
                        <option value="Efectivo">💵 Efectivo</option>
                        <option value="Tarjeta de Crédito">💳 Tarjeta de Crédito</option>
                        <option value="Tarjeta de Débito">💳 Tarjeta de Débito</option>
                        <option value="Transferencia SPEI">🏦 Transferencia SPEI</option>
                        <option value="Crédito">📋 Pagar a Crédito (CxC)</option>
                      </select>
                    </div>

                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
                      {carrito.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">El carrito está vacío.</p>
                      ) : (
                        carrito.map((item: ItemVenta, idx: number) => {
                          const unitFinal = item.esRegalo ? 0.00 : Math.max(0.00, (item.precio || 0) - (item.descuentoMontoFijo || 0));
                          return (
                            <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl space-y-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-white truncate max-w-[130px]">{item.nombre}</span>
                                <span className={item.esRegalo ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                  {item.esRegalo ? 'REGALO ($0.00)' : formatearMoneda(unitFinal * item.cantidadVendida)}
                                </span>
                              </div>
                              {item.requiereSerie ? (
                                <div className={`flex items-center justify-between gap-2 p-2 rounded border ${item.numeroSerie ? 'bg-emerald-950/30 border-emerald-800' : 'bg-amber-950/30 border-amber-800'}`}>
                                  <div>
                                    <span className="text-[9px] text-slate-400 block">Número de serie</span>
                                    <span className={`font-mono text-[10px] font-bold ${item.numeroSerie ? 'text-emerald-400' : 'text-amber-400'}`}>{item.numeroSerie || 'PENDIENTE DE ASIGNAR'}</span>
                                  </div>
                                  <button type="button" onClick={() => abrirCapturaSerieCarrito(item.lineaId)} className="bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer">{item.numeroSerie ? 'Cambiar serie' : 'Asignar serie'}</button>
                                </div>
                              ) : (
                                <p className="text-slate-500 font-mono text-[10px]">N/S: No aplica</p>
                              )}
                              {!item.esRegalo && !item.esPaqueteComponente && (
                                <div className="flex items-center justify-between bg-slate-900 p-1 rounded border border-slate-800">
                                  <span className="text-[10px] text-slate-400">Descuento Fijo ($):</span>
                                  <input type="number" step="0.01" value={item.descuentoMontoFijo === 0 ? '' : item.descuentoMontoFijo} placeholder="0.00" onChange={(e) => cambiarDescuentoMonto(item.lineaId, e.target.value)} className="w-16 bg-slate-950 border border-slate-700 text-center rounded text-white text-xs" />
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                                <span className="text-[10px] text-blue-400">Suc: {item.sucursal}</span>
                                {item.requiereSerie ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">1 unidad</span>
                                    <button type="button" onClick={() => quitarLineaCarrito(item.lineaId)} className="bg-red-900 hover:bg-red-800 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer">Quitar</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => cambiarCantidad(item.lineaId, -1)} className="w-5 h-5 bg-slate-800 rounded text-white font-bold cursor-pointer">-</button>
                                    <span className="font-bold text-white w-4 text-center">{item.cantidadVendida}</span>
                                    <button type="button" onClick={() => cambiarCantidad(item.lineaId, 1)} className="w-5 h-5 bg-slate-800 rounded text-white font-bold cursor-pointer">+</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 mt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-white font-bold text-base">
                      <span>Total a Pagar:</span>
                      <span className="text-emerald-400">{formatearMoneda(total)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button type="button" onClick={generarCotizacion} disabled={carrito.length === 0} className={`py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer ${carrito.length === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                        📄 Generar Cotización (48h)
                      </button>
                      <button type="button" onClick={procesarVenta} disabled={carrito.length === 0} className={`py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer ${carrito.length === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}>
                        💳 Cobrar Directo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MÓDULO DE REPORTES FINANCIEROS */}
          {moduloActivo === 'reportes' && verificarPermisoModulo('reportes') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Módulo de Reportes Financieros y de Gestión</h3>
                  <p className="text-slate-400 text-sm mt-1">Panel ejecutivo para dirección y administración con filtrado por rango de fechas, gastos operativos y desglose de caja vs. bancos.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={exportarExcelReporte} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer">📊 Exportar Excel / CSV</button>
                  <button type="button" onClick={exportarPDFReporte} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow cursor-pointer">📄 Exportar PDF</button>
                </div>
              </div>

              {/* Panel de Filtros Maestros */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-5 gap-3 text-xs items-end">
                <div>
                  <label className="block text-slate-400 mb-1">📅 Fecha Inicio</label>
                  <input type="date" value={fechaInicioReporte} onChange={(e) => setFechaInicioReporte(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">📅 Fecha Fin</label>
                  <input type="date" value={fechaFinReporte} onChange={(e) => setFechaFinReporte(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sucursal</label>
                  {usuarioEsAdministrador ? (
                    <select value={sucursalReporte} onChange={(e) => setSucursalReporte(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                      <option value="Todas">Todas</option>
                      {sucursales.map((s: Sucursal) => (
                        <option key={s.id} value={s.nombre}>{s.nombre}{s.estatus === 'Inactiva' ? ' (Inactiva)' : ''}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-slate-950 border border-emerald-800 rounded-xl px-3 py-2 text-emerald-400 font-bold">
                      {nombreSucursalAsignadaUsuario || 'Sin sucursal asignada'}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Categoría</label>
                  <select value={categoriaReporte} onChange={(e) => setCategoriaReporte(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="Todas">Todas</option>
                    {listaCategorias.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <button type="button" onClick={() => { setMensajeNotif('¡Reportes filtrados y actualizados con éxito!'); setModalNotifAbierto(true); }} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl shadow text-xs cursor-pointer">
                    🔍 Generar Reporte
                  </button>
                </div>
              </div>

              {/* Tarjetas de Indicadores */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Ventas del Periodo</p>
                  <h4 className="text-lg font-black text-emerald-400 mt-1">{formatearMoneda(ventasPeriodoReporte)}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Gastos Operativos</p>
                  <h4 className="text-lg font-black text-red-400 mt-1">{formatearMoneda(gastosPeriodoReporte)}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">💵 Efectivo en Caja</p>
                  <h4 className="text-lg font-black text-amber-400 mt-1">{formatearMoneda(efectivoPeriodoReporte)}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">🏦 Disponible Bancos</p>
                  <h4 className="text-lg font-black text-purple-400 mt-1">{formatearMoneda(bancosPeriodoReporte)}</h4>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">Utilidad Neta</p>
                  <h4 className="text-lg font-black text-blue-400 mt-1">{formatearMoneda(utilidadNetaPeriodo)}</h4>
                </div>
              </div>
            </div>
          )}

          {/* MODAL "NO HAY STOCK" */}
          {modalSinStockAbierto && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-red-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                <h3 className="text-lg font-bold text-red-400">⚠️ No hay stock</h3>
                <p className="text-xs text-slate-300">{mensajeSinStock}</p>
                <button type="button" onClick={() => setModalSinStockAbierto(false)} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-2 rounded-xl text-xs w-full cursor-pointer">Aceptar</button>
              </div>
            </div>
          )}

          {/* MODAL NOTIFICACIÓN INTERNA */}
          {modalNotifAbierto && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="bg-slate-900 border border-emerald-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
                <h3 className="text-lg font-bold text-emerald-400">✅ Operación Exitosa</h3>
                <p className="text-xs text-slate-300">{mensajeNotif}</p>
                <button type="button" onClick={() => setModalNotifAbierto(false)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2 rounded-xl text-xs w-full cursor-pointer">Aceptar</button>
              </div>
            </div>
          )}

          {/* HISTORIAL */}
          {moduloActivo === 'historial' && verificarPermisoModulo('historial') && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Historial de Tickets y Reimpresión</h3>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {historialVisibleUsuario.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-sm">No hay tickets registrados.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase bg-slate-950/50">
                          <th className="p-4">Folio</th>
                          <th className="p-4">Fecha</th>
                          <th className="p-4">Cliente</th>
                          <th className="p-4">Pago</th>
                          <th className="p-4">Total</th>
                          <th className="p-4 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-sm">
                        {historialVisibleUsuario.map((t: TicketGuardado, i: number) => (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="p-4 font-mono text-blue-400 font-bold text-xs">{t.folio}</td>
                            <td className="p-4 text-slate-400 text-xs">{t.fecha}</td>
                            <td className="p-4 text-white text-xs">{t.cliente}</td>
                            <td className="p-4 text-amber-400 text-xs">{t.metodoPago}</td>
                            <td className="p-4 text-emerald-400 font-bold text-xs">{formatearMoneda(t.total)}</td>
                            <td className="p-4 text-center">
                              <button type="button" onClick={() => ejecutarDescargaTicketPDF(t)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer">
                                📥 Descargar PDF
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
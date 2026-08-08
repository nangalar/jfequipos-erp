'use client';

import { useState, useEffect, useRef } from 'react';

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
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  costo: number;
  stock: number;
  sucursal: string;
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
  items: ItemVenta[];
  subtotalBruto: number;
  descuentoTotal: number;
  subtotalNeto: number;
  iva: number;
  total: number;
}

interface UsuarioSistema {
  id: number;
  nombre: string;
  email: string;
  password: string;
  rol: string;
  activo: boolean;
}

interface RolPermisos {
  nombreRol: string;
  modulosPermitidos: string[];
}

const LISTA_MODULOS_DISPONIBLES = [
  { id: 'inicio', nombre: '📊 Panel General' },
  { id: 'productos', nombre: '🏷️ Productos' },
  { id: 'inventario', nombre: '📦 Inventario / Kardex' },
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
  const [emailLogin, setEmailLogin] = useState<string>('admin@jfequipos.com');
  const [passwordLogin, setPasswordLogin] = useState<string>('admin123');
  const [vistaRecuperacion, setVistaRecuperacion] = useState<boolean>(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState<string>('');

  const [usuariosSistema, setUsuariosSistema] = useState<UsuarioSistema[]>([
    { id: 1, nombre: 'Lic. Nancy Galicia', email: 'admin@jfequipos.com', password: 'admin123', rol: 'Administrador', activo: true },
    { id: 2, nombre: 'Carlos Operador', email: 'operador@jfequipos.com', password: 'op123', rol: 'Operador / Ventas', activo: true }
  ]);

  const [rolesSistema, setRolesSistema] = useState<RolPermisos[]>([
    { nombreRol: 'Administrador', modulosPermitidos: ['inicio', 'productos', 'inventario', 'clientes', 'proveedores', 'cxc', 'cxp', 'gastos', 'auditoria', 'cotizaciones', 'ventas', 'reportes', 'historial', 'usuarios'] },
    { nombreRol: 'Operador / Ventas', modulosPermitidos: ['inicio', 'productos', 'clientes', 'cotizaciones', 'ventas', 'historial'] }
  ]);

  const [rolEditandoPermisos, setRolEditandoPermisos] = useState<RolPermisos | null>(null);

  const [moduloActivo, setModuloActivo] = useState<string>('inicio');
  
  // ESTADOS LIMPIOS EN BLANCO PARA ENTREGA AL CLIENTE
  const [catalogoProductos, setCatalogoProductos] = useState<ProductoCatalogo[]>([]);
  const [inventarioSucursales, setInventarioSucursales] = useState<StockSucursal[]>([]);
  const [kardexMovimientos, setKardexMovimientos] = useState<MovimientoKardex[]>([]);
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

  const [modalPermisosAbierto, setModalPermisosAbierto] = useState<boolean>(false);
  const [textoPromesaInput, setTextoPromesaInput] = useState<string>('');

  const [modalAutorizacionAbierto, setModalAutorizacionAbierto] = useState<boolean>(false);
  const [clienteParaAutorizar, setClienteParaAutorizar] = useState<Cliente | null>(null);

  const [modalReciboAbierto, setModalReciboAbierto] = useState<boolean>(false);
  const [reciboUltimoGenerado, setReciboUltimoGenerado] = useState<any>(null);

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [modalProveedorAbierto, setModalProveedorAbierto] = useState(false);
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

  const [busquedaInventarioModal, setBusquedaInventarioModal] = useState<string>('');
  const [modalIngresoStockAbierto, setModalIngresoStockAbierto] = useState(false);
  const [productoIngreso, setProductoIngreso] = useState<ProductoCatalogo | null>(null);
  const [cantIngreso, setCantIngreso] = useState<string>('10');
  const [minIngreso, setMinIngreso] = useState<string>('3');
  const [maxIngreso, setMaxIngreso] = useState<string>('50');
  const [sucursalIngreso, setSucursalIngreso] = useState<string>('Matriz Principal');
  const [almacenIngreso, setAlmacenIngreso] = useState<string>('Almacén Principal');
  const [motivoIngreso, setMotivoIngreso] = useState<string>('Compra a proveedor / Surtido inicial');
  const [fechaIngresoManual, setFechaIngresoManual] = useState<string>(new Date().toISOString().split('T')[0]);

  const [modalModificarStockAbierto, setModalModificarStockAbierto] = useState<boolean>(false);
  const [stockItemSeleccionado, setStockItemSeleccionado] = useState<StockSucursal | null>(null);
  const [tipoMovimientoMod, setTipoMovimientoMod] = useState<MovimientoKardex['tipoMovimiento']>('Transferencia');
  const [cantidadMod, setCantidadMod] = useState<string>('1');
  const [motivoMod, setMotivoMod] = useState<string>('Traspaso a Sucursal Norte');

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

  const [gastos, setGastos] = useState<GastoOperativo[]>([]);
  const [modalGastoAbierto, setModalGastoAbierto] = useState(false);

  const [gCat, setGCat] = useState('Mantenimiento y Refacciones');
  const [gSuc, setGSuc] = useState('Matriz Principal');
  const [gResp, setGResp] = useState('Lic. Nancy Galicia');
  const [gProv, setGProv] = useState('Global Fitness');
  const [gFecha, setGFecha] = useState('2026-06-10');
  const [gFormaPago, setGFormaPago] = useState('Transferencia SPEI');
  const [gImporte, setGImporte] = useState('');
  const [gDoc, setGDoc] = useState('comprobante_gasto.pdf');
  const [gCentro, setGCentro] = useState('Operaciones');
  const [gAut, setGAut] = useState('Gerencia de Administración');
  const [gEstatus, setGEstatus] = useState<GastoOperativo['estatus']>('Autorizado');
  const [gObs, setGObs] = useState('Compra de suministros y limpieza.');

  const [cuentasPorPagar, setCuentasPorPagar] = useState<CuentaPorPagar[]>([]);
  const [modalCxPAbierto, setModalCxPAbierto] = useState(false);
  const [modalPagoAbierto, setModalPagoAbierto] = useState<boolean>(false);
  const [cuentaSeleccionadaPago, setCuentaSeleccionadaPago] = useState<CuentaPorPagar | null>(null);
  const [montoAbono, setMontoAbono] = useState<string>('');
  const [fechaAbonoInput, setFechaAbonoInput] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenciaAbonoInput, setReferenciaAbonoInput] = useState<string>('SPEI Banco');
  const [modalHistorialAbonosAbierto, setModalHistorialAbonosAbierto] = useState<boolean>(false);
  const [cuentaHistorialSeleccionada, setCuentaHistorialSeleccionada] = useState<CuentaPorPagar | null>(null);

  const [cxpFolio, setCxpFolio] = useState('');
  const [cxpProvId, setCxpProvId] = useState('1');
  const [cxpOC, setCxpOC] = useState('OC-1002');
  const [cxpGasto, setCxpGasto] = useState('Mantenimiento y Refacciones');
  const [cxpMonto, setCxpMonto] = useState('');
  const [cxpVencimiento, setCxpVencimiento] = useState('2026-07-15');

  const [auditorias, setAuditorias] = useState<AuditoriaInventario[]>([]);
  const [modalAuditoriaAbierto, setModalAuditoriaAbierto] = useState(false);
  const [auditoriaSeleccionadaDetalle, setAuditoriaSeleccionadaDetalle] = useState<AuditoriaInventario | null>(null);
  const [codigoEscaneoAuditoria, setCodigoEscaneoAuditoria] = useState<string>('');
  const [audTipo, setAudTipo] = useState<AuditoriaInventario['tipoAlcance']>('Sucursal');
  const [audValor, setAudValor] = useState('Matriz Principal');
  const [audResp, setAudResp] = useState('Lic. Nancy Galicia');
  const [audObs, setAudObs] = useState('');

  const [fechaInicioReporte, setFechaInicioReporte] = useState('2026-06-01');
  const [fechaFinReporte, setFechaFinReporte] = useState('2026-06-30');
  const [sucursalReporte, setSucursalReporte] = useState('Todas');
  const [categoriaReporte, setCategoriaReporte] = useState('Todas');

  const [sucursalActivaPOS, setSucursalActivaPOS] = useState<string>('Matriz Principal');
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
  const [fSubcat, setFSubcat] = useState('Profesional');
  const [fMarca, setFMarca] = useState('ProFit');
  const [fModelo, setFModelo] = useState('2026');
  const [fManejaSerie, setFManejaSerie] = useState(true);
  const [fSerie, setFSerie] = useState('');
  const [fPais, setFPais] = useState('México');
  const [fProv, setFProv] = useState('Proveedor Global');
  const [fPCompra, setFPCompra] = useState('');
  const [fFactura, setFFactura] = useState('');
  const [fPedimento, setFPedimento] = useState('');
  const [fPVenta, setFPVenta] = useState('');
  const [fPMayoreo, setFPMayoreo] = useState('');
  const [fPEspecial, setFPEspecial] = useState('');
  const [fManejaGarantia, setFManejaGarantia] = useState(true);
  const [fGarantia, setFGarantia] = useState('1 Año');
  const [fUnidad, setFUnidad] = useState('Pieza');
  const [fColor, setFColor] = useState('Negro');
  const [fCapacidad, setFCapacidad] = useState('Estándar');
  const [fEsRegalo, setFEsRegalo] = useState(false);
  const [fEsPaquete, setFEsPaquete] = useState(false);

  const [nuevoNombreUsr, setNuevoNombreUsr] = useState('');
  const [nuevoEmailUsr, setNuevoEmailUsr] = useState('');
  const [nuevoPassUsr, setNuevoPassUsr] = useState('');
  const [nuevoRolUsr, setNuevoRolUsr] = useState('Operador / Ventas');
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);

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
      usuario: usuarioLogueado ? usuarioLogueado.nombre : 'Lic. Nancy Galicia',
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
    const itemsAuditoria: AuditoriaItem[] = catalogoProductos.map(prod => {
      const stockRef = obtenerStockSucursal(prod.id, audValor);
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
      tipoAlcance: audTipo,
      valorAlcance: audValor,
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

  const registrarProductoCatalogo = (e: React.FormEvent) => {
  e.preventDefault();
  if (!fCodigo || !fNombre || !fPVenta) return;

  // 1. VALIDACIÓN PARA EVITAR DUPLICADOS POR CÓDIGO (SKU)
  const codigoDuplicado = catalogoProductos.some(
    (p) => p.codigo.toLowerCase() === fCodigo.trim().toLowerCase()
  );
  if (codigoDuplicado) {
    alert("Error: Ya existe un producto registrado con este mismo Código / SKU.");
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
      numeroSerie: fManejaSerie ? (fSerie.trim() || `SN-${Math.floor(100000 + Math.random() * 900000)}`) : 'N/A',
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

    setCatalogoProductos((prev: ProductoCatalogo[]) =>
      prev.map((p: ProductoCatalogo) => (p.id === productoSeleccionadoEdicion.id ? productoSeleccionadoEdicion : p))
    );
    setProductoSeleccionadoEdicion(null);
    setMensajeNotif('¡Ficha técnica actualizada con éxito!');
    setModalNotifAbierto(true);
  };

  const handleEscaneoDirecto = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = catalogoProductos.find(
      (p: ProductoCatalogo) => p.codigo.toLowerCase() === busquedaTexto.trim().toLowerCase()
    );
    if (prod) {
      const stockDisp = obtenerStockSucursal(prod.id, sucursalActivaPOS);
      if (stockDisp <= 0 && !prod.esRegalo) {
        setMensajeSinStock(`El producto "${prod.nombre}" no cuenta con stock disponible en la sucursal ${sucursalActivaPOS}.`);
        setModalSinStockAbierto(true);
        setBusquedaTexto('');
        return;
      }

      if (prod.manejaSerie) {
        setProductoPendienteSerie(prod);
        setEsRegaloPendiente(false);
        setStockPendienteSerie(stockDisp);
        setInputNumeroSerieFisico(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
        setModalSerieAbierto(true);
      } else if (prod.esPaqueteDefinido && prod.componentesPaquete) {
        agregarPaqueteAlCarrito(prod, stockDisp);
      } else {
        agregarAlCarrito(prod, prod.esRegalo || false, stockDisp, 'N/A');
      }
      setBusquedaTexto('');
    }
  };

  const confirmarNumeroSerieModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoPendienteSerie) return;

    if (productoPendienteSerie.esPaqueteDefinido && productoPendienteSerie.componentesPaquete) {
      agregarPaqueteAlCarrito(productoPendienteSerie, stockPendienteSerie);
    } else {
      agregarAlCarrito(productoPendienteSerie, esRegaloPendiente, stockPendienteSerie, inputNumeroSerieFisico || 'SN-PENDIENTE');
    }

    setModalSerieAbierto(false);
    setProductoPendienteSerie(null);
  };

  const agregarAlCarrito = (producto: ProductoCatalogo, esRegalo: boolean = false, stockDisp: number, serieFisica: string) => {
    setVentaExitosa(false);
    setCarrito((prev: ItemVenta[]) => {
      const existe = prev.find((item: ItemVenta) => item.id === producto.id && !item.esPaqueteComponente && item.esRegalo === esRegalo && item.sucursal === sucursalActivaPOS);
      if (existe) {
        if (!esRegalo && existe.cantidadVendida >= stockDisp) return prev;
        return prev.map((item: ItemVenta) =>
          item.id === producto.id && !item.esPaqueteComponente && item.esRegalo === esRegalo && item.sucursal === sucursalActivaPOS
            ? { ...item, cantidadVendida: item.cantidadVendida + 1 }
            : item
        );
      }

      const fechaHoy = new Date();
      const anioVencimiento = fechaHoy.getFullYear() + 1;
      const fechaGarantiaStr = `${anioVencimiento}-${String(fechaHoy.getMonth() + 1).padStart(2, '0')}-${String(fechaHoy.getDate()).padStart(2, '0')}`;

      const nuevoItem: ItemVenta = {
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        precio: esRegalo ? 0.00 : (producto.precio || 0),
        costo: producto.costoPromedio || producto.precioCompra || 0,
        stock: stockDisp,
        sucursal: sucursalActivaPOS,
        numeroSerie: serieFisica,
        cantidadVendida: 1,
        esRegalo: Boolean(esRegalo),
        esPaqueteComponente: false,
        descuentoMontoFijo: 0.00,
        fechaGarantia: producto.manejaGarantia ? fechaGarantiaStr : 'Sin garantía'
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
    
    const sumaLista = paquete.componentesPaquete.reduce((acc, c) => acc + (c.precioLista || 0), 0);
    const factorProporcional = sumaLista > 0 ? (paquete.precio || 0) / sumaLista : 1;

    const fechaHoy = new Date();
    const anioVencimiento = fechaHoy.getFullYear() + 1;
    const fechaGarantiaStr = `${anioVencimiento}-${String(fechaHoy.getMonth() + 1).padStart(2, '0')}-${String(fechaHoy.getDate()).padStart(2, '0')}`;

    setCarrito((prev: ItemVenta[]) => {
      let nuevoCarrito = [...prev];
      paquete.componentesPaquete!.forEach((comp) => {
        const precioProporcional = (comp.precioLista || 0) * factorProporcional;
        let serieComp = `SN-COMP-${Math.floor(1000 + Math.random() * 9000)}`;
        
        nuevoCarrito.push({
          id: paquete.id * 100 + comp.productoId,
          codigo: `${paquete.codigo}-${comp.productoId}`,
          nombre: comp.nombre,
          categoria: 'Paquetes / Combos',
          precio: precioProporcional,
          costo: precioProporcional * 0.6,
          stock: 10,
          sucursal: 'Matriz Principal',
          numeroSerie: serieComp,
          cantidadVendida: 1,
          esRegalo: false,
          esPaqueteComponente: true,
          nombrePaqueteOrigen: paquete.nombre,
          precioListaOriginal: comp.precioLista,
          descuentoMontoFijo: 0.00,
          fechaGarantia: fechaGarantiaStr
        });
      });
      return nuevoCarrito;
    });
  };

  const cambiarCantidad = (id: number, sucursalItem: string, esPaqueteComponente: boolean, esRegalo: boolean, delta: number) => {
    setCarrito((prev: ItemVenta[]) =>
      prev
        .map((item: ItemVenta) => {
          if (item.id === id && item.sucursal === sucursalItem && item.esPaqueteComponente === esPaqueteComponente && item.esRegalo === esRegalo) {
            const nueva = item.cantidadVendida + delta;
            return nueva > 0 ? { ...item, cantidadVendida: nueva } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemVenta[]
    );
  };

  const cambiarDescuentoMonto = (id: number, sucursalItem: string, esPaqueteComponente: boolean, esRegalo: boolean, valorTexto: string) => {
    const monto = valorTexto === '' ? 0.00 : Number(valorTexto);
    setCarrito((prev: ItemVenta[]) =>
      prev.map((item: ItemVenta) =>
        item.id === id && item.sucursal === sucursalItem && item.esPaqueteComponente === esPaqueteComponente && item.esRegalo === esRegalo
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
    const subNeto = calcularSubtotalNeto();
    const iva = subNeto * 0.16;
    return {
      subtotalBruto: calcularSubtotalSinDescuento(),
      descuentoTotal: calcularTotalDescuentos(),
      subtotalNeto: subNeto,
      iva,
      total: subNeto + iva
    };
  };

  const generarCotizacion = () => {
    if (carrito.length === 0) return;
    const { total } = calcularTotal();

    const ahora = new Date();
    const fechaCreacionStr = ahora.toLocaleString();
    const expiracionDate = new Date(ahora.getTime() + 48 * 60 * 60 * 1000);

    setInventarioSucursales((prevInv: StockSucursal[]) =>
      prevInv.map((inv: StockSucursal) => {
        const itemCot = carrito.find(it => it.id === inv.productoId && inv.sucursal === sucursalActivaPOS && !it.esPaqueteComponente);
        if (itemCot) {
          return { ...inv, stockActual: Math.max(0, inv.stockActual - itemCot.cantidadVendida) };
        }
        return inv;
      })
    );

    const nuevaCotizacion: Cotizacion = {
      folio: `COT-${Math.floor(100000 + Math.random() * 900000)}`,
      fechaCreacion: fechaCreacionStr,
      fechaExpiracion: expiracionDate.toLocaleString(),
      cliente: clienteSeleccionadoPOS,
      sucursal: sucursalActivaPOS,
      items: [...carrito],
      total,
      estatus: 'Pendiente'
    };

    setCotizaciones(prev => [nuevaCotizacion, ...prev]);
    setCarrito([]);
    setMensajeNotif(`¡Cotización ${nuevaCotizacion.folio} generada con éxito! El inventario ha sido reservado por 48 horas.`);
    setModalNotifAbierto(true);
  };

  const autorizarCotizacion = (cot: Cotizacion) => {
    if (cot.estatus !== 'Pendiente') return;

    const ticketInfo: TicketGuardado = {
      folio: `TICK-${cot.folio.replace('COT-', '')}`,
      fecha: new Date().toLocaleString(),
      cliente: cot.cliente,
      metodoPago: 'Efectivo (Cotización Autorizada)',
      items: cot.items,
      subtotalBruto: cot.total / 1.16,
      descuentoTotal: 0,
      subtotalNeto: cot.total / 1.16,
      iva: cot.total - (cot.total / 1.16),
      total: cot.total
    };

    setTicketGenerado(ticketInfo);
    setHistorialTickets((prev: TicketGuardado[]) => [ticketInfo, ...prev]);
    setVentaExitosa(true);

    setCotizaciones(prev => prev.map(c => c.folio === cot.folio ? { ...c, estatus: 'Autorizada' } : c));
    setModuloActivo('ventas');
    setMensajeNotif(`¡Cotización ${cot.folio} autorizada y pasada a ventas con éxito!`);
    setModalNotifAbierto(true);
  };

  const expirarCotizacion = (cot: Cotizacion) => {
    if (cot.estatus !== 'Pendiente') return;

    setInventarioSucursales((prevInv: StockSucursal[]) =>
      prevInv.map((inv: StockSucursal) => {
        const itemCot = cot.items.find(it => it.id === inv.productoId && inv.sucursal === cot.sucursal && !it.esPaqueteComponente);
        if (itemCot) {
          return { ...inv, stockActual: inv.stockActual + itemCot.cantidadVendida };
        }
        return inv;
      })
    );

    setCotizaciones(prev => prev.map(c => c.folio === cot.folio ? { ...c, estatus: 'Expirada' } : c));
    setMensajeNotif(`La cotización ${cot.folio} ha expirado y el stock ha sido regresado al inventario.`);
    setModalNotifAbierto(true);
  };

  const procesarVenta = () => {
    if (carrito.length === 0) return;
    const { subtotalBruto, descuentoTotal, subtotalNeto, iva, total } = calcularTotal();
    
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

    setInventarioSucursales((prevInv: StockSucursal[]) =>
      prevInv.map((inv: StockSucursal) => {
        const vendido = carrito.find((it: ItemVenta) => it.id === inv.productoId && inv.sucursal === sucursalActivaPOS && !it.esPaqueteComponente);
        if (vendido) {
          const existAnt = inv.stockActual;
          const existPost = Math.max(0, existAnt - vendido.cantidadVendida);
          const prodObj = catalogoProductos.find(p => p.id === inv.productoId);
          registrarMovimientoKardex(
            prodObj ? prodObj.nombre : 'Producto',
            inv.sucursal,
            inv.almacen,
            vendido.cantidadVendida,
            'Venta',
            existAnt,
            existPost,
            prodObj ? prodObj.costoPromedio : 0,
            `Venta POS Folio Ticket`,
            `Cliente: ${clienteSeleccionadoPOS}`
          );
          return { ...inv, stockActual: existPost };
        }
        return inv;
      })
    );

    if (metodoPagoSeleccionado === 'Crédito' && clienteObj) {
      const fechaHoyStr = new Date().toISOString().split('T')[0];
      const diasCred = clienteObj.diasCredito || 30;
      const vencDate = new Date();
      vencDate.setDate(vencDate.getDate() + diasCred);
      const vencStr = vencDate.toISOString().split('T')[0];

      const nuevaCxC: CuentaPorCobrar = {
        id: Date.now(),
        folioVenta: `TICK-${Math.floor(100000 + Math.random() * 900000)}`,
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
      folio: `TICK-${Math.floor(100000 + Math.random() * 900000)}`,
      fecha: new Date().toLocaleString(),
      cliente: clienteSeleccionadoPOS,
      metodoPago: metodoPagoSeleccionado,
      items: [...carrito],
      subtotalBruto,
      descuentoTotal,
      subtotalNeto,
      iva,
      total
    };

    setTicketGenerado(ticketInfo);
    setHistorialTickets((prev: TicketGuardado[]) => [ticketInfo, ...prev]);
    setVentaExitosa(true);
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
        ${it.numeroSerie !== 'N/A' ? `<div>📌 N/S: ${it.numeroSerie}</div>` : ''}
        ${it.fechaGarantia !== 'Sin garantía' ? `<div>🛡️ Garantía: ${it.fechaGarantia}</div>` : ''}
        <br>
      `;
    });

    htmlContenido += `
          <div class="linea"></div>
          <div class="flex"><span>Subtotal Bruto:</span><span>${formatearMoneda(ticket.subtotalBruto)}</span></div>
          <div class="flex"><span>Descuentos:</span><span>-${formatearMoneda(ticket.descuentoTotal)}</span></div>
          <div class="flex"><span>IVA (16%):</span><span>${formatearMoneda(ticket.iva)}</span></div>
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

  const exportarExcelReporte = () => {
    const contenidoCSV = `Reporte Financiero (Del ${fechaInicioReporte} al ${fechaFinReporte})\nSucursal,Ventas Periodo,Gastos Op.,Efectivo Caja,Bancos,Utilidad Neta\n${sucursalReporte}, $0.00, $0.00, $0.00, $0.00, $0.00`;
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

  const verificarPermisoModulo = (modulo: string) => {
    if (!usuarioLogueado) return false;
    if (usuarioLogueado.rol === 'Administrador') return true;
    const rolRef = rolesSistema.find(r => r.nombreRol === usuarioLogueado.rol);
    return rolRef ? rolRef.modulosPermitidos.includes(modulo) : false;
  };

  const { subtotalBruto, descuentoTotal, subtotalNeto, iva, total } = calcularTotal();

  if (!usuarioLogueado) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-black text-blue-400 tracking-wider">JF EQUIPOS ERP</h1>
            <p className="text-xs text-slate-500 mt-1">Control Administrativo y Operativo</p>
          </div>

          {!vistaRecuperacion ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const usr = usuariosSistema.find(u => u.email.toLowerCase() === emailLogin.toLowerCase() && u.password === passwordLogin);
              if (usr) {
                if (!usr.activo) {
                  alert('Este usuario se encuentra inactivo.');
                  return;
                }
                setUsuarioLogueado(usr);
                setModuloActivo(verificarPermisoModulo('inicio') ? 'inicio' : 'ventas');
              } else {
                alert('Credenciales incorrectas. Verifique su correo y contraseña.');
              }
            }} className="space-y-4 text-xs">
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
            <form onSubmit={(e) => {
              e.preventDefault();
              const usr = usuariosSistema.find(u => u.email.toLowerCase() === emailRecuperacion.toLowerCase());
              if (usr) {
                alert(`📧 Se ha enviado un enlace de recuperación a "${usr.email}". Su contraseña actual es: ${usr.password}`);
                setVistaRecuperacion(false);
              } else {
                alert('El correo ingresado no está registrado en el sistema.');
              }
            }} className="space-y-4 text-xs">
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
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-black text-blue-400 tracking-wider">JF EQUIPOS</h1>
              <p className="text-xs text-slate-500 mt-1">Rol: <span className="text-amber-400 font-bold">{usuarioLogueado.rol}</span></p>
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
          <button type="button" onClick={() => setUsuarioLogueado(null)} className="w-full bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold py-2 rounded-xl text-xs cursor-pointer">
            Cerrar Sesión ({usuarioLogueado.nombre})
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white capitalize">
            Módulo: {moduloActivo === 'inicio' ? 'Panel General' : moduloActivo === 'cxc' ? 'Cuentas por Cobrar (CxC)' : moduloActivo === 'cxp' ? 'Cuentas por Pagar' : moduloActivo === 'gastos' ? 'Gastos Operativos' : moduloActivo === 'reportes' ? 'Reportes Financieros' : moduloActivo === 'auditoria' ? 'Auditoría de Inventarios' : moduloActivo === 'inventario' ? 'Inventario y Kardex' : moduloActivo === 'usuarios' ? 'Gestión de Usuarios y Roles' : moduloActivo}
          </h2>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-medium">Pesos Mexicanos (MXN) (.00)</span>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
          {moduloActivo === 'inicio' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Ventas del Día</p>
                  <h3 className="text-2xl font-black text-emerald-400 mt-2">{formatearMoneda(0)}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Ventas del Mes</p>
                  <h3 className="text-2xl font-black text-blue-400 mt-2">{formatearMoneda(0)}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Cuentas por Pagar</p>
                  <h3 className="text-2xl font-black text-amber-400 mt-2">{formatearMoneda(0)}</h3>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase">Vencimientos Próximos</p>
                  <h3 className="text-2xl font-black text-red-400 mt-2">0 Facturas</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">🔥 Los 5 Productos Más Vendidos</h4>
                  <div className="p-8 text-center text-slate-500 text-xs">Sin registros de ventas todavía.</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">⭐ Los 5 Mejores Clientes</h4>
                  <div className="p-8 text-center text-slate-500 text-xs">Sin transacciones registradas todavía.</div>
                </div>
              </div>
            </div>
          )}

          {moduloActivo === 'usuarios' && usuarioLogueado.rol === 'Administrador' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white">Módulo de Gestión de Usuarios y Permisos por Roles</h3>
                  <p className="text-slate-400 text-sm mt-1">Cree usuarios, asigne roles y edite dinámicamente qué módulos puede ver cada rol en el sistema.</p>
                </div>
                <button type="button" onClick={() => setModalUsuarioAbierto(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">
                  + Registrar Nuevo Usuario
                </button>
              </div>

              {modalUsuarioAbierto && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-emerald-500 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-emerald-400">👤 Registrar Nuevo Usuario</h3>
                      <button type="button" onClick={() => setModalUsuarioAbierto(false)} className="text-red-400 text-xs font-bold cursor-pointer">✕ Cerrar</button>
                    </div>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (!nuevoNombreUsr || !nuevoEmailUsr || !nuevoPassUsr) return;
                      const nuevo: UsuarioSistema = {
                        id: Date.now(),
                        nombre: nuevoNombreUsr,
                        email: nuevoEmailUsr,
                        password: nuevoPassUsr,
                        rol: nuevoRolUsr,
                        activo: true
                      };
                      setUsuariosSistema([...usuariosSistema, nuevo]);
                      setModalUsuarioAbierto(false);
                      setNuevoNombreUsr('');
                      setNuevoEmailUsr('');
                      setNuevoPassUsr('');
                      setMensajeNotif('¡Usuario registrado con éxito!');
                      setModalNotifAbierto(true);
                    }} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-400 mb-1">Nombre Completo *</label>
                        <input type="text" value={nuevoNombreUsr} onChange={(e) => setNuevoNombreUsr(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Correo Electrónico *</label>
                        <input type="email" value={nuevoEmailUsr} onChange={(e) => setNuevoEmailUsr(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Contraseña Provisional *</label>
                        <input type="text" value={nuevoPassUsr} onChange={(e) => setNuevoPassUsr(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Rol Asignado *</label>
                        <select value={nuevoRolUsr} onChange={(e) => setNuevoRolUsr(e.target.value)} className="...">
                          {rolesSistema.map((r, i) => <option key={i} value={r.nombreRol}>{r.nombreRol}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setModalUsuarioAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar Usuario</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {modalPermisosAbierto && rolEditandoPermisos && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">🛡️ Editar Permisos para el Rol: {rolEditandoPermisos.nombreRol}</h3>
                      <button type="button" onClick={() => setModalPermisosAbierto(false)} className="text-red-400 text-xs font-bold cursor-pointer">✕ Cerrar</button>
                    </div>
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
                                let nuevosPermisos = e.target.checked ? [...permitidosActuales, mod.id] : permitidosActuales.filter(m => m !== mod.id);
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
                      <button type="button" onClick={() => {
                        setRolesSistema(rolesSistema.map(r => r.nombreRol === rolEditandoPermisos.nombreRol ? rolEditandoPermisos : r));
                        setModalPermisosAbierto(false);
                        setMensajeNotif(`¡Permisos actualizados con éxito para el rol ${rolEditandoPermisos.nombreRol}!`);
                        setModalNotifAbierto(true);
                      }} className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">Guardar Permisos</button>
                    </div>
                  </div>
                </div>
              )}

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
                          <th className="p-3 text-center">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {usuariosSistema.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-800/40">
                            <td className="p-3 font-bold text-white">{u.nombre}</td>
                            <td className="p-3 font-mono text-slate-300">{u.email}</td>
                            <td className="p-3 text-amber-400 font-bold">{u.rol}</td>
                            <td className="p-3 text-center">
                              <button type="button" onClick={() => {
                                setUsuariosSistema(usuariosSistema.map(usr => usr.id === u.id ? { ...usr, activo: !usr.activo } : usr));
                              }} className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer ${u.activo ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                                {u.activo ? 'Activo' : 'Inactivo'}
                              </button>
                            </td>
                          </tr>
                        ))}
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

        {moduloActivo === 'productos' && verificarPermisoModulo('productos') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Catálogo de Productos</h3>
              <button type="button" onClick={() => setModalAltaAbierto(true)} className="bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer">+ Nuevo Producto</button>
            </div>
            {catalogoProductos.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay productos registrados en el sistema. Comience dando de alta su primer producto.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {catalogoProductos.map(prod => (
                  <div key={prod.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">{prod.nombre}</h4>
                    <p className="text-xs text-slate-400">Código: <span className="font-mono text-blue-400">{prod.codigo}</span></p>
                    <p className="text-xs text-emerald-400 font-bold">Precio: {formatearMoneda(prod.precio)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'inventario' && verificarPermisoModulo('inventario') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Inventario y Kardex</h3>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setModalIngresoStockAbierto(true)} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  + Ingreso de Stock
                </button>
              </div>
            </div>

            {inventarioSucursales.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                Sin movimientos ni existencias de inventario registradas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {inventarioSucursales.map((inv, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">Sucursal: {inv.sucursal}</h4>
                    <p className="text-xs text-slate-400">Almacén: {inv.almacen}</p>
                    <p className="text-xs text-blue-400 font-bold">Stock Actual: {inv.stockActual} unidades</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'clientes' && verificarPermisoModulo('clientes') && (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-bold text-white">Módulo de Clientes</h3>
      <button 
        type="button" 
        onClick={() => setModalClienteAbierto(true)} 
        className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
      >
        + Registrar Cliente
      </button>
    </div>
    {/* ... listado de clientes ... */}
  </div>
)}

        {moduloActivo === 'proveedores' && verificarPermisoModulo('proveedores') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Módulo de Proveedores</h3>
              <button 
                type="button" 
                onClick={() => setModalProveedorAbierto(true)} 
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                + Registrar Proveedor
              </button>
            </div>

            {proveedores.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay proveedores registrados.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proveedores.map(prov => (
                  <div key={prov.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">{prov.nombreComercial}</h4>
                    <p className="text-xs text-slate-400">RFC: <span className="font-mono text-blue-400">{prov.rfc}</span></p>
                    <p className="text-xs text-slate-400">Contacto: {prov.contactos}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'cxc' && verificarPermisoModulo('cxc') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Cuentas por Cobrar (CxC)</h3>
            </div>

            {cuentasPorCobrar.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay cuentas por cobrar ni ventas a crédito pendientes.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cuentasPorCobrar.map(cuenta => (
                  <div key={cuenta.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">{cuenta.clienteNombre}</h4>
                    <p className="text-xs text-slate-400">Folio: <span className="font-mono text-blue-400">{cuenta.folioVenta}</span></p>
                    <p className="text-xs text-amber-400 font-bold">Saldo Pendiente: ${cuenta.saldoPendiente.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'cxp' && verificarPermisoModulo('cxp') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Cuentas por Pagar (CxP)</h3>
              <button 
                type="button" 
                onClick={() => setModalCxPAbierto(true)} 
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                + Registrar Factura / CxP
              </button>
            </div>

            {cuentasPorPagar.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay facturas ni cuentas por pagar registradas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cuentasPorPagar.map(cuenta => (
                  <div key={cuenta.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">{cuenta.proveedorNombre}</h4>
                    <p className="text-xs text-slate-400">Factura: <span className="font-mono text-blue-400">{cuenta.folioFactura}</span></p>
                    <p className="text-xs text-amber-400 font-bold">Saldo: ${cuenta.saldoPendiente.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'gastos' && verificarPermisoModulo('gastos') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Gastos Operativos</h3>
              <button 
                type="button" 
                onClick={() => setModalGastoAbierto(true)} 
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                + Registrar Gasto
              </button>
            </div>

            {gastos.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay gastos operativos registrados en este período.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gastos.map(gasto => (
                  <div key={gasto.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">{gasto.categoria}</h4>
                    <p className="text-xs text-slate-400">Folio: <span className="font-mono text-blue-400">{gasto.folio}</span></p>
                    <p className="text-xs text-emerald-400 font-bold">Total: ${gasto.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'auditoria' && verificarPermisoModulo('auditoria') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Auditoría de Inventarios</h3>
              <button 
                type="button" 
                onClick={() => setModalAuditoriaAbierto(true)} 
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                + Programar Auditoría
              </button>
            </div>

            {auditorias.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay auditorías activas o programadas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {auditorias.map(aud => (
                  <div key={aud.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">Folio: {aud.folio}</h4>
                    <p className="text-xs text-slate-400">Alcance: {aud.tipoAlcance} ({aud.valorAlcance})</p>
                    <p className="text-xs text-amber-400 font-bold">Estatus: {aud.estatus}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'cotizaciones' && verificarPermisoModulo('cotizaciones') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Cotizaciones (Vigencia 48h)</h3>
            </div>

            {cotizaciones.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay cotizaciones activas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cotizaciones.map(cot => (
                  <div key={cot.folio} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">Folio: {cot.folio}</h4>
                    <p className="text-xs text-slate-400">Cliente: {cot.cliente || 'P público general'}</p>
                    <p className="text-xs text-emerald-400 font-bold">Total: ${cot.total.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'ventas' && verificarPermisoModulo('ventas') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Punto de Venta Profesional (POS)</h3>
              <div className="text-xs bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">
                Sucursal Activa: <strong className="text-blue-400">{sucursalActivaPOS}</strong>
              </div>
            </div>

            {carrito.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs space-y-3">
                <p>El carrito de ventas está vacío. Escanee o seleccione productos del catálogo para iniciar una venta.</p>
                <button 
                  type="button" 
                  onClick={() => setModuloActivo('productos')} 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer inline-block"
                >
                  Ir al Catálogo de Productos
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <h4 className="font-bold text-white text-sm">Artículos en el Carrito ({carrito.length})</h4>
                <div className="divide-y divide-slate-800">
                  {carrito.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-white font-bold">{item.cantidadVendida}x {item.nombre}</span>
                        <p className="text-[10px] text-slate-400">Código: {item.codigo}</p>
                      </div>
                      <span className="text-emerald-400 font-bold">${(item.precio * item.cantidadVendida).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-slate-800 flex justify-between items-center font-bold text-sm">
                  <span>Total a Pagar:</span>
                  <span className="text-emerald-400 text-base">${total.toFixed(2)}</span>
                </div>
                <button 
                  type="button" 
                  onClick={procesarVenta} 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-xs cursor-pointer shadow-lg"
                >
                  Cobrar y Generar Ticket
                </button>
              </div>
            )}
          </div>
        )}

        {moduloActivo === 'reportes' && verificarPermisoModulo('reportes') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Reportes Financieros</h3>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={exportarExcelReporte} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  📥 Exportar Excel (CSV)
                </button>
                <button 
                  type="button" 
                  onClick={exportarPDFReporte} 
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  🖨️ Imprimir / PDF
                </button>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-white text-sm">Filtros de Período</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Fecha de Inicio</label>
                  <input type="date" value={fechaInicioReporte} onChange={(e) => setFechaInicioReporte(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Fecha de Fin</label>
                  <input type="date" value={fechaFinReporte} onChange={(e) => setFechaFinReporte(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {moduloActivo === 'historial' && verificarPermisoModulo('historial') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Historial de Tickets y Reimpresión</h3>
            </div>

            {historialTickets.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No hay tickets de venta emitidos todavía.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {historialTickets.map(ticket => (
                  <div key={ticket.folio} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <h4 className="font-bold text-white text-sm">Folio: {ticket.folio}</h4>
                    <p className="text-xs text-slate-400">Cliente: {ticket.cliente || 'Público General'}</p>
                    <p className="text-xs text-emerald-400 font-bold">Total: ${ticket.total.toFixed(2)}</p>
                    <button 
                      type="button" 
                      onClick={() => ejecutarDescargaTicketPDF(ticket)} 
                      className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold py-1.5 rounded-lg text-xs cursor-pointer border border-slate-700"
                    >
                      🖨️ Reimprimir Ticket
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODAL DE ALTA DE PRODUCTOS */}
        {modalAltaAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Registrar Nuevo Producto</h3>
              <form onSubmit={registrarProductoCatalogo} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Código o SKU *</label>
                  <input type="text" value={fCodigo} onChange={(e) => setFCodigo(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. PROD-001" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nombre del Producto *</label>
                  <input type="text" value={fNombre} onChange={(e) => setFNombre(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. Caminadora Profesional" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Precio de Venta ($ MXN) *</label>
                  <input type="number" value={fPVenta} onChange={(e) => setFPVenta(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="0.00" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setModalAltaAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar Producto</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CLIENTES */}
        {modalClienteAbierto && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
      <h3 className="text-lg font-bold text-white">Registrar Nuevo Cliente</h3>
      <form onSubmit={guardarCliente} className="space-y-3 text-xs">
        <div>
          <label className="block text-slate-400 mb-1">Nombre Comercial *</label>
          <input type="text" value={cNombreComercial} onChange={(e) => setCNombreComercial(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. Gimnasio Iron Fitness" />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Responsable / Contacto *</label>
          <input type="text" value={cResponsable} onChange={(e) => setCResponsable(e.target.value)} required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. Lic. Roberto Gómez" />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Teléfono</label>
          <input type="text" value={cTelefono} onChange={(e) => setCTelefono(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="55 0000 0000" />
        </div>
        <div className="flex justify-end gap-2 pt-3">
          <button type="button" onClick={() => setModalClienteAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar Cliente</button>
        </div>
      </form>
    </div>
  </div>
)}

        {modalSinStockAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-red-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <h3 className="text-lg font-bold text-red-400">⚠️ No hay stock</h3>
              <p className="text-xs text-slate-300">{mensajeSinStock}</p>
              <button type="button" onClick={() => setModalSinStockAbierto(false)} className="bg-red-600 text-white font-bold px-6 py-2 rounded-xl text-xs w-full cursor-pointer">Aceptar</button>
            </div>
          </div>
        )}

        {modalNotifAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-emerald-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <h3 className="text-lg font-bold text-emerald-400">✅ Operación Exitosa</h3>
              <p className="text-xs text-slate-300">{mensajeNotif}</p>
              <button type="button" onClick={() => setModalNotifAbierto(false)} className="bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl text-xs w-full cursor-pointer">Aceptar</button>
            </div>
          </div>
          )}
      {/* MODAL DE PROVEEDORES */}
        {modalProveedorAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Registrar Proveedor</h3>
              <form onSubmit={(e) => { e.preventDefault(); setModalProveedorAbierto(false); }} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Nombre Comercial / Razón Social *</label>
                  <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. Proveedor S.A. de C.V." />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">RFC *</label>
                  <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase" placeholder="XAXX010101000" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setModalProveedorAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE CUENTAS POR PAGAR (CxP) */}
        {modalCxPAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Registrar Cuenta por Pagar</h3>
              <form onSubmit={(e) => { e.preventDefault(); setModalCxPAbierto(false); }} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Folio de Factura *</label>
                  <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. FAC-001" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Monto Total *</label>
                  <input type="number" step="0.01" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="0.00" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setModalCxPAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                  <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE GASTOS OPERATIVOS */}
        {modalGastoAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Registrar Gasto Operativo</h3>
              <form onSubmit={(e) => { e.preventDefault(); setModalGastoAbierto(false); }} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Categoría del Gasto *</label>
                  <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. Luz, Renta, Insumos" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Total *</label>
                  <input type="number" step="0.01" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="0.00" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setModalGastoAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                  <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Guardar Gasto</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE AUDITORÍA DE INVENTARIOS */}
        {modalAuditoriaAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Programar Auditoría</h3>
              <form onSubmit={(e) => { e.preventDefault(); setModalAuditoriaAbierto(false); }} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Alcance de la Auditoría *</label>
                  <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="Ej. Sucursal Completa" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setModalAuditoriaAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Programar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE INGRESO DE STOCK */}
        {modalIngresoStockAbierto && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Ingreso de Stock al Inventario</h3>
              <form onSubmit={(e) => { e.preventDefault(); setModalIngresoStockAbierto(false); }} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Cantidad de Unidades *</label>
                  <input type="number" required className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white" placeholder="0" />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={() => setModalIngresoStockAbierto(false)} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-xl cursor-pointer">Cancelar</button>
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl cursor-pointer">Registrar Ingreso</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  </div>
  );
}
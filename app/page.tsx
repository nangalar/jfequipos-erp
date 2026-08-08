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
  const [emailLogin, setEmailLogin] = useState<string>('');
  const [passwordLogin, setPasswordLogin] = useState<string>('');
  const [vistaRecuperacion, setVistaRecuperacion] = useState<boolean>(false);
  const [emailRecuperacion, setEmailRecuperacion] = useState<string>('');

  const [usuariosSistema, setUsuariosSistema] = useState<UsuarioSistema[]>([
    { id: 1, nombre: 'Administrador', email: 'admin@jfequipos.com', password: 'admin123', rol: 'Administrador', activo: true }
  ]);

  const [rolesSistema, setRolesSistema] = useState<RolPermisos[]>([
    { nombreRol: 'Administrador', modulosPermitidos: ['inicio', 'productos', 'inventario', 'clientes', 'proveedores', 'cxc', 'cxp', 'gastos', 'auditoria', 'cotizaciones', 'ventas', 'reportes', 'historial', 'usuarios'] },
    { nombreRol: 'Operador / Ventas', modulosPermitidos: ['inicio', 'productos', 'clientes', 'cotizaciones', 'ventas', 'historial'] }
  ]);

  const [rolEditandoPermisos, setRolEditandoPermisos] = useState<RolPermisos | null>(null);
  const [modalPermisosAbierto, setModalPermisosAbierto] = useState<boolean>(false);

  const [moduloActivo, setModuloActivo] = useState<string>('inicio');
  
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
  const [sucursalIngreso, setSucursalIngreso] = useState<string>('Matriz Principal');
  const [almacenIngreso, setAlmacenIngreso] = useState<string>('Almacén Principal');
  const [motivoIngreso, setMotivoIngreso] = useState<string>('Compra a proveedor / Surtido inicial');
  const [fechaIngresoManual, setFechaIngresoManual] = useState<string>(new Date().toISOString().split('T')[0]);

  const [modalModificarStockAbierto, setModalModificarStockAbierto] = useState<boolean>(false);
  const [stockItemSeleccionado, setStockItemSeleccionado] = useState<StockSucursal | null>(null);
  const [tipoMovimientoMod, setTipoMovimientoMod] = useState<MovimientoKardex['tipoMovimiento']>('Transferencia');
  const [cantidadMod, setCantidadMod] = useState<string>('1');
  const [motivoMod, setMotivoMod] = useState<string>('Traspaso a Sucursal Norte');

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

  const [gastos, setGastos] = useState<GastoOperativo[]>([]);
  const [modalGastoAbierto, setModalGastoAbierto] = useState<boolean>(false);

  const [gCat, setGCat] = useState('Mantenimiento y Refacciones');
  const [gSuc, setGSuc] = useState('Matriz Principal');
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
  const [audValor, setAudValor] = useState('Matriz Principal');
  const [audResp, setAudResp] = useState('');
  const [audObs, setAudObs] = useState('');

  // Reportes
  const [fechaInicioReporte, setFechaInicioReporte] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [fechaFinReporte, setFechaFinReporte] = useState(new Date().toISOString().split('T')[0]);
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

  const convertirFechaTicket = (fecha: string) => {
    const fechaConvertida = new Date(fecha);
    return Number.isNaN(fechaConvertida.getTime()) ? null : fechaConvertida;
  };

  const ahora = new Date();
  const ventasDelDia = historialTickets
    .filter((ticket: TicketGuardado) => {
      const fechaTicket = convertirFechaTicket(ticket.fecha);
      return fechaTicket &&
        fechaTicket.getFullYear() === ahora.getFullYear() &&
        fechaTicket.getMonth() === ahora.getMonth() &&
        fechaTicket.getDate() === ahora.getDate();
    })
    .reduce((acc: number, ticket: TicketGuardado) => acc + ticket.total, 0);

  const ventasDelMes = historialTickets
    .filter((ticket: TicketGuardado) => {
      const fechaTicket = convertirFechaTicket(ticket.fecha);
      return fechaTicket &&
        fechaTicket.getFullYear() === ahora.getFullYear() &&
        fechaTicket.getMonth() === ahora.getMonth();
    })
    .reduce((acc: number, ticket: TicketGuardado) => acc + ticket.total, 0);

  const mapaProductosVendidos = new Map<string, { nombre: string; cat: string; qty: number; total: number }>();
  historialTickets.forEach((ticket: TicketGuardado) => {
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
  historialTickets.forEach((ticket: TicketGuardado) => {
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

  const ticketsPeriodoReporte = historialTickets.filter((ticket: TicketGuardado) => {
    const fechaTicket = convertirFechaTicket(ticket.fecha);
    if (!fechaTicket) return false;
    if (inicioReporte && fechaTicket < inicioReporte) return false;
    if (finReporte && fechaTicket > finReporte) return false;
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
      return true;
    })
    .reduce((acc: number, gasto: GastoOperativo) => acc + gasto.total, 0);
  const utilidadNetaPeriodo = ventasPeriodoReporte - costoVentasPeriodo - gastosPeriodoReporte;

  const exportarExcelReporte = () => {
    const contenidoCSV = `Reporte Financiero (Del ${fechaInicioReporte} al ${fechaFinReporte})\nSucursal,Ventas Periodo,Gastos Op.,Efectivo Caja,Bancos,Utilidad Neta\n${sucursalReporte}, ${ventasPeriodoReporte.toFixed(2)}, ${gastosPeriodoReporte.toFixed(2)}, ${efectivoPeriodoReporte.toFixed(2)}, ${bancosPeriodoReporte.toFixed(2)}, ${utilidadNetaPeriodo.toFixed(2)}`;
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

  // Verificación de permisos por rol basado en el usuario logueado
  const verificarPermisoModulo = (modulo: string) => {
    if (!usuarioLogueado) return false;
    if (usuarioLogueado.rol === 'Administrador') return true;
    const rolRef = rolesSistema.find(r => r.nombreRol === usuarioLogueado.rol);
    return rolRef ? rolRef.modulosPermitidos.includes(modulo) : false;
  };

  const { subtotalBruto, descuentoTotal, subtotalNeto, iva, total } = calcularTotal();

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
      {/* Sidebar Corporativo Dinámico por Roles */}
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/50 border-b border-slate-800 px-8 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white capitalize">
            Módulo: {moduloActivo === 'inicio' ? 'Panel General' : moduloActivo === 'cxc' ? 'Cuentas por Cobrar (CxC)' : moduloActivo === 'cxp' ? 'Cuentas por Pagar' : moduloActivo === 'gastos' ? 'Gastos Operativos' : moduloActivo === 'reportes' ? 'Reportes Financieros' : moduloActivo === 'auditoria' ? 'Auditoría de Inventarios' : moduloActivo === 'inventario' ? 'Inventario y Kardex' : moduloActivo === 'usuarios' ? 'Gestión de Usuarios y Roles' : moduloActivo}
          </h2>
          <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full font-medium">Pesos Mexicanos (MXN) (.00)</span>
        </header>

        <div className="p-8 overflow-y-auto flex-1">
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

          {/* MÓDULO DE GESTIÓN DE USUARIOS Y ROLES CON EDICIÓN DE PERMISOS */}
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

              {/* MODAL NUEVO USUARIO */}
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
                        <select value={nuevoRolUsr} onChange={(e) => setNuevoRolUsr(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
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
                      <button type="button" onClick={() => {
                        setRolesSistema(rolesSistema.map(r => r.nombreRol === rolEditandoPermisos.nombreRol ? rolEditandoPermisos : r));
                        setModalPermisosAbierto(false);
                        setMensajeNotif(`¡Permisos actualizados con éxito para el rol ${rolEditandoPermisos.nombreRol}!`);
                        setModalNotifAbierto(true);
                      }} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">Guardar Permisos</button>
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
                        <div className="md:col-span-3">
                          <label className="block text-slate-400 mb-1">No. de serie inicial</label>
                          <input type="text" placeholder="SN-001" value={fSerie} onChange={(e) => setFSerie(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
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
                      <div>
                        <label className="block text-slate-400 mb-1">9. No. de Serie</label>
                        <input type="text" value={productoSeleccionadoEdicion.numeroSerie} onChange={(e) => setProductoSeleccionadoEdicion({...productoSeleccionadoEdicion, numeroSerie: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono" />
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
                  onClick={() => setModalIngresoStockAbierto(true)}
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
                          <select value={sucursalIngreso} onChange={(e) => setSucursalIngreso(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                            <option value="Matriz Principal">Matriz Principal</option>
                            <option value="Sucursal Norte">Sucursal Norte</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-slate-400 mb-1">Almacén / Ubicación:</label>
                          <select value={almacenIngreso} onChange={(e) => setAlmacenIngreso(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                            <option value="Almacén Principal">Almacén Principal</option>
                            <option value="Exhibición Tienda">Exhibición Tienda</option>
                            <option value="Almacén Norte">Almacén Norte</option>
                          </select>
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
                      {inventarioSucursales.map((inv: StockSucursal, idx: number) => {
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
                      {kardexMovimientos.map((k) => (
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

          {/* MÓDULO DE VENTAS (POS) CON OPCIÓN DE PAGO A CRÉDITO */}
          {moduloActivo === 'ventas' && verificarPermisoModulo('ventas') && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Punto de Venta Profesional (MXN)</h3>
                  <p className="text-slate-400 text-sm">Venta activa para la sucursal: <span className="text-amber-400 font-bold">{sucursalActivaPOS}</span></p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={sucursalActivaPOS} onChange={(e) => setSucursalActivaPOS(e.target.value)} className="bg-slate-900 border border-amber-600 text-white text-xs rounded-xl px-3 py-2 font-semibold">
                    <option value="Matriz Principal">Matriz Principal</option>
                    <option value="Sucursal Norte">Sucursal Norte</option>
                  </select>
                  <button type="button" onClick={() => setCamaraActiva(!camaraActiva)} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer">
                    📷 {camaraActiva ? 'Apagar Cámara' : 'Cámara Web'}
                  </button>
                </div>
              </div>

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

              {/* MODAL INTERNO PARA CAPTURAR NÚMERO DE SERIE FÍSICO */}
              {modalSerieAbierto && productoPendienteSerie && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                  <div className="bg-slate-900 border border-blue-500/60 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-blue-400">📌 Registrar Número de Serie Físico</h3>
                      <button type="button" onClick={() => setModalSerieAbierto(false)} className="text-red-400 font-bold text-xs bg-red-950/40 px-3 py-1 rounded-lg border border-red-800 cursor-pointer">✕ Cancelar</button>
                    </div>
                    <form onSubmit={confirmarNumeroSerieModal} className="space-y-3 text-xs">
                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Artículo a vender:</span>
                        <strong className="text-white text-sm">{productoPendienteSerie.nombre}</strong>
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Número de Serie Físico (Escaneado o Manual):</label>
                        <input
                          type="text"
                          value={inputNumeroSerieFisico}
                          onChange={(e) => setInputNumeroSerieFisico(e.target.value)}
                          required
                          className="w-full bg-slate-950 border border-blue-600 rounded-xl px-4 py-3 text-sm text-white font-mono"
                          autoFocus
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setModalSerieAbierto(false)} className="bg-slate-800 px-4 py-2 rounded-xl text-slate-300 cursor-pointer">Cancelar</button>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl shadow cursor-pointer">Confirmar y Agregar</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

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
                          <p className="text-blue-400 font-mono text-[11px]">📌 Serie Física: {it.numeroSerie}</p>
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
                                      if (prod.manejaSerie) {
                                        setProductoPendienteSerie(prod);
                                        setEsRegaloPendiente(false);
                                        setStockPendienteSerie(stockSuc);
                                        setInputNumeroSerieFisico(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
                                        setModalSerieAbierto(true);
                                      } else {
                                        agregarAlCarrito(prod, false, stockSuc, 'N/A');
                                      }
                                    }} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold cursor-pointer">+ Venta</button>
                                    <button type="button" onClick={() => {
                                      if (stockSuc <= 0) {
                                        setMensajeSinStock(`El producto "${prod.nombre}" no cuenta con stock disponible en ${sucursalActivaPOS}.`);
                                        setModalSinStockAbierto(true);
                                        return;
                                      }
                                      if (prod.manejaSerie) {
                                        setProductoPendienteSerie(prod);
                                        setEsRegaloPendiente(true);
                                        setStockPendienteSerie(stockSuc);
                                        setInputNumeroSerieFisico(`SN-${Math.floor(100000 + Math.random() * 900000)}`);
                                        setModalSerieAbierto(true);
                                      } else {
                                        agregarAlCarrito(prod, true, stockSuc, 'N/A');
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
                              <p className="text-blue-400 font-mono text-[10px]">📌 N/S: {item.numeroSerie}</p>
                              {!item.esRegalo && !item.esPaqueteComponente && (
                                <div className="flex items-center justify-between bg-slate-900 p-1 rounded border border-slate-800">
                                  <span className="text-[10px] text-slate-400">Descuento Fijo ($):</span>
                                  <input type="number" step="0.01" value={item.descuentoMontoFijo === 0 ? '' : item.descuentoMontoFijo} placeholder="0.00" onChange={(e) => cambiarDescuentoMonto(item.id, item.sucursal, item.esPaqueteComponente, item.esRegalo, e.target.value)} className="w-16 bg-slate-950 border border-slate-700 text-center rounded text-white text-xs" />
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-1 border-t border-slate-900">
                                <span className="text-[10px] text-blue-400">Suc: {item.sucursal}</span>
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => cambiarCantidad(item.id, item.sucursal, item.esPaqueteComponente, item.esRegalo, -1)} className="w-5 h-5 bg-slate-800 rounded text-white font-bold cursor-pointer">-</button>
                                  <span className="font-bold text-white w-4 text-center">{item.cantidadVendida}</span>
                                  <button type="button" onClick={() => cambiarCantidad(item.id, item.sucursal, item.esPaqueteComponente, item.esRegalo, 1)} className="w-5 h-5 bg-slate-800 rounded text-white font-bold cursor-pointer">+</button>
                                </div>
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
                  <select value={sucursalReporte} onChange={(e) => setSucursalReporte(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                    <option value="Todas">Todas</option>
                    <option value="Matriz Principal">Matriz Principal</option>
                    <option value="Sucursal Norte">Sucursal Norte</option>
                  </select>
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
                {historialTickets.length === 0 ? (
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
                        {historialTickets.map((t: TicketGuardado, i: number) => (
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
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const numero_a_letras_util_1 = require("../common/utils/numero-a-letras.util");
const sat_catalogs_util_1 = require("../common/utils/sat-catalogs.util");
const pdfkit_1 = __importDefault(require("pdfkit"));
const QRCode = __importStar(require("qrcode"));
const svg_to_pdfkit_1 = __importDefault(require("svg-to-pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let PdfService = PdfService_1 = class PdfService {
    logger = new common_1.Logger(PdfService_1.name);
    formatCurrency(val) {
        const num = Number(val || 0);
        return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    formatQuantity(val) {
        const num = Number(val || 0);
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    formatLetras(rawLetras) {
        let s = (rawLetras || '').trim();
        while (s.startsWith('(') && s.endsWith(')')) {
            s = s.substring(1, s.length - 1).trim();
        }
        return `(${s})`;
    }
    getLogoHeaderSvg() {
        const paths = [
            path.join(process.cwd(), 'assets', 'Logo_Peguu.svg'),
            path.join(process.cwd(), 'docs', 'Logo_Peguu.svg'),
            'C:/Datos/Proyectos Antigravity/Peguu/docs/Logo_Peguu.svg',
        ];
        for (const p of paths) {
            if (fs.existsSync(p)) {
                try {
                    return fs.readFileSync(p, 'utf8');
                }
                catch (e) { }
            }
        }
        return null;
    }
    getLogoFooterSvg() {
        const paths = [
            path.join(process.cwd(), 'assets', 'Logo_Peguu One.svg'),
            path.join(process.cwd(), 'docs', 'Logo_Peguu One.svg'),
            'C:/Datos/Proyectos Antigravity/Peguu/docs/Logo_Peguu One.svg',
        ];
        for (const p of paths) {
            if (fs.existsSync(p)) {
                try {
                    return fs.readFileSync(p, 'utf8');
                }
                catch (e) { }
            }
        }
        return null;
    }
    generatePaymentPdfHtml(data) {
        const uuid = data.uuid || '26c62ebf-5074-4a9c-a671-eff081faf1ae';
        const emisor = data.emisor || { rfc: 'IVD920810GU2', nombre: 'INNOVACION VALOR Y DESARROLLO SA', regimen: '601' };
        const receptor = data.receptor || { rfc: 'IXS7607092R5', nombre: 'INTERNACIONAL XIMBO Y SABORES SA DE CV', cp: '63000', regime: '601' };
        const pagoInfo = data.pago || {};
        const montoNum = Number(pagoInfo.monto || 9324.71);
        const letras = this.formatLetras((0, numero_a_letras_util_1.numeroALetras)(montoNum, 'MXN'));
        const brandColor = '#554572';
        const brandName = 'Peguu';
        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Recibo de Pago CFDI 4.0 - ${uuid}</title>
  <style>
    @page { size: letter; margin: 12mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; color: #1f2937; margin: 0; padding: 15px; line-height: 1.3; }
    .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .logo-badge { background: ${brandColor}; color: white; font-size: 18pt; font-weight: 800; padding: 4px 16px; border-radius: 20px; display: inline-block; }
    .doc-info-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; text-align: right; }
    .doc-title { font-size: 14pt; font-weight: 700; color: ${brandColor}; margin-bottom: 4px; }
    .party-container { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .party-card { width: 49%; vertical-align: top; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; }
    .party-title { font-size: 8.5pt; font-weight: 700; color: white; background: ${brandColor}; padding: 3px 8px; border-radius: 4px; margin-bottom: 6px; display: inline-block; }
    .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    .data-table th { background: ${brandColor}; color: white; font-size: 8pt; font-weight: 600; padding: 5px 8px; text-align: left; }
    .data-table td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 8pt; color: #1e293b; }
    .words-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; font-size: 8pt; margin-bottom: 12px; }
  </style>
</head>
<body>
  <table class="header-table">
    <tr>
      <td style="vertical-align: top; width: 50%;">
        <div class="logo-badge">${brandName}</div>
        <div style="font-size: 9pt; font-weight: bold; color: #475569; margin-top: 6px;">COMPLEMENTO DE RECEPCIÓN DE PAGO 2.0</div>
      </td>
      <td style="width: 50%;">
        <div class="doc-info-box">
          <div class="doc-title">REP CFDI 4.0</div>
          <div><strong>UUID:</strong> ${uuid}</div>
          <div><strong>Folio:</strong> ${data.folio_interno || 'P-101'} | <strong>Fecha:</strong> ${new Date().toISOString().substring(0, 19).replace('T', ' ')}</div>
        </div>
      </td>
    </tr>
  </table>
  <table class="party-container">
    <tr>
      <td class="party-card">
        <div class="party-title">EMISOR</div>
        <div><strong>Razón Social:</strong> ${emisor.nombre}</div>
        <div><strong>RFC:</strong> ${emisor.rfc} | <strong>Régimen:</strong> ${emisor.regimen}</div>
      </td>
      <td style="width: 2%;"></td>
      <td class="party-card">
        <div class="party-title">RECEPTOR</div>
        <div><strong>Cliente:</strong> ${receptor.nombre}</div>
        <div><strong>RFC:</strong> ${receptor.rfc} | <strong>C.P.:</strong> ${receptor.cp}</div>
      </td>
    </tr>
  </table>
  <table class="data-table">
    <thead>
      <tr><th>Fecha Pago</th><th>Forma Pago</th><th>Moneda</th><th>Monto Recibido</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>${pagoInfo.fecha_pago || new Date().toISOString().substring(0, 19).replace('T', ' ')}</td>
        <td>${pagoInfo.forma_pago || '03'} ${(0, sat_catalogs_util_1.getFormaPagoDesc)(pagoInfo.forma_pago || '03')}</td>
        <td>MXN</td>
        <td><strong>$${this.formatQuantity(montoNum)} MXN</strong></td>
      </tr>
    </tbody>
  </table>
  <div class="words-box">
    <strong>IMPORTE CON LETRA:</strong> <span style="color: ${brandColor}; font-weight: bold;">${letras}</span>
  </div>
</body>
</html>`;
    }
    async generateInvoicePdfHtml(data) {
        const uuid = data.uuid || '';
        const serie = data.serie || data.comprobante?.serie || '';
        const folio = data.folio || data.comprobante?.folio_interno || '';
        const fecha = data.fecha || new Date().toISOString().substring(0, 19).replace('T', ' ');
        const fechaCert = data.fechaCertificacion || fecha;
        const lugarExpedicion = data.lugarExpedicion || data.emisor?.domicilio?.codigo_postal || '98053';
        const noCertificado = data.noCertificado || data.comprobante?.no_certificado || '';
        const noCertificadoSat = data.noCertificadoSat || data.no_certificado_sat || '00001000000518812364';
        const rfcPac = data.rfcPac || data.rfc_pac || 'SNF171020F3A';
        const emisorRfc = data.emisor?.rfc || data.rfc || '';
        const emisorNombre = data.emisor?.nombre || data.emisor?.razon_social || data.emisor?.nombre_comercial || '';
        const emisorRegimen = data.emisor?.regimen || data.emisor?.regimen_fiscal || '601';
        let emisorDireccion = data.emisor?.direccion;
        if (!emisorDireccion) {
            if (data.emisor?.domicilio) {
                const d = data.emisor.domicilio;
                emisorDireccion = `${d.calle || ''} ${d.no_exterior || ''} ${d.colonia || ''}, ${d.municipio || ''}, ${d.estado || ''}. C.P. ${d.codigo_postal || lugarExpedicion}`.trim();
            }
            else {
                emisorDireccion = `C.P. ${lugarExpedicion}`;
            }
        }
        const emisor = {
            rfc: emisorRfc,
            nombre: emisorNombre,
            regimen: emisorRegimen,
            direccion: emisorDireccion,
        };
        const recObj = data.receptor || {};
        const receptorCp = recObj.codigo_postal || recObj.cp || recObj.domicilio_fiscal_receptor || '';
        const receptorDireccion = recObj.direccion || (receptorCp ? `C.P. ${receptorCp}` : '');
        const receptor = {
            rfc: recObj.rfc || '',
            nombre: recObj.nombre || recObj.razon_social || '',
            regimen: recObj.regimen || recObj.regimen_fiscal || '601',
            cp: receptorCp,
            uso: recObj.uso || recObj.uso_cfdi || 'G03',
            direccion: receptorDireccion,
            observaciones: recObj.observaciones || '',
            orden_venta: recObj.orden_venta || recObj.orden_compra || '',
        };
        const datosBancarios = data.datos_bancarios || data.datosBancarios || {
            metodo_pago: 'PUE - Pago en una sola exhibición',
            banco: 'BANAMEX',
            beneficiario: emisor.nombre,
            cuenta: '1234567890',
            clabe: '012180001234567890',
        };
        const conceptos = data.conceptos || data.comprobante?.conceptos || [
            {
                clave: '82101500',
                codigo_interno: 'SRV0001',
                unidad: 'H87 - PIEZA',
                descripcion: 'Diseño gráfico "rediseño de cristal"',
                valor: 150.00,
                cantidad: 2.50,
                importe: 375.00,
                descuento: 0,
                objetoImp: '02 - Sí objeto de impuesto',
                iva: 60.00,
            },
        ];
        const subTotal = Number(data.subTotal !== undefined ? data.subTotal : (data.comprobante?.subtotal || 3844.50));
        const totalIva = Number(data.totalIva !== undefined ? data.totalIva : (data.comprobante?.total_iva || 615.12));
        const total = Number(data.total !== undefined ? data.total : (data.comprobante?.total || 4459.62));
        const moneda = data.moneda || data.comprobante?.moneda || 'MXN';
        const formaPago = data.formaPago || data.comprobante?.forma_pago || '03';
        const metodoPago = data.metodoPago || data.comprobante?.metodo_pago || 'PUE';
        const letras = this.formatLetras((0, numero_a_letras_util_1.numeroALetras)(total, moneda));
        const sello = data.sello || 'qk3IjvyQqau/pMSSLH00rIgEo8+El7w8Z4fLPkVnLmYPWHKIlCBjS7h62clSC+ils+m3hyV2FEdCSXGBslOLbPAQdVVf7+JtjeKkwFG2um/yEpHf3/eYfRqlIPjw3SPw+4bAMHzSspqo3refcIjeTuUrbGsdovwrwTLOYNOQlO6lGrzS0M/cYTDEih5cyYfEcVcbALsKqVrUP7AccF9ySkIfFk/RNdAAu6VxlDsqGN4z9BiItny4WbAcArj54e8bvmtvUc0mw668IwoQ9Flm8YdPo4t/thPwLtt/X98aPpHHEUTPcgIA+6PNJ/oR2jPYuOpGg2RyGwL4iFuE2e0MYyDZw==';
        const selloSat = data.selloSat || data.sello_sat || 'SQp740UOclyc0y91lOUzOoXH3j+EVDHMkwMIgCO7tzcuuYkoV5UItqvGZ2jvYVppCPGnPHfF5rNxgpJZ2iYsrUJSSMhamYVrIBIF2IGKA8UMEa3/UrL5s57Os4vmabUwykzvLiTpnx23rYokVfIxL54r9UFcJyU/j5CTykd0qr9vpT0JYdqvW9Cu3WbOPiQ4WzIMVFCzKBlU7VM3Zun94/RIz0LQDD7hi43qaQf6UeK8SDvXeDPPNQuDUKSXHX/M+KBddABvHPPgdeQiDBY1LwNNv1YLZAajy9uVrI/qt7xjb/kKhwiB/KqnGYmq487a+rAG26DmTx3bAcSUw+PFxw==';
        const cadenaOriginal = data.cadenaOriginal || data.cadena_original || `||1.1|${uuid}|${fechaCert}|SNF171020F3A|${sello}|${noCertificadoSat}||`;
        const last8Sello = sello.length >= 8 ? sello.substring(sello.length - 8) : '12345678';
        const qrString = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${emisor.rfc}&rr=${receptor.rfc || 'XAXX010101000'}&tt=${total.toFixed(6)}&fe=${last8Sello}`;
        let qrDataUrl = '';
        try {
            qrDataUrl = await QRCode.toDataURL(qrString, { margin: 1, width: 120, color: { dark: '#554572', light: '#FFFFFF' } });
        }
        catch (e) {
            this.logger.warn(`No se pudo generar QR DataUrl: ${e.message}`);
        }
        const primaryPurple = '#554572';
        const midHeaderPurple = '#6C579A';
        const cardEmisorBlue = '#C7E1EB';
        const cardBancoGreen = '#EBF2E4';
        const cardPaymentGreen = '#EBF2E4';
        const cardTotalsSalmon = '#F4E4E3';
        const pastelPurple = '#F1EEF6';
        const logoHeaderRaw = this.getLogoHeaderSvg();
        const logoFooterRaw = this.getLogoFooterSvg();
        const logoHeaderHtml = logoHeaderRaw ?
            `<div class="logo-box">${logoHeaderRaw}</div>` :
            `<div class="logo-badge">Peguu</div>`;
        const logoFooterHtml = logoFooterRaw ?
            `<div class="footer-logo-box">${logoFooterRaw}</div>` :
            `<span class="pill-small">Peguu one</span>`;
        const conceptosHtml = conceptos.map((c) => {
            const itemImporte = Number(c.importe || (c.cantidad * (c.valor_unitario || c.valor)));
            const itemValor = Number(c.valor_unitario || c.valor || 0);
            const itemIva = Number(c.iva !== undefined ? c.iva : (itemImporte * 0.16));
            const itemDesc = c.descuento ? Number(c.descuento) : 0;
            return `
    <tr class="tr-item">
      <td class="td-item">
        <strong style="color: ${primaryPurple};">CÓDIGO:</strong> ${c.codigo_interno || c.clave_prod_serv || c.clave || 'SRV0001'}<br>
        <strong style="color: ${primaryPurple};">UNIDAD:</strong> ${c.clave_unidad || c.unidad || 'H87 - PIEZA'}<br>
        <strong style="color: ${primaryPurple};">CÓDIGO SAT:</strong> ${c.clave_prod_serv || c.clave || '82101500'}<br>
        <span style="color: #0f172a; font-weight: 700;">${c.descripcion || 'Diseño gráfico "rediseño de cristal"'}</span>
      </td>
      <td class="td-item">${c.objetoImp || c.objeto_imp || '02 - Sí objeto de impuesto'}</td>
      <td class="td-item num">${this.formatCurrency(itemValor)}</td>
      <td class="td-item num">${this.formatQuantity(c.cantidad || 1)}</td>
      <td class="td-item num">${this.formatCurrency(itemImporte)}</td>
      <td class="td-item num">${this.formatCurrency(itemDesc)}</td>
    </tr>
    <tr class="tr-tax">
      <td class="td-tax" colspan="6">
        <span class="tax-pill">Traslado Impuesto: <strong>IVA</strong></span>
        <span class="tax-pill">Tipo de factor: <strong>Tasa</strong></span>
        <span class="tax-pill">Tasa o cuota: <strong>0.160000</strong></span>
        <span class="tax-pill">Base: <strong>${this.formatCurrency(itemImporte)}</strong></span>
        <span class="tax-pill">Importe: <strong>${this.formatCurrency(itemIva)}</strong></span>
      </td>
    </tr>
    `;
        }).join('');
        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura CFDI 4.0 - ${uuid}</title>
  <style>
    @page { size: letter; margin: 10mm 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8.5pt; color: #1e293b; margin: 0; padding: 15px; line-height: 1.35; background: #ffffff; }
    
    .top-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .logo-badge { background: ${primaryPurple}; color: white; font-size: 22pt; font-weight: 900; padding: 4px 22px; border-radius: 26px; display: inline-block; letter-spacing: -0.5px; }
    .logo-box svg { width: 115px; height: 40px; display: block; }
    .footer-logo-box svg { width: 95px; height: 18px; display: inline-block; vertical-align: middle; }
    .doc-title-box { text-align: right; }
    .doc-title { font-size: 26pt; font-weight: 900; color: ${primaryPurple}; line-height: 1; margin-bottom: 4px; }
    .doc-client { font-size: 10pt; font-weight: 700; color: ${primaryPurple}; text-transform: uppercase; }
    
    .row-cards { display: flex; gap: 15px; margin-bottom: 15px; }
    .card-emisor { flex: 1; background: ${cardEmisorBlue}; border-radius: 6px; padding: 12px 15px; }
    .card-banco { flex: 1; background: ${cardBancoGreen}; border-radius: 6px; padding: 12px 15px; }
    .card-title { font-size: 9.5pt; font-weight: 800; color: ${primaryPurple}; margin-bottom: 3px; text-transform: uppercase; }
    .card-line { font-size: 8pt; margin-bottom: 3px; color: #334155; }
    .card-label { font-weight: 700; color: #475569; }
    
    .mid-boxes { display: flex; gap: 15px; margin-bottom: 15px; }
    .mid-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #ffffff; }
    .mid-header { background: ${midHeaderPurple}; color: white; font-size: 9.5pt; font-weight: 700; padding: 6px 14px; margin: 0; line-height: 1.2; text-align: center; }
    .mid-content { padding: 10px 14px; font-size: 8pt; background: #ffffff; }
    .grid-row { display: flex; margin-bottom: 5px; }
    .grid-lbl { width: 38%; font-weight: 700; color: #475569; }
    .grid-val { width: 62%; color: #1e293b; }
    
    .table-concepts { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    .table-concepts th { background: ${primaryPurple}; color: white; font-size: 7.5pt; font-weight: 700; padding: 8px 10px; text-align: left; text-transform: uppercase; white-space: nowrap; }
    .table-concepts th.num { text-align: right; }
    .tr-item { background: ${pastelPurple}; }
    .td-item { padding: 8px 10px; font-size: 8pt; vertical-align: top; }
    .td-item.num { text-align: right; font-weight: 700; }
    .tr-tax { background: #ffffff; }
    .td-tax { padding: 4px 10px 10px 10px; font-size: 7.5pt; color: #475569; border-bottom: 2px solid #f1f5f9; }
    .tax-pill { display: inline-block; margin-right: 12px; }
    
    .footer-section { display: flex; gap: 15px; margin-bottom: 15px; }
    .pay-methods-card { flex: 1; background: ${cardPaymentGreen}; border-radius: 6px; padding: 12px 16px; font-size: 8.5pt; }
    .totals-card { width: 280px; background: ${cardTotalsSalmon}; border-radius: 6px; padding: 12px 16px; }
    .tot-line { display: flex; justify-content: space-between; font-size: 9.5pt; margin-bottom: 4px; font-weight: 700; color: #475569; }
    .tot-line.grand { font-size: 14pt; color: ${primaryPurple}; font-weight: 900; margin-top: 8px; border-top: 1px solid rgba(85,69,114,0.15); padding-top: 6px; }
    .amount-words { text-align: right; font-size: 7.5pt; font-weight: 800; color: ${primaryPurple}; margin-top: 6px; }
    
    .sat-block { display: flex; gap: 14px; border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 15px; align-items: flex-start; }
    .sat-qr { width: 95px; height: 95px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
    .sat-text { flex: 1; font-family: 'Courier New', monospace; font-size: 6.2pt; color: #475569; word-break: break-all; text-align: justify; line-height: 1.25; }
    .sat-title { font-family: 'Segoe UI', sans-serif; font-size: 7.5pt; font-weight: 800; color: ${primaryPurple}; margin-bottom: 2px; }
    
    .page-footer { margin-top: 25px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; font-size: 7.5pt; color: #64748b; }
    .pill-small { background: ${primaryPurple}; color: white; padding: 2px 8px; border-radius: 10px; font-weight: 800; font-size: 7.5pt; }
  </style>
</head>
<body>

  <!-- 1. Cabecera -->
  <div class="top-header">
    <div>
      ${logoHeaderHtml}
    </div>
    <div class="doc-title-box">
      <div class="doc-title">Factura</div>
      <div class="doc-client">${receptor.nombre}</div>
    </div>
  </div>

  <!-- 2. Bloques Emisor (#C7E1EB) Y Banco (#EBF2E4) -->
  <div class="row-cards">
    <div class="card-emisor">
      <div class="card-title">${emisor.nombre}</div>
      <div class="card-line"><span class="card-label">RFC:</span> ${emisor.rfc}</div>
      <div class="card-line"><span class="card-label">RÉGIMEN FISCAL:</span><br>${emisor.regimen} - ${(0, sat_catalogs_util_1.getRegimenDesc)(emisor.regimen)}</div>
      <div class="card-line" style="margin-top: 6px;"><span class="card-label">DIRECCIÓN:</span><br>${emisor.direccion}</div>
    </div>
    <div class="card-banco">
      <div class="card-line"><span class="card-label">MÉTODO DE PAGO:</span> ${metodoPago} - ${(0, sat_catalogs_util_1.getMetodoPagoDesc)(metodoPago)}</div>
      <div class="card-line"><span class="card-label">BANCO:</span> ${datosBancarios.banco || 'BANAMEX'}</div>
      <div class="card-line"><span class="card-label">BENEFICIARIO:</span> ${datosBancarios.beneficiario || emisor.nombre}</div>
      <div class="card-line"><span class="card-label">CUENTA:</span> ${datosBancarios.cuenta || '1234567890'}</div>
      <div class="card-line"><span class="card-label">CLABE:</span> ${datosBancarios.clabe || '012180001234567890'}</div>
    </div>
  </div>

  <!-- 3. Cajas Medias con Cabecera Morada (#6C579A) -->
  <div class="mid-boxes">
    <div class="mid-box">
      <div class="mid-header">Información del cliente</div>
      <div class="mid-content">
        <div class="grid-row"><div class="grid-lbl">RFC:</div><div class="grid-val"><strong>${receptor.rfc}</strong></div></div>
        <div class="grid-row"><div class="grid-lbl">NOMBRE:</div><div class="grid-val">${receptor.nombre}</div></div>
        <div class="grid-row"><div class="grid-lbl">RÉGIMEN FISCAL:</div><div class="grid-val">${receptor.regimen || '601'} - ${(0, sat_catalogs_util_1.getRegimenDesc)(receptor.regimen || '601')}</div></div>
        <div class="grid-row"><div class="grid-lbl">DIRECCIÓN FISCAL:</div><div class="grid-val">${receptor.direccion || `C.P. ${receptor.cp || '00000'}`}</div></div>
        <div class="grid-row"><div class="grid-lbl">OBSERVACIONES:</div><div class="grid-val">${receptor.observaciones}</div></div>
        <div style="margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 6px; display: flex; justify-content: space-between;">
          <div><span class="card-label">USO DE CFDI:</span><br>${receptor.uso || 'G03'} - ${(0, sat_catalogs_util_1.getUsoCfdiDesc)(receptor.uso || 'G03')}</div>
          <div><span class="card-label">Orden(es) de venta:</span><br><strong style="color: ${primaryPurple};">${receptor.orden_venta || 'ODV-1918'}</strong></div>
        </div>
      </div>
    </div>
    <div class="mid-box">
      <div class="mid-header">Comprobante fiscal digital internet</div>
      <div class="mid-content">
        <div class="grid-row"><div class="grid-lbl">SERIE:</div><div class="grid-val"><strong>${serie}</strong></div></div>
        <div class="grid-row"><div class="grid-lbl">FOLIO:</div><div class="grid-val"><strong>${folio}</strong></div></div>
        <div class="grid-row"><div class="grid-lbl">FECHA DE EMISIÓN:</div><div class="grid-val">${fecha}</div></div>
        <div class="grid-row"><div class="grid-lbl">LUGAR DE EXPEDICIÓN:</div><div class="grid-val">${lugarExpedicion}</div></div>
        <div class="grid-row"><div class="grid-lbl">TIPO DE COMPROBANTE:</div><div class="grid-val">I - Ingreso</div></div>
        <div class="grid-row"><div class="grid-lbl">CERTIFICADO EMISOR:</div><div class="grid-val">${noCertificado}</div></div>
        <div class="grid-row"><div class="grid-lbl">FECHA DE CERTIFICACIÓN:</div><div class="grid-val">${fechaCert}</div></div>
        <div class="grid-row"><div class="grid-lbl">FOLIO FISCAL SAT:</div><div class="grid-val" style="font-family: monospace; font-size: 7.5pt;">${uuid}</div></div>
        <div class="grid-row"><div class="grid-lbl">CERTIFICADO SAT:</div><div class="grid-val">${noCertificadoSat}</div></div>
        <div class="grid-row" style="margin-top: 4px; justify-content: flex-end;"><div style="text-align: right;"><span class="card-label">RFC DEL PAC:</span><br><strong style="color: ${primaryPurple};">${rfcPac}</strong></div></div>
      </div>
    </div>
  </div>

  <!-- 4. Tabla de Conceptos -->
  <table class="table-concepts">
    <thead>
      <tr>
        <th>DESCRIPCIÓN</th>
        <th>OBJETO IMPUESTO</th>
        <th class="num">VALOR UNITARIO</th>
        <th class="num">CANTIDAD</th>
        <th class="num">IMPORTE</th>
        <th class="num">DESCUENTO</th>
      </tr>
    </thead>
    <tbody>
      ${conceptosHtml}
    </tbody>
  </table>

  <!-- 5. Tarjetas de Pago y Totales -->
  <div class="footer-section">
    <div class="pay-methods-card">
      <div style="margin-bottom: 10px;">
        <span class="card-label">Método de pago:</span><br>
        <strong>${metodoPago} - ${(0, sat_catalogs_util_1.getMetodoPagoDesc)(metodoPago)}</strong>
      </div>
      <div style="margin-bottom: 10px;">
        <span class="card-label">Forma de pago:</span><br>
        <strong>${formaPago} - ${(0, sat_catalogs_util_1.getFormaPagoDesc)(formaPago)}</strong>
      </div>
      <div>
        <span class="card-label">Moneda:</span><br>
        <strong>${moneda}</strong>
      </div>
    </div>
    
    <div class="totals-card">
      <div class="tot-line"><span>Subtotal</span> <span>${this.formatCurrency(subTotal)}</span></div>
      <div class="tot-line"><span>IVA 16%</span> <span>${this.formatCurrency(totalIva)}</span></div>
      <div class="tot-line grand"><span>Total</span> <span>${this.formatCurrency(total)}</span></div>
      <div class="amount-words">${letras}</div>
    </div>
  </div>

  <!-- 6. Timbre Fiscal SAT -->
  <div class="sat-block">
    <div class="sat-qr">
      ${qrDataUrl ? `<img src="${qrDataUrl}" style="width: 95px; height: 95px;" alt="QR SAT">` : '[QR SAT]'}
    </div>
    <div class="sat-text">
      <div style="margin-bottom: 6px;">
        <div class="sat-title">Sello Digital CFDI</div>
        <div>${sello}</div>
      </div>
      <div style="margin-bottom: 6px;">
        <div class="sat-title">Sello Digital SAT</div>
        <div>${selloSat}</div>
      </div>
      <div>
        <div class="sat-title">Cadena original del complemento de certificación digital del SAT</div>
        <div>${cadenaOriginal}</div>
      </div>
    </div>
  </div>

  <!-- 7. Pie de Página V1.0 -->
  <div class="page-footer">
    <div>
      ${logoFooterHtml} V1.0.<br>
      <span style="font-size: 6.5pt;">Todos los derechos reservados</span>
    </div>
    <div style="text-align: center;">
      <strong>Este documento es una representación impresa de un CFDI</strong><br>
      El registro de este documento puede ser verificado en la página de Internet del SAT
    </div>
    <div style="text-align: right;">
      Versión de CFDI: 4.0<br>
      <strong>Página 1 de 1</strong>
    </div>
  </div>

</body>
</html>`;
    }
    async generateInvoicePdfBuffer(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const uuid = data.uuid || '70aadc83-cde9-4c57-99b2-72c572150c66';
                const serie = data.serie || data.comprobante?.serie || 'PGU';
                const folio = String(data.folio || data.comprobante?.folio_interno || '1');
                const doc = new pdfkit_1.default({
                    size: 'LETTER',
                    margins: { top: 28, left: 28, right: 28, bottom: 65 },
                    bufferPages: true,
                    info: {
                        Title: `Factura ${serie}-${folio} - ${uuid}`,
                        Author: 'Peguu Universal Billing API',
                        Subject: `CFDI 4.0 Folio Fiscal SAT: ${uuid}`,
                        Keywords: 'CFDI, SAT, Factura, Peguu'
                    }
                });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => reject(err));
                const nowStr = new Date().toISOString().replace('T', ' ').split('.')[0];
                const fecha = data.fecha || nowStr;
                const fechaCert = data.fechaCertificacion || data.fecha_certificacion || fecha;
                const lugarExpedicion = data.lugarExpedicion || data.lugar_expedicion || data.emisor?.domicilio?.codigo_postal || '63000';
                const noCertificado = data.noCertificado || data.no_certificado || '30001000000500003434';
                const noCertificadoSat = data.noCertificadoSat || data.no_certificado_sat || '00001000000518812364';
                const rfcPac = data.rfcPac || data.rfc_pac || 'SNF171020F3A';
                const emObj = data.emisor || {};
                const emisorRfc = emObj.rfc || 'IVD920810GU2';
                const emisorNombre = emObj.nombre || emObj.razon_social || emObj.nombre_comercial || 'INNOVACION VALOR Y DESARROLLO SA';
                const emisorRegimen = emObj.regimen || emObj.regimen_fiscal || '601';
                let emisorDireccion = emObj.direccion;
                if (!emisorDireccion && emObj.domicilio) {
                    const d = emObj.domicilio;
                    emisorDireccion = `${d.calle || ''} ${d.no_exterior || ''} ${d.colonia || ''}, ${d.municipio || ''}, ${d.estado || ''}. C.P. ${d.codigo_postal || lugarExpedicion}`.trim();
                }
                if (!emisorDireccion) {
                    emisorDireccion = `C.P. ${lugarExpedicion}`;
                }
                const emisor = {
                    rfc: emisorRfc,
                    nombre: emisorNombre,
                    regimen: emisorRegimen,
                    direccion: emisorDireccion,
                };
                const recObj = data.receptor || {};
                const receptorCp = recObj.codigo_postal || recObj.cp || recObj.domicilio_fiscal_receptor || '';
                const receptorDireccion = recObj.direccion || (receptorCp ? `C.P. ${receptorCp}` : '');
                const receptorRegimen = recObj.regimen || recObj.regimen_fiscal || '601';
                const receptorUso = recObj.uso || recObj.uso_cfdi || 'G03';
                const receptor = {
                    rfc: recObj.rfc || '',
                    nombre: recObj.nombre || recObj.razon_social || '',
                    regimen: receptorRegimen,
                    cp: receptorCp,
                    uso: receptorUso,
                    direccion: receptorDireccion,
                    observaciones: recObj.observaciones || '',
                    orden_venta: recObj.orden_venta || recObj.orden_compra || '',
                };
                const rawBancarios = data.datos_bancarios || data.datosBancarios || {};
                const datosBancarios = {
                    banco: rawBancarios.banco && rawBancarios.banco !== 'BANCO:' ? rawBancarios.banco : 'BANAMEX',
                    beneficiario: rawBancarios.beneficiario && rawBancarios.beneficiario !== 'BENEFICIARIO:' ? rawBancarios.beneficiario : emisor.nombre,
                    cuenta: rawBancarios.cuenta && rawBancarios.cuenta !== 'CUENTA:' ? rawBancarios.cuenta : '1234567890',
                    clabe: rawBancarios.clabe && rawBancarios.clabe !== 'CLABE:' ? rawBancarios.clabe : '012180001234567890',
                };
                const conceptos = data.conceptos || data.comprobante?.conceptos || [
                    {
                        clave: '55121715',
                        codigo_interno: 'PGU-001',
                        unidad: 'H87 - PIEZA',
                        descripcion: 'Holográfico - etiquetas Peguu',
                        valor: 4.01927,
                        cantidad: 2000,
                        importe: 8038.54,
                        descuento: 0,
                        objetoImp: '02 - Sí objeto de impuesto',
                        iva: 1286.17,
                    }
                ];
                let subtotalNum = 0;
                conceptos.forEach((c) => {
                    subtotalNum += Number(c.importe || (c.cantidad * (c.valor_unitario || c.valor)));
                });
                const ivaNum = Number(data.totalIva !== undefined ? data.totalIva : (subtotalNum * 0.16));
                const totalNum = Number(data.total !== undefined ? data.total : (subtotalNum + ivaNum));
                const moneda = data.moneda || data.comprobante?.moneda || 'MXN';
                const formaPago = data.formaPago || data.comprobante?.forma_pago || '04';
                const metodoPago = data.metodoPago || data.comprobante?.metodo_pago || 'PUE';
                const letras = this.formatLetras((0, numero_a_letras_util_1.numeroALetras)(totalNum, moneda));
                let sello = data.sello || '';
                let selloSat = data.selloSat || data.sello_sat || '';
                if (data.xml) {
                    if (!sello) {
                        const mS = data.xml.match(/SelloCFD="([^"]+)"/i) || data.xml.match(/Sello="([^"]+)"/i);
                        if (mS)
                            sello = mS[1];
                    }
                    if (!selloSat) {
                        const mSS = data.xml.match(/SelloSAT="([^"]+)"/i);
                        if (mSS)
                            selloSat = mSS[1];
                    }
                }
                if (!sello)
                    sello = 'qk3IjvyQqau/pMSSLH00rIgEo8+El7w8Z4fLPkVnLmYPWHKIlCBjS7h62clSC+ils+m3hyV2FEdCSXGBslOLbPAQdVVf7+JtjeKkwFG2um/yEpHf3/eYfRqlIPjw3SPw+4bAMHzSspqo3refcIjeTuUrbGsdovwrwTLOYNOQlO6lGrzS0M/cYTDEih5cyYfEcVcbALsKqVrUP7AccF9ySkIfFk/RNdAAu6VxlDsqGN4z9BiItny4WbAcArj54e8bvmtvUc0mw668IwoQ9Flm8YdPo4t/thPwLtt/X98aPpHHEUTPcgIA+6PNJ/oR2jPYuOpGg2RyGwL4iFuE2e0MYyDZw==';
                if (!selloSat)
                    selloSat = 'SQp740UOclyc0y91lOUzOoXH3j+EVDHMkwMIgCO7tzcuuYkoV5UItqvGZ2jvYVppCPGnPHfF5rNxgpJZ2iYsrUJSSMhamYVrIBIF2IGKA8UMEa3/UrL5s57Os4vmabUwykzvLiTpnx23rYokVfIxL54r9UFcJyU/j5CTykd0qr9vpT0JYdqvW9Cu3WbOPiQ4WzIMVFCzKBlU7VM3Zun94/RIz0LQDD7hi43qaQf6UeK8SDvXeDPPNQuDUKSXHX/M+KBddABvHPPgdeQiDBY1LwNNv1YLZAajy9uVrI/qt7xjb/kKhwiB/KqnGYmq487a+rAG26DmTx3bAcSUw+PFxw==';
                const cadenaOriginal = data.cadenaOriginal || data.cadena_original || `||1.1|${uuid}|${fechaCert}|${rfcPac}|${sello}|${noCertificadoSat}||`;
                const qrString = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${emisor.rfc}&rr=${receptor.rfc}&tt=${totalNum.toFixed(6)}&fe=${sello.substring(sello.length - 8)}`;
                let qrBuffer = null;
                try {
                    qrBuffer = await QRCode.toBuffer(qrString, {
                        margin: 1,
                        color: { dark: '#554572', light: '#FFFFFF' }
                    });
                }
                catch (e) {
                    this.logger.warn(`No se pudo generar QR Buffer: ${e.message}`);
                }
                const logoHeaderSvg = this.getLogoHeaderSvg();
                const logoFooterSvg = this.getLogoFooterSvg();
                const primaryPurple = '#554572';
                const midHeaderPurple = '#6C579A';
                const cardEmisorBlue = '#C7E1EB';
                const cardBancoGreen = '#EBF2E4';
                const cardPaymentGreen = '#EBF2E4';
                const cardTotalsSalmon = '#F4E4E3';
                const pastelPurple = '#F1EEF6';
                const textDark = '#1e293b';
                const textGray = '#475569';
                const cornerRad = 6;
                if (logoHeaderSvg) {
                    try {
                        (0, svg_to_pdfkit_1.default)(doc, logoHeaderSvg, 28, 25, { width: 85, height: 30 });
                    }
                    catch (e) {
                        this.logger.warn(`Error renderizando LogoHeaderSVG: ${e.message}`);
                        doc.roundedRect(28, 25, 85, 30, 15).fill(primaryPurple);
                        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(18).text('Peguu', 28, 32, { width: 85, align: 'center' });
                    }
                }
                else {
                    doc.roundedRect(28, 25, 85, 30, 15).fill(primaryPurple);
                    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(18).text('Peguu', 28, 32, { width: 85, align: 'center' });
                }
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(24).text('Factura', 300, 25, { width: 284, align: 'right' });
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(9.5).text(String(receptor.nombre || '').toUpperCase(), 300, 52, { width: 284, align: 'right' });
                let y = 70;
                const cardW = 271;
                const cardH = 87;
                doc.roundedRect(28, y, cardW, cardH, cornerRad).fill(cardEmisorBlue);
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(9).text(String(emisor.nombre || '').toUpperCase(), 38, y + 10, { width: cardW - 20 });
                doc.fillColor(textDark).font('Helvetica-Bold').fontSize(8).text('RFC: ', 38, y + 24, { continued: true }).font('Helvetica').text(emisor.rfc);
                doc.font('Helvetica-Bold').text('RÉGIMEN FISCAL:', 38, y + 36);
                doc.font('Helvetica').text(`${emisor.regimen} - ${(0, sat_catalogs_util_1.getRegimenDesc)(emisor.regimen)}`, 38, y + 46, { width: cardW - 20 });
                doc.font('Helvetica-Bold').text('DIRECCIÓN:', 38, y + 58);
                doc.font('Helvetica').text(emisor.direccion || `C.P. ${lugarExpedicion}`, 38, y + 68, { width: cardW - 20, height: 12, ellipsis: true });
                doc.roundedRect(313, y, cardW, cardH, cornerRad).fill(cardBancoGreen);
                let by = y + 10;
                const bLblW = 90;
                const bValW = 160;
                const drawBankRow = (lbl, val) => {
                    doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.5).text(lbl, 323, by, { width: bLblW });
                    doc.fillColor(textDark).font('Helvetica').fontSize(7.5).text(val, 323 + bLblW, by, { width: bValW, height: 10, ellipsis: true });
                    by += 13;
                };
                drawBankRow('MÉTODO DE PAGO:', `${metodoPago} - ${(0, sat_catalogs_util_1.getMetodoPagoDesc)(metodoPago)}`);
                drawBankRow('BANCO:', datosBancarios.banco);
                drawBankRow('BENEFICIARIO:', datosBancarios.beneficiario);
                drawBankRow('CUENTA:', datosBancarios.cuenta);
                drawBankRow('CLABE:', datosBancarios.clabe);
                y += cardH + 12;
                const midW = 271;
                const midH = 152;
                doc.roundedRect(28, y, midW, midH, cornerRad).strokeColor('#cbd5e1').lineWidth(1).stroke();
                doc.save();
                doc.roundedRect(28, y, midW, 22, cornerRad).clip();
                doc.rect(28, y, midW, 22).fill(midHeaderPurple);
                doc.restore();
                doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text('Información del cliente', 28, y + 6, { width: midW, align: 'center' });
                let cy = y + 26;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.0).text('RFC:', 36, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica-Bold').fontSize(7.0).text(receptor.rfc, 115, cy, { width: 175 });
                cy += 12;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.0).text('NOMBRE:', 36, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(receptor.nombre, 115, cy, { width: 175 });
                cy += 12;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.0).text('RÉGIMEN FISCAL:', 36, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(`${receptor.regimen} - ${(0, sat_catalogs_util_1.getRegimenDesc)(receptor.regimen)}`, 115, cy, { width: 175, height: 20 });
                cy += 20;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.0).text('DIRECCIÓN FISCAL:', 36, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(receptor.direccion || (receptor.cp ? `C.P. ${receptor.cp}` : ''), 115, cy, { width: 175, height: 20 });
                cy += 20;
                if (receptor.observaciones) {
                    doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.0).text('OBSERVACIONES:', 36, cy, { width: 75 });
                    doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(receptor.observaciones, 115, cy, { width: 175 });
                }
                cy = y + 118;
                doc.moveTo(36, cy - 3).lineTo(290, cy - 3).strokeColor('#f1f5f9').lineWidth(1).stroke();
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.0).text('USO DE CFDI:', 36, cy);
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(`${receptor.uso} - ${(0, sat_catalogs_util_1.getUsoCfdiDesc)(receptor.uso)}`, 36, cy + 9, { width: 125, height: 16 });
                if (receptor.orden_venta) {
                    doc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.0).text('Orden(es) de venta', 170, cy);
                    doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(7.0).text(receptor.orden_venta, 170, cy + 9, { width: 120 });
                }
                doc.roundedRect(313, y, midW, midH, cornerRad).strokeColor('#cbd5e1').lineWidth(1).stroke();
                doc.save();
                doc.roundedRect(313, y, midW, 22, cornerRad).clip();
                doc.rect(313, y, midW, 22).fill(midHeaderPurple);
                doc.restore();
                doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text('Comprobante fiscal digital internet', 313, y + 6, { width: midW, align: 'center' });
                let fy = y + 26;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(6.5).text('SERIE', 323, fy).text('FOLIO', 385, fy).text('FECHA DE EMISIÓN', 450, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(serie, 323, fy + 8).text(folio, 385, fy + 8).text(fecha, 450, fy + 8);
                fy += 25;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(6.5).text('LUGAR DE EXPEDICIÓN', 323, fy).text('TIPO DE COMPROBANTE', 450, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(lugarExpedicion, 323, fy + 8).text(`${data.tipo || 'I'} - Ingreso`, 450, fy + 8);
                fy += 25;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(6.5).text('CERTIFICADO EMISOR', 323, fy).text('FECHA DE CERTIFICACIÓN', 450, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(noCertificado, 323, fy + 8).text(fechaCert, 450, fy + 8);
                fy += 25;
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(6.5).text('FOLIO FISCAL SAT', 323, fy);
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(7.0).text(uuid, 323, fy + 8, { width: 250 });
                fy += 24;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(6.5).text('CERTIFICADO SAT', 323, fy).text('RFC DEL PAC', 470, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(7.0).text(noCertificadoSat, 323, fy + 8).text(rfcPac, 470, fy + 8);
                y += midH + 15;
                const drawContinuationHeader = (targetDoc) => {
                    const cy = 28;
                    if (logoHeaderSvg) {
                        try {
                            (0, svg_to_pdfkit_1.default)(targetDoc, logoHeaderSvg, 28, cy, { width: 95, height: 32 });
                        }
                        catch (e) { }
                    }
                    else {
                        targetDoc.roundedRect(28, cy, 75, 26, 13).fill(primaryPurple);
                        targetDoc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(14).text('Peguu', 28, cy + 5, { width: 75, align: 'center' });
                    }
                    targetDoc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(18).text('Factura', 350, cy, { width: 234, align: 'right' });
                    targetDoc.fillColor(textGray).font('Helvetica-Bold').fontSize(7.5).text(`SERIE: ${serie}   FOLIO: ${folio}`, 350, cy + 19, { width: 234, align: 'right' });
                    targetDoc.fillColor(primaryPurple).font('Helvetica').fontSize(6.5).text(`FOLIO FISCAL SAT: ${uuid}`, 200, cy + 29, { width: 384, align: 'right' });
                    targetDoc.moveTo(28, cy + 40).lineTo(584, cy + 40).strokeColor('#cbd5e1').lineWidth(1).stroke();
                    return cy + 48;
                };
                const drawTableHeader = (targetY) => {
                    doc.rect(28, targetY, 556, 20).fill(primaryPurple);
                    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.0);
                    doc.text('DESCRIPCIÓN', 158, targetY + 6, { width: 115, lineBreak: false });
                    doc.text('OBJETO IMPUESTO', 273, targetY + 6, { width: 77, lineBreak: false });
                    doc.text('VALOR UNITARIO', 350, targetY + 6, { width: 62, align: 'right', lineBreak: false });
                    doc.text('CANTIDAD', 412, targetY + 6, { width: 45, align: 'right', lineBreak: false });
                    doc.text('IMPORTE', 457, targetY + 6, { width: 68, align: 'right', lineBreak: false });
                    doc.text('DESCUENTO', 525, targetY + 6, { width: 58, align: 'right', lineBreak: false });
                    return targetY + 20;
                };
                y = drawTableHeader(y);
                conceptos.forEach((c) => {
                    if (y + 60 > 600) {
                        doc.addPage();
                        y = drawContinuationHeader(doc);
                        y = drawTableHeader(y);
                    }
                    const itemImporte = Number(c.importe || (c.cantidad * (c.valor_unitario || c.valor)));
                    const itemValor = Number(c.valor_unitario || c.valor || 0);
                    const itemIva = Number(c.iva !== undefined ? c.iva : (itemImporte * 0.16));
                    const itemDesc = c.descuento ? Number(c.descuento) : 0;
                    const claveProd = c.clave_prod_serv || c.clave || '82101500';
                    const codInt = c.codigo_interno || claveProd || 'SRV0001';
                    const unidad = c.clave_unidad || c.unidad || 'H87 - PIEZA';
                    doc.rect(28, y, 556, 36).fill(pastelPurple);
                    doc.font('Helvetica-Bold').fontSize(6.8).fillColor(primaryPurple);
                    doc.text('CÓDIGO: ', 34, y + 4, { continued: true }).font('Helvetica').fillColor(primaryPurple).text(codInt);
                    doc.font('Helvetica-Bold').text('UNIDAD: ', 34, y + 15, { continued: true }).font('Helvetica').fillColor(primaryPurple).text(unidad, { width: 120, height: 10, ellipsis: true });
                    doc.font('Helvetica-Bold').text('CÓDIGO SAT: ', 34, y + 26, { continued: true }).font('Helvetica').fillColor(primaryPurple).text(claveProd);
                    doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(7.2).text(c.descripcion || 'Producto', 158, y + 4, { width: 115, height: 28 });
                    doc.font('Helvetica').fontSize(7.0).fillColor(primaryPurple).text(c.objetoImp || c.objeto_imp || '02 - Sí objeto de impuesto', 273, y + 4, { width: 77 });
                    doc.fillColor(primaryPurple).font('Helvetica').fontSize(7.0).text(this.formatCurrency(itemValor), 350, y + 4, { width: 62, align: 'right' });
                    doc.text(this.formatQuantity(c.cantidad || 1), 412, y + 4, { width: 45, align: 'right' });
                    doc.text(this.formatCurrency(itemImporte), 457, y + 4, { width: 68, align: 'right' });
                    doc.fillColor(primaryPurple).text(this.formatCurrency(itemDesc), 525, y + 4, { width: 58, align: 'right' });
                    y += 36;
                    doc.rect(28, y, 556, 20).fill('#FFFFFF');
                    doc.fillColor(primaryPurple).font('Helvetica').fontSize(7.0);
                    doc.text('Traslado Impuesto: ', 34, y + 5, { continued: true }).font('Helvetica-Bold').text('IVA', { continued: true })
                        .font('Helvetica').text('    Tipo de factor: ', { continued: true }).font('Helvetica-Bold').text('Tasa', { continued: true })
                        .font('Helvetica').text('    Tasa o cuota: ', { continued: true }).font('Helvetica-Bold').text('0.160000', { continued: true })
                        .font('Helvetica').text('    Base: ', { continued: true }).font('Helvetica-Bold').text(this.formatCurrency(itemImporte), { continued: true })
                        .font('Helvetica').text('    Importe: ', { continued: true }).font('Helvetica-Bold').fillColor(primaryPurple).text(this.formatCurrency(itemIva));
                    y += 20;
                    doc.moveTo(28, y).lineTo(584, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
                    y += 4;
                });
                if (y + 115 > 600) {
                    doc.addPage();
                    y = drawContinuationHeader(doc);
                }
                y += 8;
                const totBoxW = 271;
                const totBoxH = 80;
                doc.roundedRect(28, y, totBoxW, totBoxH, cornerRad).fill(cardPaymentGreen);
                let py = y + 10;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(8).text('Método de pago:', 38, py);
                doc.fillColor(textDark).font('Helvetica').fontSize(8).text(`${metodoPago} - ${(0, sat_catalogs_util_1.getMetodoPagoDesc)(metodoPago)}`, 38, py + 10, { width: totBoxW - 20, height: 12, ellipsis: true });
                py += 24;
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(8).text('Forma de pago:', 38, py);
                doc.fillColor(textDark).font('Helvetica').fontSize(8).text(`${formaPago} - ${(0, sat_catalogs_util_1.getFormaPagoDesc)(formaPago)}`, 38, py + 10, { width: 160, height: 12, ellipsis: true });
                doc.fillColor(textGray).font('Helvetica-Bold').fontSize(8).text('Moneda:', 208, py);
                doc.fillColor(textDark).font('Helvetica-Bold').fontSize(8).text(moneda, 208, py + 10);
                doc.roundedRect(313, y, totBoxW, totBoxH, cornerRad).fill(cardTotalsSalmon);
                let ty = y + 10;
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(11).text('Subtotal', 328, ty);
                doc.fillColor(primaryPurple).text(this.formatCurrency(subtotalNum), 430, ty, { width: 140, align: 'right' });
                ty += 18;
                doc.fillColor(primaryPurple).text('IVA 16%', 328, ty);
                doc.fillColor(primaryPurple).text(this.formatCurrency(ivaNum), 430, ty, { width: 140, align: 'right' });
                ty += 22;
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(14).text('Total', 328, ty);
                doc.text(this.formatCurrency(totalNum), 430, ty, { width: 140, align: 'right' });
                y += totBoxH + 5;
                doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(7.5).text(letras, 28, y, { width: 556, align: 'right' });
                const range = doc.bufferedPageRange();
                for (let i = 0; i < range.count; i++) {
                    doc.switchToPage(i);
                    doc.page.margins.bottom = 0;
                    const by = 612;
                    doc.moveTo(28, by).lineTo(584, by).strokeColor('#cbd5e1').lineWidth(1).stroke();
                    const qrSide = 86;
                    const qry = by + 8;
                    if (qrBuffer) {
                        doc.image(qrBuffer, 28, qry, { width: qrSide, height: qrSide });
                    }
                    else {
                        doc.roundedRect(28, qry, qrSide, qrSide, cornerRad).fill(primaryPurple);
                        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10).text('QR SAT', 28, qry + 36, { width: qrSide, align: 'center' });
                    }
                    let sy = qry;
                    const sealTextW = 450;
                    const sealX = 134;
                    const formatHashToJustifiedLines = (str, maxWidth, fontName, fontSize) => {
                        doc.font(fontName).fontSize(fontSize);
                        const lines = [];
                        let currentLine = '';
                        for (let j = 0; j < str.length; j++) {
                            const char = str[j];
                            const testLine = currentLine + char;
                            if (doc.widthOfString(testLine) > maxWidth && currentLine.length > 0) {
                                lines.push(currentLine);
                                currentLine = char;
                            }
                            else {
                                currentLine = testLine;
                            }
                        }
                        if (currentLine.length > 0)
                            lines.push(currentLine);
                        return lines;
                    };
                    const drawSeal = (title, hash) => {
                        doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(6.5).text(title, sealX, sy, { lineBreak: false });
                        doc.fillColor(textGray).font('Courier').fontSize(4.5);
                        const lines = formatHashToJustifiedLines(hash, sealTextW, 'Courier', 4.5);
                        let lineY = sy + 7.5;
                        for (const line of lines) {
                            doc.text(line, sealX, lineY, { lineBreak: false });
                            lineY += 5.2;
                        }
                        sy = lineY + 3;
                    };
                    drawSeal('Sello Digital CFDI', sello);
                    drawSeal('Sello Digital SAT', selloSat);
                    drawSeal('Cadena original del complemento de certificación digital del SAT', cadenaOriginal);
                    const fy = 738;
                    doc.moveTo(28, fy).lineTo(584, fy).strokeColor('#e2e8f0').lineWidth(1).stroke();
                    if (logoFooterSvg) {
                        try {
                            (0, svg_to_pdfkit_1.default)(doc, logoFooterSvg, 28, fy + 6, { width: 93, height: 18 });
                        }
                        catch (e) {
                            doc.roundedRect(28, fy + 8, 62, 14, 7).fill(primaryPurple);
                            doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5).text('Peguu one', 28, fy + 11.5, { width: 62, align: 'center', lineBreak: false });
                            doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(7.5).text('V1.0.', 94, fy + 11.5, { lineBreak: false });
                        }
                    }
                    else {
                        doc.roundedRect(28, fy + 8, 62, 14, 7).fill(primaryPurple);
                        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(7.5).text('Peguu one', 28, fy + 11.5, { width: 62, align: 'center', lineBreak: false });
                        doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(7.5).text('V1.0.', 94, fy + 11.5, { lineBreak: false });
                    }
                    doc.fillColor(textGray).font('Helvetica').fontSize(6.5).text('Todos los derechos reservados', 28, fy + 26, { lineBreak: false });
                    doc.fillColor(textDark).font('Helvetica-Bold').fontSize(7.0).text('Este documento es una representación impresa de un CFDI', 180, fy + 10, { width: 240, align: 'center', lineBreak: false });
                    doc.font('Helvetica').text('El registro de este documento puede ser verificado en la página de Internet del SAT', 180, fy + 20, { width: 240, align: 'center', lineBreak: false });
                    doc.fillColor(textGray).font('Helvetica').fontSize(7.5).text('Versión de CFDI: 4.0', 440, fy + 10, { width: 144, align: 'right', lineBreak: false });
                    doc.font('Helvetica-Bold').text(`Página ${i + 1} de ${range.count}`, 440, fy + 20, { width: 144, align: 'right', lineBreak: false });
                }
                doc.end();
            }
            catch (err) {
                reject(err);
            }
        });
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = PdfService_1 = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map
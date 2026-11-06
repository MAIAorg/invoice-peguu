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
            path.join(process.cwd(), 'assets', 'Logo_Peguu_One.svg'),
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
        const isTimbrado = Boolean(data.isTimbrado !== undefined ? data.isTimbrado :
            (data.uuid && data.uuid !== '80ffe330-11f7-4a59-8fe2-1a5e41d59fb4' && data.uuid !== '70aadc83-cde9-4c57-99b2-72c572150c66' && !data.isDraft && !data.es_preview));
        const uuid = isTimbrado ? (data.uuid || '') : '';
        const folioFiscalDisplay = isTimbrado ? uuid : (data.folioFiscalSat || '[ DOCUMENTO SIN VALOR FISCAL - VISTA PREVIA ]');
        const serie = isTimbrado ? (data.serie || data.comprobante?.serie || 'PGU') : 'PREV';
        const folio = isTimbrado ? String(data.folio || data.comprobante?.folio_interno || '1') : '0';
        const fecha = data.fecha || new Date().toISOString().substring(0, 19).replace('T', ' ');
        const fechaCert = data.fechaCertificacion || fecha;
        const lugarExpedicion = data.lugarExpedicion || data.emisor?.domicilio?.codigo_postal || '98053';
        const noCertificado = data.noCertificado || data.comprobante?.no_certificado || '';
        const noCertificadoSat = data.noCertificadoSat || data.no_certificado_sat || (isTimbrado ? '00001000000518812364' : '[ PENDIENTE DE TIMBRADO ]');
        const rfcPac = data.rfcPac || data.rfc_pac || (isTimbrado ? 'SNF171020F3A' : '[ PENDIENTE ]');
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
        const datosBancarios = data.datos_bancarios || data.datosBancarios || data.emisor?.datos_bancarios || data.emisor?.datosBancarios || {
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
        const defaultSelloDraft = 'DOCUMENTO SIN VALOR FISCAL - VISTA PREVIA. El sello digital del emisor se generará al timbrar ante el SAT.';
        const defaultSelloSatDraft = 'PENDIENTE DE CERTIFICACIÓN POR EL SAT / PAC.';
        const defaultCadenaDraft = '||1.1|VISTA-PREVIA-SIN-VALOR-FISCAL|FECHA-EMISION|DOCUMENTO-NO-TIMBRADO||';
        const sello = data.sello || (isTimbrado ? '' : defaultSelloDraft);
        const selloSat = data.selloSat || data.sello_sat || (isTimbrado ? '' : defaultSelloSatDraft);
        const cadenaOriginal = data.cadenaOriginal || data.cadena_original || (isTimbrado ? `||1.1|${uuid}|${fechaCert}|${rfcPac}|${sello}|${noCertificadoSat}||` : defaultCadenaDraft);
        let qrString = '';
        if (isTimbrado && uuid) {
            const last8Sello = sello.length >= 8 ? sello.substring(sello.length - 8) : '12345678';
            qrString = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${emisor.rfc}&rr=${receptor.rfc || 'XAXX010101000'}&tt=${total.toFixed(6)}&fe=${last8Sello}`;
        }
        else {
            qrString = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=00000000-0000-0000-0000-000000000000&re=${emisor.rfc || 'XAXX010101000'}&rr=${receptor.rfc || 'XAXX010101000'}&tt=${total.toFixed(6)}&fe=00000000`;
        }
        let qrDataUrl = '';
        try {
            qrDataUrl = await QRCode.toDataURL(qrString, { margin: 1, width: 120, color: { dark: '#554572', light: '#FFFFFF' } });
        }
        catch (e) {
            this.logger.warn(`No se pudo generar QR DataUrl: ${e.message}`);
        }
        const primaryPurple = '#6B569A';
        const headerDarkPill = '#544472';
        const headerCfdiPurple = '#6B569A';
        const headerClientRed = '#C33A3A';
        const cardEmisorYellow = '#E6DF52';
        const cardBancoCyan = '#64AFCA';
        const cardPaymentGreen = '#75AA49';
        const cardTotalsPink = '#DFACC3';
        const cardBgSoft = '#F0EDF6';
        const tableHeaderBg = '#9A87B6';
        const rowBgSoft = '#F0EDF6';
        const logoHeaderRaw = this.getLogoHeaderSvg();
        const logoFooterRaw = this.getLogoFooterSvg();
        const logoHeaderHtml = logoHeaderRaw ?
            `<div class="logo-box">${logoHeaderRaw}</div>` :
            `<div class="logo-fallback">Peguu</div>`;
        const logoFooterHtml = logoFooterRaw ?
            `<div class="footer-logo-box">${logoFooterRaw}</div>` :
            `<span class="pill-small">Peguu one</span>`;
        let obsVal = (receptor.observaciones || data.observaciones || data.comprobante?.observaciones || '').trim();
        if (obsVal.toUpperCase() === 'X') {
            obsVal = '';
        }
        const condPago = data.condicionesDePago || data.condiciones_de_pago || data.comprobante?.condiciones_de_pago || 'Contado';
        const renderConceptRow = (c) => {
            const itemImporte = Number(c.importe || (c.cantidad * (c.valor_unitario || c.valorUnitario || c.valor || 0)));
            const itemValor = Number(c.valor_unitario || c.valorUnitario || c.valor || 0);
            const itemIva = Number(c.iva !== undefined ? c.iva : (itemImporte * 0.16));
            const itemDesc = c.descuento ? Number(c.descuento) : 0;
            const claveProd = c.clave_prod_serv || c.claveProdServ || c.clave || '82101500';
            const codInt = c.codigo_interno || c.noIdentificacion || claveProd || 'SRV0001';
            const unidad = c.clave_unidad || c.claveUnidad || c.unidad || 'H87 - PIEZA';
            return `
      <div class="concept-block">
        <div class="concept-main">
          <div class="c-codes">
            <div class="c-code-line"><strong>CÓDIGO:</strong> ${codInt}</div>
            <div class="c-code-line"><strong>UNIDAD:</strong> ${unidad}</div>
            <div class="c-code-line"><strong>CÓDIGO SAT:</strong> ${claveProd}</div>
          </div>
          <div class="c-desc">${c.descripcion || 'Producto'}</div>
          <div class="c-obj">${c.objetoImp || c.objeto_imp || '02 - Sí objeto de impuesto'}</div>
          <div class="c-val">${this.formatCurrency(itemValor)}</div>
          <div class="c-cant">${this.formatQuantity(c.cantidad || 1)}</div>
          <div class="c-imp">${this.formatCurrency(itemImporte)}</div>
          <div class="c-discount">${itemDesc > 0 ? this.formatCurrency(itemDesc) : ''}</div>
        </div>
        <div class="concept-tax">
          <span>Traslado Impuesto: <strong>IVA</strong></span>
          <span>Tipo de factor: <strong>Tasa</strong></span>
          <span>Tasa o cuota: <strong>0.160000</strong></span>
          <span>Base: <strong>${this.formatCurrency(itemImporte)}</strong></span>
          <span>Importe: <strong>${this.formatCurrency(itemIva)}</strong></span>
        </div>
      </div>`;
        };
        const pages = [];
        let currentPageConceptos = [];
        let currentY = 327 + 17;
        const pageBreakLimit = 605;
        for (let i = 0; i < conceptos.length; i++) {
            const c = conceptos[i];
            if (currentY + 50 > pageBreakLimit && currentPageConceptos.length > 0) {
                pages.push({ conceptos: currentPageConceptos, hasTotals: false });
                currentPageConceptos = [c];
                currentY = 70 + 17 + 49;
            }
            else {
                currentPageConceptos.push(c);
                currentY += 49;
            }
        }
        if (currentY + 60 > pageBreakLimit && currentPageConceptos.length > 0) {
            pages.push({ conceptos: currentPageConceptos, hasTotals: false });
            pages.push({ conceptos: [], hasTotals: true });
        }
        else {
            pages.push({ conceptos: currentPageConceptos, hasTotals: true });
        }
        const totalPages = pages.length;
        const benefFontSize = (datosBancarios.beneficiario || emisor.nombre || '').length > 25 ? '5.2pt' : '6.2pt';
        const pagesHtml = pages.map((p, pageIndex) => {
            const pageNum = pageIndex + 1;
            const pageConceptsHtml = p.conceptos.map(renderConceptRow).join('');
            const tableTopPt = pageIndex === 0 ? 327 : 70;
            const topSectionHtml = (pageIndex === 0) ? `
        <!-- 1. CABECERA FULL-BLEED MORADA (0 a 147pt) -->
        <div class="header-banner">
          <div class="header-logo">${logoHeaderHtml}</div>
          <div class="factura-pill">Factura</div>
        </div>

        <!-- 2. TARJETAS SUPERIORES (Fondo inclinado, textos rectos 0deg igual que en PDFKit) -->
        <div class="emisor-bg-skew"></div>
        <div class="emisor-text-layer">
          <div class="em-nombre">${String(emisor.nombre || '').toUpperCase()}</div>
          <div class="em-rfc">RFC: ${emisor.rfc}</div>
          <div class="em-reg-lbl">RÉGIMEN FISCAL</div>
          <div class="em-reg-val">${emisor.regimen} - ${(0, sat_catalogs_util_1.getRegimenDesc)(emisor.regimen)}</div>
          <div class="em-dir-lbl">DIRECCIÓN</div>
          <div class="em-dir-val">${emisor.direccion || `C.P. ${lugarExpedicion}`}</div>
        </div>

        <div class="banco-bg-skew"></div>
        <div class="banco-text-layer">
          <div class="b-lbl" style="left: 318pt; top: 91pt;">MÉTODO DE PAGO:</div>
          <div class="b-val" style="left: 318pt; top: 99pt;">${metodoPago}</div>
          <div class="b-lbl" style="left: 318pt; top: 109pt;">BANCO:</div>
          <div class="b-val" style="left: 318pt; top: 117pt;">${datosBancarios.banco || 'BANAMEX'}</div>
          <div class="b-lbl" style="left: 318pt; top: 127pt;">BENEFICIARIO:</div>
          <div class="b-val" style="left: 318pt; top: 135pt; font-size: ${benefFontSize};">${datosBancarios.beneficiario || emisor.nombre || ''}</div>
          <div class="b-lbl" style="left: 318pt; top: 145pt;">CUENTA:</div>
          <div class="b-val" style="left: 318pt; top: 152pt;">${datosBancarios.cuenta || ''}</div>

          <div class="b-lbl" style="left: 450pt; top: 91pt;">CLABE:</div>
          <div class="b-val" style="left: 450pt; top: 99pt;">${datosBancarios.clabe || ''}</div>
          <div class="b-lbl" style="left: 450pt; top: 109pt;">MONEDA:</div>
          <div class="b-val" style="left: 450pt; top: 117pt;">${moneda}</div>
          <div class="b-lbl" style="left: 450pt; top: 127pt;">CONDICIONES:</div>
          <div class="b-val" style="left: 450pt; top: 135pt;">${condPago}</div>
        </div>

        <!-- 3. RECUADROS MEDIOS CON PASTILLAS FLOTANTES (178pt a 314pt) -->
        <!-- Izquierdo: Información del cliente -->
        <div class="mid-card-left"></div>
        <div class="pill-client">Información del cliente</div>
        <svg class="sparkle-svg" viewBox="185 171 15 18">
          <path d="M 191.82 172.99 L 186.99 178.40 L 188.11 179.39 L 192.93 173.98 Z" fill="#DFADC4"/>
          <path d="M 196.55 179.02 L 189.88 181.88 L 190.47 183.25 L 197.14 180.39 Z" fill="#DFADC4"/>
          <path d="M 191.04 186.25 L 190.99 187.74 L 198.23 187.99 L 198.28 186.50 Z" fill="#DFADC4"/>
        </svg>

        <div class="c-field-lbl" style="left: 38pt; top: 208pt;">RFC:</div>
        <div class="c-field-val" style="left: 115pt; top: 208pt; width: 175pt;">${receptor.rfc}</div>

        <div class="c-field-lbl" style="left: 38pt; top: 219pt;">NOMBRE:</div>
        <div class="c-field-val" style="left: 115pt; top: 219pt; width: 175pt;">${receptor.nombre}</div>

        <div class="c-field-lbl" style="left: 38pt; top: 235pt;">RÉGIMEN FISCAL:</div>
        <div class="c-field-val" style="left: 115pt; top: 235pt; width: 175pt;">${receptor.regimen || '601'} - ${(0, sat_catalogs_util_1.getRegimenDesc)(receptor.regimen || '601')}</div>

        <div class="c-field-lbl" style="left: 38pt; top: 251pt;">DIRECCIÓN FISCAL:</div>
        <div class="c-field-val" style="left: 115pt; top: 251pt; width: 175pt;">${receptor.direccion || (receptor.cp ? `C.P. ${receptor.cp}` : '')}</div>

        <div class="c-field-lbl" style="left: 38pt; top: 267pt;">OBSERVACIONES:</div>
        <div class="c-field-val" style="left: 115pt; top: 267pt; width: 175pt;">${obsVal}</div>

        <div class="c-field-lbl" style="left: 38pt; top: 278pt;">CUENTA:</div>
        <div class="c-field-val" style="left: 115pt; top: 278pt; width: 175pt;">${datosBancarios.cuenta || '000000000000'}</div>

        <div class="c-field-lbl" style="left: 38pt; top: 292pt;">USO DE CFDI:</div>
        <div class="c-field-val" style="left: 38pt; top: 300pt; width: 125pt;">${receptor.uso || 'G03'} - ${(0, sat_catalogs_util_1.getUsoCfdiDesc)(receptor.uso || 'G03')}</div>

        <div class="c-field-lbl" style="left: 170pt; top: 292pt;">Orden(es) de venta</div>
        <div class="c-field-val" style="left: 170pt; top: 300pt; width: 120pt;">${receptor.orden_venta || ''}</div>

        <!-- Derecho: Comprobante fiscal digital internet -->
        <div class="mid-card-right"></div>
        <div class="pill-cfdi">Comprobante fiscal digital internet</div>
        <svg class="star-svg" viewBox="529 170 23 23">
          <path d="M 541.16 171.42 L 542.02 173.28 C 542.11 173.46 542.33 173.50 542.48 173.37 L 544.02 172.03 C 544.49 171.62 545.21 171.94 545.22 172.57 L 545.26 174.62 C 545.26 174.81 545.45 174.95 545.63 174.89 L 547.59 174.29 C 548.18 174.12 548.70 174.70 548.47 175.27 L 547.67 177.16 C 547.59 177.34 547.71 177.55 547.90 177.57 L 549.92 177.83 C 550.53 177.90 550.78 178.66 550.33 179.09 L 548.84 180.49 C 548.70 180.63 548.72 180.86 548.89 180.96 L 550.64 182.01 C 551.17 182.34 551.09 183.13 550.51 183.33 L 548.58 184.00 C 548.39 184.06 548.32 184.29 548.43 184.44 L 549.60 186.13 C 549.96 186.64 549.56 187.33 548.94 187.28 L 546.91 187.10 C 546.71 187.08 546.56 187.25 546.59 187.45 L 546.98 189.46 C 547.10 190.07 546.46 190.54 545.92 190.24 L 544.13 189.24 C 543.96 189.15 543.75 189.24 543.71 189.43 L 543.25 191.43 C 543.11 192.03 542.33 192.20 541.96 191.70 L 540.73 190.06 C 540.61 189.91 540.39 189.91 540.27 190.06 L 539.04 191.70 C 538.67 192.20 537.90 192.03 537.75 191.43 L 537.29 189.43 C 537.25 189.24 537.04 189.15 536.87 189.24 L 535.08 190.24 C 534.54 190.54 533.91 190.07 534.02 189.46 L 534.41 187.45 C 534.44 187.26 534.29 187.08 534.09 187.10 L 532.06 187.28 C 531.45 187.33 531.05 186.64 531.40 186.13 L 532.57 184.44 C 532.68 184.28 532.61 184.06 532.42 184.00 L 530.49 183.33 C 529.91 183.12 529.82 182.33 530.36 182.01 L 532.11 180.96 C 532.28 180.86 532.30 180.63 532.16 180.49 L 530.67 179.09 C 530.22 178.66 530.47 177.90 531.08 177.83 L 533.10 177.57 C 533.30 177.55 533.41 177.34 533.33 177.16 L 532.53 175.27 C 532.30 174.70 532.82 174.11 533.41 174.29 L 535.37 174.89 C 535.56 174.95 535.74 174.81 535.74 174.62 L 535.78 172.57 C 535.79 171.94 536.51 171.62 536.98 172.03 L 538.52 173.37 C 538.67 173.50 538.89 173.45 538.98 173.28 L 539.84 171.42 C 540.11 170.86 540.90 170.86 541.16 171.42 Z" fill="#EAE161"/>
        </svg>

        <div class="c-field-lbl" style="left: 323pt; top: 208pt; font-size: 7.2pt;">SERIE:</div>
        <div class="c-field-val" style="left: 353pt; top: 207.2pt; font-size: 8.5pt; font-weight: 800; color: ${isTimbrado ? '#1E293B' : '#c2410c'};">${serie}</div>
        <div class="c-field-lbl" style="left: 384pt; top: 208pt; font-size: 7.2pt;">FOLIO:</div>
        <div class="c-field-val" style="left: 414pt; top: 207.2pt; font-size: 8.5pt; font-weight: 800; color: ${isTimbrado ? '#1E293B' : '#c2410c'};">${folio}</div>
        <div class="c-field-lbl" style="left: 445pt; top: 208pt; font-size: 6.2pt;">FECHA DE EMISIÓN:</div>
        <div class="c-field-val" style="left: 514pt; top: 208pt; font-size: 6.2pt;">${fecha}</div>

        <div class="c-field-lbl" style="left: 323pt; top: 225pt; font-size: 6.0pt;">LUGAR DE EXPEDICIÓN:</div>
        <div class="c-field-val" style="left: 323pt; top: 232pt; font-size: 6.5pt;">${lugarExpedicion}</div>
        <div class="c-field-lbl" style="left: 445pt; top: 225pt; font-size: 6.0pt;">TIPO DE COMPROBANTE:</div>
        <div class="c-field-val" style="left: 445pt; top: 232pt; font-size: 6.5pt;">${data.tipo || 'I'} - Ingreso</div>

        <div class="c-field-lbl" style="left: 323pt; top: 245pt; font-size: 6.0pt;">CERTIFICADO EMISOR:</div>
        <div class="c-field-val" style="left: 323pt; top: 252pt; font-size: 6.5pt;">${noCertificado}</div>
        <div class="c-field-lbl" style="left: 445pt; top: 245pt; font-size: 6.0pt;">FECHA DE CERTIFICACIÓN:</div>
        <div class="c-field-val" style="left: 445pt; top: 252pt; font-size: 6.5pt; ${!isTimbrado ? 'font-style: italic; color: #64748b;' : ''}">${isTimbrado ? fechaCert : '[ PENDIENTE ]'}</div>

        <div class="c-field-lbl" style="left: 323pt; top: 265pt; font-size: 6.0pt;">FOLIO FISCAL SAT:</div>
        <div class="c-field-val" style="left: 323pt; top: 272pt; width: 250pt; font-size: ${isTimbrado ? '6.5pt' : '5.5pt'}; font-weight: ${isTimbrado ? '600' : '800'}; color: ${isTimbrado ? '#1E293B' : '#c2410c'};">${folioFiscalDisplay}</div>

        <div class="c-field-lbl" style="left: 323pt; top: 284pt; font-size: 6.0pt;">CERTIFICADO SAT:</div>
        <div class="c-field-val" style="left: 323pt; top: 291pt; font-size: 6.5pt; ${!isTimbrado ? 'font-style: italic; color: #64748b;' : ''}">${isTimbrado ? noCertificadoSat : '[ PENDIENTE ]'}</div>
        <div class="c-field-lbl" style="left: 445pt; top: 284pt; font-size: 6.0pt;">RFC DEL PAC:</div>
        <div class="c-field-val" style="left: 445pt; top: 291pt; font-size: 6.5pt; font-weight: 800;">${isTimbrado ? rfcPac : '[ PENDIENTE ]'}</div>
      ` : `
        <!-- CABECERA DE CONTINUACIÓN (PÁGINA 2+: 0 a 58pt) -->
        <div class="continuation-header">
          <div class="cont-logo">${logoHeaderHtml}</div>
          <div class="cont-info">
            <div class="cont-serie-folio">SERIE: <strong style="${!isTimbrado ? 'color: #f97316;' : ''}">${serie}</strong> &nbsp;&nbsp; FOLIO: <strong style="${!isTimbrado ? 'color: #f97316;' : ''}">${folio}</strong></div>
            <div class="cont-uuid">FOLIO FISCAL SAT: ${folioFiscalDisplay}</div>
          </div>
          <div class="cont-pill">Factura</div>
        </div>
      `;
            return `
      <!-- HOJA ${pageNum} DE ${totalPages} -->
      <div class="invoice-page">
        ${topSectionHtml}

        <!-- 4. TABLA DE CONCEPTOS Y TOTALES (Inicia en ${tableTopPt}pt) -->
        <div class="table-zone" style="top: ${tableTopPt}pt;">
          ${p.conceptos.length > 0 ? `
          <div class="table-header-bar">
            <div class="th-desc">DESCRIPCIÓN</div>
            <div class="th-obj">OBJETO IMPUESTO</div>
            <div class="th-val">VALOR UNITARIO</div>
            <div class="th-cant">CANTIDAD</div>
            <div class="th-imp">IMPORTE</div>
            <div class="th-disc">DESCUENTO</div>
          </div>
          ${pageConceptsHtml}
          ` : ''}

          ${p.hasTotals ? `
          <!-- 5. TOTALES Y FORMAS DE PAGO (42pt de alto) -->
          <div class="totals-zone">
            <div class="pay-card">
              <div class="pay-line"><strong>Método de pago:</strong> ${metodoPago} - ${(0, sat_catalogs_util_1.getMetodoPagoDesc)(metodoPago)}</div>
              <div class="pay-line"><strong>Forma de pago:</strong> ${formaPago} - ${(0, sat_catalogs_util_1.getFormaPagoDesc)(formaPago)}</div>
              <div class="pay-line"><strong>Moneda:</strong> ${moneda}</div>
            </div>
            <div class="tot-card">
              <div class="tot-sub-lbl">Subtotal</div>
              <div class="tot-sub-val">${this.formatCurrency(subTotal)}</div>
              <div class="tot-iva-lbl">IVA 16%</div>
              <div class="tot-iva-val">${this.formatCurrency(totalIva)}</div>
              <div class="tot-big">Total ${this.formatCurrency(total)}</div>
            </div>
          </div>
          <div class="words-box">${letras}</div>
          ` : ''}
        </div>

        <!-- 6. TIMBRE FISCAL SAT FIJO (Inicia en y=612pt en todas las páginas) -->
        <div class="sat-divider"></div>
        <div class="sat-qr-box">
          ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR SAT">` : '<div style="background:#554572;color:#fff;height:100%;display:flex;align-items:center;justify-content:center;font-weight:800;">QR SAT</div>'}
        </div>
        <div class="sat-seals-box">
          <div class="sat-title">Sello Digital CFDI</div>
          <div class="sat-hash" style="${!isTimbrado ? 'font-style: italic; font-size: 5.5pt; font-family: sans-serif;' : ''}">${sello}</div>
          <div class="sat-title">Sello Digital SAT</div>
          <div class="sat-hash" style="${!isTimbrado ? 'font-style: italic; font-size: 5.5pt; font-family: sans-serif;' : ''}">${selloSat}</div>
          <div class="sat-title">Cadena original del complemento de certificación digital del SAT</div>
          <div class="sat-hash" style="${!isTimbrado ? 'font-size: 5.2pt;' : ''}">${cadenaOriginal}</div>
        </div>

        <!-- 7. PIE DE PÁGINA MORADO OFICIAL FULL-BLEED (y=711pt a 792pt) -->
        <div class="footer-banner">
          <div class="footer-logo">${logoFooterHtml}</div>
          <div class="footer-rights">Todos los derechos reservados</div>
          <div class="footer-center-1">Este documento es una representación impresa de un CFDI</div>
          <div class="footer-center-2">El registro de este documento puede ser verificado en la página de Internet del SAT</div>
          <div class="footer-right-1">Versión de CFDI: 4.0</div>
          <div class="footer-right-2">PÁG. ${String(pageNum).padStart(2, '0')} DE ${String(totalPages).padStart(2, '0')}</div>
        </div>
      </div>
      `;
        }).join('');
        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${isTimbrado ? `Factura ${serie}-${folio} - ${uuid}` : `Factura (VISTA PREVIA) - [SIN VALOR FISCAL]`}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: letter; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Helvetica, Arial, 'Nunito', sans-serif;
      color: #1E293B;
      background: #525659;
      padding: 24px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Lienzo exacto tamaño Carta: 612pt x 792pt (816px x 1056px) idéntico a PDFKit */
    .invoice-page {
      width: 612pt;
      height: 792pt;
      min-height: 792pt;
      background: #FFFFFF;
      box-shadow: 0 8px 30px rgba(0,0,0,0.32);
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }

    @media print {
      body {
        background: transparent;
        padding: 0;
        gap: 0;
      }
      .invoice-page {
        box-shadow: none;
        margin: 0;
        page-break-after: always;
        page-break-inside: avoid;
      }
    }

    /* 1. CABECERA SUPERIOR (0 a 147pt) */
    .header-banner {
      position: absolute;
      left: 0;
      top: 0;
      width: 612pt;
      height: 147pt;
      background: ${primaryPurple};
    }
    .header-logo {
      position: absolute;
      left: 30pt;
      top: 24pt;
      width: 115pt;
      height: 40.11pt;
    }
    .header-logo .logo-box svg {
      width: 115pt;
      height: 40.11pt;
      display: block;
    }
    .factura-pill {
      position: absolute;
      left: 476pt;
      top: 21pt;
      width: 108pt;
      height: 36pt;
      border-radius: 18pt;
      background: ${headerDarkPill};
      color: #FFFFFF;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 21pt;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    /* CABECERA DE CONTINUACIÓN (PÁGINA 2+: 0 a 58pt) */
    .continuation-header {
      position: absolute;
      left: 0;
      top: 0;
      width: 612pt;
      height: 58pt;
      background: ${primaryPurple};
    }
    .cont-logo {
      position: absolute;
      left: 30pt;
      top: 14pt;
      width: 85.1pt;
      height: 29.1pt;
    }
    .cont-logo .logo-box svg {
      width: 85.1pt;
      height: 29.1pt;
      display: block;
    }
    .cont-info {
      position: absolute;
      left: 150pt;
      top: 22pt;
      width: 300pt;
      text-align: right;
      color: #E9D5FF;
    }
    .cont-serie-folio {
      font-weight: 700;
      font-size: 6.8pt;
      margin-bottom: 2pt;
    }
    .cont-uuid {
      font-size: 5.8pt;
    }
    .cont-pill {
      position: absolute;
      left: 476pt;
      top: 12pt;
      width: 108pt;
      height: 34pt;
      border-radius: 17pt;
      background: ${headerDarkPill};
      color: #FFFFFF;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 19pt;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    /* 2. TARJETAS SUPERIORES (Emisor y Banco) */
    .emisor-bg-skew {
      position: absolute;
      left: 29.4pt;
      top: 82pt;
      width: 272pt;
      height: 83.4pt;
      border-radius: 6pt;
      background: ${cardEmisorYellow};
      transform: rotate(-0.82deg);
      transform-origin: 135.6pt 41pt;
    }
    .emisor-text-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .em-nombre {
      position: absolute;
      left: 38pt;
      top: 91pt;
      width: 165pt;
      font-size: 7.5pt;
      font-weight: 700;
      color: #2D1F3F;
      line-height: 1.15;
    }
    .em-rfc {
      position: absolute;
      left: 204pt;
      top: 91pt;
      width: 90pt;
      text-align: right;
      font-size: 7.2pt;
      font-weight: 700;
      color: #2D1F3F;
    }
    .em-reg-lbl {
      position: absolute;
      left: 38pt;
      top: 112pt;
      font-size: 6.5pt;
      font-weight: 700;
      color: #2D1F3F;
    }
    .em-reg-val {
      position: absolute;
      left: 38pt;
      top: 121pt;
      width: 255pt;
      font-size: 6.5pt;
      color: #2D1F3F;
    }
    .em-dir-lbl {
      position: absolute;
      left: 38pt;
      top: 134pt;
      font-size: 6.5pt;
      font-weight: 700;
      color: #2D1F3F;
    }
    .em-dir-val {
      position: absolute;
      left: 38pt;
      top: 143pt;
      width: 255pt;
      font-size: 6.5pt;
      color: #2D1F3F;
      line-height: 1.15;
    }

    .banco-bg-skew {
      position: absolute;
      left: 309.5pt;
      top: 82.6pt;
      width: 272.2pt;
      height: 82.5pt;
      border-radius: 6pt;
      background: ${cardBancoCyan};
      transform: rotate(1.00deg);
      transform-origin: 135.5pt 40.4pt;
    }
    .banco-text-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .b-lbl {
      position: absolute;
      width: 125pt;
      font-size: 6.0pt;
      font-weight: 700;
      color: #03045E;
    }
    .b-val {
      position: absolute;
      width: 125pt;
      font-size: 6.2pt;
      color: #03045E;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* 3. RECUADROS MEDIOS CON PASTILLAS FLOTANTES */
    .mid-card-left {
      position: absolute;
      left: 30pt;
      top: 196pt;
      width: 271pt;
      height: 118pt;
      border-radius: 8pt;
      background: ${cardBgSoft};
    }
    .pill-client {
      position: absolute;
      left: 36.9pt;
      top: 178pt;
      width: 150.2pt;
      height: 26pt;
      border-radius: 10pt;
      background: ${headerClientRed};
      color: #FFFFFF;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 11.5pt;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sparkle-svg {
      position: absolute;
      left: 185pt;
      top: 171pt;
      width: 15pt;
      height: 18pt;
    }

    .mid-card-right {
      position: absolute;
      left: 311pt;
      top: 196pt;
      width: 271pt;
      height: 118pt;
      border-radius: 8pt;
      background: ${cardBgSoft};
    }
    .pill-cfdi {
      position: absolute;
      left: 317.9pt;
      top: 178pt;
      width: 220.2pt;
      height: 26pt;
      border-radius: 10pt;
      background: ${headerCfdiPurple};
      color: #FFFFFF;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 11.5pt;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .star-svg {
      position: absolute;
      left: 529pt;
      top: 170pt;
      width: 23pt;
      height: 23pt;
    }

    .c-field-lbl {
      position: absolute;
      font-size: 6.8pt;
      font-weight: 700;
      color: ${headerDarkPill};
      line-height: 1.1;
    }
    .c-field-val {
      position: absolute;
      font-size: 6.8pt;
      color: #1E293B;
      line-height: 1.1;
    }

    /* 4. TABLA DE CONCEPTOS (Coordenadas exactas PDFKit: 49pt por concepto) */
    .table-zone {
      position: absolute;
      left: 29pt;
      width: 552pt;
    }
    .table-header-bar {
      position: relative;
      width: 552pt;
      height: 17pt;
      border-radius: 5pt;
      background: ${tableHeaderBg};
      color: #FFFFFF;
      font-size: 6.8pt;
      font-weight: 700;
    }
    .th-desc { position: absolute; left: 131pt; top: 4.5pt; width: 125pt; }
    .th-obj  { position: absolute; left: 266pt; top: 4.5pt; width: 75pt; }
    .th-val  { position: absolute; left: 341pt; top: 4.5pt; width: 58pt; text-align: right; }
    .th-cant { position: absolute; left: 406pt; top: 4.5pt; width: 40pt; text-align: right; }
    .th-imp  { position: absolute; left: 451pt; top: 4.5pt; width: 40pt; text-align: right; }
    .th-disc { position: absolute; left: 499pt; top: 4.5pt; width: 48pt; text-align: center; }

    .concept-block {
      width: 552pt;
      height: 49pt;
      position: relative;
    }
    .concept-main {
      width: 552pt;
      height: 30pt;
      background: ${rowBgSoft};
      position: relative;
      color: ${headerDarkPill};
    }
    .c-codes {
      position: absolute;
      left: 5pt;
      top: 2pt;
      width: 120pt;
      font-size: 6.2pt;
      line-height: 9pt;
    }
    .c-code-line {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .c-desc {
      position: absolute;
      left: 131pt;
      top: 2.5pt;
      width: 125pt;
      height: 26pt;
      overflow: hidden;
      font-weight: 700;
      font-size: 6.8pt;
      line-height: 1.15;
    }
    .c-obj {
      position: absolute;
      left: 266pt;
      top: 2.5pt;
      width: 75pt;
      font-size: 6.5pt;
      line-height: 1.15;
    }
    .c-val {
      position: absolute;
      left: 341pt;
      top: 2.5pt;
      width: 58pt;
      text-align: right;
      font-size: 6.5pt;
    }
    .c-cant {
      position: absolute;
      left: 406pt;
      top: 2.5pt;
      width: 40pt;
      text-align: right;
      font-size: 6.5pt;
    }
    .c-imp {
      position: absolute;
      left: 451pt;
      top: 2.5pt;
      width: 40pt;
      text-align: right;
      font-size: 6.5pt;
    }
    .c-discount {
      position: absolute;
      left: 499pt;
      top: 2.5pt;
      width: 48pt;
      text-align: center;
      font-size: 6.5pt;
    }

    .concept-tax {
      width: 552pt;
      height: 16pt;
      background: #FFFFFF;
      border-bottom: 1pt solid #e2e8f0;
      padding-left: 5pt;
      display: flex;
      align-items: center;
      gap: 14pt;
      font-size: 6.5pt;
      color: ${headerDarkPill};
    }

    /* 5. TOTALES Y FORMAS DE PAGO (42pt de alto) */
    .totals-zone {
      margin-top: 4pt;
      width: 552pt;
      height: 42pt;
      position: relative;
    }
    .pay-card {
      position: absolute;
      left: 2pt;
      top: 0;
      width: 271pt;
      height: 42pt;
      border-radius: 6pt;
      background: ${cardPaymentGreen};
      color: #FFFFFF;
      padding: 5pt 9pt;
      font-size: 6.5pt;
      line-height: 11pt;
    }
    .pay-line {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tot-card {
      position: absolute;
      left: 283pt;
      top: 0;
      width: 271pt;
      height: 42pt;
      border-radius: 6pt;
      background: ${cardTotalsPink};
      color: ${headerDarkPill};
    }
    .tot-sub-lbl { position: absolute; left: 12pt; top: 7pt; font-size: 7.5pt; font-weight: 700; }
    .tot-sub-val { position: absolute; left: 58pt; top: 7pt; width: 75pt; text-align: right; font-size: 7.5pt; font-weight: 700; }
    .tot-iva-lbl { position: absolute; left: 12pt; top: 21pt; font-size: 7.5pt; font-weight: 700; }
    .tot-iva-val { position: absolute; left: 58pt; top: 21pt; width: 75pt; text-align: right; font-size: 7.5pt; font-weight: 700; }
    .tot-big     { position: absolute; left: 128pt; top: 13pt; width: 135pt; text-align: right; font-size: 14pt; font-weight: 700; }

    .words-box {
      margin-top: 4pt;
      width: 554pt;
      text-align: right;
      font-size: 6.8pt;
      font-weight: 700;
      color: ${headerDarkPill};
    }

    /* 6. BLOQUE FISCAL SAT FIJO (y=612pt a 711pt) */
    .sat-divider {
      position: absolute;
      left: 28pt;
      top: 612pt;
      width: 556pt;
      border-top: 1pt solid #cbd5e1;
    }
    .sat-qr-box {
      position: absolute;
      left: 28pt;
      top: 618pt;
      width: 84pt;
      height: 84pt;
    }
    .sat-qr-box img {
      width: 84pt;
      height: 84pt;
      display: block;
    }
    .sat-seals-box {
      position: absolute;
      left: 132pt;
      top: 618pt;
      width: 452pt;
    }
    .sat-title {
      font-size: 6.5pt;
      font-weight: 700;
      color: ${headerDarkPill};
      line-height: 1.1;
      margin-bottom: 1pt;
    }
    .sat-hash {
      font-family: 'Courier New', Courier, monospace;
      font-size: 4.5pt;
      color: #475569;
      line-height: 5.2pt;
      word-break: break-all;
      margin-bottom: 3pt;
    }

    /* 7. PIE DE PÁGINA MORADO OFICIAL FULL-BLEED (y=711pt a 792pt) */
    .footer-banner {
      position: absolute;
      left: 0;
      top: 711pt;
      width: 612pt;
      height: 81pt;
      background: ${primaryPurple};
      color: #FFFFFF;
    }
    .footer-logo {
      position: absolute;
      left: 30pt;
      top: 16pt;
      width: 105pt;
      height: 20pt;
    }
    .footer-logo .footer-logo-box svg {
      width: 105pt;
      height: 20pt;
      display: block;
    }
    .footer-rights {
      position: absolute;
      left: 30pt;
      top: 41pt;
      font-size: 7.5pt;
    }
    .footer-center-1 {
      position: absolute;
      left: 160pt;
      top: 16pt;
      width: 280pt;
      text-align: center;
      font-size: 6.8pt;
      font-weight: 700;
    }
    .footer-center-2 {
      position: absolute;
      left: 160pt;
      top: 28pt;
      width: 280pt;
      text-align: center;
      font-size: 5.8pt;
    }
    .footer-right-1 {
      position: absolute;
      left: 445pt;
      top: 16pt;
      width: 139pt;
      text-align: right;
      font-size: 6.8pt;
    }
    .footer-right-2 {
      position: absolute;
      left: 445pt;
      top: 28pt;
      width: 139pt;
      text-align: right;
      font-size: 7.5pt;
      font-weight: 700;
    }
  </style>
</head>
<body>

  ${pagesHtml}

</body>
</html>`;
    }
    async generateInvoicePdfBuffer(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const isTimbrado = Boolean(data.isTimbrado !== undefined ? data.isTimbrado :
                    (data.uuid && data.uuid !== '80ffe330-11f7-4a59-8fe2-1a5e41d59fb4' && data.uuid !== '70aadc83-cde9-4c57-99b2-72c572150c66' && !data.isDraft && !data.es_preview));
                const uuid = isTimbrado ? (data.uuid || '') : '';
                const folioFiscalDisplay = isTimbrado ? uuid : (data.folioFiscalSat || '[ DOCUMENTO SIN VALOR FISCAL - VISTA PREVIA ]');
                const serie = isTimbrado ? (data.serie || data.comprobante?.serie || 'PGU') : 'PREV';
                const folio = isTimbrado ? String(data.folio || data.comprobante?.folio_interno || '1') : '0';
                const doc = new pdfkit_1.default({
                    size: 'LETTER',
                    margins: { top: 28, left: 28, right: 28, bottom: 65 },
                    bufferPages: true,
                    info: {
                        Title: isTimbrado ? `Factura ${serie}-${folio} - ${uuid}` : `Factura (VISTA PREVIA) - [SIN VALOR FISCAL]`,
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
                const nunitoCandidates = [
                    path.join(process.cwd(), 'assets', 'fonts', 'Nunito-Bold.ttf'),
                    path.join(process.cwd(), 'assets', 'fonts', 'Nunito.ttf'),
                    path.join(__dirname, '..', '..', 'assets', 'fonts', 'Nunito-Bold.ttf'),
                    path.join(__dirname, '..', '..', 'assets', 'fonts', 'Nunito.ttf'),
                    'C:/Datos/Proyectos Antigravity/Peguu/peguu-one-api/assets/fonts/Nunito-Bold.ttf',
                    'C:/Datos/Proyectos Antigravity/Peguu/peguu-one-api/assets/fonts/Nunito.ttf'
                ];
                let nunitoFont = 'Helvetica-Bold';
                for (const p of nunitoCandidates) {
                    if (fs.existsSync(p)) {
                        try {
                            doc.registerFont('Nunito', p);
                            nunitoFont = 'Nunito';
                            break;
                        }
                        catch (e) { }
                    }
                }
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
                const ordenVentaVal = data.orden_venta || data.ordenVenta || recObj.orden_venta || recObj.orden_compra || data.comprobante?.orden_venta || 'ODV-1918';
                const receptor = {
                    rfc: recObj.rfc || '',
                    nombre: recObj.nombre || recObj.razon_social || '',
                    regimen: receptorRegimen,
                    cp: receptorCp,
                    uso: receptorUso,
                    direccion: receptorDireccion,
                    observaciones: recObj.observaciones || '',
                    orden_venta: ordenVentaVal,
                };
                const rawBancarios = data.datos_bancarios || data.datosBancarios || data.emisor?.datos_bancarios || data.emisor?.datosBancarios || {};
                const datosBancarios = {
                    banco: rawBancarios.banco && rawBancarios.banco !== 'BANCO:' ? rawBancarios.banco : 'BANAMEX',
                    beneficiario: rawBancarios.beneficiario && rawBancarios.beneficiario !== 'BENEFICIARIO:' ? rawBancarios.beneficiario : emisor.nombre,
                    cuenta: rawBancarios.cuenta && rawBancarios.cuenta !== 'CUENTA:' ? rawBancarios.cuenta : '1234567890',
                    clabe: rawBancarios.clabe && rawBancarios.clabe !== 'CLABE:' ? rawBancarios.clabe : '012180001234567890',
                    banco2: rawBancarios.banco2 || rawBancarios.banco_secundario || '',
                    cuenta2: rawBancarios.cuenta2 || rawBancarios.cuenta_secundaria || '',
                    clabe2: rawBancarios.clabe2 || rawBancarios.clabe_secundaria || '',
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
                const defaultSelloDraft = 'DOCUMENTO SIN VALOR FISCAL - VISTA PREVIA. El sello digital del emisor se generará al timbrar ante el SAT.';
                const defaultSelloSatDraft = 'PENDIENTE DE CERTIFICACIÓN POR EL SAT / PAC.';
                const defaultCadenaDraft = '||1.1|VISTA-PREVIA-SIN-VALOR-FISCAL|FECHA-EMISION|DOCUMENTO-NO-TIMBRADO||';
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
                    sello = isTimbrado ? 'qk3IjvyQqau/pMSSLH00rIgEo8+El7w8Z4fLPkVnLmYPWHKIlCBjS7h62clSC+ils+m3hyV2FEdCSXGBslOLbPAQdVVf7+JtjeKkwFG2um/yEpHf3/eYfRqlIPjw3SPw+4bAMHzSspqo3refcIjeTuUrbGsdovwrwTLOYNOQlO6lGrzS0M/cYTDEih5cyYfEcVcbALsKqVrUP7AccF9ySkIfFk/RNdAAu6VxlDsqGN4z9BiItny4WbAcArj54e8bvmtvUc0mw668IwoQ9Flm8YdPo4t/thPwLtt/X98aPpHHEUTPcgIA+6PNJ/oR2jPYuOpGg2RyGwL4iFuE2e0MYyDZw==' : defaultSelloDraft;
                if (!selloSat)
                    selloSat = isTimbrado ? 'SQp740UOclyc0y91lOUzOoXH3j+EVDHMkwMIgCO7tzcuuYkoV5UItqvGZ2jvYVppCPGnPHfF5rNxgpJZ2iYsrUJSSMhamYVrIBIF2IGKA8UMEa3/UrL5s57Os4vmabUwykzvLiTpnx23rYokVfIxL54r9UFcJyU/j5CTykd0qr9vpT0JYdqvW9Cu3WbOPiQ4WzIMVFCzKBlU7VM3Zun94/RIz0LQDD7hi43qaQf6UeK8SDvXeDPPNQuDUKSXHX/M+KBddABvHPPgdeQiDBY1LwNNv1YLZAajy9uVrI/qt7xjb/kKhwiB/KqnGYmq487a+rAG26DmTx3bAcSUw+PFxw==' : defaultSelloSatDraft;
                const cadenaOriginal = data.cadenaOriginal || data.cadena_original || (isTimbrado ? `||1.1|${uuid}|${fechaCert}|${rfcPac}|${sello}|${noCertificadoSat}||` : defaultCadenaDraft);
                let qrString = '';
                if (isTimbrado && uuid) {
                    qrString = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${uuid}&re=${emisor.rfc}&rr=${receptor.rfc}&tt=${totalNum.toFixed(6)}&fe=${sello.substring(sello.length - 8)}`;
                }
                else {
                    qrString = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=00000000-0000-0000-0000-000000000000&re=${emisor.rfc || 'XAXX010101000'}&rr=${receptor.rfc || 'XAXX010101000'}&tt=${totalNum.toFixed(6)}&fe=00000000`;
                }
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
                const primaryPurple = '#6B569A';
                const headerDarkPill = '#544472';
                const headerCfdiPurple = '#6B569A';
                const headerClientRed = '#C33A3A';
                const cardEmisorYellow = '#E6DF52';
                const cardBancoCyan = '#64AFCA';
                const cardPaymentGreen = '#75AA49';
                const cardTotalsPink = '#DFACC3';
                const cardBgSoft = '#F0EDF6';
                const tableHeaderBg = '#9A87B6';
                const rowBgSoft = '#F0EDF6';
                const sunStarYellow = '#E9E160';
                const textDark = '#1E293B';
                const textGray = '#475569';
                const cornerRad = 6;
                const drawContinuationHeader = (targetDoc) => {
                    targetDoc.rect(0, 0, 612, 58).fill(primaryPurple);
                    if (logoHeaderSvg) {
                        try {
                            (0, svg_to_pdfkit_1.default)(targetDoc, logoHeaderSvg, 30, 14, { width: 85.1, height: 29.1, preserveAspectRatio: 'xMidYMid meet' });
                        }
                        catch (e) {
                            targetDoc.roundedRect(30, 14, 85, 29, 7).fill('#FFFFFF');
                            targetDoc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(16).text('Peguu', 30, 20, { width: 85, align: 'center' });
                        }
                    }
                    else {
                        targetDoc.roundedRect(30, 14, 85, 29, 7).fill('#FFFFFF');
                        targetDoc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(16).text('Peguu', 30, 20, { width: 85, align: 'center' });
                    }
                    targetDoc.roundedRect(476, 12, 108, 34, 17).fill(headerDarkPill);
                    targetDoc.fillColor('#FFFFFF').font(nunitoFont).fontSize(21.0).text('Factura', 476, 15.0, { width: 108, align: 'center', lineBreak: false });
                    targetDoc.fillColor('#E9D5FF').font('Helvetica-Bold').fontSize(6.8).text(`SERIE: ${serie}   FOLIO: ${folio}`, 200, 32, { width: 240, align: 'right' });
                    targetDoc.fillColor('#E9D5FF').font('Helvetica').fontSize(5.8).text(`FOLIO FISCAL SAT: ${uuid}`, 200, 42, { width: 240, align: 'right' });
                    return 70;
                };
                const drawTableHeader = (targetY) => {
                    doc.roundedRect(29, targetY, 552, 17, 5).fill(tableHeaderBg);
                    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(6.8);
                    doc.text('DESCRIPCIÓN', 160, targetY + 5, { width: 125, lineBreak: false });
                    doc.text('OBJETO IMPUESTO', 295, targetY + 5, { width: 75, lineBreak: false });
                    doc.text('VALOR UNITARIO', 370, targetY + 5, { width: 58, align: 'right', lineBreak: false });
                    doc.text('CANTIDAD', 435, targetY + 5, { width: 40, align: 'right', lineBreak: false });
                    doc.text('IMPORTE', 480, targetY + 5, { width: 40, align: 'right', lineBreak: false });
                    doc.text('DESCUENTO', 528, targetY + 5, { width: 48, align: 'center', lineBreak: false });
                    return targetY + 17;
                };
                doc.rect(0, 0, 612, 147).fill(primaryPurple);
                if (logoHeaderSvg) {
                    try {
                        (0, svg_to_pdfkit_1.default)(doc, logoHeaderSvg, 30, 24, { width: 115, height: 40.11, preserveAspectRatio: 'xMidYMid meet' });
                    }
                    catch (e) {
                        doc.roundedRect(30, 24, 115, 40.11, 8).fill('#FFFFFF');
                        doc.fillColor(primaryPurple).font(nunitoFont).fontSize(20).text('Peguu', 30, 32, { width: 115, align: 'center' });
                    }
                }
                else {
                    doc.roundedRect(30, 24, 115, 40.11, 8).fill('#FFFFFF');
                    doc.fillColor(primaryPurple).font(nunitoFont).fontSize(20).text('Peguu', 30, 32, { width: 115, align: 'center' });
                }
                doc.roundedRect(476, 21, 108, 36, 18).fill(headerDarkPill);
                doc.fillColor('#FFFFFF').font(nunitoFont).fontSize(23.0).text('Factura', 476, 23.5, { width: 108, align: 'center', lineBreak: false });
                doc.save();
                doc.rotate(-0.82, { origin: [165, 123] });
                doc.roundedRect(29.4, 82.0, 272.0, 83.4, 6).fill(cardEmisorYellow);
                doc.restore();
                doc.fillColor('#2D1F3F').font('Helvetica-Bold').fontSize(7.5).text(String(emisor.nombre || '').toUpperCase(), 38, 91, { width: 165, height: 20 });
                doc.fillColor('#2D1F3F').font('Helvetica-Bold').fontSize(7.2).text('RFC: ' + emisor.rfc, 204, 91, { width: 90, align: 'right' });
                doc.fillColor('#2D1F3F').font('Helvetica-Bold').fontSize(6.5).text('RÉGIMEN FISCAL', 38, 112);
                doc.fillColor('#2D1F3F').font('Helvetica').fontSize(6.5).text(`${emisor.regimen} - ${(0, sat_catalogs_util_1.getRegimenDesc)(emisor.regimen)}`, 38, 121, { width: 255, height: 12 });
                doc.fillColor('#2D1F3F').font('Helvetica-Bold').fontSize(6.5).text('DIRECCIÓN', 38, 134);
                doc.fillColor('#2D1F3F').font('Helvetica').fontSize(6.5).text(emisor.direccion || `C.P. ${lugarExpedicion}`, 38, 143, { width: 255, height: 18 });
                doc.save();
                doc.rotate(1.00, { origin: [445, 123] });
                doc.roundedRect(309.5, 82.6, 272.2, 82.5, 6).fill(cardBancoCyan);
                doc.restore();
                const benefFontSize = (datosBancarios.beneficiario || '').length > 25 ? 5.2 : 6.2;
                doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('MÉTODO DE PAGO:', 318, 91);
                doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(metodoPago, 318, 99, { width: 125, height: 8 });
                doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('BANCO:', 318, 109);
                doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(datosBancarios.banco || 'BANAMEX', 318, 117, { width: 125, height: 8 });
                doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('BENEFICIARIO:', 318, 127);
                doc.fillColor('#03045E').font('Helvetica').fontSize(benefFontSize).text(datosBancarios.beneficiario || emisor.nombre || '', 318, 135, { width: 125, height: 10 });
                doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('CUENTA:', 318, 145);
                doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(datosBancarios.cuenta || '', 318, 152, { width: 125, height: 8 });
                if (datosBancarios.banco2) {
                    doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('BANCO 2:', 450, 91);
                    doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(datosBancarios.banco2, 450, 99, { width: 125, height: 8 });
                    doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('CUENTA 2:', 450, 109);
                    doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(datosBancarios.cuenta2, 450, 117, { width: 125, height: 8 });
                    doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('CLABE 2:', 450, 127);
                    doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(datosBancarios.clabe2, 450, 135, { width: 125, height: 8 });
                    doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('CLABE 1:', 450, 145);
                    doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(datosBancarios.clabe || '', 450, 152, { width: 125, height: 8 });
                }
                else {
                    doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('CLABE:', 450, 91);
                    doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(datosBancarios.clabe || '', 450, 99, { width: 125, height: 8 });
                    doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('MONEDA:', 450, 109);
                    doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(moneda, 450, 117, { width: 125, height: 8 });
                    const condPago = data.condicionesDePago || data.condiciones_de_pago || data.comprobante?.condiciones_de_pago || 'Contado';
                    doc.fillColor('#03045E').font('Helvetica-Bold').fontSize(6.0).text('CONDICIONES:', 450, 127);
                    doc.fillColor('#03045E').font('Helvetica').fontSize(6.2).text(condPago, 450, 135, { width: 125, height: 8 });
                }
                let y = 172;
                doc.roundedRect(30.0, 196.0, 271.0, 118.0, 8).fill(cardBgSoft);
                doc.roundedRect(36.9, 178.0, 150.2, 26.0, 10).fill(headerClientRed);
                doc.fillColor('#FFFFFF').font(nunitoFont).fontSize(12.0).text('Información del cliente', 36.9, 182.8, { width: 150.2, align: 'center', lineBreak: false });
                doc.save();
                doc.path("M 191.82 172.99 L 186.99 178.40 L 188.11 179.39 L 192.93 173.98 Z").fill('#DFADC4');
                doc.path("M 196.55 179.02 L 189.88 181.88 L 190.47 183.25 L 197.14 180.39 Z").fill('#DFADC4');
                doc.path("M 191.04 186.25 L 190.99 187.74 L 198.23 187.99 L 198.28 186.50 Z").fill('#DFADC4');
                doc.restore();
                let cy = 208;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('RFC:', 38, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(receptor.rfc, 115, cy, { width: 175 });
                cy += 11;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('NOMBRE:', 38, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(receptor.nombre, 115, cy, { width: 175 });
                cy += 16;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('RÉGIMEN FISCAL:', 38, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(`${receptor.regimen} - ${(0, sat_catalogs_util_1.getRegimenDesc)(receptor.regimen)}`, 115, cy, { width: 175 });
                cy += 16;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('DIRECCIÓN FISCAL:', 38, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(receptor.direccion || (receptor.cp ? `C.P. ${receptor.cp}` : ''), 115, cy, { width: 175 });
                cy += 16;
                let obsVal = (receptor.observaciones || data.observaciones || data.comprobante?.observaciones || '').trim();
                if (obsVal.toUpperCase() === 'X') {
                    obsVal = '';
                }
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('OBSERVACIONES:', 38, cy, { width: 75 });
                if (obsVal) {
                    doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(obsVal, 115, cy, { width: 175 });
                }
                cy += 11;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('CUENTA:', 38, cy, { width: 75 });
                doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(datosBancarios.cuenta || '000000000000', 115, cy, { width: 175 });
                cy = 292;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('USO DE CFDI:', 38, cy);
                doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(`${receptor.uso} - ${(0, sat_catalogs_util_1.getUsoCfdiDesc)(receptor.uso)}`, 38, cy + 8, { width: 125, height: 14 });
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text('Orden(es) de venta', 170, cy);
                doc.fillColor(textDark).font('Helvetica').fontSize(6.8).text(receptor.orden_venta, 170, cy + 8, { width: 120 });
                doc.roundedRect(311.0, 196.0, 271.0, 118.0, 8).fill(cardBgSoft);
                doc.roundedRect(317.9, 178.0, 220.2, 26.0, 10).fill(headerCfdiPurple);
                doc.fillColor('#FFFFFF').font(nunitoFont).fontSize(12.0).text('Comprobante fiscal digital internet', 317.9, 182.8, { width: 220.2, align: 'center', lineBreak: false });
                doc.save();
                doc.path("M 541.16 171.42 L 542.02 173.28 C 542.11 173.46 542.33 173.50 542.48 173.37 L 544.02 172.03 C 544.49 171.62 545.21 171.94 545.22 172.57 L 545.26 174.62 C 545.26 174.81 545.45 174.95 545.63 174.89 L 547.59 174.29 C 548.18 174.12 548.70 174.70 548.47 175.27 L 547.67 177.16 C 547.59 177.34 547.71 177.55 547.90 177.57 L 549.92 177.83 C 550.53 177.90 550.78 178.66 550.33 179.09 L 548.84 180.49 C 548.70 180.63 548.72 180.86 548.89 180.96 L 550.64 182.01 C 551.17 182.34 551.09 183.13 550.51 183.33 L 548.58 184.00 C 548.39 184.06 548.32 184.29 548.43 184.44 L 549.60 186.13 C 549.96 186.64 549.56 187.33 548.94 187.28 L 546.91 187.10 C 546.71 187.08 546.56 187.25 546.59 187.45 L 546.98 189.46 C 547.10 190.07 546.46 190.54 545.92 190.24 L 544.13 189.24 C 543.96 189.15 543.75 189.24 543.71 189.43 L 543.25 191.43 C 543.11 192.03 542.33 192.20 541.96 191.70 L 540.73 190.06 C 540.61 189.91 540.39 189.91 540.27 190.06 L 539.04 191.70 C 538.67 192.20 537.90 192.03 537.75 191.43 L 537.29 189.43 C 537.25 189.24 537.04 189.15 536.87 189.24 L 535.08 190.24 C 534.54 190.54 533.91 190.07 534.02 189.46 L 534.41 187.45 C 534.44 187.26 534.29 187.08 534.09 187.10 L 532.06 187.28 C 531.45 187.33 531.05 186.64 531.40 186.13 L 532.57 184.44 C 532.68 184.28 532.61 184.06 532.42 184.00 L 530.49 183.33 C 529.91 183.12 529.82 182.33 530.36 182.01 L 532.11 180.96 C 532.28 180.86 532.30 180.63 532.16 180.49 L 530.67 179.09 C 530.22 178.66 530.47 177.90 531.08 177.83 L 533.10 177.57 C 533.30 177.55 533.41 177.34 533.33 177.16 L 532.53 175.27 C 532.30 174.70 532.82 174.11 533.41 174.29 L 535.37 174.89 C 535.56 174.95 535.74 174.81 535.74 174.62 L 535.78 172.57 C 535.79 171.94 536.51 171.62 536.98 172.03 L 538.52 173.37 C 538.67 173.50 538.89 173.45 538.98 173.28 L 539.84 171.42 C 540.11 170.86 540.90 170.86 541.16 171.42 Z").fill('#EAE161');
                doc.restore();
                let fy = 208;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(7.2).text('SERIE:', 323, fy);
                doc.fillColor(isTimbrado ? textDark : '#c2410c').font('Helvetica-Bold').fontSize(8.5).text(serie, 353, fy - 0.8);
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(7.2).text('FOLIO:', 384, fy);
                doc.fillColor(isTimbrado ? textDark : '#c2410c').font('Helvetica-Bold').fontSize(8.5).text(folio, 414, fy - 0.8);
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.2).text('FECHA DE EMISIÓN:', 445, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(6.2).text(fecha, 514, fy);
                fy += 17;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.0).text('LUGAR DE EXPEDICIÓN:', 323, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(6.5).text(lugarExpedicion, 323, fy + 7);
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.0).text('TIPO DE COMPROBANTE:', 445, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(6.5).text(`${data.tipo || 'I'} - Ingreso`, 445, fy + 7);
                fy += 20;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.0).text('CERTIFICADO EMISOR:', 323, fy);
                doc.fillColor(textDark).font('Helvetica').fontSize(6.5).text(noCertificado, 323, fy + 7);
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.0).text('FECHA DE CERTIFICACIÓN:', 445, fy);
                doc.fillColor(textDark).font(isTimbrado ? 'Helvetica' : 'Helvetica-Oblique').fontSize(6.5).text(isTimbrado ? fechaCert : '[ PENDIENTE ]', 445, fy + 7);
                fy += 20;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.0).text('FOLIO FISCAL SAT:', 323, fy);
                if (isTimbrado) {
                    doc.fillColor(textDark).font('Helvetica').fontSize(6.5).text(uuid, 323, fy + 7, { width: 250 });
                }
                else {
                    doc.fillColor('#c2410c').font('Helvetica-Bold').fontSize(5.2).text('[ DOCUMENTO SIN VALOR FISCAL - VISTA PREVIA ]', 323, fy + 7, { width: 250 });
                }
                fy += 19;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.0).text('CERTIFICADO SAT:', 323, fy);
                doc.fillColor(textDark).font(isTimbrado ? 'Helvetica' : 'Helvetica-Oblique').fontSize(6.5).text(isTimbrado ? noCertificadoSat : '[ PENDIENTE ]', 323, fy + 7);
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.0).text('RFC DEL PAC:', 445, fy);
                doc.fillColor(textDark).font('Helvetica-Bold').fontSize(6.5).text(isTimbrado ? rfcPac : '[ PENDIENTE ]', 445, fy + 7);
                y = 327;
                y = drawTableHeader(y);
                conceptos.forEach((c) => {
                    if (y + 50 > 605) {
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
                    doc.rect(29, y, 552, 30).fill(rowBgSoft);
                    doc.font('Helvetica-Bold').fontSize(6.2).fillColor(headerDarkPill);
                    doc.text('CÓDIGO: ', 34, y + 2.5, { continued: true }).font('Helvetica').fillColor(headerDarkPill).text(codInt);
                    doc.font('Helvetica-Bold').text('UNIDAD: ', 34, y + 11.5, { continued: true }).font('Helvetica').fillColor(headerDarkPill).text(unidad, { width: 120, height: 9, ellipsis: true });
                    doc.font('Helvetica-Bold').text('CÓDIGO SAT: ', 34, y + 20.5, { continued: true }).font('Helvetica').fillColor(headerDarkPill).text(claveProd);
                    doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text(c.descripcion || 'Producto', 160, y + 2.5, { width: 125, height: 26 });
                    doc.font('Helvetica').fontSize(6.5).fillColor(headerDarkPill).text(c.objetoImp || c.objeto_imp || '02 - Sí objeto de impuesto', 295, y + 2.5, { width: 75 });
                    doc.fillColor(headerDarkPill).font('Helvetica').fontSize(6.5).text(this.formatCurrency(itemValor), 370, y + 2.5, { width: 58, align: 'right' });
                    doc.text(this.formatQuantity(c.cantidad || 1), 435, y + 2.5, { width: 40, align: 'right' });
                    doc.text(this.formatCurrency(itemImporte), 480, y + 2.5, { width: 40, align: 'right' });
                    const descText = itemDesc > 0 ? this.formatCurrency(itemDesc) : '';
                    doc.fillColor(headerDarkPill).text(descText, 528, y + 2.5, { width: 48, align: 'center' });
                    y += 30;
                    doc.rect(29, y, 552, 16).fill('#FFFFFF');
                    doc.fillColor(headerDarkPill).font('Helvetica').fontSize(6.5);
                    doc.text('Traslado Impuesto: ', 34, y + 3, { continued: true }).font('Helvetica-Bold').text('IVA', { continued: true })
                        .font('Helvetica').text('    Tipo de factor: ', { continued: true }).font('Helvetica-Bold').text('Tasa', { continued: true })
                        .font('Helvetica').text('    Tasa o cuota: ', { continued: true }).font('Helvetica-Bold').text('0.160000', { continued: true })
                        .font('Helvetica').text('    Base: ', { continued: true }).font('Helvetica-Bold').text(this.formatCurrency(itemImporte), { continued: true })
                        .font('Helvetica').text('    Importe: ', { continued: true }).font('Helvetica-Bold').fillColor(headerDarkPill).text(this.formatCurrency(itemIva));
                    y += 16;
                    doc.moveTo(29, y).lineTo(581, y).strokeColor('#e2e8f0').lineWidth(1).stroke();
                    y += 3;
                });
                if (y + 60 > 605) {
                    doc.addPage();
                    y = drawContinuationHeader(doc);
                }
                y += 4;
                const totBoxW = 271;
                const totBoxH = 42;
                doc.roundedRect(31.0, y, totBoxW, totBoxH, cornerRad).fill(cardPaymentGreen);
                let py = y + 5;
                doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(6.5).text('Método de pago: ', 38, py, { continued: true })
                    .font('Helvetica').text(`${metodoPago} - ${(0, sat_catalogs_util_1.getMetodoPagoDesc)(metodoPago)}`, { width: totBoxW - 30, height: 8, ellipsis: true });
                py += 11;
                doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(6.5).text('Forma de pago: ', 38, py, { continued: true })
                    .font('Helvetica').text(`${formaPago} - ${(0, sat_catalogs_util_1.getFormaPagoDesc)(formaPago)}`, { width: totBoxW - 30, height: 8, ellipsis: true });
                py += 11;
                doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(6.5).text('Moneda: ', 38, py, { continued: true })
                    .font('Helvetica').text(moneda);
                doc.roundedRect(312.0, y, totBoxW, totBoxH, cornerRad).fill(cardTotalsPink);
                let ty = y + 7;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(7.5).text('Subtotal', 324, ty);
                doc.fillColor(headerDarkPill).text(this.formatCurrency(subtotalNum), 370, ty, { width: 75, align: 'right' });
                ty += 14;
                doc.fillColor(headerDarkPill).text('IVA 16%', 324, ty);
                doc.fillColor(headerDarkPill).text(this.formatCurrency(ivaNum), 370, ty, { width: 75, align: 'right' });
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(14.0).text(`Total ${this.formatCurrency(totalNum)}`, 440, y + 14, { width: 135, align: 'right' });
                y += totBoxH + 4;
                doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.8).text(letras, 28, y, { width: 556, align: 'right' });
                const range = doc.bufferedPageRange();
                for (let i = 0; i < range.count; i++) {
                    doc.switchToPage(i);
                    doc.page.margins.bottom = 0;
                    const by = 612;
                    doc.moveTo(28, by).lineTo(584, by).strokeColor('#cbd5e1').lineWidth(1).stroke();
                    const qrSide = 84;
                    const qry = by + 6;
                    if (qrBuffer) {
                        doc.image(qrBuffer, 28, qry, { width: qrSide, height: qrSide });
                    }
                    else {
                        doc.roundedRect(28, qry, qrSide, qrSide, cornerRad).fill(primaryPurple);
                        doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10).text('QR SAT', 28, qry + 36, { width: qrSide, align: 'center' });
                    }
                    let sy = qry;
                    const sealTextW = 452;
                    const sealX = 132;
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
                        doc.fillColor(headerDarkPill).font('Helvetica-Bold').fontSize(6.5).text(title, sealX, sy, { lineBreak: false });
                        doc.fillColor(textGray).font('Courier').fontSize(4.5);
                        const lines = formatHashToJustifiedLines(hash, sealTextW, 'Courier', 4.5);
                        let lineY = sy + 7.2;
                        for (const line of lines) {
                            doc.text(line, sealX, lineY, { lineBreak: false });
                            lineY += 5.2;
                        }
                        sy = lineY + 3;
                    };
                    drawSeal('Sello Digital CFDI', sello);
                    drawSeal('Sello Digital SAT', selloSat);
                    drawSeal('Cadena original del complemento de certificación digital del SAT', cadenaOriginal);
                    const fy = 711;
                    const footerBarH = 81;
                    doc.rect(0, fy, 612, footerBarH).fill(primaryPurple);
                    if (logoFooterSvg) {
                        try {
                            (0, svg_to_pdfkit_1.default)(doc, logoFooterSvg, 30, fy + 16, { width: 105, height: 20 });
                        }
                        catch (e) {
                            doc.roundedRect(30, fy + 16, 50, 17, 5).fill('#FFFFFF');
                            doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(6.5).text('Peguu', 30, fy + 20, { width: 50, align: 'center' });
                        }
                    }
                    else {
                        doc.roundedRect(30, fy + 16, 50, 17, 5).fill('#FFFFFF');
                        doc.fillColor(primaryPurple).font('Helvetica-Bold').fontSize(6.5).text('Peguu', 30, fy + 20, { width: 50, align: 'center' });
                    }
                    doc.fillColor('#FFFFFF').font('Helvetica').fontSize(7.5).text('Todos los derechos reservados', 30, fy + 41, { lineBreak: false });
                    doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(6.8).text('Este documento es una representación impresa de un CFDI', 160, fy + 16, { width: 280, align: 'center', lineBreak: false });
                    doc.fillColor('#FFFFFF').font('Helvetica').fontSize(5.8).text('El registro de este documento puede ser verificado en la página de Internet del SAT', 160, fy + 28, { width: 280, align: 'center', lineBreak: false });
                    const pageStr = String(i + 1).padStart(2, '0');
                    const totalStr = String(range.count).padStart(2, '0');
                    doc.fillColor('#FFFFFF').font('Helvetica').fontSize(6.8).text('Versión de CFDI: 4.0', 445, fy + 16, { width: 139, align: 'right', lineBreak: false });
                    doc.font('Helvetica-Bold').fontSize(7.5).text(`PÁG. ${pageStr} DE ${totalStr}`, 445, fy + 28, { width: 139, align: 'right', lineBreak: false });
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
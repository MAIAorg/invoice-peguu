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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InvoicesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const diverza_adapter_1 = require("../pac/diverza.adapter");
const crypto_service_1 = require("../common/services/crypto.service");
const pdf_service_1 = require("./pdf.service");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let InvoicesService = InvoicesService_1 = class InvoicesService {
    pacProvider;
    cryptoService;
    pdfService;
    logger = new common_1.Logger(InvoicesService_1.name);
    constructor(pacProvider, cryptoService, pdfService) {
        this.pacProvider = pacProvider;
        this.cryptoService = cryptoService;
        this.pdfService = pdfService;
    }
    generateOriginalChainIngreso(data, fecha) {
        const parts = [];
        parts.push('4.0');
        if (data.serie)
            parts.push(data.serie);
        if (data.folio)
            parts.push(data.folio);
        parts.push(fecha);
        if (data.formaPago)
            parts.push(data.formaPago);
        parts.push(data.noCertificado);
        parts.push(data.subTotal.toFixed(2));
        parts.push(data.moneda);
        parts.push(data.total.toFixed(2));
        parts.push(data.tipo);
        parts.push('01');
        if (data.metodoPago)
            parts.push(data.metodoPago);
        parts.push(data.lugarExpedicion);
        if (data.informacionGlobal) {
            parts.push(data.informacionGlobal.periodicidad);
            parts.push(data.informacionGlobal.meses);
            parts.push(String(data.informacionGlobal.anio));
        }
        parts.push(data.emisor.rfc);
        parts.push(data.emisor.nombre);
        parts.push(data.emisor.regimen);
        parts.push(data.receptor.rfc);
        parts.push(data.receptor.nombre);
        parts.push(data.receptor.cp);
        parts.push(data.receptor.regimen);
        parts.push(data.receptor.uso);
        for (const c of data.conceptos) {
            parts.push(c.clave);
            parts.push(String(c.cantidad));
            parts.push(c.unidad);
            parts.push(c.descripcion);
            parts.push(c.valor.toFixed(2));
            parts.push(c.importe.toFixed(2));
            parts.push(c.objetoImp);
            if (c.objetoImp === '02' && c.iva !== undefined) {
                parts.push(c.importe.toFixed(2));
                parts.push('002');
                parts.push('Tasa');
                parts.push('0.160000');
                parts.push(c.iva.toFixed(2));
            }
        }
        if (data.totalIva > 0) {
            parts.push(data.subTotal.toFixed(2));
            parts.push('002');
            parts.push('Tasa');
            parts.push('0.160000');
            parts.push(data.totalIva.toFixed(2));
            parts.push(data.totalIva.toFixed(2));
        }
        return '||' + parts.join('|') + '||';
    }
    generateOriginalChainPago(data, fecha) {
        const parts = [];
        parts.push('4.0');
        if (data.serie)
            parts.push(data.serie);
        if (data.folio)
            parts.push(data.folio);
        parts.push(fecha);
        parts.push(data.noCertificado);
        parts.push('0');
        parts.push('XXX');
        parts.push('0');
        parts.push('P');
        parts.push('01');
        parts.push(data.lugarExpedicion);
        parts.push(data.emisor.rfc);
        parts.push(data.emisor.nombre);
        parts.push(data.emisor.regimen);
        parts.push(data.receptor.rfc);
        parts.push(data.receptor.nombre);
        parts.push(data.receptor.cp);
        parts.push(data.receptor.regimen);
        parts.push('CP01');
        parts.push('84111506');
        parts.push('1');
        parts.push('ACT');
        parts.push('Pago');
        parts.push('0');
        parts.push('0');
        parts.push('01');
        parts.push('2.0');
        parts.push(data.pago.totalTrasladosBaseIVA16.toFixed(2));
        parts.push(data.pago.totalTrasladosImpuestoIVA16.toFixed(2));
        parts.push(data.pago.monto.toFixed(2));
        parts.push(data.pago.fechaPago);
        parts.push(data.pago.formaPago);
        parts.push(data.pago.moneda);
        parts.push('1');
        parts.push(data.pago.monto.toFixed(2));
        parts.push(data.pago.idDocumento);
        if (data.pago.serieDR)
            parts.push(data.pago.serieDR);
        if (data.pago.folioDR)
            parts.push(data.pago.folioDR);
        parts.push(data.pago.moneda);
        parts.push('1');
        parts.push(String(data.pago.numParcialidad || 1));
        parts.push(data.pago.impSaldoAnt.toFixed(2));
        parts.push(data.pago.monto.toFixed(2));
        parts.push(data.pago.impSaldoInsoluto.toFixed(2));
        parts.push('02');
        parts.push(data.pago.baseDR.toFixed(2));
        parts.push('002');
        parts.push('Tasa');
        parts.push('0.160000');
        parts.push(data.pago.importeDR.toFixed(2));
        parts.push(data.pago.baseDR.toFixed(2));
        parts.push('002');
        parts.push('Tasa');
        parts.push('0.160000');
        parts.push(data.pago.importeDR.toFixed(2));
        return '||' + parts.join('|') + '||';
    }
    getStorageBaseDir() {
        if (process.env.CSD_STORAGE_PATH && fs.existsSync(process.env.CSD_STORAGE_PATH)) {
            return process.env.CSD_STORAGE_PATH;
        }
        const localDocs = path.resolve(process.cwd(), 'docs', 'CSD_STORAGE');
        if (fs.existsSync(localDocs))
            return localDocs;
        const parentDocs = path.resolve(process.cwd(), '..', 'docs', 'CSD_STORAGE');
        if (fs.existsSync(parentDocs))
            return parentDocs;
        const localStorage = path.resolve(process.cwd(), 'storage');
        if (fs.existsSync(localStorage))
            return localStorage;
        return process.env.CSD_STORAGE_PATH || localStorage;
    }
    getStorageDir(rfc) {
        const basePath = this.getStorageBaseDir();
        return rfc ? path.join(basePath, rfc) : basePath;
    }
    getDemoDir() {
        return process.env.CSD_DEMO_PATH || path.resolve(process.cwd(), '..', 'docs', 'CSD_DEMO');
    }
    async savePacConfig(body) {
        const basePath = this.getStorageBaseDir();
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }
        const pacFile = path.join(basePath, 'pac_config.json');
        let existing = {};
        if (fs.existsSync(pacFile)) {
            try {
                existing = JSON.parse(fs.readFileSync(pacFile, 'utf8'));
            }
            catch (e) { }
        }
        const updated = {
            client_id: body.client_id || existing.client_id || process.env.DIVERZA_CLIENT_ID || '759412',
            token: body.token || existing.token || process.env.DIVERZA_TOKEN || '$2b$12$IS3EcFIDSicPMA3xNvaiYe9P9Jp.EamzkQGfzRPefdWQJV/TPVy7K',
            stamp_url: body.stamp_url || existing.stamp_url || process.env.DIVERZA_STAMP_URL || 'https://servicios.diverza.com/api/v2/documents/stamp',
            cancel_url: body.cancel_url || existing.cancel_url || process.env.DIVERZA_CANCEL_URL || 'https://servicios.diverza.com/api/v2/documents/UUID/cancel',
            actualizado_el: new Date().toISOString()
        };
        fs.writeFileSync(pacFile, JSON.stringify(updated, null, 2));
        this.logger.log(`Configuración del PAC actualizada: Client ID [${updated.client_id}], URL [${updated.stamp_url}]`);
        return {
            success: true,
            config: updated,
            message: 'Configuración del PAC guardada y activada correctamente.'
        };
    }
    async saveEmisorConfig(body) {
        const rfc = body.rfc || 'IVD920810GU2';
        const targetDir = this.getStorageDir(rfc);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const perfilFile = path.join(targetDir, 'emisor_perfil.json');
        let existing = {};
        if (fs.existsSync(perfilFile)) {
            try {
                existing = JSON.parse(fs.readFileSync(perfilFile, 'utf8'));
            }
            catch (e) { }
        }
        const updated = {
            rfc,
            razon_social: body.razon_social || existing.razon_social || '',
            nombre_comercial: body.nombre_comercial || existing.nombre_comercial || '',
            email: body.email || existing.email || '',
            regimen_fiscal: body.regimen_fiscal || existing.regimen_fiscal || '601',
            domicilio: { ...existing.domicilio, ...body.domicilio },
            lugar_expedicion: { ...existing.lugar_expedicion, ...body.lugar_expedicion },
            impuestos_default: {
                iva_traslado_pct: body.impuestos_default?.iva_traslado_pct ?? existing.impuestos_default?.iva_traslado_pct ?? 16.0,
                iva_retenido_pct: body.impuestos_default?.iva_retenido_pct ?? existing.impuestos_default?.iva_retenido_pct ?? 0.0,
                isr_retenido_pct: body.impuestos_default?.isr_retenido_pct ?? existing.impuestos_default?.isr_retenido_pct ?? 0.0,
            },
            parametros_default: {
                uso_cfdi: body.parametros_default?.uso_cfdi || existing.parametros_default?.uso_cfdi || 'G03',
                forma_pago: body.parametros_default?.forma_pago || existing.parametros_default?.forma_pago || '99',
                metodo_pago: body.parametros_default?.metodo_pago || existing.parametros_default?.metodo_pago || 'PPD',
            },
            actualizado_el: new Date().toISOString()
        };
        fs.writeFileSync(perfilFile, JSON.stringify(updated, null, 2));
        this.logger.log(`Perfil de Emisor guardado para RFC ${rfc}: Razón Social [${updated.razon_social}]`);
        return {
            success: true,
            perfil: updated,
            message: 'Perfil fiscal del emisor y parámetros guardados correctamente.'
        };
    }
    getActiveConfiguredRfc() {
        const basePath = this.getStorageBaseDir();
        if (!fs.existsSync(basePath))
            return '';
        try {
            const items = fs.readdirSync(basePath);
            for (const item of items) {
                const fullPath = path.join(basePath, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    const perfilFile = path.join(fullPath, 'emisor_perfil.json');
                    const cerFile = path.join(fullPath, 'csd.cer');
                    if (fs.existsSync(perfilFile) || fs.existsSync(cerFile)) {
                        return item;
                    }
                }
            }
        }
        catch (e) { }
        return '';
    }
    async getFullConfig(rfc) {
        const targetRfc = rfc || this.getActiveConfiguredRfc();
        const targetDir = targetRfc ? this.getStorageDir(targetRfc) : '';
        let emisor = {};
        let folios = {};
        let csdStatus = { tiene_cer: false, tiene_key_enc: false };
        if (targetDir && fs.existsSync(targetDir)) {
            const perfilFile = path.join(targetDir, 'emisor_perfil.json');
            if (fs.existsSync(perfilFile)) {
                try {
                    emisor = JSON.parse(fs.readFileSync(perfilFile, 'utf8'));
                }
                catch (e) { }
            }
            const folioFile = path.join(targetDir, 'folios.json');
            if (fs.existsSync(folioFile)) {
                try {
                    folios = JSON.parse(fs.readFileSync(folioFile, 'utf8'));
                }
                catch (e) { }
            }
            csdStatus.tiene_cer = fs.existsSync(path.join(targetDir, 'csd.cer'));
            csdStatus.tiene_key_enc = fs.existsSync(path.join(targetDir, 'csd.key.enc'));
        }
        const basePath = this.getStorageBaseDir();
        const pacFile = path.join(basePath, 'pac_config.json');
        let pac = {};
        if (fs.existsSync(pacFile)) {
            try {
                pac = JSON.parse(fs.readFileSync(pacFile, 'utf8'));
            }
            catch (e) { }
        }
        else {
            pac = {
                client_id: process.env.DIVERZA_CLIENT_ID || '',
                token: process.env.DIVERZA_TOKEN || '',
                stamp_url: process.env.DIVERZA_STAMP_URL || 'https://servicios.diverza.com/api/v2/documents/stamp',
                cancel_url: process.env.DIVERZA_CANCEL_URL || 'https://servicios.diverza.com/api/v2/documents/UUID/cancel',
            };
        }
        return {
            rfc: targetRfc,
            emisor,
            csd: csdStatus,
            pac,
            folios,
        };
    }
    async saveFolioConfig(body) {
        const rfc = body.rfc || 'IVD920810GU2';
        const targetDir = this.getStorageDir(rfc);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        const folioData = {
            serie: body.serie || 'F',
            siguiente_folio: body.folio_inicial || 100,
            actualizado_el: new Date().toISOString()
        };
        fs.writeFileSync(path.join(targetDir, 'folios.json'), JSON.stringify(folioData, null, 2));
        this.logger.log(`Configuración de folios guardada para RFC ${rfc}: Serie [${folioData.serie}], Siguiente Folio [${folioData.siguiente_folio}]`);
        return {
            success: true,
            rfc,
            serie: folioData.serie,
            siguiente_folio: folioData.siguiente_folio,
            message: `Configuración de folios actualizada. Próxima factura usará Serie '${folioData.serie}' y Folio '${folioData.siguiente_folio}'.`
        };
    }
    getNextFolioAndSerie(rfc, requestedSerie, requestedFolio, incrementOnDisk = true) {
        const targetDir = this.getStorageDir(rfc);
        const folioFile = path.join(targetDir, 'folios.json');
        let defaultSerie = 'F';
        let nextFolioNumber = 100;
        let hasConfigFile = false;
        let folioConfigData = {};
        if (fs.existsSync(folioFile)) {
            try {
                folioConfigData = JSON.parse(fs.readFileSync(folioFile, 'utf8'));
                defaultSerie = folioConfigData.serie || 'F';
                nextFolioNumber = Number(folioConfigData.siguiente_folio || 100);
                hasConfigFile = true;
            }
            catch (e) {
                this.logger.warn(`No se pudo leer folios.json para RFC ${rfc}`);
            }
        }
        const finalSerie = (hasConfigFile && folioConfigData.serie) ? folioConfigData.serie : (requestedSerie || defaultSerie);
        let finalFolio = (hasConfigFile) ? String(nextFolioNumber) : (requestedFolio || String(nextFolioNumber));
        if (hasConfigFile && incrementOnDisk) {
            folioConfigData.siguiente_folio = nextFolioNumber + 1;
            folioConfigData.actualizado_el = new Date().toISOString();
            fs.writeFileSync(folioFile, JSON.stringify(folioConfigData, null, 2));
            this.logger.log(`Folio asignado para RFC ${rfc}: Serie [${finalSerie}], Folio [${finalFolio}]. Siguiente consecutivo en disco: [${folioConfigData.siguiente_folio}]`);
        }
        return { serie: finalSerie, folio: String(finalFolio) };
    }
    async saveCsdConfig(body) {
        this.logger.log(`Guardando configuración CSD encriptada (AES-256-GCM) para RFC: ${body.rfc}`);
        const rfc = body.rfc || 'IVD920810GU2';
        const targetDir = this.getStorageDir(rfc);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        let keyBuffer;
        try {
            keyBuffer = Buffer.from(body.key_base64, 'base64');
            const testKey = crypto.createPrivateKey({
                key: keyBuffer,
                format: 'der',
                type: 'pkcs8',
                passphrase: body.password_csd,
            });
            if (!testKey)
                throw new Error('Llave inválida');
        }
        catch (err) {
            this.logger.error(`Error al validar CSD y contraseña para ${rfc}: ${err.message}`);
            throw new common_1.BadRequestException('La contraseña del CSD es incorrecta o los archivos .cer/.key son inválidos.');
        }
        const encryptedKey = this.cryptoService.encryptToBuffer(keyBuffer);
        const encryptedPassword = this.cryptoService.encryptToBuffer(body.password_csd);
        fs.writeFileSync(path.join(targetDir, 'csd.cer'), Buffer.from(body.cer_base64, 'base64'));
        fs.writeFileSync(path.join(targetDir, 'csd.key.enc'), encryptedKey);
        fs.writeFileSync(path.join(targetDir, 'csd.pass.enc'), encryptedPassword);
        const legacyKey = path.join(targetDir, 'csd.key');
        const legacyPass = path.join(targetDir, 'csd.pass');
        if (fs.existsSync(legacyKey))
            fs.unlinkSync(legacyKey);
        if (fs.existsSync(legacyPass))
            fs.unlinkSync(legacyPass);
        return {
            success: true,
            rfc: rfc,
            message: `Certificado CSD para el RFC ${rfc} guardado y encriptado (AES-256-GCM) con éxito en el servidor.`
        };
    }
    async stampInvoice(invoiceData) {
        const tipo = invoiceData.comprobante?.tipo_comprobante || 'I';
        this.logger.log(`Procesando comprobante tipo [${tipo}] para origen: ${invoiceData.origen}`);
        const now = new Date();
        now.setHours(now.getHours() - 6);
        const fecha = now.toISOString().split('.')[0];
        const rfcEmisor = invoiceData.emisor?.rfc || invoiceData.rfc || this.getActiveConfiguredRfc() || 'IVD920810GU2';
        if (!rfcEmisor) {
            throw new common_1.BadRequestException('Debe proporcionar el RFC del Emisor en la petición.');
        }
        const csdStorageDir = this.getStorageDir(rfcEmisor);
        let keyBuffer;
        let cerPath = path.join(csdStorageDir, 'csd.cer');
        let password = '';
        const encKeyPath = path.join(csdStorageDir, 'csd.key.enc');
        const encPassPath = path.join(csdStorageDir, 'csd.pass.enc');
        const legacyKeyPath = path.join(csdStorageDir, 'csd.key');
        if (fs.existsSync(encKeyPath) && fs.existsSync(cerPath)) {
            keyBuffer = this.cryptoService.decryptFromBuffer(fs.readFileSync(encKeyPath));
            if (fs.existsSync(encPassPath)) {
                password = this.cryptoService.decryptFromBuffer(fs.readFileSync(encPassPath)).toString('utf8');
            }
            this.logger.log(`🔑 Usando CSD activo (Encriptado AES-256-GCM) para RFC: ${rfcEmisor}`);
        }
        else if (fs.existsSync(legacyKeyPath) && fs.existsSync(cerPath)) {
            keyBuffer = fs.readFileSync(legacyKeyPath);
            if (fs.existsSync(path.join(csdStorageDir, 'csd.pass'))) {
                password = fs.readFileSync(path.join(csdStorageDir, 'csd.pass'), 'utf8').trim();
            }
            this.logger.log(`🔑 Usando CSD activo (Legacy) para RFC: ${rfcEmisor}`);
        }
        else {
            throw new common_1.BadRequestException(`No se encontró un Certificado de Sello Digital (CSD) activo para el RFC '${rfcEmisor}'. Por favor cargue los archivos .cer, .key y contraseña en la Sección II de Configuración.`);
        }
        let noCertificado = '';
        if (fs.existsSync(cerPath)) {
            try {
                const cerBuf = fs.readFileSync(cerPath);
                const x509 = new crypto.X509Certificate(cerBuf);
                const hex = x509.serialNumber;
                let serial = '';
                for (let i = 0; i < hex.length; i += 2) {
                    serial += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                }
                if (serial.length === 20) {
                    noCertificado = serial;
                }
            }
            catch (e) {
                this.logger.warn(`No se pudo extraer el número de certificado de ${cerPath}`);
            }
        }
        if (!noCertificado) {
            throw new common_1.BadRequestException(`El archivo .cer cargado para el RFC '${rfcEmisor}' no contiene un número de serie válido.`);
        }
        let emisorGuardado = {};
        const emisorPerfilFile = path.join(csdStorageDir, 'emisor_perfil.json');
        if (fs.existsSync(emisorPerfilFile)) {
            try {
                emisorGuardado = JSON.parse(fs.readFileSync(emisorPerfilFile, 'utf8'));
            }
            catch (e) { }
        }
        const nombreEmisor = invoiceData.emisor?.nombre || invoiceData.emisor?.razon_social || emisorGuardado.razon_social || emisorGuardado.nombre_comercial;
        const regimenEmisor = invoiceData.emisor?.regimen || invoiceData.emisor?.regimen_fiscal || emisorGuardado.regimen_fiscal;
        const lugarExpedicionEmisor = invoiceData.lugarExpedicion || invoiceData.lugar_expedicion || emisorGuardado.lugar_expedicion?.codigo_postal || emisorGuardado.domicilio?.codigo_postal;
        if (!nombreEmisor || !regimenEmisor || !lugarExpedicionEmisor) {
            throw new common_1.BadRequestException(`Debe configurar los datos del Emisor (Razón Social, Régimen Fiscal y Código Postal) para el RFC '${rfcEmisor}' en la Sección I y V de Configuración.`);
        }
        const receptor = invoiceData.receptor || {};
        const comprobante = invoiceData.comprobante || {};
        const folioAndSerie = this.getNextFolioAndSerie(rfcEmisor, comprobante.serie, comprobante.folio_interno);
        let xml = '';
        if (tipo === 'P') {
            const pagoInfo = invoiceData.pago || {};
            const monto = Number(pagoInfo.monto || 0);
            const baseDR = Number(pagoInfo.base || (monto / 1.16));
            const importeDR = Number(pagoInfo.iva || (monto - baseDR));
            const formattedData = {
                serie: 'P',
                folio: comprobante.folio_interno || 'P-101',
                noCertificado: noCertificado,
                lugarExpedicion: lugarExpedicionEmisor,
                emisor: {
                    rfc: rfcEmisor,
                    nombre: nombreEmisor,
                    regimen: regimenEmisor,
                },
                receptor: {
                    rfc: receptor.rfc || 'XAXX010101000',
                    nombre: receptor.razon_social || 'PUBLICO EN GENERAL',
                    cp: receptor.codigo_postal || lugarExpedicionEmisor,
                    regimen: receptor.regimen_fiscal || '616',
                    uso: 'CP01',
                },
                pago: {
                    fechaPago: pagoInfo.fecha_pago || fecha,
                    formaPago: pagoInfo.forma_pago || '04',
                    moneda: 'MXN',
                    monto: monto,
                    idDocumento: pagoInfo.uuid_relacionado || '',
                    serieDR: 'F',
                    folioDR: 'F-101',
                    num_parcialidad: pagoInfo.num_parcialidad || 1,
                    impSaldoAnt: monto,
                    impSaldoInsoluto: 0,
                    totalTrasladosBaseIVA16: baseDR,
                    totalTrasladosImpuestoIVA16: importeDR,
                    baseDR: baseDR,
                    importeDR: importeDR,
                },
            };
            const chain = this.generateOriginalChainPago(formattedData, fecha);
            const keyDer = keyBuffer;
            const privateKey = crypto.createPrivateKey({ key: keyDer, format: 'der', type: 'pkcs8', passphrase: password });
            const signer = crypto.createSign('SHA256');
            signer.update(chain);
            const sello = signer.sign(privateKey, 'base64');
            const cerBase64 = fs.readFileSync(cerPath).toString('base64');
            xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:pago20="http://www.sat.gob.mx/Pagos20" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/Pagos20 http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos20.xsd" Version="4.0" ${formattedData.serie ? `Serie="${formattedData.serie}"` : ''} ${formattedData.folio ? `Folio="${formattedData.folio}"` : ''} Fecha="${fecha}" Sello="${sello}" NoCertificado="${formattedData.noCertificado}" Certificado="${cerBase64}" SubTotal="0" Moneda="XXX" Total="0" TipoDeComprobante="P" Exportacion="01" LugarExpedicion="${formattedData.lugarExpedicion}">
    <cfdi:Emisor Rfc="${formattedData.emisor.rfc}" Nombre="${formattedData.emisor.nombre}" RegimenFiscal="${formattedData.emisor.regimen}"/>
    <cfdi:Receptor Rfc="${formattedData.receptor.rfc}" Nombre="${formattedData.receptor.nombre}" DomicilioFiscalReceptor="${formattedData.receptor.cp}" RegimenFiscalReceptor="${formattedData.receptor.regimen}" UsoCFDI="CP01"/>
    <cfdi:Conceptos>
        <cfdi:Concepto ClaveProdServ="84111506" Cantidad="1" ClaveUnidad="ACT" Descripcion="Pago" ValorUnitario="0" Importe="0" ObjetoImp="01"/>
    </cfdi:Conceptos>
    <cfdi:Complemento>
        <pago20:Pagos Version="2.0">
            <pago20:Totales TotalTrasladosBaseIVA16="${formattedData.pago.totalTrasladosBaseIVA16.toFixed(2)}" TotalTrasladosImpuestoIVA16="${formattedData.pago.totalTrasladosImpuestoIVA16.toFixed(2)}" MontoTotalPagos="${formattedData.pago.monto.toFixed(2)}"/>
            <pago20:Pago FechaPago="${formattedData.pago.fechaPago}" FormaDePagoP="${formattedData.pago.formaPago}" MonedaP="${formattedData.pago.moneda}" Monto="${formattedData.pago.monto.toFixed(2)}">
                <pago20:DoctoRelacionado IdDocumento="${formattedData.pago.idDocumento}" ${formattedData.pago.serieDR ? `Serie="${formattedData.pago.serieDR}"` : ''} ${formattedData.pago.folioDR ? `Folio="${formattedData.pago.folioDR}"` : ''} MonedaDR="${formattedData.pago.moneda}" EquivalenciaDR="1" NumParcialidad="${formattedData.pago.num_parcialidad}" ImpSaldoAnt="${formattedData.pago.impSaldoAnt.toFixed(2)}" ImpPagado="${formattedData.pago.monto.toFixed(2)}" ImpSaldoInsoluto="${formattedData.pago.impSaldoInsoluto.toFixed(2)}" ObjetoImpDR="02">
                    <pago20:ImpuestosDR>
                        <pago20:TrasladosDR>
                            <pago20:TrasladoDR BaseDR="${formattedData.pago.baseDR.toFixed(2)}" ImpuestoDR="002" TipoFactorDR="Tasa" TasaOCuotaDR="0.160000" ImporteDR="${formattedData.pago.importeDR.toFixed(2)}"/>
                        </pago20:TrasladosDR>
                    </pago20:ImpuestosDR>
                </pago20:DoctoRelacionado>
                <pago20:ImpuestosP>
                    <pago20:TrasladosP>
                        <pago20:TrasladoP BaseP="${formattedData.pago.baseDR.toFixed(2)}" ImpuestoP="002" TipoFactorP="Tasa" TasaOCuotaP="0.160000" ImporteP="${formattedData.pago.importeDR.toFixed(2)}"/>
                    </pago20:TrasladosP>
                </pago20:ImpuestosP>
            </pago20:Pago>
        </pago20:Pagos>
    </cfdi:Complemento>
</cfdi:Comprobante>`.trim();
        }
        else {
            const conceptosInput = invoiceData.conceptos || invoiceData.comprobante?.conceptos || [];
            const conceptos = conceptosInput.map((c) => ({
                clave: c.clave_prod_serv || c.clave || '01010101',
                cantidad: Number(c.cantidad || 1),
                unidad: c.clave_unidad || c.unidad || 'ACT',
                descripcion: c.descripcion || 'Producto',
                valor: Number(c.valor_unitario || c.valor || 0),
                importe: Number(c.importe || 0),
                objetoImp: c.objeto_imp || c.objetoImp || '02',
                iva: Number(c.importe || 0) * (emisorGuardado.impuestos_default?.iva_traslado_pct ? (emisorGuardado.impuestos_default.iva_traslado_pct / 100) : 0.16),
            }));
            const subTotal = Number(comprobante.subtotal || conceptos.reduce((acc, item) => acc + item.importe, 0));
            const totalIva = conceptos.reduce((acc, item) => acc + (item.objetoImp === '02' ? item.iva : 0), 0);
            const total = Number(comprobante.total || (subTotal + totalIva));
            const formattedData = {
                serie: folioAndSerie.serie,
                folio: folioAndSerie.folio,
                formaPago: comprobante.forma_pago || emisorGuardado.parametros_default?.forma_pago || '01',
                noCertificado: noCertificado,
                subTotal: subTotal,
                moneda: comprobante.moneda || 'MXN',
                total: total,
                tipo: 'I',
                metodoPago: comprobante.metodo_pago || emisorGuardado.parametros_default?.metodo_pago || 'PUE',
                lugarExpedicion: lugarExpedicionEmisor,
                uuidSustitucion: invoiceData.uuid_sustitucion,
                informacionGlobal: invoiceData.informacion_global ? {
                    periodicidad: invoiceData.informacion_global.periodicidad || '01',
                    meses: invoiceData.informacion_global.meses || '07',
                    anio: invoiceData.informacion_global.anio || 2026,
                } : undefined,
                emisor: {
                    rfc: rfcEmisor,
                    nombre: nombreEmisor,
                    regimen: regimenEmisor,
                },
                receptor: {
                    rfc: receptor.rfc || 'XAXX010101000',
                    nombre: receptor.razon_social || 'PUBLICO EN GENERAL',
                    cp: receptor.codigo_postal || lugarExpedicionEmisor,
                    regimen: receptor.regimen_fiscal || '616',
                    uso: receptor.uso_cfdi || emisorGuardado.parametros_default?.uso_cfdi || 'S01',
                },
                conceptos: conceptos,
                subTotalNum: subTotal,
                totalIva: totalIva,
                totalNum: total,
            };
            const chain = this.generateOriginalChainIngreso(formattedData, fecha);
            const keyDer = keyBuffer;
            const privateKey = crypto.createPrivateKey({ key: keyDer, format: 'der', type: 'pkcs8', passphrase: password });
            const signer = crypto.createSign('SHA256');
            signer.update(chain);
            const sello = signer.sign(privateKey, 'base64');
            const cerBase64 = fs.readFileSync(cerPath).toString('base64');
            xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd" Version="4.0" ${formattedData.serie ? `Serie="${formattedData.serie}"` : ''} ${formattedData.folio ? `Folio="${formattedData.folio}"` : ''} Fecha="${fecha}" Sello="${sello}" FormaPago="${formattedData.formaPago}" NoCertificado="${formattedData.noCertificado}" Certificado="${cerBase64}" SubTotal="${formattedData.subTotal.toFixed(2)}" Moneda="${formattedData.moneda}" Total="${formattedData.total.toFixed(2)}" TipoDeComprobante="I" Exportacion="01" MetodoPago="${formattedData.metodoPago}" LugarExpedicion="${formattedData.lugarExpedicion}">
    ${formattedData.informacionGlobal ? `<cfdi:InformacionGlobal Periodicidad="${formattedData.informacionGlobal.periodicidad}" Meses="${formattedData.informacionGlobal.meses}" Año="${formattedData.informacionGlobal.anio}"/>` : ''}
    <cfdi:Emisor Rfc="${formattedData.emisor.rfc}" Nombre="${formattedData.emisor.nombre}" RegimenFiscal="${formattedData.emisor.regimen}"/>
    <cfdi:Receptor Rfc="${formattedData.receptor.rfc}" Nombre="${formattedData.receptor.nombre}" DomicilioFiscalReceptor="${formattedData.receptor.cp}" RegimenFiscalReceptor="${formattedData.receptor.regimen}" UsoCFDI="${formattedData.receptor.uso}"/>
    <cfdi:Conceptos>
        ${formattedData.conceptos.map((c) => `
        <cfdi:Concepto ClaveProdServ="${c.clave}" Cantidad="${c.cantidad}" ClaveUnidad="${c.unidad}" Descripcion="${c.descripcion}" ValorUnitario="${c.valor.toFixed(2)}" Importe="${c.importe.toFixed(2)}" ObjetoImp="${c.objetoImp}">
            ${c.objetoImp === '02' ? `
            <cfdi:Impuestos>
                <cfdi:Traslados>
                    <cfdi:Traslado Base="${c.importe.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${c.iva.toFixed(2)}"/>
                </cfdi:Traslados>
            </cfdi:Impuestos>` : ''}
        </cfdi:Concepto>`).join('')}
    </cfdi:Conceptos>
    ${formattedData.totalIva > 0 ? `
    <cfdi:Impuestos TotalImpuestosTrasladados="${formattedData.totalIva.toFixed(2)}">
        <cfdi:Traslados>
            <cfdi:Traslado Base="${formattedData.subTotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${formattedData.totalIva.toFixed(2)}"/>
        </cfdi:Traslados>
    </cfdi:Impuestos>` : ''}
</cfdi:Comprobante>`.trim();
        }
        const xmlBase64 = Buffer.from(xml).toString('base64');
        const res = await this.pacProvider.stampInvoice(xmlBase64, tipo === 'P', rfcEmisor);
        if (res.status === 'STAMPED' || res.uuid) {
            let emisorGuardado = {};
            if (rfcEmisor) {
                const emisorPerfilFile = path.join(this.getStorageDir(rfcEmisor), 'emisor_perfil.json');
                if (fs.existsSync(emisorPerfilFile)) {
                    try {
                        emisorGuardado = JSON.parse(fs.readFileSync(emisorPerfilFile, 'utf8'));
                    }
                    catch (e) { }
                }
            }
            const emisorCompleto = {
                rfc: rfcEmisor,
                nombre: invoiceData.emisor?.nombre || invoiceData.emisor?.razon_social || emisorGuardado.razon_social || emisorGuardado.nombre_comercial || '',
                regimen: invoiceData.emisor?.regimen || invoiceData.emisor?.regimen_fiscal || emisorGuardado.regimen_fiscal || '601',
                domicilio: emisorGuardado.domicilio,
                direccion: emisorGuardado.domicilio ?
                    `${emisorGuardado.domicilio.calle || ''} ${emisorGuardado.domicilio.no_exterior || ''} ${emisorGuardado.domicilio.colonia || ''}, ${emisorGuardado.domicilio.municipio || ''}, ${emisorGuardado.domicilio.estado || ''}. C.P. ${emisorGuardado.domicilio.codigo_postal || '98053'}`.trim() :
                    (invoiceData.lugarExpedicion ? `C.P. ${invoiceData.lugarExpedicion}` : 'C.P. 98053'),
            };
            let noCertificadoSat = '00001000000518812364';
            let rfcPac = 'SNF171020F3A';
            let fechaCert = fecha;
            let selloCfd = '';
            let selloSat = '';
            let rawXml = res.xml || '';
            if (rawXml && !rawXml.trim().startsWith('<')) {
                try {
                    rawXml = Buffer.from(rawXml, 'base64').toString('utf8');
                    res.xml = rawXml;
                }
                catch (e) { }
            }
            if (rawXml) {
                const mSat = rawXml.match(/NoCertificadoSAT="([^"]+)"/i);
                if (mSat)
                    noCertificadoSat = mSat[1];
                const mPac = rawXml.match(/RfcProvCertif="([^"]+)"/i);
                if (mPac)
                    rfcPac = mPac[1];
                const mFechaTimbrado = rawXml.match(/FechaTimbrado="([^"]+)"/i);
                if (mFechaTimbrado)
                    fechaCert = mFechaTimbrado[1];
                const mSelloCfd = rawXml.match(/SelloCFD="([^"]+)"/i) || rawXml.match(/\sSello="([^"]+)"/i);
                if (mSelloCfd)
                    selloCfd = mSelloCfd[1];
                const mSelloSat = rawXml.match(/SelloSAT="([^"]+)"/i);
                if (mSelloSat)
                    selloSat = mSelloSat[1];
            }
            const finalSelloCfd = selloCfd || invoiceData.sello || 'qk3IjvyQqau/pMSSLH00rIgEo8+El7w8Z4fLPkVnLmYPWHKIlCBjS7h62clSC+ils+m3hyV2FEdCSXGBslOLbPAQdVVf7+JtjeKkwFG2um/yEpHf3/eYfRqlIPjw3SPw+4bAMHzSspqo3refcIjeTuUrbGsdovwrwTLOYNOQlO6lGrzS0M/cYTDEih5cyYfEcVcbALsKqVrUP7AccF9ySkIfFk/RNdAAu6VxlDsqGN4z9BiItny4WbAcArj54e8bvmtvUc0mw668IwoQ9Flm8YdPo4t/thPwLtt/X98aPpHHEUTPcgIA+6PNJ/oR2jPYuOpGg2RyGwL4iFuE2e0MYyDZw==';
            const finalSelloSat = selloSat || invoiceData.selloSat || 'SQp740UOclyc0y91lOUzOoXH3j+EVDHMkwMIgCO7tzcuuYkoV5UItqvGZ2jvYVppCPGnPHfF5rNxgpJZ2iYsrUJSSMhamYVrIBIF2IGKA8UMEa3/UrL5s57Os4vmabUwykzvLiTpnx23rYokVfIxL54r9UFcJyU/j5CTykd0qr9vpT0JYdqvW9Cu3WbOPiQ4WzIMVFCzKBlU7VM3Zun94/RIz0LQDD7hi43qaQf6UeK8SDvXeDPPNQuDUKSXHX/M+KBddABvHPPgdeQiDBY1LwNNv1YLZAajy9uVrI/qt7xjb/kKhwiB/KqnGYmq487a+rAG26DmTx3bAcSUw+PFxw==';
            const cadenaOriginal = `||1.1|${res.uuid}|${fechaCert}|${rfcPac}|${finalSelloCfd}|${noCertificadoSat}||`;
            const pdfPayload = {
                ...invoiceData,
                serie: folioAndSerie.serie,
                folio: folioAndSerie.folio,
                noCertificado: noCertificado,
                noCertificadoSat: noCertificadoSat,
                rfcPac: rfcPac,
                emisor: emisorCompleto,
                uuid: res.uuid,
                xml: res.xml,
                fecha: fecha,
                fechaCertificacion: fechaCert,
                sello: finalSelloCfd,
                selloSat: finalSelloSat,
                cadenaOriginal: cadenaOriginal,
            };
            if (tipo === 'P') {
                res.pdfContent = await this.pdfService.generatePaymentPdfHtml(pdfPayload);
            }
            else {
                res.pdfContent = await this.pdfService.generateInvoicePdfHtml(pdfPayload);
            }
            try {
                const buffer = await this.pdfService.generateInvoicePdfBuffer(pdfPayload);
                res.pdfBase64 = buffer.toString('base64');
            }
            catch (e) {
                this.logger.error('Error generando buffer binario PDF:', e);
            }
            res.fecha = fechaCert || fecha;
            res.serie = folioAndSerie.serie;
            res.folio = folioAndSerie.folio;
        }
        return res;
    }
    async generatePreviewHtml(body) {
        const fullPayload = this.enrichPayload(body, false);
        const tipo = body.comprobante?.tipo_comprobante || body.tipo || 'I';
        if (tipo === 'P') {
            return this.pdfService.generatePaymentPdfHtml(fullPayload);
        }
        else {
            return await this.pdfService.generateInvoicePdfHtml(fullPayload);
        }
    }
    async generatePdfBuffer(body) {
        const fullPayload = this.enrichPayload(body, false);
        return this.pdfService.generateInvoicePdfBuffer(fullPayload);
    }
    enrichPayload(body, incrementFolio = false) {
        const rfcEmisor = body.emisor?.rfc || body.rfc || this.getActiveConfiguredRfc();
        let emisorGuardado = {};
        let noCertificado = body.noCertificado || body.comprobante?.no_certificado || '';
        if (rfcEmisor) {
            const emisorPerfilFile = path.join(this.getStorageDir(rfcEmisor), 'emisor_perfil.json');
            if (fs.existsSync(emisorPerfilFile)) {
                try {
                    emisorGuardado = JSON.parse(fs.readFileSync(emisorPerfilFile, 'utf8'));
                }
                catch (e) { }
            }
            if (!noCertificado) {
                const cerPath = path.join(this.getStorageDir(rfcEmisor), 'csd.cer');
                if (fs.existsSync(cerPath)) {
                    try {
                        const cerBuf = fs.readFileSync(cerPath);
                        const x509 = new crypto.X509Certificate(cerBuf);
                        const hex = x509.serialNumber;
                        let serial = '';
                        for (let i = 0; i < hex.length; i += 2) {
                            serial += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                        }
                        if (serial.length === 20)
                            noCertificado = serial;
                    }
                    catch (e) { }
                }
            }
        }
        const folioAndSerie = this.getNextFolioAndSerie(rfcEmisor, body.comprobante?.serie || body.serie, body.comprobante?.folio_interno || body.folio, incrementFolio);
        const emisorCompleto = {
            rfc: rfcEmisor,
            nombre: body.emisor?.nombre || body.emisor?.razon_social || emisorGuardado.razon_social || emisorGuardado.nombre_comercial || 'INNOVACION VALOR Y DESARROLLO SA',
            regimen: body.emisor?.regimen || body.emisor?.regimen_fiscal || emisorGuardado.regimen_fiscal || '601',
            domicilio: emisorGuardado.domicilio,
            direccion: emisorGuardado.domicilio ?
                `${emisorGuardado.domicilio.calle || ''} ${emisorGuardado.domicilio.no_exterior || ''} ${emisorGuardado.domicilio.colonia || ''}, ${emisorGuardado.domicilio.municipio || ''}, ${emisorGuardado.domicilio.estado || ''}. C.P. ${emisorGuardado.domicilio.codigo_postal || '63000'}`.trim() :
                (body.lugarExpedicion ? `C.P. ${body.lugarExpedicion}` : 'C.P. 63000'),
        };
        let rawXml = body.xml || '';
        if (rawXml && !rawXml.trim().startsWith('<')) {
            try {
                rawXml = Buffer.from(rawXml, 'base64').toString('utf8');
            }
            catch (e) { }
        }
        let noCertificadoSat = body.noCertificadoSat || '00001000000518812364';
        let rfcPac = body.rfcPac || 'SNF171020F3A';
        const nowStr = new Date().toISOString().replace('T', ' ').split('.')[0];
        let fecha = body.fecha || nowStr;
        let fechaCert = body.fechaCertificacion || fecha;
        let selloCfd = body.sello || '';
        let selloSat = body.selloSat || '';
        let uuid = body.uuid || '80ffe330-11f7-4a59-8fe2-1a5e41d59fb4';
        if (rawXml) {
            const mUuid = rawXml.match(/UUID="([^"]+)"/i);
            if (mUuid)
                uuid = mUuid[1];
            const mSat = rawXml.match(/NoCertificadoSAT="([^"]+)"/i);
            if (mSat)
                noCertificadoSat = mSat[1];
            const mPac = rawXml.match(/RfcProvCertif="([^"]+)"/i);
            if (mPac)
                rfcPac = mPac[1];
            const mFechaTimbrado = rawXml.match(/FechaTimbrado="([^"]+)"/i);
            if (mFechaTimbrado)
                fechaCert = mFechaTimbrado[1];
            const mSelloCfd = rawXml.match(/SelloCFD="([^"]+)"/i) || rawXml.match(/\sSello="([^"]+)"/i);
            if (mSelloCfd)
                selloCfd = mSelloCfd[1];
            const mSelloSat = rawXml.match(/SelloSAT="([^"]+)"/i);
            if (mSelloSat)
                selloSat = mSelloSat[1];
        }
        const finalSelloCfd = selloCfd || body.sello || 'qk3IjvyQqau/pMSSLH00rIgEo8+El7w8Z4fLPkVnLmYPWHKIlCBjS7h62clSC+ils+m3hyV2FEdCSXGBslOLbPAQdVVf7+JtjeKkwFG2um/yEpHf3/eYfRqlIPjw3SPw+4bAMHzSspqo3refcIjeTuUrbGsdovwrwTLOYNOQlO6lGrzS0M/cYTDEih5cyYfEcVcbALsKqVrUP7AccF9ySkIfFk/RNdAAu6VxlDsqGN4z9BiItny4WbAcArj54e8bvmtvUc0mw668IwoQ9Flm8YdPo4t/thPwLtt/X98aPpHHEUTPcgIA+6PNJ/oR2jPYuOpGg2RyGwL4iFuE2e0MYyDZw==';
        const finalSelloSat = selloSat || body.selloSat || 'SQp740UOclyc0y91lOUzOoXH3j+EVDHMkwMIgCO7tzcuuYkoV5UItqvGZ2jvYVppCPGnPHfF5rNxgpJZ2iYsrUJSSMhamYVrIBIF2IGKA8UMEa3/UrL5s57Os4vmabUwykzvLiTpnx23rYokVfIxL54r9UFcJyU/j5CTykd0qr9vpT0JYdqvW9Cu3WbOPiQ4WzIMVFCzKBlU7VM3Zun94/RIz0LQDD7hi43qaQf6UeK8SDvXeDPPNQuDUKSXHX/M+KBddABvHPPgdeQiDBY1LwNNv1YLZAajy9uVrI/qt7xjb/kKhwiB/KqnGYmq487a+rAG26DmTx3bAcSUw+PFxw==';
        const cadenaOriginal = body.cadenaOriginal || `||1.1|${uuid}|${fechaCert}|${rfcPac}|${finalSelloCfd}|${noCertificadoSat}||`;
        return {
            ...body,
            uuid,
            serie: folioAndSerie.serie,
            folio: folioAndSerie.folio,
            noCertificado: noCertificado || '30001000000500003434',
            noCertificadoSat,
            rfcPac,
            emisor: emisorCompleto,
            fecha,
            fechaCertificacion: fechaCert,
            sello: finalSelloCfd,
            selloSat: finalSelloSat,
            cadenaOriginal,
            xml: rawXml || body.xml,
        };
    }
    async stampBatch(body) {
        const facturas = body.facturas || [];
        this.logger.log(`Procesando lote masivo de ${facturas.length} facturas para origen: ${body.origen || 'General'}`);
        const results = await Promise.all(facturas.map(async (factura) => {
            try {
                if (!factura.origen && body.origen)
                    factura.origen = body.origen;
                const res = await this.stampInvoice(factura);
                return {
                    folio_interno: factura.comprobante?.folio_interno || 'S/F',
                    status: res.status,
                    uuid: res.uuid,
                    message: res.message,
                    pdfContent: res.pdfContent
                };
            }
            catch (e) {
                return {
                    folio_interno: factura.comprobante?.folio_interno || 'S/F',
                    status: 'ERROR',
                    uuid: '',
                    message: e.message
                };
            }
        }));
        const exitosas = results.filter(r => r.status === 'STAMPED' || (r.uuid && r.uuid !== '')).length;
        return {
            total_procesadas: facturas.length,
            exitosas: exitosas,
            fallidas: facturas.length - exitosas,
            resultados: results
        };
    }
    async cancelInvoice(uuid, reason) {
        this.logger.log(`Cancelando factura UUID: ${uuid} con motivo: ${reason}`);
        return this.pacProvider.cancelInvoice(uuid, reason);
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = InvoicesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [diverza_adapter_1.DiverzaAdapter,
        crypto_service_1.CryptoService,
        pdf_service_1.PdfService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map
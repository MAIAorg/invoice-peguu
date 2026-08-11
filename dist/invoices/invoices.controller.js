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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const express = __importStar(require("express"));
const invoices_service_1 = require("./invoices.service");
let InvoicesController = class InvoicesController {
    invoicesService;
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    async getConfig(rfc) {
        return await this.invoicesService.getFullConfig(rfc);
    }
    async configureEmisor(body) {
        return await this.invoicesService.saveEmisorConfig(body);
    }
    async stamp(body) {
        const result = await this.invoicesService.stampInvoice(body);
        return result;
    }
    async previewHtml(body) {
        const html = await this.invoicesService.generatePreviewHtml(body);
        return { html };
    }
    async downloadPdf(body, res) {
        const pdfBuffer = await this.invoicesService.generatePdfBuffer(body);
        const folio = body.comprobante?.folio_interno || body.folio || 'factura';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${folio}.pdf"`);
        res.send(pdfBuffer);
    }
    async getPdfByUuid(uuid, res) {
        const pdfBuffer = await this.invoicesService.generatePdfBuffer({ uuid });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${uuid}.pdf"`);
        res.send(pdfBuffer);
    }
    async stampBatch(body) {
        const result = await this.invoicesService.stampBatch(body);
        return result;
    }
    async cancel(body) {
        const result = await this.invoicesService.cancelInvoice(body.uuid, body.motivo);
        return { success: result };
    }
    async configureCsd(body, files) {
        let cer_base64 = body.cer_base64;
        let key_base64 = body.key_base64;
        const uploadedCer = files?.cer?.[0] || files?.cer_file?.[0];
        const uploadedKey = files?.key?.[0] || files?.key_file?.[0];
        if (uploadedCer) {
            cer_base64 = uploadedCer.buffer.toString('base64');
        }
        if (uploadedKey) {
            key_base64 = uploadedKey.buffer.toString('base64');
        }
        return await this.invoicesService.saveCsdConfig({
            rfc: body.rfc,
            cer_base64,
            key_base64,
            password_csd: body.password_csd,
        });
    }
    async configureFolios(body) {
        const result = await this.invoicesService.saveFolioConfig(body);
        return result;
    }
    async configurePac(body) {
        const result = await this.invoicesService.savePacConfig(body);
        return result;
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)('configuracion'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener Configuración Completa Registrada (Emisor, CSD, PAC, Folios, Domicilio)' }),
    (0, swagger_1.ApiQuery)({ name: 'rfc', required: false, example: 'IVD920810GU2' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Objeto completo de configuración cargado desde el almacenamiento.' }),
    __param(0, (0, common_1.Query)('rfc')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getConfig", null);
__decorate([
    (0, swagger_1.ApiTags)('Configuración Emisor'),
    (0, common_1.Post)('configurar-emisor'),
    (0, swagger_1.ApiOperation)({ summary: 'Configurar Datos del Emisor, Domicilio Fiscal, Impuestos y Parámetros Estándar' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Perfil fiscal del emisor guardado correctamente.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                rfc: 'MMA1901216N2',
                razon_social: 'MAYORGA MARKETING',
                nombre_comercial: 'INKO IMPRESORES',
                email: 'admin@inkoimpresores.com',
                regimen_fiscal: '601',
                domicilio: {
                    calle: 'NEZAHUALCÓYOTL',
                    no_exterior: '310',
                    no_interior: '',
                    codigo_postal: '98053',
                    colonia: 'CNOP',
                    municipio: 'ZACATECAS',
                    estado: 'ZACATECAS',
                    pais: 'MÉXICO'
                },
                lugar_expedicion: {
                    ciudad: 'ZACATECAS',
                    estado: 'ZACATECAS',
                    codigo_postal: '98053'
                },
                impuestos_default: {
                    iva_traslado_pct: 16.00,
                    iva_retenido_pct: 0.00,
                    isr_retenido_pct: 0.00
                },
                parametros_default: {
                    uso_cfdi: 'G03',
                    forma_pago: '99',
                    metodo_pago: 'PPD'
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "configureEmisor", null);
__decorate([
    (0, common_1.Post)('timbrar'),
    (0, swagger_1.ApiOperation)({ summary: 'Timbrar Factura Individual o Factura Global CFDI 4.0' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Factura timbrada exitosamente con UUID y XML Base64.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Error de validación de datos o CSD inválido.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                origen: 'peguu_tienda',
                receptor: {
                    rfc: 'IXS7607092R5',
                    razon_social: 'INTERNACIONAL XIMBO Y SABORES SA DE CV',
                    codigo_postal: '63000',
                    regimen_fiscal: '601',
                    uso_cfdi: 'G03'
                },
                comprobante: {
                    tipo_comprobante: 'I',
                    forma_pago: '04',
                    metodo_pago: 'PUE',
                    moneda: 'MXN',
                    folio_interno: 'F-2026-101',
                    subtotal: 8038.54,
                    total: 9324.71,
                    conceptos: [
                        {
                            clave_prod_serv: '55121715',
                            cantidad: 2000,
                            clave_unidad: 'H87',
                            descripcion: 'Holográfico - etiquetas Peguu',
                            valor_unitario: 4.01927,
                            importe: 8038.54
                        }
                    ]
                }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "stamp", null);
__decorate([
    (0, common_1.Post)('vista-previa-html'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener vista previa en HTML/PDF de un comprobante (timbrado o sin timbrar)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'HTML renderizado del comprobante de acuerdo al diseño oficial de Peguu.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "previewHtml", null);
__decorate([
    (0, common_1.Post)('descargar-pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar Archivo Binario PDF (.pdf) directamente' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo binario .pdf devuelto con Content-Type application/pdf.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "downloadPdf", null);
__decorate([
    (0, common_1.Get)(':uuid/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener o visualizar archivo binario PDF por UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo binario PDF devuelto directamente.' }),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getPdfByUuid", null);
__decorate([
    (0, common_1.Post)('timbrar-lote'),
    (0, swagger_1.ApiOperation)({ summary: 'Timbrado Masivo de Facturas por Lote (Batch Invoicing)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reporte del lote procesado con lista de UUIDs y resultados.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                origen: 'peguu_erp',
                facturas: [
                    {
                        receptor: { rfc: 'IXS7607092R5', razon_social: 'CLIENTE 1 SA DE CV', codigo_postal: '63000', regimen_fiscal: '601', uso_cfdi: 'G03' },
                        comprobante: { tipo_comprobante: 'I', folio_interno: 'LOTE-101', subtotal: 8038.54, total: 9324.71, conceptos: [{ clave_prod_serv: '55121715', cantidad: 2000, clave_unidad: 'H87', descripcion: 'Etiquetas Peguu Lote 1', valor_unitario: 4.01927, importe: 8038.54 }] }
                    },
                    {
                        receptor: { rfc: 'IXS7607092R5', razon_social: 'CLIENTE 2 SA DE CV', codigo_postal: '63000', regimen_fiscal: '601', uso_cfdi: 'G03' },
                        comprobante: { tipo_comprobante: 'I', folio_interno: 'LOTE-102', subtotal: 8038.54, total: 9324.71, conceptos: [{ clave_prod_serv: '55121715', cantidad: 2000, clave_unidad: 'H87', descripcion: 'Etiquetas Peguu Lote 2', valor_unitario: 4.01927, importe: 8038.54 }] }
                    }
                ]
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "stampBatch", null);
__decorate([
    (0, common_1.Post)('cancelar'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar Factura ante el SAT' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Confirmación de solicitud de cancelación.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                uuid: 'cb15fab1-bc2c-48e3-9b1b-e33ce61ee493',
                motivo: '02'
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "cancel", null);
__decorate([
    (0, swagger_1.ApiTags)('Configuración CSD'),
    (0, common_1.Post)('configurar-csd'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'cer', maxCount: 1 },
        { name: 'key', maxCount: 1 },
        { name: 'cer_file', maxCount: 1 },
        { name: 'key_file', maxCount: 1 },
    ])),
    (0, swagger_1.ApiConsumes)('application/json', 'multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Cargar y Encriptar CSD (.cer, .key, contraseña) en JSON Base64 o subida directa de archivos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Certificado validado y encriptado exitosamente en disco.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "configureCsd", null);
__decorate([
    (0, common_1.Post)('configurar-folios'),
    (0, swagger_1.ApiOperation)({ summary: 'Configurar Serie y Folio Inicial Auto-Incrementable por Emisor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuración de folios guardada correctamente.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                rfc: 'IVD920810GU2',
                serie: 'FAC',
                folio_inicial: 5001
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "configureFolios", null);
__decorate([
    (0, swagger_1.ApiTags)('Configuración PAC'),
    (0, common_1.Post)('configurar-pac'),
    (0, swagger_1.ApiOperation)({ summary: 'Configurar Credenciales y URLs del PAC (Diverza / Timbre Fiscal)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuración del PAC actualizada y activada correctamente.' }),
    (0, swagger_1.ApiBody)({
        schema: {
            example: {
                client_id: '759412',
                token: '$2b$12$IS3EcFIDSicPMA3xNvaiYe9P9Jp.EamzkQGfzRPefdWQJV/TPVy7K',
                stamp_url: 'https://servicios.diverza.com/api/v2/documents/stamp',
                cancel_url: 'https://servicios.diverza.com/api/v2/documents/UUID/cancel'
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "configurePac", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, swagger_1.ApiTags)('Facturación'),
    (0, common_1.Controller)('api/v1/facturas'),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map
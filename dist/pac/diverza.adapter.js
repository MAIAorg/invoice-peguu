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
var DiverzaAdapter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiverzaAdapter = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let DiverzaAdapter = DiverzaAdapter_1 = class DiverzaAdapter {
    logger = new common_1.Logger(DiverzaAdapter_1.name);
    getPacConfigFile() {
        const basePath = process.env.CSD_STORAGE_PATH || path.resolve(process.cwd(), '..', 'docs', 'CSD_STORAGE');
        return path.join(basePath, 'pac_config.json');
    }
    getPacConfig() {
        const file = this.getPacConfigFile();
        if (fs.existsSync(file)) {
            try {
                return JSON.parse(fs.readFileSync(file, 'utf8'));
            }
            catch (e) {
                this.logger.warn(`No se pudo leer pac_config.json, buscando en variables de entorno.`);
            }
        }
        return {};
    }
    get clientId() {
        const config = this.getPacConfig();
        return config.client_id || process.env.DIVERZA_CLIENT_ID || '';
    }
    get token() {
        const config = this.getPacConfig();
        return config.token || process.env.DIVERZA_TOKEN || '';
    }
    get stampUrl() {
        const config = this.getPacConfig();
        return config.stamp_url || process.env.DIVERZA_STAMP_URL || 'https://servicios.diverza.com/api/v2/documents/stamp';
    }
    get cancelUrlTemplate() {
        const config = this.getPacConfig();
        return config.cancel_url || process.env.DIVERZA_CANCEL_URL || 'https://servicios.diverza.com/api/v2/documents/UUID/cancel';
    }
    async stampInvoice(xmlBase64, isPayment = false, rfcEmisor) {
        if (!this.clientId || !this.token) {
            throw new common_1.BadRequestException('Falta configurar las credenciales del PAC Diverza (Client ID y Token). Por favor configúrelas en la sección "III) Datos de PAC".');
        }
        const targetRfc = rfcEmisor || '';
        try {
            const docType = isPayment
                ? 'application/vnd.diverza.cfdi_4.0_complemento+xml'
                : 'application/vnd.diverza.cfdi_4.0+xml';
            this.logger.log(`Conectando a PAC Diverza: ${this.stampUrl} | Client ID: ${this.clientId} | RFC Emisor: ${targetRfc}`);
            const response = await axios_1.default.post(this.stampUrl, {
                credentials: {
                    id: this.clientId,
                    token: this.token,
                },
                issuer: { rfc: targetRfc },
                document: {
                    content: xmlBase64,
                    format: 'xml',
                    type: docType,
                    template: 'letter',
                    section: 'all',
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'id': this.clientId,
                    'token': this.token,
                    'client_id': this.clientId,
                },
            });
            const data = response.data;
            this.logger.log(`✅ ¡Respuesta Exitosa de Diverza PAC! UUID: ${data.uuid || data.id}`);
            return {
                uuid: data.uuid || data.id || crypto.randomUUID(),
                xml: data.content || data.xml || xmlBase64,
                pdfContent: data.pdf,
                status: 'STAMPED',
                message: 'Factura timbrada exitosamente con PAC Diverza',
            };
        }
        catch (error) {
            const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
            this.logger.error(`Error del PAC Diverza: ${errorMsg}`);
            return {
                uuid: '',
                xml: '',
                status: 'ERROR',
                message: errorMsg,
            };
        }
    }
    async cancelInvoice(uuid, reason) {
        if (!this.clientId || !this.token) {
            throw new common_1.BadRequestException('Falta configurar las credenciales del PAC Diverza para cancelación.');
        }
        try {
            const url = this.cancelUrlTemplate.replace('UUID', uuid);
            this.logger.log(`Cancelando factura ante PAC Diverza (${uuid}): ${url}`);
            const response = await axios_1.default.post(url, {
                credentials: {
                    id: this.clientId,
                    token: this.token,
                },
                cancellation: {
                    motivo: reason,
                },
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'id': this.clientId,
                    'token': this.token,
                    'client_id': this.clientId,
                },
            });
            return response.status === 200 || response.status === 201;
        }
        catch (error) {
            this.logger.error(`Error cancelando factura ${uuid} con PAC Diverza: ${error.message}`);
            return false;
        }
    }
    async getVouchersCount() {
        return 0;
    }
};
exports.DiverzaAdapter = DiverzaAdapter;
exports.DiverzaAdapter = DiverzaAdapter = DiverzaAdapter_1 = __decorate([
    (0, common_1.Injectable)()
], DiverzaAdapter);
//# sourceMappingURL=diverza.adapter.js.map
import { DiverzaAdapter } from '../pac/diverza.adapter';
import { StampedResponse } from '../pac/pac.interface';
import { CryptoService } from '../common/services/crypto.service';
import { PdfService } from './pdf.service';
export declare class InvoicesService {
    private readonly pacProvider;
    private readonly cryptoService;
    private readonly pdfService;
    private readonly logger;
    constructor(pacProvider: DiverzaAdapter, cryptoService: CryptoService, pdfService: PdfService);
    generateOriginalChainIngreso(data: any, fecha: string): string;
    generateOriginalChainPago(data: any, fecha: string): string;
    private getStorageBaseDir;
    private getStorageDir;
    private getDemoDir;
    savePacConfig(body: {
        client_id?: string;
        token?: string;
        stamp_url?: string;
        cancel_url?: string;
    }): Promise<{
        success: boolean;
        config: {
            client_id: any;
            token: any;
            stamp_url: any;
            cancel_url: any;
            actualizado_el: string;
        };
        message: string;
    }>;
    saveEmisorConfig(body: {
        rfc: string;
        razon_social?: string;
        nombre_comercial?: string;
        email?: string;
        regimen_fiscal?: string;
        domicilio?: {
            calle?: string;
            no_exterior?: string;
            no_interior?: string;
            codigo_postal?: string;
            colonia?: string;
            localidad?: string;
            municipio?: string;
            estado?: string;
            pais?: string;
            referencia?: string;
            telefono?: string;
        };
        lugar_expedicion?: {
            ciudad?: string;
            estado?: string;
            codigo_postal?: string;
        };
        impuestos_default?: {
            iva_traslado_pct?: number;
            iva_retenido_pct?: number;
            isr_retenido_pct?: number;
        };
        parametros_default?: {
            uso_cfdi?: string;
            forma_pago?: string;
            metodo_pago?: string;
        };
    }): Promise<{
        success: boolean;
        perfil: {
            rfc: string;
            razon_social: any;
            nombre_comercial: any;
            email: any;
            regimen_fiscal: any;
            domicilio: any;
            lugar_expedicion: any;
            impuestos_default: {
                iva_traslado_pct: any;
                iva_retenido_pct: any;
                isr_retenido_pct: any;
            };
            parametros_default: {
                uso_cfdi: any;
                forma_pago: any;
                metodo_pago: any;
            };
            actualizado_el: string;
        };
        message: string;
    }>;
    private getActiveConfiguredRfc;
    getFullConfig(rfc?: string): Promise<{
        rfc: string;
        emisor: {};
        csd: {
            tiene_cer: boolean;
            tiene_key_enc: boolean;
        };
        pac: {};
        folios: {};
    }>;
    saveFolioConfig(body: {
        rfc: string;
        serie?: string;
        folio_inicial?: number;
    }): Promise<{
        success: boolean;
        rfc: string;
        serie: string;
        siguiente_folio: number;
        message: string;
    }>;
    private getNextFolioAndSerie;
    saveCsdConfig(body: {
        rfc: string;
        cer_base64: string;
        key_base64: string;
        password_csd: string;
    }): Promise<{
        success: boolean;
        rfc: string;
        message: string;
    }>;
    stampInvoice(invoiceData: any): Promise<StampedResponse>;
    generatePreviewHtml(body: any): Promise<string>;
    generatePdfBuffer(body: any): Promise<Buffer>;
    private enrichPayload;
    stampBatch(body: {
        origen?: string;
        facturas: any[];
    }): Promise<any>;
    cancelInvoice(uuid: string, reason: string): Promise<boolean>;
}

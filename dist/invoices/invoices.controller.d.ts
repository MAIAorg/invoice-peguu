import * as express from 'express';
import { InvoicesService } from './invoices.service';
export declare class InvoicesController {
    private readonly invoicesService;
    constructor(invoicesService: InvoicesService);
    getConfig(rfc?: string): Promise<{
        rfc: string;
        emisor: {};
        csd: {
            tiene_cer: boolean;
            tiene_key_enc: boolean;
        };
        pac: {};
        folios: {};
    }>;
    configureEmisor(body: any): Promise<{
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
    stamp(body: any): Promise<import("../pac/pac.interface").StampedResponse>;
    previewHtml(body: any): Promise<{
        html: string;
    }>;
    downloadPdf(body: any, res: express.Response): Promise<void>;
    getPdfByUuid(uuid: string, res: express.Response): Promise<void>;
    stampBatch(body: {
        origen?: string;
        facturas: any[];
    }): Promise<any>;
    cancel(body: {
        uuid: string;
        motivo: string;
    }): Promise<{
        success: boolean;
    }>;
    configureCsd(body: any, files?: {
        cer?: any[];
        key?: any[];
        cer_file?: any[];
        key_file?: any[];
    }): Promise<{
        success: boolean;
        rfc: string;
        message: string;
    }>;
    configureFolios(body: {
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
    configurePac(body: {
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
}

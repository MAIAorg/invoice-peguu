export declare class PdfService {
    private readonly logger;
    private formatCurrency;
    private formatQuantity;
    private formatLetras;
    private getLogoHeaderSvg;
    private getLogoFooterSvg;
    generatePaymentPdfHtml(data: any): string;
    generateInvoicePdfHtml(data: any): Promise<string>;
    generateInvoicePdfBuffer(data: any): Promise<Buffer>;
}

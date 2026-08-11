export interface StampedResponse {
    uuid: string;
    xml: string;
    pdfContent?: string;
    status: 'STAMPED' | 'ERROR';
    message?: string;
}
export interface IPacProvider {
    stampInvoice(xmlBase64: string): Promise<StampedResponse>;
    cancelInvoice(uuid: string, reason: string): Promise<boolean>;
    getVouchersCount?(): Promise<number>;
}

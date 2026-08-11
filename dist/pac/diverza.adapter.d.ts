import { IPacProvider, StampedResponse } from './pac.interface';
export declare class DiverzaAdapter implements IPacProvider {
    private readonly logger;
    private getPacConfigFile;
    private getPacConfig;
    private get clientId();
    private get token();
    private get stampUrl();
    private get cancelUrlTemplate();
    stampInvoice(xmlBase64: string, isPayment?: boolean, rfcEmisor?: string): Promise<StampedResponse>;
    cancelInvoice(uuid: string, reason: string): Promise<boolean>;
    getVouchersCount(): Promise<number>;
}

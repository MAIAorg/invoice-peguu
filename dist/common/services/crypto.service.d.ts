export declare class CryptoService {
    private readonly algorithm;
    private readonly key;
    encrypt(data: Buffer): {
        encryptedData: Buffer;
        iv: Buffer;
        authTag: Buffer;
    };
    decrypt(encryptedData: Buffer, iv: Buffer, authTag: Buffer): Buffer;
    encryptToBuffer(data: Buffer | string): Buffer;
    decryptFromBuffer(combined: Buffer): Buffer;
}

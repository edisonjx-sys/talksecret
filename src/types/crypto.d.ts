/**
 * Web Crypto API type declarations for Node.js/Edge runtime compatibility
 */
declare const globalThis: {
  crypto: {
    subtle: {
      encrypt(
        algorithm: AesGcmParams,
        key: CryptoKey,
        data: Uint8Array
      ): Promise<ArrayBuffer>;
      decrypt(
        algorithm: AesGcmParams,
        key: CryptoKey,
        data: Uint8Array
      ): Promise<ArrayBuffer>;
    };
    getRandomValues<T extends Uint8Array>(array: T): T;
  };
};

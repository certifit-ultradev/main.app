export { };

declare global {
    interface Window {
        WidgetCheckout: {
            new(opts: {
                currency: string;
                amountInCents: number;
                reference: string;
                signature: string;
                publicKey: string;
            }): {
                open: (cb: (result: any) => void) => void;
            };
        };
    }
}
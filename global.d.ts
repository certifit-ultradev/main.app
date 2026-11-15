export { };

declare global {
    interface Window {
        WidgetCheckout: {
            new(opts: {
                currency: string;
                amountInCents: number;
                reference: string;
                signature: { integrity: string };
                publicKey: string;
            }): {
                open: (cb: (result: unknown) => void) => void;
            };
        };
    }
}

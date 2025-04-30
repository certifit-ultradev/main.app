import { TransactionWompiResponse } from "@/utils/types"

export class Transaction {
    id: string;
    createdAt: Date;
    amountInCents: number;
    status: string;
    reference: string;
    customerEmail: string;
    currency: string;
    paymentMethodType: string;
    paymentMethod: string;
    redirectUrl: string;
    paymentLinkId: string;

    constructor(
        data: {
            id: string;
            createdAt: Date;
            amountInCents: number;
            status: string;
            reference: string;
            customerEmail: string;
            currency: string;
            paymentMethodType: string;
            paymentMethod: string;
            redirectUrl: string;
            paymentLinkId: string;
        }
    ) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.amountInCents = data.amountInCents;
        this.status = data.status;
        this.reference = data.reference;
        this.customerEmail = data.customerEmail;
        this.currency = data.currency;
        this.paymentMethodType = data.paymentMethodType;
        this.paymentMethod = data.paymentMethod;
        this.redirectUrl = data.redirectUrl;
        this.paymentLinkId = data.paymentLinkId;
    }

    static fromWompiResponse(originalResponse: TransactionWompiResponse) {
        const { data } = originalResponse;

        return new Transaction({
            id: data.id,
            createdAt: new Date(data.created_at),
            amountInCents: data.amount_in_cents,
            status: data.status,
            reference: data.reference,
            customerEmail: data.customer_email,
            currency: data.currency,
            paymentMethodType: data.payment_method_type,
            paymentMethod: data.payment_method.phone_number,
            redirectUrl: data.redirect_url,
            paymentLinkId: data.payment_link_id
        });
    }
}
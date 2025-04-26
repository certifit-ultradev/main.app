export class Transaction {
    id: string
    createdAt: Date
    amountInCents: number
    status: string
    reference: string
    customerEmail: string
    currency: string
    paymentMethodType: string
    paymentMethod: string
    redirectUrl: string
    paymentLinkId: string

    constructor({
        id,
        createdAt,
        amountInCents,
        status,
        reference,
        customerEmail,
        currency,
        paymentMethodType,
        paymentMethod,
        redirectUrl,
        paymentLinkId,
    }) {
        this.id = id;
        this.createdAt = createdAt;
        this.amountInCents = amountInCents;
        this.status = status;
        this.reference = reference;
        this.customerEmail = customerEmail;
        this.currency = currency;
        this.paymentMethodType = paymentMethodType;
        this.paymentMethod = paymentMethod;
        this.redirectUrl = redirectUrl;
        this.paymentLinkId = paymentLinkId;
    }

    static fromWompiResponse(originalResponse) {
        const { data } = originalResponse;

        return new Transaction({
            id: data.id,
            createdAt: data.created_at,
            amountInCents: data.amount_in_cents,
            status: data.status,
            reference: data.reference,
            customerEmail: data.customer_email,
            currency: data.currency,
            paymentMethodType: data.payment_method_type,
            paymentMethod: {
                type: data.payment_method.type,
                phoneNumber: data.payment_method.phone_number,
            },
            redirectUrl: data.redirect_url,
            paymentLinkId: data.payment_link_id,
        });
    }
}
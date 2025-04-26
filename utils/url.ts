export const getPaymentReviewUrl = () => {
    const domain = process.env.NEXT_PUBLIC_DOMAIN;
    return `${domain}/payment-review`;
}
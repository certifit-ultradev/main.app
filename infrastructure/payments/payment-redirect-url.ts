import { getPublicAppUrl } from '@/config/env';

/** Payment-specific return location, kept beside the provider integration. */
export const getPaymentReviewUrl = (): string => `${getPublicAppUrl()}/payment-review`;

/** Minimal persistence projection required to quote a course payment. */
export type PaymentCourseRecord = {
    id: number;
    canonicalId: string;
    price: number;
    isActive: boolean;
    expiresAt: Date;
};

export interface PaymentCourseReadPort {
    /** A course unavailable for quotation is represented by `null`, not an exception. */
    findCourseForQuote(canonicalId: string): Promise<PaymentCourseRecord | null>;
    /** Existence predicates return a boolean rather than an optional record. */
    hasEnrollment(courseId: number, userId: string): Promise<boolean>;
}

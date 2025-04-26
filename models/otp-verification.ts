export class OtpVerification {
    id: string
    sid: string
    value: string
    type: string
    status: string
    attempts: number
    constructor(data?: Partial<OtpVerification>) {
        Object.assign(this, data);
    }
} 
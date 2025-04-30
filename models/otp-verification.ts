export class OtpVerification {
    id?: string;
    sid: string;
    value: string;
    type: string;
    status: string;
    attempts: number;

    constructor(
        data: {
            id?: string;
            sid: string;
            value: string;
            type: string;
            status: string;
            attempts: number;
        }
    ) {
        this.id = data.id;
        this.sid = data.sid;
        this.value = data.value;
        this.type = data.type;
        this.status = data.status;
        this.attempts = data.attempts;
    }
} 
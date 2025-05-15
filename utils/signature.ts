
export const generateSignature = async (reference: string, price: number, signatureKey: string) => {
    return generateHash(`${reference}${price}COP${signatureKey}`);
}

export const generateHash = async (value: string): Promise<string> => {
    const encondedText = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encondedText);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

function getValueByPath(obj: EventData, path: string) {
    const parts = path.split('.');
    return parts.reduce((acc: any, key) => {
        return acc && acc[key];
    }, obj);
}

type EventData = {
    id: string
    created_at: Date
    amount_in_cents: number
    status: string
    reference: string
    customer_email: string
    currency: string
    payment_method_type: string
    payment_method: {
        phone_number: string
    };
    redirect_url: string
    payment_link_id: string
    properties: string[];
}


export const verifyEventSignature = async (data: EventData, timestamp: string, eventKey: string | undefined): Promise<string> => {
    const extractedValues = data.properties.map((prop) => {
        return getValueByPath(data, prop);
    });

    return generateHash(`${extractedValues.join('')}${timestamp}${eventKey}`);
}
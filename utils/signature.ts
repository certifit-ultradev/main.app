
export const generateSignature = async (reference: string, price: number, signatureKey: string) => {
    return generateHash(`${reference}${price}COP${signatureKey}`);
}

export const generateHash = async (value: string): string => {
    const encondedText = new TextEncoder().encode(value);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encondedText);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

function getValueByPath(obj, path) {
    const parts = path.split('.');
    return parts.reduce((acc, key) => {
        return acc && acc[key];
    }, obj);
}


export const verifyEventSignature = async (data, timestamp, eventKey): string => {
    const extractedValues = data.properties.map((prop) => {
        return getValueByPath(data, prop);
    });

    return generateHash(`${extractedValues.join('')}${timestamp}${eventKey}`);
}
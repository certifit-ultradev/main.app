import { v4 as uuidv4 } from "uuid";

export const generateExpirationToken = () => {
    return {
        token: uuidv4(),
        expires: new Date(new Date().getTime() + 3600 * 1000)
    }
}

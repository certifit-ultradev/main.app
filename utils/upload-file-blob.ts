import { PutBlobResult } from '@vercel/blob';
import { v4 as uuidv4 } from "uuid";
import { upload } from '@vercel/blob/client';

export const uploadFile = async (pathName: string, file: File): Promise<PutBlobResult> => {
    const fullPath = pathName + generateFileName(file.type);
    return await upload(fullPath, file, {
        access: 'public',
        handleUploadUrl: '/api/blob-upload',
    });
}

export const generateFileName = (type: string): string => {
    let fileName = uuidv4();
    switch (type) {
        case 'video/mp4':
            fileName = `${fileName}.mp4`;
            break;
        case 'image/png':
            fileName = `${fileName}.png`;
            break;
        case 'image/jpeg':
            fileName = `${fileName}.jpg`;
            break;
        default:
            throw new Error("Formato invalido");
    }
    return fileName;
}
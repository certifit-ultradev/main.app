import { upload } from '@vercel/blob/client';
import { v4 as uuidv4 } from 'uuid';

export type UploadedAsset = Readonly<{ url: string; pathname: string }>;

export const generateEditorAssetName = (mimeType: string): string => {
    let extension: string;
    switch (mimeType) {
        case 'video/mp4': extension = 'mp4'; break;
        case 'image/png': extension = 'png'; break;
        case 'image/jpeg': extension = 'jpg'; break;
        default: throw new Error('Formato de archivo inválido');
    }
    return `${uuidv4()}.${extension}`;
};

export const uploadEditorAsset = async (path: string, file: File): Promise<UploadedAsset> => {
    const result = await upload(`${path}${generateEditorAssetName(file.type)}`, file, {
        access: 'public', handleUploadUrl: '/api/blob-upload', multipart: true,
    });
    return { url: result.url, pathname: result.pathname };
};

import { v4 as uuidv4 } from 'uuid';

const extensions: Record<string, string> = {
    'video/mp4': 'mp4',
    'image/png': 'png',
    'image/jpeg': 'jpg',
};

export const generateAssetFileName = (mimeType: string): string => {
    const extension = extensions[mimeType];
    if (!extension) throw new Error('Formato invalido');
    return `${uuidv4()}.${extension}`;
};

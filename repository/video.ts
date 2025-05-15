import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';
import { generateFileName } from '@/utils/upload-file-blob';

/**
 * Save a video file to local storage and return the URL.
 * @param {File} file - The video file to save.
 * @returns {Promise<string>} - The URL of the saved video.
 */
export const saveVideoLocalStorage = async (file: File): Promise<string> => {
    if (!file) {
        throw new Error('No file provided');
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileName = `${uuidv4()}-${file.name}`;
    const filePath = path.join(uploadsDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save the file to the uploads directory
    await fs.promises.writeFile(filePath, buffer);
    const videoUrl = `/uploads/${fileName}`;
    return videoUrl;
};

/**
 * Save a video file to Vercel Blob Storage and return the URL.
 * @param {string} path - The path where the video will be saved.
 * @param {File} file - The video file to save.
 * @returns {Promise<string>} - The URL of the saved video.
 */
export const saveVideoVercelBlobStorage = async (path: string, file: File): Promise<string> => {
    const fullPath = path + generateFileName(file.type);
    const blob = await put(fullPath, file, {
        access: 'public',
    });
    revalidatePath('/');

    return blob.url;
};
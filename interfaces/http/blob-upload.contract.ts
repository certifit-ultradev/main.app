import { z } from 'zod';

const BlobGenerateTokenRequestSchema = z.object({
    type: z.literal('blob.generate-client-token'),
    payload: z.object({
        pathname: z.string().min(1),
        callbackUrl: z.string().url(),
        multipart: z.boolean(),
        clientPayload: z.string().nullable(),
    }).strict(),
}).strict();

const BlobUploadCompletedRequestSchema = z.object({
    type: z.literal('blob.upload-completed'),
    payload: z.object({
        blob: z.object({
            url: z.string().url(),
            downloadUrl: z.string().url(),
            pathname: z.string().min(1),
            contentType: z.string().min(1),
            contentDisposition: z.string().min(1),
        }).passthrough(),
        tokenPayload: z.string().nullable().optional(),
    }).passthrough(),
}).strict();

/** Vercel Blob's signed callback envelope, validated before reaching its SDK adapter. */
export const BlobUploadRequestSchema = z.union([
    BlobGenerateTokenRequestSchema,
    BlobUploadCompletedRequestSchema,
]);

export type BlobUploadRequest = z.infer<typeof BlobUploadRequestSchema>;

/** Minimal JSON envelope consumed by the Vercel client upload protocol. */
export const BlobUploadResponseSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('blob.generate-client-token'),
        clientToken: z.string().min(1),
    }).strict(),
    z.object({
        type: z.literal('blob.upload-completed'),
        response: z.literal('ok'),
    }).strict(),
]);

export type BlobUploadResponse = z.infer<typeof BlobUploadResponseSchema>;

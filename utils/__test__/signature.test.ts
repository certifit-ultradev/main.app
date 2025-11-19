import { generateSignature, generateHash, verifyEventSignature } from '../signature';

describe('utils/signature', () => {
    describe('generateHash', () => {
        it('should generate SHA-256 hash for given string', async () => {
            const input = 'test-string';
            const result = await generateHash(input);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64); // SHA-256 produces 64 hex characters
            expect(result).toMatch(/^[a-f0-9]{64}$/);
        });

        it('should generate consistent hash for same input', async () => {
            const input = 'consistent-test';
            const hash1 = await generateHash(input);
            const hash2 = await generateHash(input);
            
            expect(hash1).toBe(hash2);
        });

        it('should generate different hashes for different inputs', async () => {
            const hash1 = await generateHash('input1');
            const hash2 = await generateHash('input2');
            
            expect(hash1).not.toBe(hash2);
        });

        it('should handle empty string', async () => {
            const result = await generateHash('');
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });

        it('should handle special characters', async () => {
            const input = '!@#$%^&*()_+-={}[]|:";\'<>?,./';
            const result = await generateHash(input);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });

        it('should handle unicode characters', async () => {
            const input = '你好世界🌍';
            const result = await generateHash(input);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });

        it('should handle very long strings', async () => {
            const input = 'a'.repeat(10000);
            const result = await generateHash(input);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });
    });

    describe('generateSignature', () => {
        it('should generate signature from reference, price and key', async () => {
            const reference = 'REF-12345';
            const price = 50000;
            const signatureKey = 'test-key';
            
            const result = await generateSignature(reference, price, signatureKey);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
            expect(result).toMatch(/^[a-f0-9]{64}$/);
        });

        it('should format signature with COP currency', async () => {
            const reference = 'REF-001';
            const price = 100000;
            const signatureKey = 'key123';
            
            const expectedInput = `${reference}${price}COP${signatureKey}`;
            const expectedHash = await generateHash(expectedInput);
            const result = await generateSignature(reference, price, signatureKey);
            
            expect(result).toBe(expectedHash);
        });

        it('should generate consistent signature for same inputs', async () => {
            const reference = 'REF-999';
            const price = 75000;
            const signatureKey = 'secret';
            
            const sig1 = await generateSignature(reference, price, signatureKey);
            const sig2 = await generateSignature(reference, price, signatureKey);
            
            expect(sig1).toBe(sig2);
        });

        it('should generate different signatures for different references', async () => {
            const price = 50000;
            const signatureKey = 'key';
            
            const sig1 = await generateSignature('REF-001', price, signatureKey);
            const sig2 = await generateSignature('REF-002', price, signatureKey);
            
            expect(sig1).not.toBe(sig2);
        });

        it('should generate different signatures for different prices', async () => {
            const reference = 'REF-123';
            const signatureKey = 'key';
            
            const sig1 = await generateSignature(reference, 10000, signatureKey);
            const sig2 = await generateSignature(reference, 20000, signatureKey);
            
            expect(sig1).not.toBe(sig2);
        });

        it('should generate different signatures for different keys', async () => {
            const reference = 'REF-123';
            const price = 50000;
            
            const sig1 = await generateSignature(reference, price, 'key1');
            const sig2 = await generateSignature(reference, price, 'key2');
            
            expect(sig1).not.toBe(sig2);
        });

        it('should handle zero price', async () => {
            const reference = 'REF-FREE';
            const price = 0;
            const signatureKey = 'key';
            
            const result = await generateSignature(reference, price, signatureKey);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });
    });

    describe('verifyEventSignature', () => {
        const mockEventData: any = {
            id: 'evt-123',
            created_at: new Date('2024-01-01'),
            amount_in_cents: 50000,
            status: 'APPROVED',
            reference: 'REF-123',
            customer_email: 'test@test.com',
            currency: 'COP',
            payment_method_type: 'CARD',
            payment_method: {
                phone_number: '1234567890',
            },
            redirect_url: 'https://example.com',
            payment_link_id: 'link-123',
            properties: ['id', 'status', 'amount_in_cents'],
        };

        it('should generate event signature from data properties', async () => {
            const timestamp = '1640995200';
            const eventKey = 'event-secret';
            
            const result = await verifyEventSignature(mockEventData, timestamp, eventKey);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
            expect(result).toMatch(/^[a-f0-9]{64}$/);
        });

        it('should extract values from data using properties paths', async () => {
            const timestamp = '1640995200';
            const eventKey = 'secret';
            
            const expectedInput = `evt-123APPROVED50000${timestamp}${eventKey}`;
            const expectedHash = await generateHash(expectedInput);
            const result = await verifyEventSignature(mockEventData, timestamp, eventKey);
            
            expect(result).toBe(expectedHash);
        });

        it('should generate consistent signature for same inputs', async () => {
            const timestamp = '1640995200';
            const eventKey = 'secret';
            
            const sig1 = await verifyEventSignature(mockEventData, timestamp, eventKey);
            const sig2 = await verifyEventSignature(mockEventData, timestamp, eventKey);
            
            expect(sig1).toBe(sig2);
        });

        it('should handle nested property paths', async () => {
            const dataWithNested: any = {
                ...mockEventData,
                properties: ['id', 'payment_method.phone_number'],
            };
            const timestamp = '1640995200';
            const eventKey = 'secret';
            
            const result = await verifyEventSignature(dataWithNested, timestamp, eventKey);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });

        it('should handle undefined eventKey', async () => {
            const timestamp = '1640995200';
            
            const result = await verifyEventSignature(mockEventData, timestamp, undefined);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });

        it('should generate different signatures for different timestamps', async () => {
            const eventKey = 'secret';
            
            const sig1 = await verifyEventSignature(mockEventData, '1640995200', eventKey);
            const sig2 = await verifyEventSignature(mockEventData, '1640995300', eventKey);
            
            expect(sig1).not.toBe(sig2);
        });

        it('should handle empty properties array', async () => {
            const dataWithEmptyProps: any = {
                ...mockEventData,
                properties: [],
            };
            const timestamp = '1640995200';
            const eventKey = 'secret';
            
            const result = await verifyEventSignature(dataWithEmptyProps, timestamp, eventKey);
            
            expect(typeof result).toBe('string');
            expect(result.length).toBe(64);
        });

        it('should handle single property', async () => {
            const dataWithSingleProp: any = {
                ...mockEventData,
                properties: ['id'],
            };
            const timestamp = '1640995200';
            const eventKey = 'secret';
            
            const expectedInput = `evt-123${timestamp}${eventKey}`;
            const expectedHash = await generateHash(expectedInput);
            const result = await verifyEventSignature(dataWithSingleProp, timestamp, eventKey);
            
            expect(result).toBe(expectedHash);
        });
    });
});

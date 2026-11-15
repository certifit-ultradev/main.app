import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '@/application/identity/password-hasher.port';

const BCRYPT_COST = 10;

export const bcryptPasswordHasher: PasswordHasher = {
    hash(plainPassword) {
        return bcrypt.hash(plainPassword, BCRYPT_COST);
    },
};

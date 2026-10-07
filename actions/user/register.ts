'use server';

import { editUserById, registerUser } from '@/services/user';
import { actionFailure, actionSuccess, type ActionResult } from '@/interfaces/actions/action-result';
import { withAdminAction } from '@/interfaces/actions/action-context';
import {
    CreateAdminUserInputSchema,
    UpdateAdminUserInputSchema,
    UserIdInputSchema,
} from '@/interfaces/actions/admin.contract';
import { validateActionInput } from '@/interfaces/actions/validation';

function unexpectedUserError(): ActionResult<never> {
    return actionFailure('UNEXPECTED', 'No fue posible completar la operación de usuarios.');
}

export async function register(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(CreateAdminUserInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const userData = {
                name: parsedInput.data.name,
                lastName: parsedInput.data.lastName,
                email: parsedInput.data.email,
                phoneNumber: parsedInput.data.phoneNumber,
                password: parsedInput.data.password,
                identification: parsedInput.data.identification,
                identificationType: parsedInput.data.identificationType,
            };
            const user = await registerUser(userData);
            return user
                ? actionSuccess(null, 'Usuario creado correctamente.')
                : actionFailure('UNEXPECTED', 'No se pudo crear el usuario.');
        } catch {
            return unexpectedUserError();
        }
    });
}

export async function edit(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(UpdateAdminUserInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const userData = {
                name: parsedInput.data.name,
                lastName: parsedInput.data.lastName,
                email: parsedInput.data.email,
                phoneNumber: parsedInput.data.phoneNumber,
                identification: parsedInput.data.identification,
                identificationType: parsedInput.data.identificationType,
                ...(parsedInput.data.password ? { password: parsedInput.data.password } : {}),
            };
            const user = await editUserById(parsedInput.data.id, userData);
            return user
                ? actionSuccess(null, 'Usuario editado correctamente.')
                : actionFailure('NOT_FOUND', 'El usuario no existe.');
        } catch {
            return unexpectedUserError();
        }
    });
}

export async function activate(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(UserIdInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const user = await editUserById(parsedInput.data.id, { emailVerified: new Date() });
            return user
                ? actionSuccess(null, 'Usuario activado correctamente.')
                : actionFailure('NOT_FOUND', 'El usuario no existe.');
        } catch {
            return unexpectedUserError();
        }
    });
}

export async function deactivate(input: unknown): Promise<ActionResult<null>> {
    const parsedInput = validateActionInput(UserIdInputSchema, input);
    if (!parsedInput.ok) return parsedInput;

    return withAdminAction(async () => {
        try {
            const user = await editUserById(parsedInput.data.id, { emailVerified: null });
            return user
                ? actionSuccess(null, 'Usuario desactivado correctamente.')
                : actionFailure('NOT_FOUND', 'El usuario no existe.');
        } catch {
            return unexpectedUserError();
        }
    });
}

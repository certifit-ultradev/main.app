import { getAuthenticatedActor } from '@/infrastructure/auth/authenticated-actor';
import { InsufficientRoleError } from '@/exceptions/actor-access-errors';
import { mapErrorToAPIResponse } from '@/exceptions/error-encoder';
import { getClientProfile, editClientProfile } from '@/services/client-profile';
import { apiSuccess } from '@/interfaces/http/api-response';
import { UpdateClientProfileSchema } from '@/interfaces/http/users/profile.contract';

const privateResponse = <T>(data: T): Response => Response.json(apiSuccess(data), {
    headers: { 'Cache-Control': 'private, no-store' },
});

async function clientId(): Promise<string> {
    const actor = await getAuthenticatedActor();
    if (actor.isAdmin) throw new InsufficientRoleError();
    return actor.id;
}

export async function GET(): Promise<Response> {
    try {
        return privateResponse(await getClientProfile(await clientId()));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}

export async function PATCH(request: Request): Promise<Response> {
    try {
        const userId = await clientId();
        const patch = UpdateClientProfileSchema.parse(await request.json());
        return privateResponse(await editClientProfile(userId, patch));
    } catch (error) {
        return mapErrorToAPIResponse(error);
    }
}

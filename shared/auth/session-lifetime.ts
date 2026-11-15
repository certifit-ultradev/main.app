export const SESSION_WITHOUT_REMEMBER_SECONDS = 24 * 60 * 60;
export const REMEMBERED_SESSION_SECONDS = 30 * 24 * 60 * 60;

export function sessionDeadline(rememberMe: boolean, now = Date.now()): number {
    return now + (rememberMe ? REMEMBERED_SESSION_SECONDS : SESSION_WITHOUT_REMEMBER_SECONDS) * 1000;
}

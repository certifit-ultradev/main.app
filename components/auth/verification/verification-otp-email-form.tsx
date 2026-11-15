'use client';

import { FormError } from '@/components/form/form-error';
import { FormSuccess } from '@/components/form/form-success';
import type { RegistrationFormValues } from '@/features/auth/registration/registration-form.types';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { sendVerificationToken } from '@/actions/auth/verification-token';

interface VerificationOtpEmailProps {
    data: RegistrationFormValues;
}

/**
 * The email link is the confirmation channel. We intentionally do not poll an
 * account status by email, because that endpoint would reveal account state.
 */
export const VerificationOtpEmailForm = ({ data }: VerificationOtpEmailProps) => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [status, setStatus] = useState('Enviando correo de verificación...');

    const requestVerificationEmail = useCallback(async () => {
        const response = await sendVerificationToken({ email: data.email });
        if (response.ok) {
            setSuccess(response.message);
            setStatus('Revisa tu bandeja de entrada para continuar.');
            return;
        }
        setError(response.error.message);
        setStatus('');
    }, [data.email]);

    useEffect(() => {
        requestVerificationEmail().catch(() => {
            setError('No fue posible procesar la solicitud. Intenta nuevamente.');
            setStatus('');
        });
    }, [requestVerificationEmail]);

    const onClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setError(undefined);
        setSuccess(undefined);
        setStatus('Enviando correo de verificación...');
        try {
            await requestVerificationEmail();
        } catch {
            setError('No fue posible procesar la solicitud. Intenta nuevamente.');
            setStatus('');
        }
    };

    return (
        <div className={cn('justify-center items-center')}>
            <div className={cn('flex flex-col justify-center items-center bg-white p-10')}>
                <div className={cn('w-full max-w-lg min-w-[20rem]')}>
                    <h1 className={cn('text-2xl font-semibold mb-4 text-left')}>¡Registro casi completo!</h1>
                    <p className={cn('text-gray-500 mb-6 text-left')}>
                        Revisa tu bandeja de entrada y confirma tu correo desde el enlace recibido. Después podrás iniciar sesión.
                    </p>
                    <ol className={cn('list-decimal m-6 text-gray-500')}>
                        <li>Busca el correo de Certifit con el asunto “Confirma tu correo electrónico”.</li>
                        <li>Abre el enlace de confirmación.</li>
                        <li>Inicia sesión una vez confirmada tu cuenta.</li>
                    </ol>
                    <p className={cn('text-gray-500 mb-4')}>{status}</p>
                    <FormError error={error} />
                    <FormSuccess message={success} />
                    <button type="button" onClick={onClick} className={cn('mt-4 text-[#0BBBE7] hover:underline')}>
                        Reenviar correo de activación
                    </button>
                </div>
            </div>
        </div>
    );
};

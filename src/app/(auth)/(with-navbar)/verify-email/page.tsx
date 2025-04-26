'use client';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Card, Spinner } from '@nextui-org/react';
import { FaCircleCheck, FaCircleExclamation } from 'react-icons/fa6';
import { verifyEmail } from '@/actions/auth/verification-token';
import { cn } from '@/lib/utils';

const VerifyEmailPage = () => {
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const searchParams = useSearchParams();

    const token = searchParams.get('token');

    const onSubmit = useCallback(() => {
        if (success || error) return;

        if (!token) {
            setError('No se recibió el token!');
            return;
        }

        verifyEmail(token)
            .then((data) => {
                if (data.success) {
                    setSuccess(data.message);
                }
                setError(data.error);
            })
            .catch(() => {
                setError('Ocurrio un error!');
            });
    }, [token, success, error]);

    useEffect(() => {
        onSubmit();
    }, [onSubmit]);

    return (
        <div className={cn('flex flex-col justify-center items-center bg-white p-10')}>
            <Card className={cn('w-96')}>
                {!success && !error && (
                    <>
                        <h1 className={cn('text-lg font-bold text-center')}>Verificando</h1>
                        <Spinner />
                    </>
                )}
                {success && (
                    <div className={cn('bg-green-400/30 p-2 flex items-center w-full rounded-lg')}>
                        <FaCircleCheck size={20} className={cn('text-green-600')} />
                        <p className={cn(' text-sm ml-1 text-green-700')}>{success}</p>
                    </div>
                )}
                {error && (
                    <div className={cn('bg-red-400/30 p-2 flex items-center w-full rounded-lg')}>
                        <FaCircleExclamation size={20} className={cn('text-red-600')} />
                        <p className={cn(' text-sm ml-1 text-red-700')}>{error}</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default VerifyEmailPage;
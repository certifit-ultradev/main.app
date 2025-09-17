import { FormError } from '@/components/form/form-error';
import { FormSuccess } from '@/components/form/form-success';
import { RegisterPageData } from '@/utils/types';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { sendVerificationToken } from '@/actions/auth/verification-token';
import { checkIfUserIsActive } from '@/actions/user/user-verified';
import Modal from '@/components/modal';
import { useRouter } from 'next/navigation';
import { CheckIcon } from '@/components/svg/certifit-icons';

interface VerificationOtpEmailProps {
    data: RegisterPageData;
};

export const VerificationOtpEmailForm = ({ data }: VerificationOtpEmailProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const [status, setStatus] = useState('Enviando correo de verificación...');
    const [isActive, setIsActive] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        const sendVerificationEmail = async () => {
            try {
                const response = await sendVerificationToken(data.email);
                if (response.success) {
                    setStatus('Correo de verificación enviado.');
                } else {
                    const data = response.error;
                    setError(data ?? 'Algo ocurrio, intente mas tarde');
                    setStatus('');
                }
            } catch (error) {
                console.error('Error al enviar el correo de verificación:', error);
                setError('Error al enviar el correo de verificación.');
                setStatus('');
            }
        };

        sendVerificationEmail();
    }, [data.email]);

    useEffect(() => {
        const checkActivationStatus = async () => {
            try {
                const result = await checkIfUserIsActive(data.email);
                if (result.success) {
                    setIsActive(true);
                    setIsOpen(true);
                    clearInterval(intervalId);
                    setSuccess('¡Cuenta activada! Puedes continuar.');
                }
            } catch (error) {
                console.error('Error al verificar el estado de activación:', error);
            }
        }

        const intervalId = setInterval(checkActivationStatus, 5000);

        return () => {
            clearInterval(intervalId);
        };
    }, [data.email]);

    const onClick = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        setError("");
        await sendVerificationToken(data.email);
    }

    const handleModalClose = () => {
        setIsOpen(false);
        router.push('/login');
    };

    return (
        <div className={cn('justify-center items-center')}>
            <div className={cn('flex flex-col justify-center items-center bg-white p-10')}>
                <div className={cn('w-full max-w-lg min-w-[20rem]')}>
                    <div>
                        <h1 className={cn('text-2xl font-semibold mb-4 text-left w-full max-w-lg')}>
                            ¡Registro casi completo!
                        </h1>
                        <span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>
                            Hemos enviado un correo electrónico de activación a la dirección {data.email}.
                            Para completar tu registro y activar tu cuenta, sigue estos pasos:
                        </span>
                    </div>
                    <div className={cn('flex relative mb-4 items-center justify-center')}>
                        {!isActive ? (
                            <svg className={cn('animate-spin h-5 w-5 text-black')} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z'></path>
                            </svg>
                        ) : (<CheckIcon width={20} height={20} className={cn('text-5xl text text-[#2A8940]')} />)}
                    </div>
                    <ol className={cn('list-decimal m-6')}>
                        <li><span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>Revisa tu bandeja de entrada: Busca un correo de Certifit con el asunto &apos;Activa tu cuenta&apos;.</span></li>
                        <li><span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>Haz clic en el botón de activación: Dentro del correo encontrarás un botón o enlace para activar tu cuenta.</span></li>
                        <li><span className={cn('text-gray-500 mb-6 text-left w-full max-w-lg')}>Inicia sesión: Una vez que hayas activado tu cuenta, podrás iniciar sesión y disfrutar de todos nuestros servicios.</span></li>
                    </ol>

                    <div className={cn('relative mb-4')}>
                        <label>
                            No recibio el correo?
                            <a onClick={onClick} className={cn('text-[#0BBBE7]')} target='_blank' >
                                reenviar
                            </a>
                        </label>
                        <div className={cn('relative mb-4')}>
                            {status && <p className={cn('text-gray-500 mb-4')}>{status}</p>}
                            <FormError error={error} />
                            <FormSuccess message={success} />
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <Modal open={isOpen} setOpen={handleModalClose} closeButton={true}>
                    <div>
                        <div className={cn('sm:flex sm:items-start')}>
                            <div className={cn('text-center sm:text-left w-full')}>
                                <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                                    <div className={cn('rounded-2xl flex items-center justify-center w-[89px] h-[89px] bg-[#EBF9EE]')}>
                                        <div className={cn('rounded-2xl flex items-center justify-center w-[65px] h-[65px] bg-[#CEF4D7]')}>
                                            <svg className={cn('text-5xl text')} width='56' height='57' viewBox='0 0 56 57' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                <path d='M28.0325 5.16406C15.1455 5.16406 4.69922 15.6104 4.69922 28.4974C4.69922 41.3843 15.1455 51.8307 28.0325 51.8307C39.8859 51.8307 49.8352 42.9453 51.2212 31.2693C51.3705 29.9883 50.4582 28.7961 49.1772 28.6421C47.8985 28.4927 46.7039 29.405 46.5545 30.686C45.4462 40.0193 37.5152 47.164 28.0325 47.164C17.7239 47.164 9.36588 38.806 9.36588 28.4974C9.36588 18.1887 17.7239 9.83072 28.0325 9.83072C30.1862 9.83072 32.3189 10.2204 34.3045 10.925C35.5179 11.3544 36.7895 10.68 37.2212 9.46671C37.6505 8.25104 37.0485 6.90709 35.8352 6.47542C33.3525 5.59576 30.7182 5.16406 28.0325 5.16406ZM49.0325 9.83072C48.4352 9.83072 47.8099 10.0407 47.3549 10.4864L27.0105 30.539C26.4109 31.1294 25.8065 31.015 25.3352 30.3197L23.0019 26.8921C22.2879 25.8397 20.7899 25.534 19.7212 26.2364C18.6502 26.9387 18.3492 28.3924 19.0632 29.4447L21.3966 32.8724C23.4989 35.9733 27.6125 36.384 30.2935 33.7474L50.7102 13.7694C51.6202 12.8734 51.6202 11.3824 50.7102 10.4864C50.2552 10.0384 49.6298 9.83072 49.0325 9.83072Z' fill='#3BAE56' />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                                    <p>¡Bienvenido {data.name} {data.lastName}!</p>
                                </div>
                                <div className={cn('grid px-4 bg-[#F5F8FE] py-3 justify-items-center items-center sm:px-6')}>
                                    ¡Gracias por unirte a nuestra comunidad!

                                    Estamos emocionados de ser parte de tu viaje hacia el aprendizaje y el crecimiento personal.
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
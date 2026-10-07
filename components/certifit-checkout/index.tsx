'use client'

import { cn } from '@/lib/utils';
import React, { useCallback, useState } from 'react'
import Modal from '../modal';
import { CheckIcon, XIcon } from '../svg/certifit-icons';
import SubmitButton from '../submitButton';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { parseCheckoutWidgetTransactionId, quoteCourseCheckout, registerCourseCheckout } from '@/features/payments/checkout.client';

interface CertifitCheckoutProps {
    courseCanonicalId: string
    closeCheckout: () => void;
}

export default function CertifitCheckoutComponent({ courseCanonicalId }: CertifitCheckoutProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState({
        success: false,
        message: ''
    });
    const { status } = useSession();
    const handleLogin = useCallback(() => router.push(`/login?callbackUrl=${encodeURIComponent("/#top-courses")}`), [router]);

    const handleOpenCheckout = () => {
        setIsLoading(true);
        const startTrx = async () => {
            try {
                const trx = await quoteCourseCheckout(courseCanonicalId);
                const widget = new window.WidgetCheckout({
                    currency: trx.currency,
                    amountInCents: trx.amountInCents,
                    reference: trx.reference,
                    signature: { integrity: trx.signature.integrity },
                    publicKey: trx.publicKey
                });
                widget.open(async (result) => {
                    try {
                        const transactionId = parseCheckoutWidgetTransactionId(result);
                        const resultPurchase = await registerCourseCheckout(trx.purchaseId, transactionId);
                        setResult({
                            success: true,
                            message: resultPurchase.message
                        });
                        setIsOpen(true);
                    } catch (error) {
                        setResult({ success: false, message: error instanceof Error ? error.message : 'No fue posible registrar el pago.' });
                        setIsOpen(true);
                    }
                });
                setIsLoading(false);
            } catch (error) {
                setResult({ success: false, message: error instanceof Error ? error.message : 'No fue posible iniciar el pago.' });
                setIsLoading(false);
                setIsOpen(true);
            }
        };
        startTrx();

    };

    const handleModalClose = () => {
        setIsOpen(false);
        window.location.reload();
    };

    return (
        <>
            {status == "authenticated" ? <div>
                    <SubmitButton onClick={handleOpenCheckout} disabled={false} isLoading={isLoading} label={'Pagar con Wompi'} customClass={cn('mt-6 lg:mt-0 px-6 py-3 bg-[#0BBBE7] hover:bg-[#009fdf] font-semibold rounded-full transition-colors text-white')} />
                </div> : <><SubmitButton onClick={handleLogin} disabled={false} isLoading={isLoading} label={'Iniciar sesión'} customClass={cn('mt-6 lg:mt-0 px-6 py-3 bg-[#0BBBE7] hover:bg-[#009fdf] font-semibold rounded-full transition-colors text-white')} /></>}
                
            <div>
                <ModalPurchaseResult result={result} isOpen={isOpen} setOpen={handleModalClose} />
            </div>
        </>
    );
}

type ModalPurchaseResultProp = {
    result: {
        success: boolean,
        message: string
    }
    isOpen: boolean;
    setOpen: () => void;
}

const ModalPurchaseResult = ({ result, isOpen, setOpen }: ModalPurchaseResultProp) => {
    const colorStatus = result.success ? 'bg-[#EBF9EE]' : 'bg-[#F4CECE]';

    return (
        <Modal open={isOpen} setOpen={setOpen} closeButton={true}>
            <div>
                <div className={cn('sm:flex sm:items-start')}>
                    <div className={cn('text-center sm:text-left w-full')}>
                        <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                            <div className={cn(`rounded-2xl flex items-center justify-center w-[89px] h-[89px] ${colorStatus}`)}>
                                <div className={cn(`rounded-2xl flex items-center justify-center w-[65px] h-[65px] ${colorStatus}`)}>
                                    {result.success ? <CheckIcon width={56} height={57} className={cn('text-5xl text')} /> : <XIcon width={56} height={57} className={cn('text-5xl text')} />}
                                </div>
                            </div>
                            <p>Resultado del Pago</p>
                        </div>
                        <div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6')}>
                            {result.message}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

'use client'

import { cn } from '@/lib/utils';
import React, { useCallback, useState } from 'react'
import Modal from '../modal';
import { CheckIcon, XIcon } from '../svg/certifit-icons';
import SubmitButton from '../submitButton';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
                const response = await fetch('/api/payment/transactions/quote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseCanonicalId }),
                });
                const trx = await response.json();
                if (trx.success) {
                    const widget = new window.WidgetCheckout({
                        currency: trx.currency,
                        amountInCents: trx.amountInCents,
                        reference: trx.reference,
                        signature: trx.signature,
                        publicKey: trx.publicKey
                    });
                    const currentOpenFunc = widget.open;
                    console.log(widget, currentOpenFunc);


                    widget.open(async (result) => {
                        const response = await fetch('/api/payment/transactions', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ purchaseId: trx.purchaseId, id: result.transaction.id }),
                        });
                        const resultPurchase = await response.json();
                        setResult({
                            success: resultPurchase.success,
                            message: resultPurchase.message
                        });
                        setIsOpen(true);
                        setIsLoading(false);
                    });
                } else {
                    setResult({
                        success: false,
                        message: trx.message
                    });
                    setIsLoading(false);
                    setIsOpen(true);
                }
            } catch (error) {
                if (error instanceof Error) {
                    setResult({
                        success: false,
                        message: error.message
                    });
                    setIsLoading(false);
                    setIsOpen(true);
                }
                console.error(error);
            }
        };
        startTrx();

        setInterval(() => {
            setIsLoading(false);
        }, 2000);
    };

    const handleModalClose = () => {
        setIsOpen(false);
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
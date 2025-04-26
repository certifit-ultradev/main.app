import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';
import { Dispatch, SetStateAction } from 'react';

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

interface ModalProps extends PropsWithChildren {
	open: boolean;
	closeButton: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
	onClose?: () => void;
}

function Modal(props: ModalProps) {
	const { open, setOpen, onClose, children, closeButton = true } = props

	const handleClose = () => {
		setOpen(false);
		if (onClose) {
			onClose(); // Llamamos a la función onClose si está definida
		}
	};

	return (
		<Dialog open={open} onClose={handleClose} className={cn('relative z-10')}>
			<DialogBackdrop
				transition
				className={cn('fixed inset-0 bg-gray-500/75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in')}
			/>
			<div className={cn('fixed inset-0 z-10 w-screen overflow-y-auto')}>
				<div className={cn('flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0')}>
					<DialogPanel
						transition
						className={cn('relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95')}
					>
						<div className={cn('bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4')}>
							{children}
						</div>
						{closeButton && (
							<div className={cn('grid px-4 py-3 justify-items-center items-center sm:px-6 mb-4')}>
								<button
									type='button'
									data-autofocus
									onClick={handleClose}
									className={cn('w-32 bg-[#0BBBE7] text-white py-2 rounded-full hover:bg-[#009fdf] transition-colors')}
								>
									Cerrar
								</button>
							</div>
						)}
					</DialogPanel>
				</div>
			</div>
		</Dialog>
	)
}

export default Modal

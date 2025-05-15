import React, { MouseEventHandler, ReactElement, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type Options = Array<{
    label: string | ReactElement
    value: string
    handleClick: MouseEventHandler<HTMLElement>
}>

interface MobileMenuProps {
    options: Options
}

export default function MobileMenu(props: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { options } = props;

    const handleToggle = () => setIsOpen(!isOpen);
    const handleClose = () => setIsOpen(false);

    return (
        <>
            <button onClick={handleToggle}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            {isOpen && (
                <div className={cn('fixed inset-0 bg-[#121313] bg-opacity-100 z-50 flex flex-col p-4 w-full')}>
                    <div className={cn('flex items-center justify-between mb-8')}>
                        <Image unoptimized={true} src="/logo.png" alt="logo" width={100} height={30} className={cn('w-20')} />
                        <button onClick={handleClose}>
                            <svg className={cn('w-6 h-6 text-white')} fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className={cn('flex items-center pr-4 justify-center')}>
                        <span className={cn('text-gray-400 mb-6')}>Menu</span>
                    </div>
                    {options.map((option, i) => {
                        return (
                            <button key={i} type='button' onClick={(e) => { handleClose(); option.handleClick(e); }} className={cn('hover:bg-white hover:text-black text-white font-semibold pr-4 py-2 rounded-full mb-4')}>{option.label}</button>
                        )
                    })}
                </div>
            )}
        </>
    );
}

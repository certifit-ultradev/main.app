'use client';

import { useEffect, useRef, useState } from 'react';
import { DEFAULT_DIAL_CODE, DIAL_CODES, splitPhoneNumber } from '@/shared/phone-number';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup,
    DropdownMenuRadioItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type PhoneNumberFieldProps = {
    value?: string;
    onChange: (value: string) => void;
    id: string;
    variant?: 'light' | 'dark';
    size?: 'regular' | 'compact';
    disabled?: boolean;
};

/** Keeps the country calling code separate in the UI and emits the stored digits. */
export function PhoneNumberField({ value = '', onChange, id, variant = 'light', size = 'regular', disabled }: PhoneNumberFieldProps) {
    const [dialCode, setDialCode] = useState(() => splitPhoneNumber(value).dialCode);
    const lastEmitted = useRef<string | null>(null);

    useEffect(() => {
        if (value !== lastEmitted.current) setDialCode(splitPhoneNumber(value).dialCode);
    }, [value]);

    const nationalNumber = value.startsWith(dialCode)
        ? value.slice(dialCode.length)
        : splitPhoneNumber(value).nationalNumber;

    const emit = (nextCode: string, nextNational: string) => {
        const combined = `${nextCode}${nextNational}`;
        lastEmitted.current = combined;
        onChange(combined);
    };

    const styles = variant === 'dark'
        ? 'border-gray-700 bg-[#0B0B0B] text-white'
        : 'border-gray-300 bg-white text-gray-900';
    const padding = size === 'compact' ? 'py-2' : 'py-3';

    return <div className="flex w-full min-w-0 max-w-full gap-2">
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild disabled={disabled}>
                <button type="button" aria-label="Indicativo telefónico"
                    className={`flex w-24 shrink-0 items-center justify-between rounded-lg border px-2 focus:outline-none focus:border-[#0BBBE7] ${padding} ${styles}`}>
                    <span>+{dialCode || DEFAULT_DIAL_CODE}</span><span aria-hidden="true">▾</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" avoidCollisions={false}
                style={{ maxHeight: 'min(12rem, var(--radix-dropdown-menu-content-available-height, 12rem))' }}
                className={`w-28 overflow-y-auto overscroll-contain ${styles}`}>
                <DropdownMenuRadioGroup value={dialCode} onValueChange={(nextCode) => {
                    setDialCode(nextCode);
                    emit(nextCode, nationalNumber);
                }}>
                    {DIAL_CODES.map((code) => <DropdownMenuRadioItem key={code} value={code}
                        className={variant === 'dark' ? 'focus:bg-gray-700 focus:text-white' : ''}>
                        +{code}
                    </DropdownMenuRadioItem>)}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <label htmlFor={id} className="sr-only">Número de teléfono sin indicativo</label>
        <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="Número sin indicativo"
            value={nationalNumber}
            required
            disabled={disabled}
            maxLength={15 - dialCode.length}
            onChange={(event) => {
                const raw = event.target.value;
                const digits = raw.replace(/\D/g, '').slice(0, 15);
                if (raw.trim().startsWith('+')) {
                    const parsed = splitPhoneNumber(digits);
                    setDialCode(parsed.dialCode);
                    emit(parsed.dialCode, parsed.nationalNumber.slice(0, 15 - parsed.dialCode.length));
                } else {
                    emit(dialCode, digits.slice(0, 15 - dialCode.length));
                }
            }}
            className={`min-w-0 flex-1 rounded-lg border px-3 focus:outline-none focus:border-[#0BBBE7] ${padding} ${styles}`}
        />
    </div>;
}

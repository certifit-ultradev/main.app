/** @jest-environment jsdom */
import { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PhoneNumberField } from '@/components/form/phone-number-field';

const mockChange = jest.fn();

function Form({ initial = '573001234567' }: { initial?: string }) {
    const [value, setValue] = useState(initial);
    return <PhoneNumberField id="phone" value={value} onChange={(next) => { mockChange(next); setValue(next); }} />;
}

describe('PhoneNumberField', () => {
    it('keeps the number separate when changing between one-, two- and three-digit codes', async () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        try {
            await act(async () => root.render(<Form />));
            const trigger = container.querySelector('[aria-label="Indicativo telefónico"]') as HTMLButtonElement;
            const input = container.querySelector('input') as HTMLInputElement;
            expect(trigger.textContent).toContain('+57');
            expect(input.value).toBe('3001234567');

            await act(async () => { trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); });
            const menu = document.querySelector('[role="menu"]') as HTMLElement;
            expect(menu.className).toContain('overflow-y-auto');
            expect(menu.style.maxHeight).toContain('12rem');
            expect(menu.getAttribute('data-side')).toBe('bottom');
            const option = (code: string) => Array.from(document.querySelectorAll('[role="menuitemradio"]'))
                .find((item) => item.textContent?.trim() === `+${code}`) as HTMLElement;
            expect(option('1')).toBeDefined();
            await act(async () => { option('1').click(); });
            expect(trigger.textContent).toContain('+1');
            expect(input.value).toBe('3001234567');
            expect(mockChange).toHaveBeenLastCalledWith('13001234567');

            await act(async () => { trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); });
            await act(async () => { option('355').click(); });
            expect(trigger.textContent).toContain('+355');
            expect(input.value).toBe('3001234567');
            expect(mockChange).toHaveBeenLastCalledWith('3553001234567');
        } finally {
            await act(async () => root.unmount());
            container.remove();
            mockChange.mockClear();
        }
    });

    it('starts an empty number with the Colombian calling code', async () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        try {
            await act(async () => root.render(<Form initial="" />));
            expect((container.querySelector('[aria-label="Indicativo telefónico"]') as HTMLButtonElement).textContent).toContain('+57');
            expect((container.querySelector('input') as HTMLInputElement).value).toBe('');
        } finally {
            await act(async () => root.unmount());
            container.remove();
        }
    });

    it('accepts an international paste without adding the selected code twice', async () => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = createRoot(container);
        try {
            await act(async () => root.render(<Form initial="" />));
            const input = container.querySelector('input') as HTMLInputElement;
            const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            await act(async () => {
                setValue?.call(input, '+1 415 555 2671');
                input.dispatchEvent(new Event('input', { bubbles: true }));
            });
            expect((container.querySelector('[aria-label="Indicativo telefónico"]') as HTMLButtonElement).textContent).toContain('+1');
            expect(input.value).toBe('4155552671');
            expect(mockChange).toHaveBeenLastCalledWith('14155552671');
        } finally {
            await act(async () => root.unmount());
            container.remove();
            mockChange.mockClear();
        }
    });
});

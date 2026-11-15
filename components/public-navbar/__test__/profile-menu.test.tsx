/** @jest-environment jsdom */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSession } from 'next-auth/react';
import { useOptionalClientProfile } from '@/features/users/client/client-profile-context';
import PublicNavbar from '@/components/public-navbar';

const mockPush = jest.fn();
jest.mock('next-auth/react', () => ({ useSession: jest.fn() }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
jest.mock('@/actions/auth/logout', () => ({ logout: jest.fn() }));
jest.mock('@/features/users/client/client-profile-context', () => ({ useOptionalClientProfile: jest.fn() }));
jest.mock('@/components/dropdown', () => ({
    __esModule: true,
    default: ({ label, options }: { label: React.ReactNode; options: Array<{ label: string }> }) =>
        <div>{label}{options.map((option) => <span key={option.label}>{option.label}</span>)}</div>,
}));

describe('public navbar profile menu', () => {
    let container: HTMLDivElement;
    let root: Root;

    beforeEach(() => {
        Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        (useOptionalClientProfile as jest.Mock).mockReturnValue({ profile: {
            name: 'Pablo', lastName: 'Lozano', profileImage: null,
        } });
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
        jest.clearAllMocks();
    });

    it('shows profile and initials in desktop and mobile menus for a client', async () => {
        (useSession as jest.Mock).mockReturnValue({ status: 'authenticated', data: { user: { name: 'Pablo', isAdmin: false } } });
        await act(async () => root.render(<PublicNavbar />));
        expect(container.textContent).toContain('Mi perfil');
        expect(container.textContent).not.toContain('Administración');
        expect(container.querySelectorAll('[aria-label="Perfil de Pablo Lozano"]')).toHaveLength(2);
        expect(container.textContent).toContain('PL');

        await act(async () => { (container.querySelector('[aria-label="Abrir menú"]') as HTMLButtonElement).click(); });
        expect(container.textContent?.match(/Mi perfil/g)).toHaveLength(2);
        await act(async () => {
            Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Mi perfil')?.click();
        });
        expect(mockPush).toHaveBeenCalledWith('/users/profile');
    });

    it('shows administration for administrators in desktop and mobile menus', async () => {
        (useSession as jest.Mock).mockReturnValue({ status: 'authenticated', data: { user: { name: 'Admin', isAdmin: true } } });
        await act(async () => root.render(<PublicNavbar />));
        expect(container.textContent).not.toContain('Mi perfil');
        expect(container.textContent).toContain('Administración');
        await act(async () => { (container.querySelector('[aria-label="Abrir menú"]') as HTMLButtonElement).click(); });
        expect(container.textContent).not.toContain('Mi perfil');
        expect(container.textContent?.match(/Administración/g)).toHaveLength(2);
        await act(async () => {
            Array.from(container.querySelectorAll('button')).find((button) => button.textContent === 'Administración')?.click();
        });
        expect(mockPush).toHaveBeenCalledWith('/admin');
    });
});

import { useCallback, type JSX } from 'react'
import MobileMenu from './components/mobileMenu'
import { useRouter } from 'next/navigation'
import { logout } from '@/actions/auth/logout'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import Dropdown from '../dropdown'
import { Button } from '../ui/button'
import { useSession } from 'next-auth/react'
import { navbarListDesktop } from './constants'
import { ProfileAvatar } from '@/components/user/profile-avatar'
import { useOptionalClientProfile } from '@/features/users/client/client-profile-context'

function Navbar(): JSX.Element {
    const { data: session, status } = useSession();
    const clientProfile = useOptionalClientProfile()?.profile;
    const router = useRouter();
    const handleLogout = useCallback(async () => {
        await logout()
    }, []);

    const isLogged = status == "authenticated";
    const role = session?.user.isAdmin ? 'admin' : 'user';

    const itemsPerRole = navbarListDesktop.filter((item) => {
        return item.roles.find((rol) =>
            rol === role
        );
    })

    const handleLogin = useCallback(() => router.push(`/login`), [router])
    const handlerChangePassword = useCallback(() => router.push(`/users/change-password`), [router])
    const handleProfile = useCallback(() => router.push('/users/profile'), [router])
    const handleAdministration = useCallback(() => router.push('/admin'), [router])
    const handleRegister = useCallback(() => router.push(`/register`), [router])

    // Opciones para el menú móvil
    const mobileOptions = [
        // Opciones condicionales dependiendo si está logueado o no
        ...(!isLogged
            ? [
                { label: 'Login', value: 'login', handleClick: handleLogin },
                { label: 'Crear cuenta', value: 'register', handleClick: handleRegister },
            ]
            : [
                ...(role === 'user' ? [{ label: 'Mi perfil', value: 'profile', handleClick: handleProfile }] : []),
                { label: 'Cambiar contraseña', value: 'change-password', handleClick: handlerChangePassword },
                { label: 'Cerrar Sesión', value: 'logout', handleClick: handleLogout },
            ]
        ),
        role === 'admin'
            ? { label: 'Administración', value: 'admin', handleClick: handleAdministration }
            : { label: 'Inicio', value: 'inicio', handleClick: () => router.push('/dashboard') },
        ...(role === 'admin' ? [{ label: 'Usuarios', value: '/admin/users', handleClick: () => router.push('/admin/users') }] : []),
        { label: 'Soporte', value: 'support', href: '/support', openInNewTab: true },
    ];

    return (
        <nav className={cn('h-20 w-full bg-[#27282B] flex justify-between px-4 sm:px-12 py-1 items-center')}>
            {/* Logo */}
            <div className="flex-shrink-0 mr-4">
                <Link href="/">
                    <Image
                        src='https://vnruzfzvnvdhb848.public.blob.vercel-storage.com/public/logo-Xm0liee8ZmpclDqhTaYAi5vKcHPiEz.png'
                        alt='logo'
                        width={100}
                        height={30}
                        className={cn('w-20')}
                        priority
                    />
                </Link>
            </div>

            {/* Menú Desktop (Mostrado en pantallas medianas o mayores) */}
            <div className="hidden lg:flex flex-grow justify-center space-x-6">
                {itemsPerRole.map((item) => item.to === '/support'
                    ? <a key={item.to} href={item.to} target="_blank" rel="noopener noreferrer" className="flex text-white hover:text-gray-300"><item.icon className={cn('h-6 mr-4')} width={20} height={20} />{item.label}</a>
                    : <Link key={item.to} href={item.to} className="flex text-white hover:text-gray-300"><item.icon className={cn('h-6 mr-4')} width={20} height={20} />{item.label}</Link>)}
            </div>

            {/* Sección Usuario Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
                {isLogged ? (
                    <>
                        <Dropdown
                            label={<ProfileAvatar
                                name={clientProfile?.name ?? session?.user.name ?? ''}
                                lastName={clientProfile?.lastName ?? ''}
                                imageUrl={clientProfile?.profileImage ?? null}
                            />}
                            optionContainerClass="mt-8 right-0 bg-[#222325] text-white shadow-2xl"
                            options={[
                                ...(role === 'user' ? [{ label: 'Mi perfil', value: 'profile', handleClick: handleProfile }] : []),
                                ...(role === 'admin' ? [{ label: 'Administración', value: 'admin', handleClick: handleAdministration }] : []),
                                { label: 'Cambiar contraseña', value: 'change-password', handleClick: handlerChangePassword },
                                { label: 'Cerrar Sesión', value: 'logout', handleClick: handleLogout },
                            ]}
                        />
                    </>
                ) : (
                    <>
                        <Button onClick={handleRegister} className={cn('bg-white text-black py-2 font-semibold rounded-full hover:bg-gray-200 transition')}>
                            Crear cuenta
                        </Button>
                        <button onClick={handleLogin} className="text-white font-semibold hover:text-gray-300 transition">
                            Iniciar sesión
                        </button>
                    </>
                )}
            </div>

            {/* Menú Móvil (visible en pantallas pequeñas) */}
            <div className="flex items-center space-x-4 lg:hidden">
                <MobileMenu options={mobileOptions} avatar={isLogged ? <ProfileAvatar
                    name={clientProfile?.name ?? session?.user.name ?? ''}
                    lastName={clientProfile?.lastName ?? ''}
                    imageUrl={clientProfile?.profileImage ?? null}
                /> : undefined} />
            </div>
        </nav>
    );
}

export default Navbar

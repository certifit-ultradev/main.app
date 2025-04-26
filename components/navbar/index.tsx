import { useCallback } from 'react'
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

function Navbar(): JSX.Element {
    const { data: session, status } = useSession();
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
                { label: 'Cambiar contraseña', value: 'profile', handleClick: handlerChangePassword },
                { label: 'Cerrar Sesión', value: 'logout', handleClick: handleLogout },
            ]
        ),
        { label: 'Inicio', value: 'inicio', handleClick: () => { window.location.href = role == 'admin' ? '/admin' : '/dashboard' } },
        role == 'admin' ? { label: 'Usuarios', value: '/admin/users', handleClick: () => { window.location.href = '/admin/users' } } : { label: 'Soporte', value: 'contact-us', handleClick: () => { window.location.hash = 'contact-us' } },
    ];

    return (
        <nav className={cn('h-20 w-full bg-[#27282B] flex justify-between px-4 sm:px-12 py-1 items-center')}>
            {/* Logo */}
            <div className="flex-shrink-0 mr-4">
                <Link href="/">
                    <Image
                        src='/logo.png'
                        alt='logo'
                        width={100}
                        height={30}
                        className={cn('w-20')}
                        priority
                    />
                </Link>
            </div>

            {/* Menú Desktop (Mostrado en pantallas medianas o mayores) */}
            <div className="hidden md:flex flex-grow justify-center space-x-6">
                {itemsPerRole.map((item, i) => {
                    return (
                        <Link key={i} href={`${item.to}`} className="flex text-white hover:text-gray-300"><item.icon className={cn('h-6 mr-4')} width={20} height={20} />{item.label}</Link>
                    )
                })}
            </div>

            {/* Sección Usuario Desktop */}
            <div className="hidden md:flex items-center space-x-4">
                {isLogged ? (
                    <>
                        <Dropdown
                            label={<div className="w-8 h-8 bg-gray-500 rounded-full" />} // Reemplazar con avatar real
                            optionContainerClass="mt-8 right-0 bg-[#222325] text-white shadow-2xl"
                            options={[
                                { label: 'Cambiar contraseña', value: 'profile', handleClick: handlerChangePassword },
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
            <div className="md:hidden flex items-center space-x-4">
                <MobileMenu options={mobileOptions} />
            </div>
        </nav>
    );
}

export default Navbar

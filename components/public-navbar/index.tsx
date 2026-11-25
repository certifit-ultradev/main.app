"use client"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Dropdown from '@/components/dropdown'
import { cn } from '@/lib/utils'
import { useCallback } from 'react'
import { logout } from '@/actions/auth/logout'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react';
import MobileMenu from './components/mobileMenu'
import { ProfileAvatar } from '@/components/user/profile-avatar'
import { useOptionalClientProfile } from '@/features/users/client/client-profile-context'

export default function PublicNavbar() {
    const { status, data: session } = useSession();
    const clientProfile = useOptionalClientProfile()?.profile;
    const router = useRouter();
    const handleLogout = useCallback(async () => {
        await logout()
    }, []);

    const isLogged = status == "authenticated";
    const isClient = isLogged && !session?.user.isAdmin;
    const isAdmin = isLogged && session?.user.isAdmin;
    const avatar = <ProfileAvatar
        name={isClient ? clientProfile?.name ?? session?.user.name ?? '' : session?.user.name ?? ''}
        lastName={isClient ? clientProfile?.lastName ?? '' : ''}
        imageUrl={isClient ? clientProfile?.profileImage ?? null : null}
    />;

    const handleLogin = useCallback(() => router.push(`/login`), [router]);
    const handlerChangePassword = useCallback(() => router.push(`/users/change-password`), [router])
    const handleProfile = useCallback(() => router.push('/users/profile'), [router]);
    const handleAdministration = useCallback(() => router.push('/admin'), [router]);
    const handleRegister = useCallback(() => router.push(`/register`), [router]);

    // Opciones para el menú móvil
    const mobileOptions = [
        // Opciones condicionales dependiendo si está logueado o no
        ...(!isLogged
            ? [
                { label: 'Login', value: 'login', handleClick: handleLogin },
                { label: 'Crear cuenta', value: 'register', handleClick: handleRegister },
            ]
            : [
                ...(isClient ? [{ label: 'Mi perfil', value: 'profile', handleClick: handleProfile }] : []),
                ...(isAdmin ? [{ label: 'Administración', value: 'admin', handleClick: handleAdministration }] : []),
                { label: 'Cambiar contraseña', value: 'password', handleClick: handlerChangePassword },
                { label: 'Cerrar Sesión', value: 'logout', handleClick: handleLogout },
            ]
        ),
        { label: 'Acerca de Nosotros', value: 'about-us', handleClick: () => { window.location.hash = 'about-us' } },
        { label: 'Cursos', value: 'courses', handleClick: () => { window.location.hash = 'courses' } },
        { label: 'Contactanos', value: 'contact-us', handleClick: () => { window.location.hash = 'contact-us' } },
    ];

    return (
        <nav className={cn('h-20 w-full bg-[#121313] flex justify-between px-4 sm:px-12 py-1 items-center')}>
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
                <a href="#about-us" className="text-white hover:text-gray-300">Acerca de Nosotros</a>
                <a href="#courses" className="text-white hover:text-gray-300">Cursos</a>
                <a href="#contact-us" className="text-white hover:text-gray-300">Contactanos</a>
            </div>

            {/* Sección Usuario Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
                {isLogged ? (
                    <>
                        <Dropdown                            
                            label={avatar}
                            optionContainerClass="mt-8 right-0 bg-[#222325] text-white shadow-2xl"
                            options={[
                                ...(isClient ? [{ label: 'Mi perfil', value: 'profile', handleClick: handleProfile }] : []),
                                ...(isAdmin ? [{ label: 'Administración', value: 'admin', handleClick: handleAdministration }] : []),
                                { label: 'Cambiar contraseña', value: 'password', handleClick: handlerChangePassword },
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
                <MobileMenu options={mobileOptions} avatar={isLogged ? avatar : undefined} />
            </div>
        </nav>
    );
}

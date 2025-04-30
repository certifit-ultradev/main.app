import { fetchUserById } from '@/actions/user/exist';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';

// @ts-expect-error: params
const UserViewPage = async ({ params }) => {
    const { id } = await params;
    const result = await fetchUserById({ data: { id } });
    if (!result.success) {
        notFound(); // Si no se encuentra el usuario, muestra una página 404
    }

    const user = result.payload;
    return (
        <div className={cn('p-6 w-[110rem] my-4 mx-auto bg-white rounded-xl shadow-md space-y-4')}>
            <h2 className={cn('text-2xl font-semibold')}>Detalles del Usuario</h2>
            <div className={cn('space-y-2')}>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Nombre:</span>
                    <span className={cn('font-medium')}>{user?.name}</span>
                </div>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Apellidos:</span>
                    <span className={cn('font-medium')}>{user?.lastName}</span>
                </div>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Correo:</span>
                    <span className={cn('font-medium')}>{user?.email}</span>
                </div>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Teléfono:</span>
                    <span className={cn('font-medium')}>{user?.phoneNumber}</span>
                </div>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Administrador:</span>
                    <span className={`font-medium ${user?.isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                        {user?.isAdmin ? 'Sí' : 'No'}
                    </span>
                </div>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Correo Verificado:</span>
                    <span className={`font-medium ${user?.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                        {user?.emailVerified ? 'Sí' : 'No'}
                    </span>
                </div>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Creado:</span>
                    <span className={cn('font-medium')}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}
                    </span>
                </div>
                <div className={cn('flex justify-between')}>
                    <span className={cn('text-gray-600')}>Actualizado:</span>
                    <span className={cn('font-medium')}>
                        {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Sin actualizaciones'}
                    </span>
                </div>
            </div>

            <div className={cn('flex justify-end mt-4')}>
                {/* Aquí puedes agregar botones de edición, eliminar, etc. */}
                <Button
                    className={cn('bg-[#0BBBE7] text-white py-2 rounded-full hover:bg-[#009fdf] transition-colors')}>
                    Editar Usuario
                </Button>
            </div>
        </div>
    );
};

export default UserViewPage;
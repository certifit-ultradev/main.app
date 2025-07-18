const { PrismaClient } = require('./app/generated/prisma/client');
const bcrypt = require('bcrypt');

const prismaCli = new PrismaClient();

async function main() {
    user();
}

async function user() {
    // Hasheamos la contraseña del usuario para mayor seguridad
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insertamos un usuario en la base de datos
    try {
        await prismaCli.user.create({
            data: {
                name: 'Admin',
                lastName: 'Admin',
                password: hashedPassword,
                isAdmin: true,
                email: 'certifit.ultra@gmail.com',
                emailVerified: new Date,
                phoneNumber: "123456789",
                createdAt: new Date(),
                updatedAt: new Date()
            },
        });
    } catch (error) {
        console.error('Usuario no creado.', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prismaCli.$disconnect();
    });
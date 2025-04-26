import { User } from "@/models/user";
import { registerUser } from "@/services/user";
import { ServerActionResponse, RegisterUser } from "@/utils/types"
import { register } from "../register";

jest.mock('@/services/user');

const mockRegisterUser: RegisterUser = {
    name: "Test",
    lastName: "Test",
    email: "test@test.com",
    phoneNumber: "+571234567890",
    password: "",
    confirmPassword: "",
    checkTerms: true
};

describe('User Register Action Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Debería registrar un usuario exitosamente', async () => {
        const userCreated: User = new User({
            name: "Test",
            lastName: "Test",
            email: "test@test.com",
            phoneNumber: "+571234567890",
            emailVerified: true
        });

        (registerUser as jest.Mock).mockResolvedValue(userCreated);

        const result = await register(mockRegisterUser);

        expect(registerUser).toHaveBeenCalledWith(mockRegisterUser);

        expect({
            success: true,
            message: 'Usuario creado correctamente.',
        }).toEqual(result);
    });

    test('Debería devolver un mensaje usuario no creado', async () => {
        (registerUser as jest.Mock).mockResolvedValue(null);

        const result = await register(mockRegisterUser);

        expect(registerUser).toHaveBeenCalledWith(mockRegisterUser);

        expect({
            success: false,
            error: 'No se pudo crear el usuario.',
        }).toEqual(result);
    });

    test('Debería manejar cualquier error y retornar el mensaje de error adecuado', async () => {
        (registerUser as jest.Mock).mockRejectedValue(new Error("some error"));

        const result = await register(mockRegisterUser);

        expect(registerUser).toHaveBeenCalledWith(mockRegisterUser);

        expect({
            success: false,
            error: 'Ocurrio un error creando el usuario, intente mas tarde.',
        }).toEqual(result);
    });
});
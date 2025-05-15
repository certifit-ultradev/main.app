import { z } from "zod";
import { CourseAlreadyPurchasedError } from "./course-already-purchased";
import { CourseInvalidStateError } from "./course-invalid-state";
import { NotFoundError } from "./not-found";
import { TransactionError } from "./transaction-error";
import { UserNotLoggedError } from "./user-not-logged";
import { UserExistError } from "./user-exist";
import { AuthError } from "next-auth";
import { Prisma } from "@/prisma/app/generated/prisma/client";

/**
 * mapErrorToAPIResponse
 * This function maps the error to a response object that can be returned to the client.
 * @param error - The error to map.
 * @returns A response object with the error message and status code.
 */
export function mapErrorToAPIResponse(error: unknown) {
    switch (true) {
        case error instanceof CourseAlreadyPurchasedError:
        case error instanceof TransactionError:
        case error instanceof UserNotLoggedError:
        case error instanceof CourseInvalidStateError:
            return Response.json({
                success: false,
                message: error.cause,
            }, { status: 400 });
        case error instanceof UserExistError:
        case error instanceof NotFoundError:
            return Response.json({
                success: false,
                message: error.cause,
            }, { status: 404 });
        case error instanceof z.ZodError:
            return Response.json({
                success: false,
                message: "Datos de respuesta invalidos"
            }, { status: 422 });
        default:
            if (error instanceof Error) {
                console.log("error", error.message, error.cause);
            }
            return Response.json({
                success: false,
                message: "ocurrio un error, intente mas tarde",
            }, { status: 500 });
    }
}

/**
 * mapErrorToServerActionResponse
 * This function maps the error to a response object that can be returned to the admin client.
 * @param error - The error to map.
 * @returns A response object with the error message and status code.
 */
export function mapErrorToServerActionResponse(error: unknown) {
    switch (true) {
        case error instanceof CourseAlreadyPurchasedError:
        case error instanceof TransactionError:
        case error instanceof UserNotLoggedError:
        case error instanceof CourseInvalidStateError:
        case error instanceof NotFoundError:
        case error instanceof UserExistError:
            return {
                success: false,
                message: error.cause,
            };
        case error instanceof AuthError:
            switch (error.type) {
                case "CredentialsSignin":
                    return { success: false, error: "Credenciales invalidas." };
                default:
                    return { success: false, error: "Algo ha pasado, intenta mas tarde!" };
            }
        
        case error instanceof Prisma.PrismaClientRustPanicError:
        case error instanceof Prisma.PrismaClientInitializationError:
        case error instanceof Prisma.PrismaClientKnownRequestError:
        case error instanceof Prisma.PrismaClientValidationError:
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log(`Error conocido de Prisma (código ${error.code}): ${error.message}`);
                // Errores conocidos de Prisma
                if (error.code === 'P2002') {
                    return {
                        success: false,
                        message: "El correo electrónico ya está en uso.",
                    }
                } else {
                    console.log(`Error conocido de Prisma (código ${error.code}): ${error.message}`);
                }
            }
            return {
                success: false,
                message: "ocurrio un error, intente mas tarde",
            };
        case error instanceof Error:
            return {
                success: false,
                message: "ocurrio un error, intente mas tarde",
            };
        case error instanceof TypeError:
            return {
                success: false,
                message: "ocurrio un error, intente mas tarde",
            };
        default:
            return {
                success: false,
                message: "ocurrio un error, intente mas tarde",
            };
    }
}

/**
 * logPrismaError
 * This function logs the Prisma error to the console.
 * @param error - The error to log.
 */
export function logPrismaError(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(`Error conocido de Prisma (código ${error.code}): ${error.message}`);
        // Errores conocidos de Prisma
        if (error.code === 'P2002') {
            console.log('Error: El correo electrónico ya está en uso.', error.message);
        } else {
            console.log(`Error conocido de Prisma (código ${error.code}): ${error.message}`);
        }
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        // Errores de validación
        console.log('Error de validación:', error.message);
    } else if (error instanceof Prisma.PrismaClientInitializationError) {
        // Errores de inicialización
        console.log('Error de inicialización del cliente de Prisma:', error.message);
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
        // Errores de pánico en Rust
        console.log('Error crítico en el motor de Prisma:', error.message);
    } else if (error instanceof Error){
        // Otros errores
        console.log('Error desconocido:', error.message);
    }
}
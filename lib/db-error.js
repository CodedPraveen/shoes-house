import { Prisma } from "@prisma/client";

export function isDatabaseUnavailable(error) {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P1001" || error.code === "P2024")
    );
}

export function logDatabaseError(error) {
    console.error("[Database]", {
        code: error.code,
        message: error.message,
    });
}
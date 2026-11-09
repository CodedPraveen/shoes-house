import { auth, clerkClient } from "@clerk/nextjs/server";
import { userService } from "@/services/user-service";
import { resolveDbUserFromClerk } from "@/lib/db-user-resolution";

// export async function requireDbUser() {
//     const { userId: clerkId } = await auth();

//     if (!clerkId) {
//         throw new Error("Unauthorized");
//     }
export async function requireDbUser({
    throwIfMissing = true,
} = {}, dependencies = {}) {
    return resolveDbUserFromClerk({
        throwIfMissing,
        auth: dependencies.auth ?? auth,
        userService: dependencies.userService ?? userService,
        clerkClient: dependencies.clerkClient ?? clerkClient,
    });
}

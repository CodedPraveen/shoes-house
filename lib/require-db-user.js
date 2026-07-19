import { auth, clerkClient } from "@clerk/nextjs/server";
import { userService } from "@/services/user-service";

// export async function requireDbUser() {
//     const { userId: clerkId } = await auth();

//     if (!clerkId) {
//         throw new Error("Unauthorized");
//     }
export async function requireDbUser({
    throwIfMissing = true,
} = {}) {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
        if (throwIfMissing) {
            throw new Error("Unauthorized");
        }

        return null;
    }

    let user = await userService.getByClerkId(clerkId);

    if (user) {
        return user;
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);

    user = await userService.upsertFromClerk({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name:
            `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
            null,
    });

    return user;
}
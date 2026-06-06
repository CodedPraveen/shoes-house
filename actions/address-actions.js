"use server";

import { auth } from "@clerk/nextjs/server";
import { addressService } from "@/services/address-service";
import { userService } from "@/services/user-service";
import { revalidatePath } from "next/cache";

async function requireDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");
  const user = await userService.getByClerkId(clerkId);
  if (!user) throw new Error("User not synced");
  return user;
}

export async function getAddressesAction() {
  const user = await requireDbUser();
  return addressService.listByUser(user.id);
}

export async function saveAddressAction(data) {
  const user = await requireDbUser();
  const row = data.id
    ? await addressService.update(user.id, data.id, data)
    : await addressService.create(user.id, data);
  revalidatePath("/profile");
  revalidatePath("/checkout");
  return row;
}

export async function deleteAddressAction(addressId) {
  const user = await requireDbUser();
  await addressService.remove(user.id, addressId);
  revalidatePath("/profile");
  revalidatePath("/checkout");
  return { ok: true };
}

export async function setDefaultAddressAction(addressId) {
  const user = await requireDbUser();
  const row = await addressService.setDefault(user.id, addressId);
  revalidatePath("/profile");
  revalidatePath("/checkout");
  return row;
}

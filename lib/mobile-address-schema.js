import { z } from "zod";

export const mobileAddressSchema = z.strictObject({
  label: z.string().max(40).optional(),
  fullName: z.string().min(1).max(100),
  phone: z.string().min(10).max(20),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).nullable().optional(),
  landmark: z.string().max(200).nullable().optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  country: z.string().max(100).optional(),
  pincode: z.string().min(6).max(10),
  isDefault: z.boolean().optional(),
});

import { slugify } from "@/lib/slugify-text";

export { slugify };

export async function ensureUniqueProductSlug(prisma, baseSlug, excludeId = null) {
  let slug = slugify(baseSlug);
  if (!slug) slug = "product";

  let candidate = slug;
  let n = 0;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!existing) return candidate;
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

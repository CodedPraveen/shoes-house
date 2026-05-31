import PageHeader from "@/components/page-header";

export default function StaticPageLayout({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <main className="pt-20">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="mx-auto w-full max-w-3xl px-5 pb-20 sm:px-8">
        <div className="space-y-6 text-sm leading-relaxed text-black/65 sm:text-base">
          {children}
        </div>
      </div>
    </main>
  );
}

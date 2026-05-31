import StaticPageLayout from "@/components/static-page-layout";
import { staticPages } from "@/data/static-content";

export function createStaticPage(slug) {
  const content = staticPages[slug];
  if (!content) return null;

  return function StaticPage() {
    return (
      <StaticPageLayout
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      >
        {content.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-medium text-black">{section.heading}</h2>
            <p className="mt-2">{section.body}</p>
          </section>
        ))}
      </StaticPageLayout>
    );
  };
}

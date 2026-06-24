import SectionReveal from "@/components/section-reveal";
import { featuredCollection } from "@/data/products";

export default function FeaturedCollection() {
  return (
    <SectionReveal id="featured" className="px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto w-full max-w-[1400px] space-y-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-black/45">
            Featured Collection
          </p>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Crafted silhouettes for every city pace.
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {featuredCollection.map((item) => (
            <article
              key={item.id}
              className="group relative overflow-hidden no54123-[2rem]"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-[400px] w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 w-full space-y-3 p-7 text-white">
                <h3 className="text-2xl font-medium tracking-tight">{item.title}</h3>
                <p className="max-w-sm text-sm text-white/85">{item.description}</p>
                <button className="no54123-full border border-white/35 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.16em] backdrop-blur transition hover:bg-white hover:text-black">
                  Discover
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionReveal>
  );
}

import SectionReveal from "@/components/section-reveal";

export default function BrandStory() {
  return (
    <SectionReveal id="story" className="px-5 py-8 sm:px-8 lg:py-10">
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 overflow-hidden no54123-[2rem] border border-black/10 bg-zinc-50 lg:grid-cols-2">
        <div className="overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1400&q=80"
            alt="Sneaker studio storytelling"
            className="h-full min-h-[360px] w-full object-cover"
          />
        </div>
        <div className="flex items-center px-6 py-10 sm:px-5">
          <div className="space-y-6">
            {/* <p className="text-xs uppercase tracking-[0.25em] text-black/45">
              Brand Story
            </p> */}
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Designed to move with your identity.
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-black/60 sm:text-base">
              We blend contemporary fashion minimalism with performance-first
              material choices. Every pair is developed for people who value
              style, detail, and comfort in equal measure.
            </p>
            <button
              type="button"
              className="no54123-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:scale-[1.02]"
            >
              Read Journal
            </button>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}

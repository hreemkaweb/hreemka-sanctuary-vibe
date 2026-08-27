import { SectionHeading } from "@/components/hreemka/primitives";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import founder from "@/assets/founder.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";

type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
};

/** Add up to 20 items here — the marquee adapts automatically. */
const items: GalleryItem[] = [
  {
    src: gallery1,
    alt: "Founder guiding a client through a tarot consultation",
    caption: "Founder with clients",
  },
  {
    src: gallery2,
    alt: "Group healing workshop seated in a circle",
    caption: "Workshops & events",
  },
  {
    src: gallery3,
    alt: "Rose quartz and amethyst crystals on ivory linen",
    caption: "Crystal healing",
  },
  {
    src: gallery4,
    alt: "Woman meditating in a sunlit sanctuary room",
    caption: "Meditation sessions",
  },
  {
    src: gallery5,
    alt: "Mala beads, singing bowl and sacred oils",
    caption: "Genuine healing products",
  },
  { src: gallery6, alt: "Two women smiling after a healing session", caption: "Happy clients" },
  { src: founder, alt: "Portrait of the Hreemka founder", caption: "Behind the scenes" },
  { src: hero2, alt: "Amethyst crystal cluster in soft light", caption: "Energy work" },
  { src: hero3, alt: "Tarot cards beside a singing bowl", caption: "Spiritual consultations" },
  { src: hero4, alt: "Peaceful sanctuary interior", caption: "Sanctuary interiors" },
];

function Card({ item }: { item: GalleryItem }) {
  return (
    <figure className="group relative w-[240px] shrink-0 overflow-hidden liquid-glass card-liquid p-2 sm:w-[300px] lg:w-[340px]">
      <div className="relative overflow-hidden rounded-[calc(var(--glass-radius)-0.5rem)]">
        <img
          src={item.src}
          alt={item.alt}
          width={900}
          height={1200}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-[300px] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.08] sm:h-[380px] lg:h-[420px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <figcaption className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-primary-foreground opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <span
            className="eyebrow"
            style={{ color: "color-mix(in oklab, var(--gold) 85%, white)" }}
          >
            Hreemka
          </span>
          <p className="mt-2 text-lg leading-snug">{item.caption}</p>
        </figcaption>
      </div>
    </figure>
  );
}

export function ExperienceGallery() {
  return (
    <section id="experience" className="relative overflow-hidden py-24 sm:py-32 veil">
      <div className="absolute inset-0 halo opacity-60" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Our Gallery"
          title="Experience Hreemka"
          subtitle="Real people. Real healing. Real transformation."
        />
      </div>

      <div className="marquee relative mt-14">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-group" aria-hidden={copy === 1}>
              {items.map((item) => (
                <Card key={`${copy}-${item.caption}`} item={item} />
              ))}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent sm:w-28" />
      </div>
    </section>
  );
}

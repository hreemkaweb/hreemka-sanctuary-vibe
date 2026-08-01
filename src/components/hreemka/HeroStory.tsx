import { useEffect, useRef, useState } from "react";
import hero1 from "@/assets/hero-1.png.asset.json";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import hero4 from "@/assets/hero-4.jpg";
import hero5 from "@/assets/hero-5.jpg";

const scenes = [
  {
    image: hero1.url,
    eyebrow: "Scene One",
    title: "Find Clarity in Life",
    text: "When the noise quiets, the answer was always yours. Begin with a conversation that finally makes sense of where you are.",
    cta: "Begin with clarity",
  },
  {
    image: hero2,
    eyebrow: "Scene Two",
    title: "Heal Emotional & Energetic Blocks",
    text: "Grief, fear and old patterns settle in the body. We gently release what has been carried for far too long.",
    cta: "Release what weighs you",
  },
  {
    image: hero3,
    eyebrow: "Scene Three",
    title: "Discover Ancient Healing Practices",
    text: "Tarot, crystals, sound, breath and switchwords — timeless Indian wisdom, offered with modern care and ethics.",
    cta: "Explore the practices",
  },
  {
    image: hero4,
    eyebrow: "Scene Four",
    title: "Transform Through Personalized Guidance",
    text: "No templates, no fear. A healing path shaped entirely around your story, your energy and your season of life.",
    cta: "See your path",
  },
  {
    image: hero5,
    eyebrow: "Scene Five",
    title: "Begin Your Journey with Hreemka",
    text: "A sanctuary of trust, held by nine years of practice and 2,800+ transformations. Your first step is one conversation away.",
    cta: "Book a consultation",
  },
];

export function HeroStory() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const passed = Math.min(Math.max(-el.getBoundingClientRect().top, 0), total);
      const p = total > 0 ? passed / total : 0;
      setProgress(p);
      setActive(Math.min(scenes.length - 1, Math.floor(p * scenes.length * 0.999)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative" style={{ height: "500vh" }}>
      <section className="sticky top-0 flex h-screen items-center overflow-hidden">
        {scenes.map((scene, i) => (
          <img
            key={scene.title}
            src={scene.image}
            alt={scene.title}
            width={1920}
            height={1200}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-[1400ms] ease-out ${
              i === 0
                ? "object-[72%_center] sm:object-[68%_center] md:object-[62%_center] lg:object-[58%_center] xl:object-[54%_center]"
                : "object-center"
            }`}
            style={{
              opacity: active === i ? 1 : 0,
              transform: `scale(${active === i ? 1.04 : 1.14})`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-6">
          <div className="max-w-2xl text-primary-foreground">
            {scenes.map((scene, i) => (
              <div
                key={scene.title}
                aria-hidden={active !== i}
                className="transition-all duration-700 ease-out"
                style={{
                  display: active === i ? "block" : "none",
                  opacity: active === i ? 1 : 0,
                }}
              >
                <p
                  className="eyebrow"
                  style={{ color: "color-mix(in oklab, var(--gold) 85%, white)" }}
                >
                  {scene.eyebrow}
                </p>
                <h1 className="mt-5 text-5xl leading-[1.05] sm:text-7xl">{scene.title}</h1>
                <p className="mt-6 max-w-xl text-base leading-relaxed opacity-85 sm:text-lg">
                  {scene.text}
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href="#booking" className="btn-sacred">
                    {scene.cta}
                  </a>
                  <a href="#services" className="btn-ghost-sacred text-primary-foreground">
                    Healing modalities
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {scenes.map((scene, i) => (
            <span
              key={scene.title}
              className="h-[2px] rounded-full transition-all duration-700"
              style={{
                width: active === i ? 46 : 20,
                backgroundColor:
                  active === i
                    ? "color-mix(in oklab, var(--gold) 90%, white)"
                    : "color-mix(in oklab, white 45%, transparent)",
              }}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/15">
          <div
            className="h-full bg-gold transition-[width] duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </section>
    </div>
  );
}

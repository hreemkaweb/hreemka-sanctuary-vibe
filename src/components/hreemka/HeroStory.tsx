import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import scene2 from "@/assets/scene.2.JPG";
import scene3 from "@/assets/scene3.JPG";
import hero5 from "@/assets/hero-5.jpg";

const scenes = [
  {
    image: "/hero.png",
    eyebrow: "Scene One",
    title: "Find Clarity in Life",
    text: "When the noise quiets, the answer was always yours. Begin with a conversation that finally makes sense of where you are.",
    cta: "Begin with clarity",
  },
  {
    image: scene2,
    eyebrow: "Scene Two",
    title: "Heal Emotional & Energetic Blocks",
    text: "Grief, fear and old patterns settle in the body. We gently release what has been carried for far too long.",
    cta: "Release what weighs you",
  },
  {
    image: scene3,
    eyebrow: "Scene Three",
    title: "Discover Ancient Healing Practices",
    text: "Tarot, crystals, sound, breath and switchwords — timeless Indian wisdom, offered with modern care and ethics.",
    cta: "Explore the practices",
  },
  {
    image: "/scene-4.jpeg",
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
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const sceneFiveVideoRef = useRef<HTMLVideoElement>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentPosRef = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const preloadedImages = scenes.map(({ image }) => {
      const preload = new Image();
      preload.src = image;
      return preload;
    });

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
      preloadedImages.length = 0;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const video = sceneFiveVideoRef.current;
    if (!video) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPlayback = () => {
      if (active === 4 && !motionQuery.matches) {
        void video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    };

    syncPlayback();
    motionQuery.addEventListener("change", syncPlayback);
    return () => {
      motionQuery.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, [active]);

  useEffect(() => {
    const hero = heroSectionRef.current;
    const logo = logoRef.current;
    if (!hero || !logo) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

    const applyTransform = (x: number, y: number) => {
      const existing = logo.style.transform || "";
      const hasExisting = existing && existing !== "none";
      logo.style.transform = hasExisting
        ? `${existing} translate3d(${x}px, ${y}px, 0)`
        : `translate3d(${x}px, ${y}px, 0)`;
    };

    const render = () => {
      const currentX = currentPosRef.current.x;
      const currentY = currentPosRef.current.y;
      const targetX = targetPosRef.current.x;
      const targetY = targetPosRef.current.y;

      const nextX = currentX + (targetX - currentX) * 0.12;
      const nextY = currentY + (targetY - currentY) * 0.12;

      currentPosRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);

      if (Math.abs(targetX - nextX) > 0.08 || Math.abs(targetY - nextY) > 0.08) {
        animationFrameRef.current = window.requestAnimationFrame(render);
      } else {
        animationFrameRef.current = null;
      }
    };

    const resetProfile = () => {
      targetPosRef.current = { x: 0, y: 0 };
      currentPosRef.current = { x: 0, y: 0 };
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      applyTransform(0, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (active !== 0 || reducedMotionQuery.matches || coarsePointerQuery.matches) return;

      const rect = hero.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width;
      const relativeY = (event.clientY - rect.top) / rect.height;

      targetPosRef.current = {
        x: clamp((relativeX - 0.5) * 50, -25, 25),
        y: clamp((relativeY - 0.5) * 36, -18, 18),
      };

      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(render);
      }
    };

    const handlePointerLeave = () => {
      targetPosRef.current = { x: 0, y: 0 };
      if (animationFrameRef.current === null) {
        animationFrameRef.current = window.requestAnimationFrame(render);
      }
    };

    const handleMediaChange = () => {
      if (reducedMotionQuery.matches || coarsePointerQuery.matches) {
        resetProfile();
      }
    };

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);

    if (typeof reducedMotionQuery.addEventListener === "function") {
      reducedMotionQuery.addEventListener("change", handleMediaChange);
    } else {
      reducedMotionQuery.addListener(handleMediaChange);
    }

    if (typeof coarsePointerQuery.addEventListener === "function") {
      coarsePointerQuery.addEventListener("change", handleMediaChange);
    } else {
      coarsePointerQuery.addListener(handleMediaChange);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);

      if (typeof reducedMotionQuery.removeEventListener === "function") {
        reducedMotionQuery.removeEventListener("change", handleMediaChange);
      } else {
        reducedMotionQuery.removeListener(handleMediaChange);
      }

      if (typeof coarsePointerQuery.removeEventListener === "function") {
        coarsePointerQuery.removeEventListener("change", handleMediaChange);
      } else {
        coarsePointerQuery.removeListener(handleMediaChange);
      }

      resetProfile();
    };
  }, [active]);

  return (
    <div ref={wrapRef} className="relative" style={{ height: "500vh" }}>
      <section ref={heroSectionRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
        {scenes.map((scene, i) => (
          <div
            key={scene.title}
            className={`hero-scene absolute inset-0 transition-all duration-[1400ms] ease-out ${
              i === 0 ? "hero-scene-one" : i === 4 ? "hero-scene-five" : ""
            }`}
            style={{
              backgroundImage: `url(${scene.image})`,
              opacity: active === i ? 1 : 0,
              transform: `scale(${active === i ? 1.04 : 1.14})`,
            }}
          >
            {i === 4 && (
              <video
                ref={sceneFiveVideoRef}
                className="hero-scene-video"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                poster={scene.image}
                aria-hidden="true"
              >
                <source src="/C2104.mp4" type="video/mp4" />
              </video>
            )}
            {i === 0 && (
              <div ref={logoRef} className="hero-scene-fallback" aria-hidden="true">
                <div className="hero-scene-fallback-mark">
                  <span />
                  <i />
                </div>
                <p>Hreemka</p>
                <small>Your Sacred Healing Space</small>
              </div>
            )}
            {i !== 4 && (
              <img
                src={scene.image}
                alt={scene.title}
                width={1920}
                height={1200}
                loading={i === 0 ? "eager" : "lazy"}
                className="hero-scene-art h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.hidden = true;
                }}
              />
            )}
          </div>
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
                  <Link to="/book" className="btn-sacred">
                    {scene.cta}
                  </Link>
                  <Link to="/services" className="btn-ghost-sacred text-primary-foreground">
                    Healing modalities
                  </Link>
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

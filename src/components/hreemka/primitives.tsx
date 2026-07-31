import { useEffect, useRef, useState } from "react";

/** Fades content in as it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "text-center" : ""}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">{title}</h2>
      {subtitle ? (
        <p
          className={`mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

/** Soft sacred-geometry mandala used as a background flourish. */
export function Mandala({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={`pointer-events-none text-primary/12 ${className}`}
    >
      <g fill="none" stroke="currentColor" strokeWidth="0.6">
        <circle cx="100" cy="100" r="88" />
        <circle cx="100" cy="100" r="66" />
        <circle cx="100" cy="100" r="42" />
        {Array.from({ length: 12 }).map((_, i) => (
          <ellipse
            key={i}
            cx="100"
            cy="100"
            rx="26"
            ry="84"
            transform={`rotate(${i * 15} 100 100)`}
          />
        ))}
      </g>
    </svg>
  );
}

export function Particles({ count = 14 }: { count?: number }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${(i * 97) % 100}%`,
            bottom: `${(i * 37) % 60}%`,
            width: `${3 + (i % 4)}px`,
            height: `${3 + (i % 4)}px`,
            animationDelay: `${i * 1.3}s`,
            animationDuration: `${11 + (i % 5) * 2}s`,
          }}
        />
      ))}
    </div>
  );
}

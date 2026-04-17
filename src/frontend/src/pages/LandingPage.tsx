import { GlassCard } from "@/components/GlassCard";
import { NeonBackground } from "@/components/NeonBackground";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "@tanstack/react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Camera, Cpu, MessageSquare, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: Cpu,
    title: "AI Planner",
    desc: "Neural-powered shoot planning — locations, lighting setups, and mood boards generated instantly.",
    neon: "cyan" as const,
    badge: "PLAN",
  },
  {
    icon: Wand2,
    title: "Pose Creator",
    desc: "Generate cinematic poses with Year 2258 AI intelligence. Real-time previews and adjustments.",
    neon: "purple" as const,
    badge: "CREATE",
  },
  {
    icon: Camera,
    title: "Shoot Planner",
    desc: "Build, save, and reuse complete photography sessions with AI-generated shot lists and timelines.",
    neon: "cyan" as const,
    badge: "SAVE",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Ask your intelligent photography assistant anything — instant expert answers, real-time guidance.",
    neon: "purple" as const,
    badge: "ASK",
  },
];

export default function LandingPage() {
  const { isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  // GSAP hero entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Badge fades in first
      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 },
      );

      // Logo chars split reveal
      if (logoRef.current) {
        const spans = logoRef.current.querySelectorAll("span");
        tl.fromTo(
          spans,
          { opacity: 0, y: 40, skewX: 6 },
          { opacity: 1, y: 0, skewX: 0, duration: 0.6, stagger: 0.12 },
          "-=0.3",
        );
      }

      // Subtitle reveal
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.2",
      );

      // CTA buttons
      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.55 },
        "-=0.2",
      );

      // Ambient hero glow pulse
      gsap.to(".hero-ambient", {
        opacity: 0.35,
        scale: 1.08,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // GSAP ScrollTrigger for feature cards
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = featuresRef.current?.querySelectorAll(".feature-card");
      if (!cards) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );

      // Section header
      gsap.fromTo(
        ".features-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    }, featuresRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* 3D Background */}
      <NeonBackground className="opacity-55" />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.12) 2px, rgba(0,255,255,0.12) 4px)",
        }}
        aria-hidden="true"
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.5 0.25 262 / 0.05) 1px, transparent 1px), linear-gradient(90deg, oklch(0.5 0.25 262 / 0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        aria-hidden="true"
      />

      {/* Ambient glow orb */}
      <div
        className="hero-ambient absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-25"
        style={{
          background:
            "radial-gradient(ellipse at center, oklch(0.5 0.25 262 / 0.5) 0%, oklch(0.6 0.25 305 / 0.25) 40%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-card/60 backdrop-blur-md border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 neon-glow">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-display font-bold text-sm hero-glow text-primary leading-none tracking-wide">
              SHOOT SENSE AI
            </p>
            <p className="font-display text-[9px] text-secondary tracking-[0.2em] uppercase mt-0.5">
              VITHE TREXA
            </p>
          </div>
        </div>
        <Link
          to="/auth"
          data-ocid="landing.header_login.link"
          className="px-5 py-2 rounded-lg font-display text-sm font-semibold bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30 hover:neon-glow transition-smooth"
        >
          Launch App
        </Link>
      </header>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center min-h-[88vh] text-center px-6 py-16"
      >
        {/* Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 mb-8 opacity-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-display text-xs text-primary tracking-[0.18em] uppercase">
            Year 2258 — AI Photography Intelligence
          </span>
        </div>

        {/* Logo — each word is a separate span for GSAP stagger */}
        <h1
          ref={logoRef}
          className="font-display font-bold text-5xl sm:text-6xl md:text-8xl leading-[0.95] mb-6 max-w-5xl flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          aria-label="SHOOT SENSE AI"
        >
          <span className="hero-glow text-primary opacity-0">SHOOT</span>
          <span className="text-foreground opacity-0">SENSE</span>
          <span
            className="opacity-0 text-transparent bg-clip-text"
            style={{
              backgroundImage:
                "linear-gradient(135deg, oklch(0.55 0.26 264), oklch(0.65 0.25 305))",
              WebkitBackgroundClip: "text",
            }}
          >
            AI
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="font-body text-muted-foreground text-lg md:text-xl max-w-2xl mb-10 leading-relaxed opacity-0"
          style={{ textShadow: "0 0 40px oklch(0.6 0.25 305 / 0.35)" }}
        >
          AI-Powered Photography Planning for the Future. Generate poses, plan
          shoots, and chat with your neural assistant — all at the speed of
          thought.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 opacity-0">
          <Link
            to="/auth"
            data-ocid="landing.cta_enter.link"
            className="group relative px-9 py-4 rounded-xl font-display font-bold text-base text-primary overflow-hidden transition-smooth"
            style={{
              background: "oklch(0.5 0.25 262 / 0.18)",
              border: "2px solid oklch(0.5 0.25 262 / 0.55)",
              boxShadow:
                "0 0 24px oklch(0.5 0.25 262 / 0.4), inset 0 0 20px oklch(0.5 0.25 262 / 0.08)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Enter the Studio
            </span>
            {/* Hover shimmer */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-smooth"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.5 0.25 262 / 0.25) 0%, transparent 60%)",
              }}
              aria-hidden="true"
            />
          </Link>

          <button
            type="button"
            data-ocid="landing.cta_explore.link"
            onClick={() =>
              document
                .getElementById("features")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-9 py-4 rounded-xl font-display font-semibold text-base bg-card/40 text-foreground border border-border/50 hover:border-secondary/50 hover:text-secondary transition-smooth backdrop-blur-sm"
          >
            Explore Features
          </button>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="font-display text-[10px] tracking-widest text-muted-foreground uppercase">
            Scroll to explore
          </span>
          <div className="w-px h-8 bg-gradient-to-b from-primary/60 to-transparent" />
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 px-6 py-20 bg-card/25 border-t border-border/20 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="features-header text-center mb-14 opacity-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/25 mb-4">
              <Sparkles className="w-3 h-3 text-secondary" />
              <span className="font-display text-[10px] tracking-widest text-secondary uppercase">
                Neural Intelligence Suite
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Everything You Need to{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, oklch(0.55 0.26 264), oklch(0.65 0.25 305))",
                  WebkitBackgroundClip: "text",
                }}
              >
                Create
              </span>
            </h2>
            <p className="font-body text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
              Plan, shoot, and iterate at the speed of thought. Powered by
              next-generation neural photography intelligence.
            </p>
          </div>

          {/* Feature cards grid */}
          <div
            ref={featuresRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map(({ icon: Icon, title, desc, neon, badge }, i) => (
              <GlassCard
                key={title}
                neon={neon}
                data-ocid={`landing.feature.item.${i + 1}`}
                className="feature-card p-6 flex flex-col gap-4 hover:scale-[1.02] transition-smooth opacity-0"
              >
                {/* Card header */}
                <div className="flex items-start justify-between">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${neon === "cyan" ? "bg-primary/20" : "bg-secondary/20"}`}
                  >
                    <Icon
                      className={`w-5 h-5 ${neon === "cyan" ? "text-primary" : "text-secondary"}`}
                    />
                  </div>
                  <span
                    className={`font-mono text-[9px] tracking-[0.2em] px-2 py-0.5 rounded border ${
                      neon === "cyan"
                        ? "text-primary border-primary/30 bg-primary/10"
                        : "text-secondary border-secondary/30 bg-secondary/10"
                    }`}
                  >
                    {badge}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-display font-bold text-sm text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>

                {/* Bottom neon line */}
                <div
                  className={`mt-auto h-px w-full rounded-full ${neon === "cyan" ? "bg-primary/30" : "bg-secondary/30"}`}
                />
              </GlassCard>
            ))}
          </div>

          {/* CTA beneath features */}
          <div className="text-center mt-12">
            <Link
              to="/auth"
              data-ocid="landing.features_cta.link"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-display font-semibold text-sm bg-card/60 text-foreground border border-border/50 hover:border-primary/50 hover:text-primary transition-smooth backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              Start Your First Shoot
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-card/50 border-t border-border/30 px-6 py-8">
        {/* Neon separator */}
        <div
          className="w-full h-px mb-6 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.5 0.25 262 / 0.7) 30%, oklch(0.6 0.25 305 / 0.7) 70%, transparent)",
            boxShadow:
              "0 0 12px oklch(0.5 0.25 262 / 0.4), 0 0 24px oklch(0.6 0.25 305 / 0.2)",
          }}
          aria-hidden="true"
        />

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/20">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-display font-bold text-xs text-primary leading-none">
                SHOOT SENSE AI
              </p>
              <p className="font-display text-[8px] tracking-[0.22em] text-secondary uppercase mt-0.5">
                VITHE TREXA
              </p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-5" aria-label="Footer links">
            <Link
              to="/auth"
              data-ocid="landing.footer_login.link"
              className="font-display text-xs text-muted-foreground hover:text-primary transition-smooth"
            >
              Login
            </Link>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-display text-xs text-muted-foreground hover:text-secondary transition-smooth"
            >
              Features
            </button>
          </nav>

          {/* Copyright */}
          <p className="font-body text-xs text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()}{" "}
            <span className="text-primary">VITHE TREXA</span>. Built with love
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

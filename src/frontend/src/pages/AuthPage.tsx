import { NeonBackground } from "@/components/NeonBackground";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "@/hooks/useBackend";
import { useNavigate } from "@tanstack/react-router";
import { Cpu, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } = useAuth();
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [showKey, setShowKey] = useState(false);
  const {
    data: profile,
    isFetched,
    isLoading: profileLoading,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();

  useEffect(() => {
    if (isAuthenticated && isFetched && !profileLoading) {
      const missingProfile =
        !profile || (Array.isArray(profile) && profile.length === 0);
      if (missingProfile) {
        setShowSetup(true);
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [isAuthenticated, profile, isFetched, profileLoading, navigate]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    await saveProfile.mutateAsync(displayName.trim());
    navigate({ to: "/dashboard" });
  };

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <NeonBackground className="opacity-40" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.5 0.25 262 / 0.15) 1px, transparent 1px), linear-gradient(90deg, oklch(0.5 0.25 262 / 0.15) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 neon-glow flex items-center justify-center mb-4">
            <Cpu className="w-9 h-9 text-primary" />
          </div>
          <h1 className="font-display font-bold text-2xl hero-glow text-primary">
            SHOOT SENSE AI
          </h1>
          <p className="font-display text-xs text-secondary tracking-widest mt-1">
            VITHE TREXA
          </p>
        </div>

        {/* Auth Card */}
        <div className="glassmorphism rounded-2xl p-8 border border-primary/30 shadow-[0_0_40px_oklch(0.5_0.25_262/0.2)]">
          {!showSetup ? (
            <>
              <h2 className="font-display font-bold text-xl text-foreground mb-2 text-center">
                Access the Neural Hub
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-8">
                Connect your Internet Identity to enter the photography
                intelligence system.
              </p>
              <button
                type="button"
                data-ocid="auth.login.button"
                onClick={login}
                disabled={isLoggingIn || isInitializing}
                className="
                  w-full py-3.5 rounded-xl font-display font-bold text-base
                  bg-primary/30 text-primary border-2 border-primary/60
                  hover:bg-primary/40 neon-glow transition-smooth
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                "
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Login with Internet
                    Identity
                  </>
                )}
              </button>
              <p className="font-body text-xs text-muted-foreground text-center mt-4">
                Secure, decentralized authentication — no password needed.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display font-bold text-xl text-foreground mb-2 text-center">
                Set Up Your Profile
              </h2>
              <p className="font-body text-sm text-muted-foreground text-center mb-8">
                Welcome, Photographer. What should the AI call you?
              </p>
              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <label
                    htmlFor="display-name"
                    className="block font-display text-xs text-muted-foreground mb-2 uppercase tracking-wider"
                  >
                    Display Name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    data-ocid="auth.display_name.input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="
                      w-full px-4 py-3 rounded-lg bg-background/50 border border-primary/30
                      text-foreground font-body text-sm placeholder:text-muted-foreground
                      focus:outline-none focus:border-primary/60 focus:neon-glow transition-smooth
                    "
                  />
                </div>
                <div>
                  <label
                    htmlFor="ai-key"
                    className="block font-display text-xs text-muted-foreground mb-2 uppercase tracking-wider"
                  >
                    OpenAI Key{" "}
                    <span className="text-muted-foreground/50 normal-case">
                      (optional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      id="ai-key"
                      type={showKey ? "text" : "password"}
                      data-ocid="auth.openai_key.input"
                      placeholder="sk-..."
                      className="
                        w-full px-4 py-3 pr-10 rounded-lg bg-background/50 border border-secondary/30
                        text-foreground font-mono text-sm placeholder:text-muted-foreground
                        focus:outline-none focus:border-secondary/60 transition-smooth
                      "
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      aria-label={showKey ? "Hide key" : "Show key"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                    >
                      {showKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  data-ocid="auth.setup.submit_button"
                  disabled={!displayName.trim() || saveProfile.isPending}
                  className="
                    w-full py-3.5 rounded-xl font-display font-bold text-base
                    bg-secondary/30 text-secondary border-2 border-secondary/60
                    hover:bg-secondary/40 transition-smooth
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2
                  "
                >
                  {saveProfile.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />{" "}
                      Initializing...
                    </>
                  ) : (
                    <>Enter the Hub</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="font-body text-xs text-muted-foreground text-center mt-6">
          © {new Date().getFullYear()}. Built with{" "}
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
    </div>
  );
}

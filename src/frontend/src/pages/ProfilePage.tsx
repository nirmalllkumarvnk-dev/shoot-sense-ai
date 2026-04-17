import { GlassCard } from "@/components/GlassCard";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetCallerUserProfile,
  useSetOpenAIKey,
  useUpdateProfile,
} from "@/hooks/useBackend";
import { Check, Eye, EyeOff, Key, LogOut, Save, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const updateProfile = useUpdateProfile();
  const setOpenAIKey = useSetOpenAIKey();
  const { logout, identity } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    if (profile?.displayName) {
      setDisplayName(profile.displayName);
    }
  }, [profile?.displayName]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    await updateProfile.mutateAsync(displayName.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    await setOpenAIKey.mutateAsync(apiKey.trim());
    setApiKey("");
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto" data-ocid="profile.page">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Profile Settings
        </h1>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Manage your account and AI configuration.
        </p>
      </div>

      {/* Identity */}
      <GlassCard neon="cyan" className="p-5" data-ocid="profile.identity.panel">
        <h2 className="font-display font-semibold text-sm text-foreground mb-4">
          Internet Identity
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 neon-glow flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <div className="w-32 h-4 bg-muted/50 rounded animate-pulse mb-1" />
            ) : (
              <p className="font-display font-bold text-sm text-foreground">
                {profile?.displayName ?? "Unnamed"}
              </p>
            )}
            <p className="font-mono text-xs text-muted-foreground truncate">
              {identity?.getPrincipal().toString() ?? "Loading…"}
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Display Name */}
      <GlassCard
        neon="cyan"
        className="p-5"
        data-ocid="profile.display_name.panel"
      >
        <h2 className="font-display font-semibold text-sm text-foreground mb-4">
          Display Name
        </h2>
        <form onSubmit={handleSaveName} className="flex gap-3">
          <input
            type="text"
            data-ocid="profile.display_name.input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="
              flex-1 px-4 py-2.5 rounded-lg bg-background/50 border border-primary/30
              text-foreground font-body text-sm placeholder:text-muted-foreground
              focus:outline-none focus:border-primary/60 transition-smooth
            "
          />
          <button
            type="submit"
            data-ocid="profile.display_name.save_button"
            disabled={!displayName.trim() || updateProfile.isPending}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-lg
              bg-primary/30 text-primary border border-primary/60
              hover:bg-primary/40 neon-glow transition-smooth font-display text-sm
              disabled:opacity-40 shrink-0
            "
          >
            {nameSaved ? (
              <>
                <Check className="w-4 h-4" /> Saved
              </>
            ) : updateProfile.isPending ? (
              "Saving…"
            ) : (
              <>
                <Save className="w-4 h-4" /> Save
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {/* OpenAI API Key */}
      <GlassCard neon="purple" className="p-5" data-ocid="profile.openai.panel">
        <div className="flex items-center gap-2 mb-1">
          <Key className="w-4 h-4 text-secondary" />
          <h2 className="font-display font-semibold text-sm text-foreground">
            OpenAI API Key
          </h2>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-4">
          Required for AI chat, pose generation, and shot list features.
        </p>
        <form onSubmit={handleSaveKey} className="space-y-3">
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              data-ocid="profile.openai_key.input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="
                w-full px-4 py-2.5 pr-10 rounded-lg bg-background/50 border border-secondary/30
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
          <button
            type="submit"
            data-ocid="profile.openai_key.save_button"
            disabled={!apiKey.trim() || setOpenAIKey.isPending}
            className="
              flex items-center gap-2 px-5 py-2.5 rounded-lg
              bg-secondary/30 text-secondary border border-secondary/60
              hover:bg-secondary/40 transition-smooth font-display text-sm
              disabled:opacity-40
            "
          >
            {keySaved ? (
              <>
                <Check className="w-4 h-4" /> Key Saved
              </>
            ) : setOpenAIKey.isPending ? (
              "Saving…"
            ) : (
              <>
                <Key className="w-4 h-4" /> Save Key
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {/* Stats */}
      {profile && (
        <GlassCard
          neon="none"
          className="p-5 border-border/20"
          data-ocid="profile.stats.panel"
        >
          <h2 className="font-display font-semibold text-sm text-foreground mb-4">
            Account Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-2xl font-bold text-primary">
                {profile.photoCount.toString()}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Photos Planned
              </p>
            </div>
            <div>
              <p className="font-mono text-sm text-muted-foreground">
                {new Date(
                  Number(profile.createdAt / BigInt(1_000_000)),
                ).toLocaleDateString()}
              </p>
              <p className="font-body text-xs text-muted-foreground">
                Member Since
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Logout */}
      <div className="pt-2">
        <button
          type="button"
          data-ocid="profile.logout.button"
          onClick={logout}
          className="
            flex items-center gap-2 px-5 py-2.5 rounded-xl
            bg-destructive/10 text-destructive border border-destructive/30
            hover:bg-destructive/20 transition-smooth font-display text-sm font-semibold
          "
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      {/* Footer */}
      <footer className="pt-4 border-t border-border/20 text-center">
        <p className="font-body text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}

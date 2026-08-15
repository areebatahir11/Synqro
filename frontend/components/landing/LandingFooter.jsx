import { Logo } from "@/components/ui/Logo";

export function LandingFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <Logo />
        <p className="text-xs text-ink-faint">
          Project management &amp; team collaboration, built for software teams.
        </p>
      </div>
    </footer>
  );
}

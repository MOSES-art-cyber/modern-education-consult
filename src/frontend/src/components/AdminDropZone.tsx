import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Lock, LogIn } from "lucide-react";
import DropZone from "./DropZone";

interface AdminDropZoneProps {
  label?: string;
  ocidPrefix?: string;
}

export default function AdminDropZone({
  label,
  ocidPrefix,
}: AdminDropZoneProps) {
  const { identity, login, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const isAdmin = !!identity && !identity.getPrincipal().isAnonymous();

  if (isInitializing) {
    return (
      <div
        data-ocid={`${ocidPrefix}.loading_state`}
        className="flex items-center justify-center py-10 text-foreground/40 text-sm"
      >
        Checking access...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        data-ocid={`${ocidPrefix}.panel`}
        className="flex flex-col items-center gap-4 py-10 px-6 rounded-2xl border-2 border-dashed border-border bg-accent/20 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Lock size={26} className="text-primary" />
        </div>
        <div>
          <p className="font-semibold text-brand-dark text-sm">
            Admin Access Required
          </p>
          <p className="text-xs text-foreground/50 mt-1 max-w-xs">
            Only administrators can add or edit files and links on this page.
            Please log in with Internet Identity to continue.
          </p>
        </div>
        <Button
          type="button"
          onClick={login}
          disabled={isLoggingIn}
          data-ocid={`${ocidPrefix}.button`}
          className="bg-primary hover:bg-primary/90 text-white font-semibold gap-2"
        >
          <LogIn size={15} />
          {isLoggingIn ? "Connecting..." : "Log in as Admin"}
        </Button>
      </div>
    );
  }

  return <DropZone label={label} ocidPrefix={ocidPrefix} />;
}

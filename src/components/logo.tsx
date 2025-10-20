import { Logo as LogoIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold">InsightBoard</span>
    </div>
  );
}

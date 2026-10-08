import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/lib/labels";
import { cn } from "@/lib/utils";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  warning: "bg-amber-500/20 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
  danger: "bg-red-500/15 text-red-700 dark:bg-red-400/15 dark:text-red-300",
  info: "bg-sky-500/15 text-sky-800 dark:bg-sky-400/15 dark:text-sky-300",
  primary: "bg-primary/15 text-primary dark:text-primary",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return <Badge className={cn("border-transparent", TONE_CLASSES[tone], className)}>{label}</Badge>;
}

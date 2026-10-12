import { Badge } from "@/components/ui/badge";
import type { Tone } from "@/lib/labels";
import { TONE_BADGE } from "@/lib/tones";
import { cn } from "@/lib/utils";

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return <Badge className={cn("border-transparent", TONE_BADGE[tone], className)}>{label}</Badge>;
}

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  default: { value: "text-foreground", icon: "bg-primary/15 text-primary", bar: "bg-primary" },
  positive: {
    value: "text-emerald-600 dark:text-emerald-400",
    icon: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  negative: {
    value: "text-red-600 dark:text-red-400",
    icon: "bg-red-500/15 text-red-600 dark:text-red-400",
    bar: "bg-red-500",
  },
  warning: {
    value: "text-amber-600 dark:text-amber-400",
    icon: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
} as const;

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
  icon: Icon,
  style,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: "default" | "positive" | "negative" | "warning";
  icon?: React.ComponentType<{ className?: string }>;
  style?: React.CSSProperties;
}) {
  const palette = TONE_STYLES[tone];

  const content = (
    <Card
      style={style}
      className="relative h-full animate-in gap-1.5 p-4 pl-5 transition-all duration-200 fill-mode-both fade-in slide-in-from-bottom-2 hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className={cn("absolute inset-y-0 left-0 w-1.5", palette.bar)} aria-hidden />
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn("flex size-9 items-center justify-center rounded-full", palette.icon)}
          >
            <Icon className="size-5" />
          </span>
        )}
      </div>
      <div className={cn("text-2xl font-bold tabular-nums", palette.value)}>{value}</div>
      {hint && <div className="text-sm text-muted-foreground">{hint}</div>}
    </Card>
  );

  return href ? (
    <Link
      href={href}
      className="rounded-xl focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

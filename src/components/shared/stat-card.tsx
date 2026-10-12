import Link from "next/link";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONE_STYLES = {
  brand: { value: "text-foreground", icon: "bg-primary/16 text-primary-ink", glow: "bg-primary/25" },
  neutral: { value: "text-foreground", icon: "bg-muted text-foreground", glow: "bg-foreground/10" },
  success: { value: "text-success", icon: "bg-success/14 text-success", glow: "bg-success/20" },
  info: { value: "text-info", icon: "bg-info/14 text-info", glow: "bg-info/20" },
  negative: { value: "text-danger", icon: "bg-danger/14 text-danger", glow: "bg-danger/20" },
} as const;

export type StatTone = keyof typeof TONE_STYLES;

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "brand",
  icon: Icon,
  style,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: StatTone;
  icon?: React.ComponentType<{ className?: string }>;
  style?: React.CSSProperties;
}) {
  const palette = TONE_STYLES[tone];

  const content = (
    <Card
      style={style}
      className={cn(
        "group/stat relative h-full animate-fade-up gap-1 overflow-hidden p-3.5 sm:gap-1.5 sm:p-4",
        href && "hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/45",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-10 -right-10 size-28 rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover/stat:opacity-100",
          palette.glow,
        )}
      />
      <div className="relative flex items-start justify-between gap-2">
        <span className="text-sm leading-tight font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover/stat:scale-110 group-hover/stat:-rotate-6 sm:size-9",
              palette.icon,
            )}
          >
            <Icon className="size-4.5 sm:size-5" />
          </span>
        )}
      </div>
      <div className={cn("relative text-xl font-bold tracking-tight tabular-nums sm:text-2xl", palette.value)}>
        {value}
      </div>
      {hint && <div className="relative text-xs text-muted-foreground sm:text-sm">{hint}</div>}
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

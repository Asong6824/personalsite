import type { LucideIcon } from "lucide-react";

interface ArticleInfoItemProps {
  label: string;
  value?: string | null;
  icon?: LucideIcon;
}

export function ArticleInfoItem({ label, value, icon: Icon }: ArticleInfoItemProps) {
  if (!value) return null;

  return (
    <div className="grid grid-cols-[0.95rem_minmax(0,1fr)] gap-3">
      <div className="pt-0.5 text-[var(--channel-ink,#141413)]">
        {Icon && <Icon size={15} strokeWidth={1.55} />}
      </div>
      <div>
        <div className="text-xs font-medium leading-4 text-[var(--channel-muted,#68645d)]">
          {label}
        </div>
        <div className="mt-0.5 text-[15px] font-medium leading-5 text-[var(--channel-ink,#141413)]">
          {value}
        </div>
      </div>
    </div>
  );
}

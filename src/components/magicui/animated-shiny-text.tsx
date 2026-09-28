import { cn } from "@/lib/utils";

export const AnimatedShinyText = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <span
      style={
        {
          "--shiny-width": `${shimmerWidth}px`
        } as any
      }
      className={cn(
        "mx-auto max-w-md text-site-neutral-600/70 dark:text-site-neutral-400/70",
        // Shine effect
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        // Shine gradient
        "bg-gradient-to-r from-transparent via-site-neutral-950/80 via-50% to-transparent  dark:via-site-neutral-50/80",
        className
      )}
      {...props}>
      {children}
    </span>
  );
};

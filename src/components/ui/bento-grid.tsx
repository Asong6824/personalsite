import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[18rem] md:grid-cols-3",
        className
      )}>
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-site-neutral-200 bg-site-neutral-50 p-4 transition duration-200 hover:shadow-xl dark:border-site-neutral-50/[0.2] dark:bg-site-neutral-950 dark:shadow-none",
        className
      )}>
      {header}
      <div className="transition duration-200 group-hover/bento:translate-x-2">
        {icon}
        <div
          className="mt-2 mb-2 font-sans font-bold text-site-neutral-600 dark:text-site-neutral-200">
          {title}
        </div>
        <div
          className="font-sans text-xs font-normal text-site-neutral-600 dark:text-site-neutral-300">
          {description}
        </div>
      </div>
    </div>
  );
};

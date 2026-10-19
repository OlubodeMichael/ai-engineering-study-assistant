import type { ButtonHTMLAttributes, Ref } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  ref?: Ref<HTMLButtonElement>;
}

const ICON_BUTTON_CLASSES =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-hover hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus";

/** Square icon-only button; `label` becomes its accessible name and tooltip. */
export function IconButton({ label, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${ICON_BUTTON_CLASSES} ${className}`}
      {...props}
    />
  );
}

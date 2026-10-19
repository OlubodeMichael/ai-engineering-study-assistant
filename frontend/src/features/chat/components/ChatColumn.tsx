import type { ReactNode, Ref } from "react";

interface ChatColumnProps {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The single centered reading column shared by messages, references, and the
 * composer. Centers the container within the main panel; text stays left-aligned.
 */
export function ChatColumn({ children, className = "", ref }: ChatColumnProps) {
  return (
    <div ref={ref} className={`mx-auto w-full max-w-3xl min-w-0 px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

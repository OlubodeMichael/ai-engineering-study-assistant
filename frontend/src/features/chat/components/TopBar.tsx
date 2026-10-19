import type { RefObject } from "react";
import { IconButton } from "@/shared/components/IconButton";
import { MenuIcon, NewQuestionIcon, SidebarIcon } from "@/shared/components/icons";

interface TopBarProps {
  drawerId: string;
  desktopSidebarId: string;
  isDrawerOpen: boolean;
  isSidebarCollapsed: boolean;
  expandButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenDrawer: () => void;
  onExpandSidebar: () => void;
  onNewQuestion: () => void;
}

/** Always shown on mobile; on desktop only while the sidebar is collapsed. */
export function TopBar({
  drawerId,
  desktopSidebarId,
  isDrawerOpen,
  isSidebarCollapsed,
  expandButtonRef,
  onOpenDrawer,
  onExpandSidebar,
  onNewQuestion,
}: TopBarProps) {
  return (
    <div
      className={`flex h-12 shrink-0 items-center gap-1 border-b border-border px-2 ${isSidebarCollapsed ? "" : "md:hidden"}`}
    >
      <IconButton
        label="Open sidebar"
        onClick={onOpenDrawer}
        aria-controls={drawerId}
        aria-expanded={isDrawerOpen}
        className="md:hidden"
      >
        <MenuIcon width={20} height={20} />
      </IconButton>
      <IconButton
        ref={expandButtonRef}
        label="Show sidebar"
        onClick={onExpandSidebar}
        aria-controls={desktopSidebarId}
        aria-expanded={!isSidebarCollapsed}
        className="hidden md:inline-flex"
      >
        <SidebarIcon width={18} height={18} />
      </IconButton>
      <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground md:text-left">
        AI Engineering Study Assistant
      </p>
      <IconButton label="New question" onClick={onNewQuestion}>
        <NewQuestionIcon width={18} height={18} />
      </IconButton>
    </div>
  );
}

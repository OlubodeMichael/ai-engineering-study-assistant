"use client";

import { IconButton } from "@/shared/components/IconButton";
import { CloseIcon, SidebarIcon } from "@/shared/components/icons";
import { useChatScreen } from "../hooks/useChatScreen";
import { useSidebarCollapse } from "../hooks/useSidebarCollapse";
import { Composer } from "./Composer";
import { ChatColumn } from "./ChatColumn";
import { ConversationView } from "./ConversationView";
import { EmptyState } from "./EmptyState";
import { MobileSidebarDrawer } from "./MobileSidebarDrawer";
import { SidebarContent } from "./SidebarContent";
import { StatusAnnouncer } from "./StatusAnnouncer";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { TopBar } from "./TopBar";

const DRAWER_ID = "mobile-sidebar";
const DESKTOP_SIDEBAR_ID = "desktop-sidebar";

export function ChatApp() {
  const screen = useChatScreen();
  const { isCollapsed, collapse, expand, collapseButtonRef, expandButtonRef } =
    useSidebarCollapse();
  const { session, scroll, isEmpty } = screen;

  const sidebarProps = {
    questions: session.sessionQuestions,
    activeThreadId: session.activeThread?.id ?? null,
    onNewQuestion: screen.startNewQuestion,
    onSelectQuestion: screen.selectQuestion,
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <aside
        id={DESKTOP_SIDEBAR_ID}
        className={`hidden w-64 shrink-0 border-r border-border bg-sidebar ${isCollapsed ? "" : "md:block"}`}
      >
        <SidebarContent
          {...sidebarProps}
          headerAction={
            <IconButton
              ref={collapseButtonRef}
              label="Hide sidebar"
              onClick={collapse}
              aria-controls={DESKTOP_SIDEBAR_ID}
              aria-expanded={!isCollapsed}
            >
              <SidebarIcon width={18} height={18} />
            </IconButton>
          }
        />
      </aside>
      <MobileSidebarDrawer id={DRAWER_ID} isOpen={screen.isDrawerOpen} onClose={screen.closeDrawer}>
        <SidebarContent
          {...sidebarProps}
          headerAction={
            <IconButton label="Close sidebar" onClick={screen.closeDrawer}>
              <CloseIcon />
            </IconButton>
          }
        />
      </MobileSidebarDrawer>

      <main className="flex min-w-0 flex-1 flex-col">
        <h1 className="sr-only">AI Engineering Study Assistant</h1>
        <TopBar
          drawerId={DRAWER_ID}
          desktopSidebarId={DESKTOP_SIDEBAR_ID}
          isDrawerOpen={screen.isDrawerOpen}
          isSidebarCollapsed={isCollapsed}
          expandButtonRef={expandButtonRef}
          onOpenDrawer={screen.openDrawer}
          onExpandSidebar={expand}
          onNewQuestion={screen.startNewQuestion}
        />
        <div
          className={`flex min-h-0 flex-1 flex-col ${isEmpty ? "justify-center overflow-y-auto py-8" : ""}`}
        >
          {isEmpty ? (
            <EmptyState />
          ) : (
            <ConversationView
              exchanges={session.activeThread?.exchanges ?? []}
              isBusy={session.isBusy}
              onRetry={screen.askQuestion}
              scrollRef={scroll.scrollRef}
              contentRef={scroll.contentRef}
              showScrollToLatest={!scroll.isNearBottom}
              onScrollToLatest={scroll.scrollToLatest}
            />
          )}
          <div className="w-full shrink-0 bg-background pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <ChatColumn>
              <Composer
                inputRef={screen.inputRef}
                value={screen.draft}
                onChange={screen.setDraft}
                onSubmit={screen.submitDraft}
                onStop={session.stop}
                isBusy={session.isBusy}
                validationMessage={screen.validationMessage}
              />
            </ChatColumn>
          </div>
          {isEmpty && <SuggestedQuestions onSelect={screen.askQuestion} />}
        </div>
        <StatusAnnouncer exchange={session.latestExchange} />
      </main>
    </div>
  );
}

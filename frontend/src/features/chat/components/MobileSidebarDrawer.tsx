"use client";

import { type MouseEvent, type ReactNode, useEffect, useLayoutEffect, useRef } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 48rem)";

interface MobileSidebarDrawerProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Modal drawer built on <dialog>, which provides focus trapping, Escape to
 * close, and focus restoration natively.
 */
export function MobileSidebarDrawer({ id, isOpen, onClose, children }: MobileSidebarDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const desktopQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const closeOnDesktop = (): void => {
      if (desktopQuery.matches) onClose();
    };
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, [isOpen, onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
    if (event.target === event.currentTarget) onClose();
  }

  return (
    <dialog
      id={id}
      ref={dialogRef}
      aria-label="Sidebar"
      onClose={onClose}
      onClick={handleBackdropClick}
      className="fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-sidebar p-0 text-foreground backdrop:bg-black/50 md:hidden"
    >
      {children}
    </dialog>
  );
}

import { useHydrated } from "@tanstack/react-router";
import { SidebarTrigger, useSidebar } from "fumadocs-ui/layouts/docs/slots/sidebar";
import { Menu, X } from "lucide-react";
import { createPortal } from "react-dom";

/**
 * Puts the guide drawer button in the site header's menu slot. Phones then
 * keep one top bar instead of a second Fumadocs bar with the same purpose.
 */
export function GuideMenuButton() {
  const { open } = useSidebar();
  const slot = useHydrated() ? document.querySelector("#guide-menu-slot") : null;
  if (!slot) return null;
  const Icon = open ? X : Menu;
  return createPortal(
    <SidebarTrigger className="icon-button">
      <Icon size={21} aria-hidden="true" />
    </SidebarTrigger>,
    slot,
  );
}

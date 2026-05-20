export interface SidebarPanelAnchor {
  left: number;
  top: number;
}

export function clampSidebarPanelLeft(rect: DOMRect, panelWidth: number): SidebarPanelAnchor {
  if (typeof window === 'undefined') {
    return { left: rect.right + 8, top: rect.top };
  }
  const maxLeft = window.innerWidth - 16 - panelWidth;
  return { left: Math.min(rect.right + 8, Math.max(8, maxLeft)), top: rect.top };
}

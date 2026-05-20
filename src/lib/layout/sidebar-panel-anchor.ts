export interface SidebarPanelAnchor {
  left: number;
  top: number;
  /** When set, the panel is positioned above the trigger via translateY(-100%). */
  placement?: 'above' | 'beside';
  width?: number;
}

const PANEL_GAP_PX = 8;

export function clampSidebarPanelLeft(rect: DOMRect, panelWidth: number): SidebarPanelAnchor {
  if (typeof window === 'undefined') {
    return { left: rect.right + PANEL_GAP_PX, top: rect.top, placement: 'beside' };
  }
  const maxLeft = window.innerWidth - 16 - panelWidth;
  return {
    left: Math.min(rect.right + PANEL_GAP_PX, Math.max(8, maxLeft)),
    top: rect.top,
    placement: 'beside',
  };
}

export function anchorSidebarPanelAboveTrigger(rect: DOMRect): SidebarPanelAnchor {
  return {
    left: rect.left,
    top: rect.top - PANEL_GAP_PX,
    placement: 'above',
    width: rect.width,
  };
}

export interface SidebarPanelAnchor {
  left: number;
  top: number;
  /** Panel edge alignment relative to `top`. */
  placement?: 'above' | 'below' | 'beside';
  width?: number;
  maxHeight?: number;
}

const PANEL_GAP_PX = 8;
const VIEWPORT_PADDING_PX = 16;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getViewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}

export function clampSidebarPanelLeft(rect: DOMRect, panelWidth: number): SidebarPanelAnchor {
  const { width: viewportWidth } = getViewportSize();
  const maxLeft = viewportWidth - VIEWPORT_PADDING_PX - panelWidth;
  const left = clamp(rect.right + PANEL_GAP_PX, VIEWPORT_PADDING_PX, maxLeft);
  const maxHeight = getViewportSize().height - VIEWPORT_PADDING_PX * 2;
  const top = clamp(
    rect.top,
    VIEWPORT_PADDING_PX,
    getViewportSize().height - VIEWPORT_PADDING_PX - Math.min(maxHeight, 320),
  );

  return {
    left,
    top,
    placement: 'beside',
    width: panelWidth,
    maxHeight,
  };
}

/**
 * Positions a panel beside or above/below a trigger so it stays fully visible in the viewport.
 * `estimatedHeight` is used before mount; pair with `maxHeight` + scroll for long content.
 */
export function fitSidebarPanelNearTrigger(
  rect: DOMRect,
  options: { width: number; estimatedHeight: number },
): SidebarPanelAnchor {
  const { width: viewportWidth, height: viewportHeight } = getViewportSize();
  const panelWidth = Math.min(options.width, viewportWidth - VIEWPORT_PADDING_PX * 2);
  const left = clamp(rect.left, VIEWPORT_PADDING_PX, viewportWidth - VIEWPORT_PADDING_PX - panelWidth);

  const spaceAbove = rect.top - VIEWPORT_PADDING_PX - PANEL_GAP_PX;
  const spaceBelow = viewportHeight - rect.bottom - VIEWPORT_PADDING_PX - PANEL_GAP_PX;
  const preferAbove = spaceAbove >= options.estimatedHeight || spaceAbove >= spaceBelow;

  if (preferAbove) {
    const maxHeight = Math.max(120, Math.min(options.estimatedHeight, spaceAbove));
    return {
      left,
      top: rect.top - PANEL_GAP_PX,
      placement: 'above',
      width: panelWidth,
      maxHeight,
    };
  }

  const maxHeight = Math.max(120, Math.min(options.estimatedHeight, spaceBelow));
  return {
    left,
    top: rect.bottom + PANEL_GAP_PX,
    placement: 'below',
    width: panelWidth,
    maxHeight,
  };
}

/** @deprecated Use {@link fitSidebarPanelNearTrigger} — kept for callers that only need a rough above anchor. */
export function anchorSidebarPanelAboveTrigger(rect: DOMRect): SidebarPanelAnchor {
  return fitSidebarPanelNearTrigger(rect, { width: Math.max(rect.width, 280), estimatedHeight: 320 });
}

const ACCOUNT_PANEL_WIDTH_PX = 280;
const ACCOUNT_PANEL_ESTIMATED_HEIGHT_PX = 340;

export function anchorSidebarAccountPanel(rect: DOMRect, isCollapsed: boolean): SidebarPanelAnchor {
  if (isCollapsed) {
    return clampSidebarPanelLeft(rect, ACCOUNT_PANEL_WIDTH_PX);
  }
  return fitSidebarPanelNearTrigger(rect, {
    width: Math.max(rect.width, ACCOUNT_PANEL_WIDTH_PX),
    estimatedHeight: ACCOUNT_PANEL_ESTIMATED_HEIGHT_PX,
  });
}

import type { Step } from 'react-joyride';

export const ONBOARDING_TOUR_STEPS: Step[] = [
  {
    target: '[data-tour="sidebar-inbox"]',
    title: 'Your inbox',
    content:
      'All WhatsApp, Instagram, and Messenger conversations from your customers appear here. Your AI agent handles them automatically.',
    placement: 'right',
    skipBeacon: true,
  },
  {
    target: '[data-tour="sidebar-appointments"]',
    title: 'Appointments',
    content:
      'Your calendar with all scheduled meetings. Appointments booked by your agent appear here as pending — you confirm or reject them.',
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-agent-settings"]',
    title: 'Agent settings',
    content: 'Configure your AI agent here — its name, personality, and what it knows about your business.',
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-orders"]',
    title: 'Orders',
    content: 'Every sale your agent makes appears here. You can track payment status and confirm wire transfers.',
    placement: 'right',
  },
  {
    target: '[data-tour="sidebar-notifications"]',
    title: 'Notifications',
    content: "When your agent needs help or a payment arrives, you'll be notified here — and on your WhatsApp.",
    placement: 'right',
  },
];

/** Alias for spec / docs; same steps as {@link ONBOARDING_TOUR_STEPS}. */
export const TOUR_STEPS = ONBOARDING_TOUR_STEPS;

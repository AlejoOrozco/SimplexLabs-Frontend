'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EVENTS, Joyride, STATUS, type EventData } from 'react-joyride';
import { useAuth } from '@/context/auth-context';
import { ONBOARDING_TOUR_STEPS } from '@/lib/constants/onboarding-tour';
import { useMarkFirstLoginComplete } from '@/lib/hooks/use-mark-first-login-complete';
import { notify } from '@/lib/toast';

const TOUR_START_DELAY_MS = 800;

export function OnboardingTour(): JSX.Element | null {
  const { user, isLoading } = useAuth();
  const [run, setRun] = useState(false);
  const markFirstLoginComplete = useMarkFirstLoginComplete();
  const completionSentRef = useRef(false);

  const shouldOfferTour =
    !isLoading &&
    user !== null &&
    user.roleName !== 'SUPER_ADMIN' &&
    user.firstLoginCompleted === false;

  useEffect(() => {
    if (!shouldOfferTour) return;
    const timer = window.setTimeout(() => setRun(true), TOUR_START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [shouldOfferTour]);

  useEffect(() => {
    if (shouldOfferTour) completionSentRef.current = false;
  }, [shouldOfferTour]);

  const handleEvent = useCallback(
    (data: EventData) => {
      const finishedOrSkipped =
        data.type === EVENTS.TOUR_STATUS &&
        (data.status === STATUS.FINISHED || data.status === STATUS.SKIPPED);
      const tourEnded = data.type === EVENTS.TOUR_END;
      if (!finishedOrSkipped && !tourEnded) return;
      if (completionSentRef.current) return;
      completionSentRef.current = true;
      setRun(false);
      void markFirstLoginComplete.mutateAsync().catch(() => {
        completionSentRef.current = false;
        notify.error('Could not save tour progress. Try again from your profile if this keeps showing.');
      });
    },
    [markFirstLoginComplete],
  );

  if (!shouldOfferTour && !run) return null;

  return (
    <Joyride
      steps={ONBOARDING_TOUR_STEPS}
      run={run}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      options={{
        primaryColor: 'var(--color-brand-500)',
        backgroundColor: 'var(--surface-page)',
        textColor: 'var(--text-primary)',
        arrowColor: 'var(--surface-page)',
        zIndex: 10000,
        showProgress: true,
        buttons: ['back', 'close', 'primary', 'skip'],
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Done',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
}

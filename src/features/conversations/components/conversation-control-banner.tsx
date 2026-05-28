interface ConversationControlBannerProps {
  message: string;
  variant?: 'info' | 'warning';
}

export function ConversationControlBanner({
  message,
  variant = 'info',
}: ConversationControlBannerProps): JSX.Element {
  const styles =
    variant === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-950'
      : 'border-blue-200 bg-blue-50 text-blue-950';

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles}`} role="status">
      {message}
    </div>
  );
}

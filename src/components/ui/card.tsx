import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function Card({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg border bg-white text-gray-950 shadow-sm', className)}
        {...props}
      />
    );
  },
);

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
});

export const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardTitle({ className, ...props }, ref) {
  return (
    <h3
      ref={ref as unknown as React.Ref<HTMLHeadingElement>}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...(props as React.HTMLAttributes<HTMLHeadingElement>)}
    />
  );
});

export const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref as unknown as React.Ref<HTMLParagraphElement>}
      className={cn('text-sm text-gray-600', className)}
      {...(props as React.HTMLAttributes<HTMLParagraphElement>)}
    />
  );
});

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />;
});

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function CardFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  );
});

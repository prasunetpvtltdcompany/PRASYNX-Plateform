import * as React from 'react';
import { cn } from '@/lib/utils';
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-2xl bg-white dark:bg-gray-900 border border-gray-100/80 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]', className)} {...props} />
));
Card.displayName = 'Card';
export { Card };

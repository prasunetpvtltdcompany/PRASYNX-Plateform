import * as React from 'react';
import { cn } from '@/lib/utils';
const Progress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: number }>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn('h-2 w-full rounded-full bg-gray-100 overflow-hidden', className)} {...props}>
    <div className="h-full rounded-full bg-gradient-to-r from-[#6D4CFF] to-[#8B5CF6] transition-all duration-500" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
));
Progress.displayName = 'Progress';
export { Progress };

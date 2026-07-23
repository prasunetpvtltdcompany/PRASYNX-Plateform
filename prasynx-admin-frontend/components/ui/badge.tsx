import * as React from 'react';
import { cn } from '@/lib/utils';
const Badge = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' }>(({ className, variant = 'default', ...props }, ref) => {
  const v: Record<string, string> = { default: 'bg-gray-100 text-gray-700 border-gray-200', success: 'bg-green-50 text-green-600 border-green-200', warning: 'bg-yellow-50 text-yellow-600 border-yellow-200', danger: 'bg-red-50 text-red-600 border-red-200', info: 'bg-blue-50 text-blue-600 border-blue-200', purple: 'bg-purple-50 text-purple-600 border-purple-200' };
  return (<span ref={ref} className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border', v[variant], className)} {...props} />);
});
Badge.displayName = 'Badge';
export { Badge };

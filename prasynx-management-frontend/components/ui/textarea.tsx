import * as React from 'react';
import { cn } from '@/lib/utils';
const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('flex min-h-[80px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#6D4CFF] focus:bg-white focus:ring-3 focus:ring-[rgba(109,76,255,0.1)]', className)} {...props} />
));
Textarea.displayName = 'Textarea';
export { Textarea };

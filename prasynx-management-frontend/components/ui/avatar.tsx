import * as React from 'react';
import { cn } from '@/lib/utils';
const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { src?: string; fallback?: string }>(({ className, src, fallback, children, ...props }, ref) => (
  <div ref={ref} className={cn('relative flex shrink-0 overflow-hidden rounded-full w-10 h-10', className)} {...props}>
    {src ? <img src={src} alt="" className="aspect-square h-full w-full" /> : null}
    {!src && fallback ? <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B6FFF] text-white text-sm font-bold">{fallback}</div> : null}
    {children}
  </div>
));
Avatar.displayName = 'Avatar';
export { Avatar };

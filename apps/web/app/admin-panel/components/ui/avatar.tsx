import * as React from 'react';
import { cn } from '@/lib/utils';
const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { src?: string; alt?: string; fallback?: string }>(({ className, src, alt, fallback, children, ...props }, ref) => (
  <div ref={ref} className={cn('relative flex shrink-0 overflow-hidden rounded-full', className)} {...props}>
    {src ? <img src={src} alt={alt || ''} className="aspect-square h-full w-full" /> : null}
    {!src && fallback ? (<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D4CFF] to-[#8B5CF6] text-white text-xs font-bold rounded-full">{fallback}</div>) : null}
    {children}
  </div>
));
Avatar.displayName = 'Avatar';
export { Avatar };

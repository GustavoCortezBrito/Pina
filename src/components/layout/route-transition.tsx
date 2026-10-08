"use client";

import { usePathname } from "next/navigation";

/** Reinicia uma animação de entrada suave a cada troca de página. */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out">
      {children}
    </div>
  );
}

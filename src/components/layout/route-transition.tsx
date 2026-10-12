"use client";

import { usePathname } from "next/navigation";

/** Reinicia uma animação de entrada suave a cada troca de página. */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}

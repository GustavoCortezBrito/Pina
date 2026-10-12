import { HouseIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <Empty className="border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HouseIcon />
          </EmptyMedia>
          <EmptyTitle>Este imóvel não está mais disponível</EmptyTitle>
          <EmptyDescription>Ele pode ter sido alugado. Veja os outros imóveis da vitrine.</EmptyDescription>
        </EmptyHeader>
        <Button asChild>
          <Link href="/vitrine">Ver imóveis disponíveis</Link>
        </Button>
      </Empty>
    </main>
  );
}

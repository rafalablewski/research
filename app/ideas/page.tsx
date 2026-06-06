import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { IdeaCard } from "@/components/discovery/idea-card";
import { INVESTMENT_IDEAS } from "@/data";

export const metadata: Metadata = { title: "Investment Ideas" };

/** Curated thematic collections. Server component — purely static content. */
export default function IdeasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Investment Ideas"
        subtitle="Curated collections across stocks and crypto. Tap any idea to open it in the screener."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INVESTMENT_IDEAS.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}

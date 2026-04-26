"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useAccount } from "wagmi";
import { CampaignCard } from "@/components/campaign-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readLocalLearningState } from "@/lib/client-learning-store";
import type { Campaign } from "@/lib/campaigns";
import { cn } from "@/lib/utils";

export function CampaignFilter({ campaigns }: { campaigns: Campaign[] }) {
  const { address, isConnected } = useAccount();
  const [activeTag, setActiveTag] = useState("All");
  const [query, setQuery] = useState("");
  const [completedCampaignIds, setCompletedCampaignIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isConnected || !address) {
      setCompletedCampaignIds(new Set());
      return;
    }

    const walletAddress = address;
    let cancelled = false;
    const syncLocal = () => {
      if (!cancelled) {
        setCompletedCampaignIds(new Set(readLocalLearningState(walletAddress).completedCampaignIds));
      }
    };
    async function loadCompletedCampaigns() {
      syncLocal();
      try {
        const res = await fetch(`/api/profile?userAddress=${encodeURIComponent(walletAddress)}`);
        const payload = (await res.json()) as {
          ok?: boolean;
          completedCampaigns?: { id: string }[];
        };
        if (!cancelled && res.ok && payload.ok) {
          setCompletedCampaignIds(
            new Set([
              ...readLocalLearningState(walletAddress).completedCampaignIds,
              ...(payload.completedCampaigns ?? []).map((campaign) => campaign.id),
            ]),
          );
        }
      } catch {
        syncLocal();
      }
    }

    void loadCompletedCampaigns();
    window.addEventListener("l2earn-learning-updated", syncLocal);
    return () => {
      cancelled = true;
      window.removeEventListener("l2earn-learning-updated", syncLocal);
    };
  }, [address, isConnected]);

  const tags = useMemo(
    () => ["All", ...Array.from(new Set(campaigns.flatMap((campaign) => campaign.tags))).sort()],
    [campaigns],
  );

  const filteredCampaigns = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return campaigns.filter((campaign) => {
      const matchesTag = activeTag === "All" || campaign.tags.includes(activeTag);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [campaign.title, campaign.brand, campaign.summary, ...campaign.tags]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesTag && matchesQuery;
    });
  }, [activeTag, campaigns, query]);

  const resetFilters = () => {
    setActiveTag("All");
    setQuery("");
  };

  return (
    <section className="space-y-6" aria-label="Campaign filters">
      <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card/40 p-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses"
            className="pl-9"
            aria-label="Search courses"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant={activeTag === tag ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTag(tag)}
              className={cn("h-8", activeTag === tag && "shadow-none")}
              aria-pressed={activeTag === tag}
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {filteredCampaigns.length} of {campaigns.length} courses
        </span>
        {(activeTag !== "All" || query.trim().length > 0) && (
          <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {filteredCampaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              completed={completedCampaignIds.has(campaign.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/70 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">No matching courses</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try another tag or search term.
          </p>
        </div>
      )}
    </section>
  );
}

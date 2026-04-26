"use client";

type LocalLearningState = {
  completedCampaignIds: string[];
};

const storageKey = (address: string) => `l2earn:learning:${address.trim().toLowerCase()}`;

export function readLocalLearningState(address?: string): LocalLearningState {
  if (!address || typeof window === "undefined") return { completedCampaignIds: [] };
  try {
    const raw = window.localStorage.getItem(storageKey(address));
    if (!raw) return { completedCampaignIds: [] };
    const parsed = JSON.parse(raw) as Partial<LocalLearningState>;
    return {
      completedCampaignIds: Array.isArray(parsed.completedCampaignIds)
        ? [...new Set(parsed.completedCampaignIds.filter((id): id is string => typeof id === "string"))]
        : [],
    };
  } catch {
    return { completedCampaignIds: [] };
  }
}

export function rememberLocalCourseCompletion(address: string, campaignId: string) {
  if (typeof window === "undefined") return;
  const current = readLocalLearningState(address);
  const next = {
    completedCampaignIds: [...new Set([...current.completedCampaignIds, campaignId])].sort(),
  };
  window.localStorage.setItem(storageKey(address), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("l2earn-learning-updated", { detail: next }));
}

export type BadgeTier = {
  key: string;
  tokenId: number;
  milestone: number;
  title: string;
  description: string;
  imagePath: string;
};

export const BADGE_TIERS: BadgeTier[] = [
  {
    key: "lessons-1",
    tokenId: 1001,
    milestone: 1,
    title: "First Lesson Badge",
    description: "Awarded for completing your first L2Earn lesson.",
    imagePath: "/placeholder-logo.png",
  },
  {
    key: "lessons-3",
    tokenId: 1003,
    milestone: 3,
    title: "Three Lessons Badge",
    description: "Awarded for completing three L2Earn lessons.",
    imagePath: "/placeholder-logo.png",
  },
  {
    key: "lessons-5",
    tokenId: 1005,
    milestone: 5,
    title: "Five Lessons Badge",
    description: "Awarded for completing five L2Earn lessons.",
    imagePath: "/placeholder-logo.png",
  },
  {
    key: "lessons-10",
    tokenId: 1010,
    milestone: 10,
    title: "Ten Lessons Badge",
    description: "Awarded for completing ten L2Earn lessons.",
    imagePath: "/placeholder-logo.png",
  },
];

export function getBadgeTierForCompletedLessons(completedLessons: number): BadgeTier | null {
  return BADGE_TIERS.find((tier) => tier.milestone === completedLessons) ?? null;
}

export function getBadgeTierByTokenId(tokenId: number): BadgeTier | null {
  return BADGE_TIERS.find((tier) => tier.tokenId === tokenId) ?? null;
}

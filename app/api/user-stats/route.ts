import { NextRequest } from "next/server";
import { getUser } from "@/lib/store";

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address");

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return Response.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const user = getUser(address.toLowerCase());

    // Format completed campaigns with scores
    const completedCampaigns = user.completedCampaigns.map((campaignId) => {
      // Find the score from the txs array (last transaction for this campaign)
      const campaignTx = user.txs.reverse().find((tx) => tx.campaignId === campaignId);
      // Convert amount (in cents) to score out of 3
      // For now, we'll estimate based on the reward amount (500 cents = 5 dNZD with 2/3 score)
      const score = Math.min(3, Math.round((campaignTx?.amount ?? 0) / 166.67));
      return {
        campaignId,
        score: score > 0 ? score : 2, // Default to passing score if we can't determine
        completedAt: campaignTx?.timestamp ?? 0,
      };
    });

    return Response.json({
      address,
      balance: user.balance,
      completedCampaigns,
      streak: user.streak,
      badges: user.badges,
      totalCompleted: user.completedCampaigns.length,
      lastCompletionDate: user.lastCompletionDate,
    });
  } catch (error) {
    console.error("User stats error:", error);
    return Response.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    );
  }
}

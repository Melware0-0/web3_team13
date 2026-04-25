import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CampaignFilter } from "@/components/campaign-filter";
import { CAMPAIGNS } from "@/lib/campaigns";

export const metadata = {
  title: "Campaigns | L2Earn",
  description: "Earn dNZD by learning about brands building on NewMoney.",
};

export default function CampaignsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-72px)]">
        <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
          <header className="mb-12 max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              Campaigns
            </p>
            <h1 className="mb-4 text-4xl font-black tracking-tight text-foreground md:text-5xl">
              Pick a brand. Pass the quiz. Get paid.
            </h1>
            <p className="text-lg text-muted-foreground">
              Each campaign rewards you in dNZD when you pass an AI-tutored quiz. Connect a wallet
              before you start so we know where to send the payout.
            </p>
          </header>

          <CampaignFilter campaigns={CAMPAIGNS} />
        </div>
      </main>
      <Footer />
    </>
  );
}

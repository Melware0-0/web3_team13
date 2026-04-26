import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ProfileDashboard } from "@/components/profile-dashboard";

export const metadata = {
  title: "Profile | L2Earn",
  description: "View your L2Earn learning passport, rewards, and NFT credentials.",
};

export default function ProfilePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-72px)]">
        <div className="container mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <ProfileDashboard />
        </div>
      </main>
      <Footer />
    </>
  );
}

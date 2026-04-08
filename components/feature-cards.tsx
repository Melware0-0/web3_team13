import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "WEB3",
    description:
      "Discover the power of decentralized applications and blockchain technology. Learn how smart contracts and distributed ledgers are revolutionizing the way we interact online.",
    image: "/images/web3-feature.jpg",
  },
  {
    title: "COMMUNITY",
    description:
      "Join a vibrant community of developers, designers, and innovators. Collaborate on projects, share knowledge, and build lasting connections with like-minded individuals.",
    image: "/images/community-feature.jpg",
  },
  {
    title: "FUTURE",
    description:
      "Shape the future of technology with cutting-edge tools and frameworks. From DeFi to NFTs, explore the endless possibilities of Web3 development.",
    image: "/images/future-feature.jpg",
  },
];

export function FeatureCards() {
  return (
    <section id="about" className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            What We Offer
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Explore the pillars of our community and discover what makes WDCC x Web3UOA unique.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group overflow-hidden border-0 bg-card shadow-lg transition-all hover:shadow-xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl font-bold tracking-wide text-foreground">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

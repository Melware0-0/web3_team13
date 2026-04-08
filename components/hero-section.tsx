import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-primary/10 to-background py-20 md:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center md:px-6">
        <h1 className="mb-6 text-balance text-4xl font-black italic tracking-tight text-foreground md:text-5xl lg:text-6xl">
          WELCOME TO WDCC x Web3UOA!
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
          Build projects that push the boundaries of the web. Join us to explore
          decentralized technologies and create the future of the internet.
        </p>
        <Link href="/wallet">
          <Button size="lg" className="px-8 py-6 text-lg font-semibold">
            Get Started!
          </Button>
        </Link>
      </div>
    </section>
  );
}

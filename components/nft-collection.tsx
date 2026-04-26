"use client";

import { useEffect, useState } from "react";
import { Award, ExternalLink, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type NftClaim = {
  tokenId: number;
  name: string;
  description: string;
  threshold: number;
  completedCount: number;
  credential?: {
    wallet: string;
    course: string;
    score: number;
    total: number;
    luminSignedCertificateHash: string;
  };
  certificate?: {
    status: "not_configured" | "signature_request_sent" | "error";
    documentUrl?: string;
    luminDetailsUrl?: string;
    error?: string;
  };
  txHash: string;
  explorerUrl?: string;
  ts: number;
};

type NftResponse = {
  ok?: boolean;
  completedCount?: number;
  claims?: NftClaim[];
  error?: string;
};

export function NftCollection() {
  const { address, isConnected } = useAccount();
  const [claims, setClaims] = useState<NftClaim[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isConnected || !address) {
      setClaims([]);
      setCompletedCount(0);
      return;
    }

    const walletAddress = address;
    let cancelled = false;
    async function loadNfts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/nft?userAddress=${encodeURIComponent(walletAddress)}`);
        const payload = (await res.json()) as NftResponse;
        if (!res.ok || !payload.ok) {
          throw new Error(payload.error ?? "Failed to load NFTs.");
        }
        if (!cancelled) {
          setClaims(payload.claims ?? []);
          setCompletedCount(payload.completedCount ?? 0);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message = loadError instanceof Error ? loadError.message : String(loadError);
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadNfts();
    return () => {
      cancelled = true;
    };
  }, [address, isConnected]);

  if (!isConnected) return null;

  const certificateHref = (claim: NftClaim) => {
    const params = new URLSearchParams({ userAddress: address ?? "" });
    if (claim.credential) {
      params.set("campaignId", claim.credential.course);
      params.set("score", String(claim.credential.score));
      params.set("total", String(claim.credential.total));
      params.set("mintTx", claim.txHash);
    }
    return `/api/certificates/${claim.tokenId}?${params.toString()}`;
  };

  return (
    <Card className="w-full max-w-md border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-primary" />
          Learning Credential NFTs
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {completedCount} courses
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading credentials...
          </div>
        ) : error ? (
          <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
            {error}
          </p>
        ) : claims.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-sm text-muted-foreground">
            Complete your first course to unlock a wallet-bound learning credential.
          </p>
        ) : (
          <ul className="space-y-3">
            {claims.map((claim) => (
              <li key={claim.tokenId} className="rounded-lg border border-border/40 bg-background/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{claim.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {claim.description}
                    </p>
                  </div>
                  <Badge variant="secondary">#{claim.tokenId}</Badge>
                </div>
                {claim.credential ? (
                  <p className="mt-3 break-all text-[11px] text-muted-foreground">
                    Course {claim.credential.course} · score {claim.credential.score}/{claim.credential.total} ·
                    Lumin certificate hash {claim.credential.luminSignedCertificateHash}
                  </p>
                ) : null}
                {claim.certificate ? (
                  <div className="mt-3 text-xs">
                    {claim.certificate.documentUrl || claim.certificate.luminDetailsUrl ? (
                      <a
                        href={claim.certificate.documentUrl ?? claim.certificate.luminDetailsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        Open signed certificate
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <div className="space-y-1">
                        <a
                          href={certificateHref(claim)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          Open generated PDF
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-muted-foreground">
                          Lumin certificate: {claim.certificate.status.replaceAll("_", " ")}
                          {claim.certificate.error ? ` (${claim.certificate.error})` : ""}
                        </p>
                      </div>
                    )}
                  </div>
                ) : null}
                {!claim.certificate ? (
                  <a
                    href={certificateHref(claim)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open generated PDF
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
                <p className="mt-3 break-all text-[11px] text-muted-foreground">
                  Mint tx{" "}
                  {claim.explorerUrl?.startsWith("http") ? (
                    <a
                      href={claim.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      {claim.txHash}
                    </a>
                  ) : (
                    claim.txHash
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

# L2Earn

**Learn-to-Earn for the Great Handover.** Web3NZ Hackathon · Team 13 · UoA · Apr 2026.

Watch a short video → pass an AI-tutored quiz → earn **dNZD** in your wallet. The same campaign is published as a machine-readable feed so AI agents can index brands too. **One campaign, two audiences.**

## Why this exists

Two prompts, fused into one product:

1. **NewMoney's brief** — Ryan Johnson-Hunt's pitch: a learn-to-earn flow where brands sponsor short videos + quizzes, learners earn dNZD on completion, publishers (e.g. NBR-style outlets) earn a margin. CAC that beats Google Ads.
2. **Hackathon theme — The Great Handover** — by 2126, the buyer is an AI agent, not a human. Brands need to teach *both* audiences. L2Earn's `/api/agents/campaigns` endpoint is the open feed agents read before recommending or transacting.

Stablecoin settlement on dNZD is the connective tissue.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** · **Tailwind v4**
- **shadcn/ui** + Lucide
- **Reown AppKit + wagmi + viem** — real wallet connection (MetaMask / WalletConnect / Coinbase) on Base, Base Sepolia, Mainnet, Arbitrum, Polygon, Optimism
- **Anthropic Claude** (`claude-haiku-4-5-20251001`) for quiz generation + grading
- **File-backed dNZD ledger** in `data/store.json` — mocked per Ryan's transcript ("just use the stablecoin in net solution and you're eligible")

## Run it

```bash
git clone https://github.com/Melware0-0/web3_team13.git
cd web3_team13
git checkout puranjay_branch
cp .env.example .env.local
# Fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (free at walletconnect.network)
# Optionally fill ANTHROPIC_API_KEY (otherwise quiz uses a deterministic stub)
npm install
npm run dev
```

Open http://localhost:3000.

## Master wallet payout config

To send the completion payout from a server-side master wallet, set these in `.env.local`:

```bash
MASTER_WALLET_PRIVATE_KEY=0x...
MASTER_WALLET_ADDRESS=0xC7Fd206cC5534700B06A760CeAd2A0602aF036b7
EVM_RPC_URL=https://sepolia.base.org
EVM_CHAIN_ID=84532
NZD_TOKEN_ADDRESS=0x63ee4b77d3912DC7bCe711c3BE7bF12D532F1853
NZD_TOKEN_DECIMALS=18
NZD_PAYOUT_AMOUNT=5
```

Without these variables, `/api/payout` will return a configuration error and no on-chain transfer is sent.
`MASTER_WALLET_PRIVATE_KEY` must derive to `MASTER_WALLET_ADDRESS`, otherwise payout calls are rejected.

## Demo path (Sunday, 5pm)

1. **`/`** — NewMoney-themed landing. Click "Browse Campaigns".
2. **`/wallet`** — connect MetaMask on **Base Sepolia** (testnet, no real funds). Your `0x…` address is your identity.
3. **`/campaigns`** — pick "What is dNZD?".
4. Watch the 60-second intro video.
5. Click **"Start AI Quiz"** — Claude generates 3 questions live from the campaign transcript.
6. Answer → submit. Claude grades and explains every wrong answer.
7. On pass: **+5.00 dNZD** banner appears. Server-side guard blocks double-credits.
8. Back to **`/wallet`** — balance card shows 5.00 dNZD with the campaign in tx history.
9. **The Handover moment** — open `/api/agents/campaigns` in a new tab. Same campaign, machine-readable. *"In 2126 your AI shopping agent ingests this before recommending a brand."*
10. Close on the NewMoney slide: NZ-regulated, 1:1 reserve-backed, multi-chain via LayerZero.

## What's where

```
app/
  page.tsx                       # L2Earn landing
  campaigns/
    page.tsx                     # campaign grid
    [id]/page.tsx                # video + AI quiz + payout
  wallet/page.tsx                # WalletConnector + dNZD balance
  api/
    quiz/generate/route.ts       # Claude -> 3 MCQs, cached server-side by quizId
    quiz/grade/route.ts          # grades + explanations, decides pass/fail
    wallet/route.ts              # GET balance + tx history
    wallet/credit/route.ts       # POST mints dNZD on quiz pass (one-shot per campaign)
    agents/campaigns/route.ts    # the machine-readable feed for AI agents

components/
  navbar.tsx, hero-section.tsx, feature-cards.tsx, footer.tsx
  wallet-connector.tsx           # Reown AppKit connect card (kept from shu_branch)
  web3-provider.tsx              # wagmi + AppKit provider (kept)
  campaign-card.tsx              # campaign grid tile
  quiz-player.tsx                # AI tutor flow client component
  dnzd-balance.tsx               # /wallet balance + tx list
  ui/                            # shadcn primitives

lib/
  campaigns.ts                   # seed campaign data
  store.ts                       # dNZD ledger (file-backed JSON, cents-precise)
  anthropic.ts                   # Claude client + in-memory quiz session cache
  wagmi-config.ts                # networks + Reown adapter
```

## Tracks targeted

- **NewMoney Builder** ($500) — dNZD is the settlement rail for every payout.
- **Theme: The Great Handover** — `/api/agents/campaigns` is the open spec for agent indexing; the AI tutor itself is an agent.
- (Stretch, separate planning) — Local Systems · Digital Identity · Avalanche C-Chain · Fire Eyes/ENS.

## Security notes (honest disclosures for judges)

- **dNZD is mocked.** No real chain mint. We display "testnet · mock" in the UI. A v2 would deploy a real ERC20 (Base or Avalanche) with NewMoney's wholesale counterparty minting on quiz pass.
- **Wallet identity is the connected `address`** with no signature challenge. A v2 would gate `POST /api/wallet/credit` behind a SIWE signature.
- **Quiz integrity** — correct answers never leave the server. `generate` caches the full quiz in-memory keyed by `quizId`; `grade` looks it up. No client-side tampering vector.

## Built with thanks to

The NewMoney team — Ryan Johnson-Hunt, Tim Maclean, Will Remor, Craig Farndale — and the Web3UOA / WDCC organisers. The wallet workshop scaffold on `shu_branch` was the launchpad for everything in this build.

> *"For builders, this is what freedom looks like."* — NewMoney

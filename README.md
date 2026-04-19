# Web3 Wallet Connector Workshop

**Stack:** Next.js · wagmi · Reown AppKit (WalletConnect) · TanStack Query

---

## Pre-Workshop Setup
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] MetaMask browser extension installed (https://metamask.io)
- [ ] A code editor (VS Code recommended)
- [ ] Create a free WalletConnect Project ID at https://walletconnect.network/

---


## Initial setup

1. Clone this repo to get started:

```bash
git clone https://github.com/UoaWDCC/web3-starter-template.git
cd web3-starter-template
```
2. Switch to the starter branch

```bash
git switch starter-branch
```

3. Install the necessarry dependencies
```bash
npm install
```
---
## Overview

You'll be integrating a wallet connector into a Next.js app using three files that each play a distinct role. By the end of this workshop you'll have a working connect/disconnect flow supporting MetaMask, WalletConnect, and Coinbase Wallet across multiple EVM chains.

---

## Part 1 — Architecture 

The three files form a clear dependency chain. Think of it like a restaurant: `wagmi-config.ts` is the kitchen setup, `web3-provider.tsx` is the front-of-house staff, and `wallet-connector.tsx` is what the customer actually sees and touches.

```
wagmi-config.ts
│  Defines networks, RPC transports, and storage.
│  Exports wagmiAdapter and config.
│
└─▶ web3-provider.tsx
    │  Calls createAppKit once. Wraps your app in
    │  WagmiProvider + QueryClientProvider.
    │  Goes in your root layout.
    │
    └─▶ wallet-connector.tsx
           Consumes context via hooks.
           Renders the connect card or connected card
           depending on wallet state.
```

> **RPC (Remote Procedure Call):** a communication protocol that lets your app talk to a blockchain node — fetching balances, sending transactions, etc. — as if it were a local function call.

### File roles at a glance

| File | Role | You will... |
|---|---|---|
| `wagmi-config.ts` | Foundation — networks & transports | Import chains, fill in the networks array and transports |
| `web3-provider.tsx` | Context layer — providers & AppKit init | Import config values, complete createAppKit, wrap children in providers |
| `wallet-connector.tsx` | UI component — hooks & rendering | Fix missing hook values, wire up the connect button |

---

## Part 2 — Libraries 

### Why these four packages?

**`wagmi` ("We're All Gonna Make It")**  
React hooks for Ethereum. Wraps **viem** (a TypeScript interface for Ethereum) and gives you `useBalance`, `useAccount`, `useSignMessage`, and more. You only need 2–3 hooks for a working integration.

**`@reown/appkit`**  
The WalletConnect modal UI. Handles MetaMask, WalletConnect QR, and Coinbase Wallet — all in one drop-in modal. Requires a free project ID from [Wallet Connect](https://walletconnect.network/).

**`@tanstack/react-query`**  
Async state management. wagmi uses it internally for caching RPC calls. You don't interact with it directly — you just need `QueryClientProvider` in the tree.

**`@wagmi/core`**  
Framework-agnostic core used by the WagmiAdapter. Provides `createStorage` and `cookieStorage` for SSR-safe state persistence across page loads.

### Key hooks you'll use

| Hook | Returns | Use it to... |
|---|---|---|
| `useAppKit()` | `open()` | Open the connect/account/network modal |
| `useAppKitAccount()` | `address`, `isConnected`, `status` | Gate rendering on connection state |
| `useAppKitNetwork()` | `caipNetwork`, `chainId` | Display the active chain name and explorer URL |
| `useBalance({ address })` | `{ formatted, symbol, value }` | Show the user's native token balance |

> **Tip:** `open()` accepts an optional `view` parameter:
> - `open({ view: "Networks" })` → opens the network switcher
> - `open({ view: "Account" })` → opens account details (with disconnect)

---
## Part 3 — Files Walkthrough 

Let's walk through and see what those 3 files have!

---

## Part 4 — Exercise 

The starter files have several intentional gaps marked with `TODO` comments. Work through them in file order — each fix unlocks the next.

---

### `wagmi-config.ts`

**TODO 1 — Import your networks**

The import statement is currently empty:

```ts
import {} from "@reown/appkit/networks";
```

Add the chains you want to support in the import!


**TODO 2 — Populate the networks array and transports**

Fill in the `networks` array and add one `http()` transport per chain:

e.g.

```ts
export const networks = [thisnet, thatnet, thosenets, these];

transports: {
  [thisnet.id]: http(),
  ...
},
```

---

### `web3-provider.tsx`

**TODO 3 — Import from wagmi-config**

The file references `wagmiAdapter`, `projectId`, and `networks` but never imports them. Import wagmi-config and the references.



**TODO 4 — Complete createAppKit**

The `createAppKit` call is currently empty. Fill it in so that the wallet application works!

*Hint: look at the provided docs at the bottom.


**TODO 5 — Wrap children in both providers**

The return statement is missing `WagmiProvider`and its necessarry configurations. The correct nesting is `WagmiProvider` → `QueryClientProvider` → `children`:

---

### `wallet-connector.tsx`

**TODO 6 — Destructure isConnected from useAppKitAccount**

The current line is missing `isConnected`, which means the conditional render below it will always fail:

```ts
const { address, status } = useAppKitAccount();
```

**TODO 7 — Wire up the connect button**

The connect button has no `onClick`. Add it so clicking opens the wallet modal:

```tsx
<Button
  size="lg"
  className="w-full gap-2"
>
```

---

### Checkpoint

Once all TODOs are complete:

1. Create `.env.local` in the project root and add your project ID:
   ```
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_id_here
   ```
2. Run `npm run dev`
3. Open the app and click **Connect Wallet**
4. Connect using MetaMask — you should see your address, balance, and network

---

## Part 5 — Extra Exercises

These are optional extensions to try if you finish early or want to explore further after the workshop.

---

### Extra 1 — Add a testnet

Add `sepolia` to your networks so you can test without using real funds:

```ts
import { mainnet, arbitrum, polygon, optimism, base, sepolia } from "@reown/appkit/networks";

export const networks = [mainnet, arbitrum, polygon, optimism, base, sepolia];

transports: {
  // ...existing entries
  [sepolia.id]: http(),
}
```

Open the network switcher in the modal and confirm Sepolia appears.

---

### Extra 2 — Add a copy toast

Give users visual feedback when they copy their address. In `wallet-connector.tsx`:

```tsx
const [copied, setCopied] = useState(false);

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

// In your JSX, next to the Copy button:
{copied && <span className="text-xs text-emerald-500">Copied!</span>}
```

---

### Extra 3 — Gate a UI section behind wallet connection

Add a placeholder section that only renders when a wallet is connected:

```tsx
{isConnected && (
  <div className="rounded-lg bg-muted/50 p-4">
    <p className="text-xs font-medium text-muted-foreground mb-1">Your NFTs</p>
    <p className="text-sm text-muted-foreground">Coming soon...</p>
  </div>
)}
```

---

### Extra 4 — Use a private RPC

Replace the public `http()` transport for mainnet with a provider URL. Public RPCs are rate-limited — a private one is more reliable for production:

```ts
// In .env.local:
// NEXT_PUBLIC_ALCHEMY_MAINNET_URL=https://eth-mainnet.g.alchemy.com/v2/your_key

transports: {
  [mainnet.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL),
  // ...rest unchanged
}
```

Free tiers are available at [Alchemy](https://www.alchemy.com) and [Infura](https://infura.io).

---

### Extra 5 — Redesign the wallet card with AI

The current `wallet-connector.tsx` works, but the design is basic. Use an AI coding tool (Claude, ChatGPT, GitHub Copilot, etc.) to make it look more polished — and practise writing effective prompts while you're at it.

**Starter prompt:**

> "Here is my wallet connector React component. Redesign the connected wallet card to look more modern and visually interesting. Keep all the existing functionality (address display, copy button, block explorer link, balance, network info, disconnect button) but improve the layout, typography, and visual hierarchy. Use only Tailwind CSS classes. The component uses shadcn/ui Card, Button primitives."

**Ideas to ask for:**
- A dark glassmorphism card style
- A coloured dot or badge that changes per network (green for mainnet, yellow for testnets)
- An identicon or blockie avatar generated from the wallet address
- An animated balance that counts up on load
- A more prominent disconnect affordance

**Discuss with the group afterward:**
- What wording in your prompt produced the best result?
- What did the AI get wrong that you had to correct manually?
- Did you need multiple rounds of prompting, or did one shot work?
- How would you make it look good on mobile?

---

## Common Gotchas

**`createAppKit` inside a component**  
Always call it at module level. If it's inside a React component, it re-initialises on every render and breaks modal state.

**Missing `isConnected` in the destructure**  
If the connected card never appears after connecting, check that `isConnected` is destructured from `useAppKitAccount()`. Without it, `!isConnected` evaluates to `true` forever.

**Wrong provider nesting order**  
The correct nesting is `WagmiProvider` → `QueryClientProvider` → your components. Swapping the order or omitting either will cause hook errors.

**Address type errors**  
wagmi's `useBalance` expects `` 0x${string} ``, not plain `string`. Always cast: `` address as `0x${string}` ``.

**Hydration mismatch**  
This is why we use `cookieStorage` and `ssr: true`. If you see hydration errors, check that `cookies` is being passed correctly from your root layout into `Web3Provider`.

**Rate limits on public RPCs**  
The default `http()` transport uses public endpoints that are heavily rate-limited. For anything beyond local dev, use Alchemy, Infura, or another provider.

---

## Resources

- [Reown AppKit docs](https://docs.reown.com/appkit/overview)
- [Wallet Connect docs](https://docs.walletconnect.network/)
- [wagmi docs](https://wagmi.sh)
- [viem docs](https://viem.sh)
- [Get a WalletConnect project ID](https://walletconnect.network/)
- [Alchemy (free RPC tier)](https://www.alchemy.com)
- [Infura (free RPC tier)](https://infura.io)
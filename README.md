# Web3 Wallet Connector Workshop

**Stack:** Next.js · wagmi · Reown AppKit (WalletConnect) · TanStack Query

---

## Pre-Workshop Setup

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] MetaMask browser extension installed (https://metamask.io)
- [ ] A code editor (VS Code recommended)
- [ ] Create a free WalletConnect Project ID at https://walletconnect.network

---

## Initial Setup

1. Clone this repo to get started:

```bash
git clone https://github.com/UoaWDCC/web3-starter-template.git
cd web3-starter-template
```

2. Switch to the starter branch:

```bash
git switch starter-branch
```

3. Install the necessary dependencies:

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
           Renders the UI depending on the wallet state.
```

> **RPC (Remote Procedure Call):** a communication protocol that lets your app talk to a blockchain node — fetching balances, sending transactions, etc. — as if it were a local function call.

---

## Part 2 — Exercise

The starter files have several intentional gaps marked with `TODO` comments. Work through them in file order — each fix unlocks the next.

> **All necessary information to implement the wallet connector can be found in the docs below:**  
> [wagmi docs](https://wagmi.sh) · [Reown AppKit docs](https://docs.reown.com/appkit/overview)

---

### `wagmi-config.ts`

**TODO 1 — Import your networks**

The import statement is currently empty:

```ts
import {} from "@reown/appkit/networks";
```

Add the chains you want to support in the import.

---

**TODO 2 — Populate the networks array and transports**

Fill in the `networks` array and add one `http()` transport per chain:

```ts
export const networks = [thisnet, thatnet, thosenets, these];

transports: {
  [thisnet.id]: http(),
  // ...
},
```

---

### `web3-provider.tsx`

**TODO 3 — Import from wagmi-config**

The file references `wagmiAdapter`, `projectId`, and `networks` but never imports them. Import `wagmi-config` and the references.

---

**TODO 4 — Complete createAppKit**

The `createAppKit` call is currently empty. Fill it in so that the wallet application works.

---

**TODO 5 — Wrap children in both providers**

The return statement is missing `WagmiProvider` and its necessary configurations. The correct nesting is:

```
WagmiProvider
  └ QueryClientProvider
      └ children
```

---

### `wallet-connector.tsx`

**TODO 6 — Destructure hooks from useAppKitAccount**

The current line is missing the necessary values for the wallet connector:

```ts
const {} = useAppKitAccount();
```

Add the necessary values.

---

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

## Part 3 — Extra Exercises

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

**Missing values in the useAppKitAccount destructure**  
If the connected card never appears after connecting, check that all necessary values are destructured from `useAppKitAccount()`.

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
- [WalletConnect docs](https://docs.walletconnect.network/)
- [wagmi docs](https://wagmi.sh)
- [viem docs](https://viem.sh)
- [Get a WalletConnect project ID](https://walletconnect.network)
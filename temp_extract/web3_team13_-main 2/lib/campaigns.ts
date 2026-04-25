export type Campaign = {
  id: string;
  brand: string;
  title: string;
  summary: string;
  /** Source-of-truth text the AI tutor draws from. */
  transcript: string;
  /** Reward in dNZD cents. 500 = 5.00 dNZD */
  rewardCents: number;
  tags: string[];
  quizQuestions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "newmoney-101",
    brand: "NewMoney",
    title: "What is dNZD?",
    summary:
      "A 60-second intro to NewMoney's NZ-regulated, 1:1 reserve-backed digital dollar. Built for builders.",
    rewardCents: 500,
    tags: ["NewMoney", "Stablecoins", "Aotearoa"],
    transcript: `
NewMoney is a New Zealand-founded fintech building stable, transparent digital cash for Kiwis and Aussies.
Its first two stablecoins are dNZD (digital New Zealand Dollar) and dAUD (digital Australian Dollar).

Every dNZD token is fully backed 1:1 by fiat reserves held in trust in a New Zealand-registered bank.
The trust is administered by NewMoney NZ Nominee Limited under a New Zealand bare-trust structure, which
means every token represents a direct and redeemable beneficial interest in real cash.

dNZD is a blockchain-based digital representation of the New Zealand Dollar. It is currently live on the
Ethereum, Base, Polygon, and Solana networks, with cross-chain functionality enabled by an integration
with LayerZero. More networks are joining every week.

Primary issuance and redemption are available only to wholesale counterparties in New Zealand. The
stablecoins themselves are not financial products. They are governed exclusively by New Zealand law.

NewMoney's mission is to be the most trusted, transparent, integrated, and practical digital dollar for
everyday use - giving people the freedom of open money: faster, simpler, borderless. The team combines
deep institutional fluency with DeFi-native innovation, reducing FX drag across trans-Tasman and global
flows. Use cases include DeFi earning vaults, payment networks, stablecoin FX, payroll, and anything
that disrupts the status quo.
    `.trim(),
    quizQuestions: [
      {
        id: "q1",
        question: "What is dNZD?",
        options: [
          "A blockchain-based digital representation of the New Zealand Dollar",
          "A New Zealand government bond",
          "A volatile cryptocurrency unrelated to NZD",
          "A KiwiSaver investment fund",
        ],
        correctIndex: 0,
        explanation:
          "dNZD is presented as a blockchain-based digital representation of NZD, backed by fiat reserves.",
      },
      {
        id: "q2",
        question: "Which networks does the campaign say dNZD is live on?",
        options: [
          "Only Ethereum",
          "Bitcoin, Litecoin, and Dogecoin",
          "Ethereum, Base, Polygon, and Solana",
          "A private NewMoney chain only",
        ],
        correctIndex: 2,
        explanation:
          "The campaign text names Ethereum, Base, Polygon, and Solana as the current networks.",
      },
      {
        id: "q3",
        question: "What backs every dNZD token according to the campaign?",
        options: [
          "Algorithmic rebalancing",
          "A basket of crypto assets",
          "Community staking pools",
          "Fiat reserves held in trust 1:1 in a New Zealand-registered bank",
        ],
        correctIndex: 3,
        explanation:
          "The transcript states that every dNZD token is backed 1:1 by fiat reserves held in trust in a New Zealand-registered bank.",
      },
    ],
  },
  {
    id: "newmoney-stablecoins",
    brand: "NewMoney",
    title: "Why Stablecoins Matter",
    summary:
      "Understand how stablecoins like dNZD solve volatility problems in crypto and enable everyday commerce.",
    rewardCents: 600,
    tags: ["NewMoney", "Stablecoins", "DeFi", "Finance"],
    transcript: `
Stablecoins are cryptocurrencies designed to maintain a stable value by being pegged to an external reference,
most commonly a fiat currency like USD, NZD, or AUD. They solve a critical problem in crypto: volatility.

Bitcoin and Ethereum fluctuate wildly - sometimes 10% or more in a single day. This makes them unsuitable
for everyday payments, payroll, or commerce. You can't price your coffee in Bitcoin if it could be worth
double tomorrow or half as much. Stablecoins bridge this gap.

There are three main types of stablecoins:

1. Fiat-backed: Fully collateralized by fiat currency in banks (like dNZD). These are the most transparent
   and offer the strongest stability guarantees. Every coin represents a claim on real cash.

2. Crypto-backed: Collateralized by other cryptocurrencies, typically in excess (e.g., 150% backing).
   These require complex mechanisms to maintain the peg and carry counterparty risk.

3. Algorithmic: Maintained by code and incentive mechanisms rather than collateral. These have historically
   been unstable and risky.

dNZD is fiat-backed by NewMoney. Every token in circulation is backed 1:1 by NZD held in a New Zealand-registered
bank under a bare-trust structure. This means dNZD holders have a direct claim on the underlying cash.

Stablecoins enable:
- Fast cross-border payments without FX middlemen
- 24/7 settlement (no banking hours)
- Programmable money for smart contracts and DeFi
- Reliable unit of account for commerce and loans
- Freedom for unbanked populations to access stable currency
    `.trim(),
    quizQuestions: [
      {
        id: "q1",
        question: "What is the main problem stablecoins solve?",
        options: [
          "They eliminate the need for blockchain",
          "Cryptocurrency volatility makes it unsuitable for everyday payments",
          "They replace central banks",
          "They create infinite wealth",
        ],
        correctIndex: 1,
        explanation:
          "Stablecoins solve the volatility problem that makes regular crypto unsuitable for commerce and payroll.",
      },
      {
        id: "q2",
        question: "Which type of stablecoin is dNZD?",
        options: [
          "Crypto-backed with 150% collateral",
          "Algorithmic",
          "Fiat-backed with 1:1 NZD backing",
          "Variable-peg",
        ],
        correctIndex: 2,
        explanation:
          "dNZD is fiat-backed by NewMoney, with every token backed 1:1 by NZD held in a New Zealand bank.",
      },
      {
        id: "q3",
        question: "What does bare-trust structure mean for dNZD holders?",
        options: [
          "They have no legal claim to the backing",
          "They have a direct claim on real cash reserves",
          "The bank owns the money, not token holders",
          "The trust is unregistered and unregulated",
        ],
        correctIndex: 1,
        explanation:
          "A bare-trust structure means dNZD holders have a direct and redeemable beneficial interest in the real cash backing.",
      },
    ],
  },
  {
    id: "newmoney-defi",
    brand: "NewMoney",
    title: "DeFi & Open Money",
    summary:
      "Discover how NewMoney stablecoins unlock DeFi opportunities and financial freedom.",
    rewardCents: 700,
    tags: ["NewMoney", "DeFi", "Finance", "Open Banking"],
    transcript: `
DeFi (Decentralized Finance) is financial infrastructure built on public blockchains where transactions
settle in code rather than through centralized intermediaries like banks. Stablecoins like dNZD are the
foundation of DeFi: they're the reliable medium of exchange, unit of account, and store of value.

NewMoney's vision is "open money" - fast, simpler, borderless financial systems that reduce friction and costs.
Traditional finance charges fees at every step: bank transfers, FX conversions, intermediaries all take cuts.

With dNZD on public blockchains, users can:

1. Send money 24/7/365 without banking hours. A transaction settles in minutes, not days.

2. Reduce FX drag: Trans-Tasman and global flows no longer need to pass through multiple currency conversions
   and correspondent banks. Send dNZD directly, reducing costs by 50% or more.

3. Earn yield: DeFi protocols let dNZD holders deposit their funds into "earning vaults" that generate returns
   from lending, liquidity provision, and other strategies. This is accessible to anyone with a crypto wallet.

4. Access credit without a bank: Smart contracts can programmatically issue loans backed by dNZD collateral,
   opening credit to people excluded from traditional banking.

5. Programmable money: Businesses can automate payroll, subscriptions, and payments with code. Money flows
   instantly on a schedule or trigger condition.

6. Payroll at scale: Companies can pay global teams instantly in dNZD, avoiding SWIFT fees and delays.

NewMoney combines "deep institutional fluency with DeFi-native innovation" - meaning they understand both
traditional finance and blockchain, building bridges between them for everyday users, not just speculators.

The freedom of open money means lower costs, faster settlement, and financial inclusion for all.
    `.trim(),
    quizQuestions: [
      {
        id: "q1",
        question: "What is DeFi?",
        options: [
          "A bank offering digital accounts",
          "Financial infrastructure built on public blockchains where transactions settle in code",
          "A government regulation framework",
          "A cryptocurrency exchange",
        ],
        correctIndex: 1,
        explanation:
          "DeFi is financial infrastructure built on public blockchains where transactions settle via code rather than centralized intermediaries.",
      },
      {
        id: "q2",
        question: "How does dNZD reduce trans-Tasman FX costs?",
        options: [
          "By eliminating currency altogether",
          "Users send dNZD directly, avoiding multiple conversions and correspondent banks",
          "By fixing exchange rates permanently",
          "It cannot reduce FX costs",
        ],
        correctIndex: 1,
        explanation:
          "With dNZD, money can move directly between NZ and Australia without passing through multiple currency conversions and intermediaries.",
      },
      {
        id: "q3",
        question: "What does 'open money' mean according to the campaign?",
        options: [
          "Money that anyone can print",
          "Fast, simpler, borderless financial systems that reduce friction and costs",
          "Money with no regulation",
          "A free currency with no backing",
        ],
        correctIndex: 1,
        explanation:
          "Open money in NewMoney's vision means fast, simpler, borderless systems that reduce friction, costs, and intermediaries.",
      },
    ],
  },
  {
    id: "newmoney-trust",
    brand: "NewMoney",
    title: "Trust & Reserve Backing",
    summary:
      "Learn how NewMoney ensures dNZD is backed by real cash and why transparency matters.",
    rewardCents: 600,
    tags: ["NewMoney", "Trust", "Banking", "Regulation"],
    transcript: `
Trust is the foundation of money. Historically, people trusted central banks to manage fiat currency responsibly.
In crypto, trust has often been misplaced: many stablecoins have failed, collapsed, or lost their peg entirely.

NewMoney builds trust through radical transparency and regulated reserve backing.

Every dNZD token is backed 1:1 by fiat reserves held in a New Zealand-registered bank. This means:

1. For every dNZD in circulation, there is exactly one real NZD sitting in a trust account.

2. The trust is administered by "NewMoney NZ Nominee Limited" under a New Zealand bare-trust structure.
   This is legal language meaning: the trust is registered, regulated by NZ law, and the token holders
   have direct beneficial interest in the cash.

3. If NewMoney the company fails, the cash does not belong to the company - it's held in trust for token holders.
   Your dNZD remains redeemable for real cash independently of company status.

4. New Zealand law governs dNZD. It's not an experiment or a gray area - it's a formal, regulated instrument.

This contrasts with algorithmic stablecoins (which depend on code and incentive mechanisms and can fail) or
under-collateralized crypto-backed stablecoins (which carry counterparty risk and can decouple from their peg).

Compare to historical failures:
- Terra/Luna: Algorithmic stablecoin that promised stability through incentives. It collapsed spectacularly in 2022,
  losing billions of dollars in value. Investors lost their savings.
- Stablecoin X: A project that claimed 1:1 backing but actually held less cash than coins in circulation. When
  scrutiny arrived, it collapsed.

NewMoney's approach is different: full, real, auditable backing by fiat cash in a regulated bank under NZ law.

This model scales, survives company failures, and gives users legitimate confidence in redemption.
    `.trim(),
    quizQuestions: [
      {
        id: "q1",
        question: "What backs every dNZD token?",
        options: [
          "NewMoney's company assets",
          "Exactly 1:1 by NZD held in a New Zealand-registered bank in trust",
          "A basket of crypto assets",
          "Community votes and incentives",
        ],
        correctIndex: 1,
        explanation:
          "Every dNZD is backed 1:1 by real NZD held in a regulated bank trust account.",
      },
      {
        id: "q2",
        question: "What happens to your dNZD if NewMoney the company fails?",
        options: [
          "Your dNZD becomes worthless",
          "The cash is used to pay company creditors",
          "Your dNZD remains redeemable for real cash because it's held in trust",
          "The government confiscates it",
        ],
        correctIndex: 2,
        explanation:
          "Under the bare-trust structure, dNZD holders have direct beneficial interest in the cash. If NewMoney fails, the cash is still held for token holders independently.",
      },
      {
        id: "q3",
        question: "Which historical stablecoin collapsed due to algorithmic failure?",
        options: [
          "Bitcoin",
          "USD Coin (USDC)",
          "Terra/Luna",
          "Tether",
        ],
        correctIndex: 2,
        explanation:
          "Terra/Luna was an algorithmic stablecoin that promised stability through incentives. It collapsed spectacularly in 2022, demonstrating the risk of algorithmic approaches.",
      },
    ],
  },
  {
    id: "newmoney-cross-chain",
    brand: "NewMoney",
    title: "Cross-Chain Money",
    summary:
      "Understand how LayerZero enables dNZD to move seamlessly across Ethereum, Base, Polygon, Solana, and beyond.",
    rewardCents: 700,
    tags: ["NewMoney", "LayerZero", "Blockchain", "Interoperability"],
    transcript: `
The blockchain ecosystem is fragmented. Ethereum, Solana, Polygon, Base, Arbitrum - each is a separate network
with different communities, liquidity, and use cases. Users and developers often need stablecoins to move between them.

Historically, this was a pain: you'd have to bridge through centralized exchanges, losing liquidity and paying fees.
Cross-chain messaging was unreliable, and many bridges have been hacked, resulting in billions in losses.

NewMoney uses LayerZero, a protocol that enables secure cross-chain messaging without relying on wrapped tokens,
liquidity pools, or centralized bridges.

How it works:

1. LayerZero connects blockchains with programmable smart contracts. A transaction on Ethereum can trigger code
   on Solana reliably.

2. Instead of managing separate tokens (wrapped dNZD on Polygon, bridged dNZD on Base, etc.), dNZD uses a single
   canonical token with LayerZero's Omnichain Fungible Token (OFT) standard.

3. When you send dNZD from Ethereum to Solana, the LayerZero network verifies the transaction and atomically
   mints on the destination chain. Your dNZD is fungible and interchangeable everywhere.

4. This is safer, cheaper, and faster than traditional bridges because there's no centralized liquidity pool
   or wrapped token overhead.

Benefits:

- Composability: DeFi protocols on any chain can use dNZD as a base unit without worrying about bridge fragmentation.
- Liquidity: Instead of fragmented pools on each chain, dNZD liquidity is essentially global and unified.
- Security: LayerZero is maintained by a decentralized network of validators and relies on cryptographic proofs,
  not centralized operators.
- Scalability: As new chains launch, NewMoney can integrate them via LayerZero - "more networks are joining every week."

NewMoney's cross-chain strategy positions dNZD as a global settlement layer: one digital dollar that works
everywhere, enabling truly borderless finance.
    `.trim(),
    quizQuestions: [
      {
        id: "q1",
        question: "What is LayerZero?",
        options: [
          "A centralized cryptocurrency exchange",
          "A protocol for secure cross-chain messaging without wrapped tokens or centralized bridges",
          "A Layer 2 scaling solution for Ethereum only",
          "A stablecoin competitor to dNZD",
        ],
        correctIndex: 1,
        explanation:
          "LayerZero is a protocol enabling secure cross-chain messaging and is used by NewMoney to make dNZD fungible across all chains.",
      },
      {
        id: "q2",
        question: "How does NewMoney manage dNZD across multiple chains?",
        options: [
          "Separate tokens on each chain that must be wrapped",
          "A single canonical token with LayerZero's OFT standard",
          "A centralized liquidity pool on one exchange",
          "User responsibility to manually bridge tokens",
        ],
        correctIndex: 1,
        explanation:
          "dNZD uses LayerZero's Omnichain Fungible Token standard, enabling a single canonical token that works on all chains.",
      },
      {
        id: "q3",
        question: "What is a key advantage of dNZD's cross-chain approach?",
        options: [
          "It eliminates the need for blockchain validators",
          "Global, unified liquidity instead of fragmented pools on each chain",
          "It requires manual intervention to move tokens",
          "It relies on centralized exchanges for security",
        ],
        correctIndex: 1,
        explanation:
          "By being fungible across chains via LayerZero, dNZD has global unified liquidity instead of fragmented liquidity on each chain.",
      },
    ],
  },
];

export const getCampaign = (id: string): Campaign | undefined =>
  CAMPAIGNS.find((c) => c.id === id);

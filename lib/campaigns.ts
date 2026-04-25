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
everyday use — giving people the freedom of open money: faster, simpler, borderless. The team combines
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
];

export const getCampaign = (id: string): Campaign | undefined =>
  CAMPAIGNS.find((c) => c.id === id);

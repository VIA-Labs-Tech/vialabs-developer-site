import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// NOTE: the mobile drawer menu mirrors this tree by hand — if you change
// this file, also update src/theme/Navbar/MobileSidebar/PrimaryMenu/index.tsx.
const sidebars: SidebarsConfig = {
  docsSidebar: [
    "intro",
    {
      type: "category",
      label: "Learn",
      collapsed: true,
      items: [
        "general/technology-overview",
        "general/fees-and-gas",
        "general/faq",
        "general/troubleshooting",
        "general/testnet-tokens",
      ],
    },
    {
      type: "category",
      label: "Build",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "EVM",
          collapsed: false,
          items: [
            "examples/hello-world",
            "examples/burn-mint-token",
            "examples/lock-mint-token",
            "examples/lock-release-token",
            "examples/private-oracle",
          ],
        },
        {
          type: "category",
          label: "Cardano",
          collapsed: true,
          items: [
            "examples/cardano/overview",
            "examples/cardano/integration-paths",
            "examples/cardano/mint-burn-client",
          ],
        },
        {
          type: "category",
          label: "Midnight",
          collapsed: true,
          items: ["examples/midnight/overview", "examples/midnight/integration-paths"],
        },
        {
          type: "doc",
          id: "examples/stellar-coming-soon",
          label: "Stellar (Coming Soon)",
        },
        {
          type: "category",
          label: "Guides",
          collapsed: false,
          items: ["examples/guides/usdm-cardano-midnight"],
        },
      ],
    },
    {
      type: "category",
      label: "Reference",
      collapsed: false,
      items: [
        "general/contract-source",
        {
          type: "category",
          label: "Contracts",
          collapsed: true,
          items: [
            "general/ref-via-integration",
            "general/ref-mint-burn",
            "general/ref-locker-release",
            "general/ref-fee-collector",
            "general/ref-gas-refund",
          ],
        },
        "general/supported-networks",
        "general/error-reference",
        "general/audits",
      ],
    },
    "work-with-us/developers",
    "legal/disclaimers",
  ],
};

export default sidebars;

import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docsSidebar: [
    "intro",
    {
      type: "category",
      label: "Build",
      collapsed: false,
      items: [
        "examples/hello-world",
        "examples/burn-mint-token",
        "examples/lock-mint-token",
        "examples/lock-release-token",
        "examples/private-oracle",
        "examples/cardano-coming-soon",
        "examples/midnight-coming-soon",
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
      ],
    },
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
    "work-with-us/developers",
    "legal/disclaimers",
  ],
};

export default sidebars;

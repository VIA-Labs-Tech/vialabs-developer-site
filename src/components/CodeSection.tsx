import Link from '@docusaurus/Link';
import CodeBlock from '@theme/CodeBlock';
import { ArrowIcon } from './icons';
import Section from './Section';

const codeSnippet = `contract VIAHelloWorld is ViaIntegrationV1 {
    string public receivedMessage;

    function sendHello(uint64 destChainId) external payable {
        messageSend(destChainId, abi.encode("Hello World"), 1);
    }

    function messageProcess(
        uint256, uint64, bytes32, bytes32,
        bytes memory data, bytes memory, uint256
    ) internal override {
        receivedMessage = abi.decode(data, (string));
    }
}`;

export default function CodeSection() {
  return (
    <Section
      title="It's This Simple"
      subtitle="Inherit ViaIntegrationV1, send a message, handle it on the other side. That's it."
    >
      <div className="max-w-[700px] mx-auto rounded-[0.875rem] overflow-hidden border border-[rgba(100,116,139,0.25)] bg-[#12131b] [&_div[class^='codeBlockContainer']]:m-0 [&_div[class^='codeBlockContainer']]:rounded-none [&_div[class^='codeBlockContainer']]:border-none [&_div[class^='codeBlockContainer']]:shadow-none [&_div[class^='codeBlockContainer']]:bg-transparent [&_pre]:m-0 [&_pre]:rounded-none [&_pre]:text-[0.8rem] [&_pre]:leading-[1.7] [&_pre]:!bg-transparent [&_div[class^='buttonGroup']]:hidden">
        <div className="flex items-center gap-[0.4rem] py-3 px-4 bg-[rgba(100,116,139,0.06)] border-b border-[rgba(100,116,139,0.15)]">
          <span className="w-[10px] h-[10px] rounded-full bg-[#ff5f57]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#ffbd2e]" />
          <span className="w-[10px] h-[10px] rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[0.8rem] font-medium font-mono text-[#64748b]">VIAHelloWorld.sol</span>
        </div>
        <CodeBlock language="solidity" showLineNumbers>
          {codeSnippet}
        </CodeBlock>
      </div>
      <Link
        to="/docs/examples/hello-world"
        className="inline-flex items-center gap-[0.35rem] mt-5 text-[0.9rem] font-semibold text-[#00E5E5] no-underline transition-all duration-200 justify-center w-full max-w-[700px] mx-auto hover:gap-[0.6rem] hover:text-[#33EBEB] hover:no-underline"
      >
        View full tutorial <ArrowIcon />
      </Link>
    </Section>
  );
}

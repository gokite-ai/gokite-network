import { Code } from "bright";
import { StarIcon } from "lucide-react";
import type { Metadata } from "next";
import Demo from "~/components/demo";
import {
  Blockquote,
  H1,
  H2,
  InlineCode,
  Link,
  P,
  UnorderedList,
} from "~/components/typography";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export const metadata: Metadata = {
  title: "gokite-network - packages for gokite.ai network",
  description:
    "@gokite-network/* publish multiple packages for network login flow!",
  authors: [
    {
      name: "jerry-zhu",
      url: "https://www.npmjs.com/settings/jerry-zhu/packages",
    },
  ],
};

Code.theme = {
  dark: "github-dark",
  light: "github-light",
  lightSelector: "html.light",
  darkSelector: "html.dark",
};

const sectionClasses =
  "py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14 max-w-[75ch] mx-auto min-h-[40vh] flex flex-col justify-center";

export default function Home() {
  return (
    <main>
      <header className={sectionClasses}>
        <H1>GoKite Network</H1>
        <P>
          <InlineCode>@gokite-network/* </InlineCode>publish multiple packages
          for network login flow!
        </P>
        <P>
          This tool ensures that all packages in monorepo are using Particle
          Network
        </P>

        <div className="pt-10 flex row justify-evenly items-center">
          <Demo />
          <Button variant="outline" asChild>
            <a href="https://github.com/gokite-ai/gokite-network">
              <StarIcon className="mr-2 inline-flex" /> Star on GitHub
            </a>
          </Button>
        </div>
      </header>
      <section id="installation" className={sectionClasses}>
        <H2>Installation</H2>
        <P>
          Install <InlineCode>@gokite-network/auth</InlineCode> via your
          favorite package manager:
        </P>
        <div className="mt-6">
          <Tabs defaultValue="bun">
            <TabsList>
              <TabsTrigger value="bun">Bun</TabsTrigger>
              <TabsTrigger value="yarn">Yarn</TabsTrigger>
              <TabsTrigger value="pnpm">pnpm</TabsTrigger>
              <TabsTrigger value="npm">npm</TabsTrigger>
            </TabsList>
            <div className="my-10">
              <TabsContent value="bun">
                <Code lang="shell">bun install @gokite-network/auth</Code>
              </TabsContent>
              <TabsContent value="yarn">
                <Code lang="shell">yarn add @gokite-network/auth</Code>
              </TabsContent>
              <TabsContent value="pnpm">
                <Code lang="shell">pnpm install @gokite-network/auth</Code>
              </TabsContent>
              <TabsContent value="npm">
                <Code lang="shell">npm install @gokite-network/auth</Code>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </section>
      <section className={sectionClasses}>
        <H2 className="mt-4">Usage:</H2>
        <P>
          Once you&apos;ve installed{" "}
          <InlineCode>@gokite-network/auth</InlineCode>, you can add a{" "}
          <InlineCode>@gokite-network/auth:check</InlineCode> script in your
          root <InlineCode>package.json</InlineCode>:
        </P>
        <Code lang="json">
          {`{
  "scripts": {
    "@gokite-network/auth:check": "@gokite-network/auth check"
  }
}`}
        </Code>
        <P>
          You can now run{" "}
          <InlineCode>bun run @gokite-network/auth:check</InlineCode> (or use
          whatever package manager you have setup) to check for version
          conformance!
        </P>
      </section>
      <section className={sectionClasses}>
        <H2>Configuration:</H2>
        <P>
          use <InlineCode>@gokite-network/auth</InlineCode> to define a
          configuration file that connects to Particle
        </P>
        <P>
          You can configure <InlineCode>@gokite-network/auth</InlineCode> via
          either a <InlineCode>auth.config.ts</InlineCode> file. An example
          configuration is provided below:
        </P>

        <Code lang="typescript">
          {`
          import GokiteNetwork from "@gokite-network/auth";
          import { baseSepolia } from "@particle-network/connectkit/chains";

          export const envConfig = {
            projectId, // Particle Dashboard projectId
            clientKey, // Particle Dashboard clientKey
            appId, // Particle Dashboard appId
          };
          
          export const chainsMap = {
            // Choice a chain network to connect wellect
            [baseSepolia.id]: baseSepolia, // use rpc if you need https://revoke.cash/en/learn/wallets/add-network/base-sepolia
          };
          
          export const providerConfig = {
            ...envConfig,
            chainName: baseSepolia.name.split(" ")[0],
            chainId: baseSepolia.id,
            preload: false,
            wallet: {
              displayWalletEntry: true,
          
              defaultWalletEntryPosition: EntryPosition.BR,
              customStyle: {
                fiatCoin: "USD",
              },
            } as any,
          };
          
          // use specified erc4337 to create smartaccount
          export const erc4337 = {
            name: "BICONOMY",
            version: "2.0.0",
          };
          
          // intialize GoKite Network Instance
          export const gokiteNetwork = new GokiteNetwork(
            providerConfig,
            erc4337,
            '{BACKEND_API}/v2/signin'
          );`}
        </Code>

        <P>
          In addition, you need to create{" "}
          <InlineCode>@particle-network/connectkit</InlineCode> configuration as
          well. An example configuration is provided below:
        </P>

        <Code lang="typescript">
          {`
          import { createConfig } from "@particle-network/connectkit";
          import { aa } from "@particle-network/connectkit/aa";
          import { authWalletConnectors } from "@particle-network/connectkit/auth";
          import {
            coinbaseWallet,
            evmWalletConnectors,
            injected,
            passkeySmartWallet,
            walletConnect,
          } from "@particle-network/connectkit/evm";
          import { wallet, EntryPosition } from "@particle-network/connectkit/wallet";

          export const authConfig = createConfig({
            ...envConfig,
          
            appearance: {
              // Login Popup config
              ...
            },
            walletConnectors: [
              evmWalletConnectors({
                metadata: { name: "Gokite" },
                connectorFns: [
                  injected({ target: "metaMask" }),
                  injected({ target: "okxWallet" }),
                  injected({ target: "phantom" }),
                  injected({ target: "trustWallet" }),
                  injected({ target: "bitKeep" }),
                  walletConnect({
                    showQrModal: false,
                  }),
                  coinbaseWallet(),
                  passkeySmartWallet(),
                ],
                multiInjectedProviderDiscovery: true,
              }),
              authWalletConnectors({
                // Optional, configure this if you're using social logins
                authTypes: [
                  "email",
                  "phone",
                  "google",
                  "apple",
                  "twitter",
                  "github",
                  "facebook",
                  "microsoft",
                  "linkedin",
                  "github",
                  "discord",
                ], // Optional, restricts the types of social logins supported
                fiatCoin: "USD", // Optional, also supports CNY, JPY, HKD, INR, and KRW
                promptSettingConfig: {
                  // Optional, changes the frequency in which the user is asked to set a master or payment password
                  promptMasterPasswordSettingWhenLogin: 1,
                  promptPaymentPasswordSettingWhenSign: 1,
                },
              }),
            ],
            plugins: [
              wallet({
                // Optional configurations for the attached embedded wallet modal
                entryPosition: EntryPosition.BR, // Alters the position in which the modal button appears upon login
                visible: true, // Dictates whether or not the wallet modal is included/visible or not
                customStyle: {
                  fiatCoin: "USD",
                },
              }),
              aa(erc4337),
            ],
            chains: Object.values(chainsMap) as any,
          });
          `}
        </Code>
      </section>

      <footer className={sectionClasses}>
        <P>
          The source code for the library is available on{" "}
          <Link href="https://github.com/gokite-ai/gokite-network">GitHub</Link>
          . If you run into any bugs, please report them via{" "}
          <Link href="https://github.com/gokite-ai/gokite-network/issues/new">
            issues
          </Link>
          .
        </P>
        <P>
          If you&apos;d like to discuss changes to the project, feel free to
          start a{" "}
          <Link href="https://github.com/gokite-ai/gokite-network/discussions/new/choose">
            discussion
          </Link>
          !
        </P>
      </footer>
    </main>
  );
}

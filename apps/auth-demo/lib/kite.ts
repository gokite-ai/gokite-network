import { ParticleChains } from "@particle-network/chains";
import { defineChain } from "@particle-network/connectkit/chains";

export const kiteTestnet = defineChain({
  id: 2368,
  name: "KiteAITest",
  chainType: "evm",
  // icon
  // nativeIcon
  network: "Testnet",
  nativeCurrency: {
    name: "KiteAI",
    symbol: "KITE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc-testnet.gokite.ai"],
    },
  },
  blockExplorers: {
    default: {
      name: "KiteAI Explorer",
      url: "https://testnet.kitescan.ai",
    },
  },
});

const testnetKey = `${kiteTestnet.name.toLowerCase()}-${kiteTestnet.id}`;
Object.defineProperty(ParticleChains, testnetKey, {
  get() {
    return kiteTestnet;
  },
  enumerable: true,
  configurable: false,
});
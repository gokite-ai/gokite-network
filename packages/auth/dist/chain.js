import { ParticleChains } from "@particle-network/chains";
import { defineChain } from "@particle-network/connectkit/chains";
export const gokiteTestnet = defineChain({
	id: 2368,
	name: "Gokite Testnet",
	nativeCurrency: {
		name: "Gokite Testnet",
		symbol: "GOKITE",
		decimals: 18
	},
	rpcUrls: { default: { http: ["https://rpc-testnet.gokite.ai"] } },
	blockExplorers: { default: {
		name: "Gokite Testnet Explorer",
		url: "https://testnet.kitescan.ai"
	} },
	testnet: true
});
const testnetKey = `${gokiteTestnet.name.split(" ")[0].toLowerCase()}-${gokiteTestnet.id}`;
Object.defineProperty(ParticleChains, testnetKey, {
	get() {
		return gokiteTestnet;
	},
	enumerable: true,
	configurable: false
});

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

import { keccak256, parseAbi, http, createPublicClient } from "viem";
export class SmartAccount {
	smartAccountFactoryAbi = parseAbi(["function getAddress(address owner, uint256 salt) public view returns (address)", "function createAccount(address owner, uint256 salt) public payable returns (address account)"]);
	entryPointAbi = parseAbi(["function getNonce(address sender, uint192 key) external view returns (uint256 nonce)"]);
	salt;
	publicClient;
	constructor(auth, chain, config) {
		this.auth = auth;
		this.chain = chain;
		this.config = config;
		this.publicClient = createPublicClient({
			chain: this.chain,
			transport: http()
		});
		this.salt = keccak256(new TextEncoder().encode(this.config.secretKey));
	}
	getChainId() {
		return this.chain.id;
	}
	getWallet() {
		return this.auth.getWallet();
	}
	async getAddress() {
		const owner = this.getWallet()?.public_address;
		if (!owner) {
			throw new Error("SmartAccount Error: EOA address is empty");
		}
		return await this.publicClient.readContract({
			address: this.config.smartAccountFactoryAddress,
			abi: this.smartAccountFactoryAbi,
			functionName: "getAddress",
			args: [owner, this.salt]
		});
	}
	async getNonce(key = 0n) {
		const sender = this.getWallet()?.public_address;
		if (!sender) {
			throw new Error("SmartAccount Error: EOA address is empty");
		}
		return await this.publicClient.readContract({
			address: this.config.entryPointAddress,
			abi: this.entryPointAbi,
			functionName: "getNonce",
			args: [sender, key]
		});
	}
}

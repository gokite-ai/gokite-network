import type { Auth, Wallet } from "@particle-network/auth";
import type { Chain } from "viem";
export declare class SmartAccount {
	private auth;
	private chain;
	config: {
		entryPointAddress: `0x${string}`;
		smartAccountFactoryAddress: `0x${string}`;
		secretKey: string;
	};
	private smartAccountFactoryAbi;
	private entryPointAbi;
	salt: string;
	private publicClient;
	constructor(auth: Auth, chain: Chain, config: {
		entryPointAddress: `0x${string}`;
		smartAccountFactoryAddress: `0x${string}`;
		secretKey: string;
	});
	getChainId(): number;
	getWallet(): Wallet | null;
	getAddress(): Promise<string>;
	getNonce(key?: bigint): Promise<bigint>;
}

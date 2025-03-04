import type { Config, LoginOptions, UserInfo } from "@particle-network/auth";
import { SmartAccount } from "@particle-network/aa";
import type { FeeQuotesResponse } from "@particle-network/aa";
export type { UserInfo } from "@particle-network/auth";
export default class GokiteNetwork {
	private config;
	private erc4337;
	private smartAccount?;
	private etherProvider?;
	private signer;
	private auth;
	constructor(config: Config, erc4337?: {
		name: string;
		version: string;
	});
	ensureSmartAccount(smartAccount?: SmartAccount): void;
	set user(userInfo: UserInfo | null);
	get user(): UserInfo | null;
	login(options?: LoginOptions): Promise<UserInfo | null>;
	logout(): Promise<void>;
	getBalance(): Promise<bigint>;
	createSession(options?: {
		validUntil: number;
		validAfter: number;
	}): Promise<FeeQuotesResponse>;
	sendUserOp(smartAddress: string, sessionData: FeeQuotesResponse): Promise<string>;
}

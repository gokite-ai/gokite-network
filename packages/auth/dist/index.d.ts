import type { Config, LoginOptions, UserInfo } from "@particle-network/auth";
import { SmartAccount } from "@particle-network/aa";
import type { FeeQuotesResponse } from "@particle-network/aa";
export type { UserInfo } from "@particle-network/auth";
export default class GokiteNetwork {
	private config;
	private erc4337;
	private signInRpc?;
	private smartAccount?;
	private etherProvider?;
	private auth;
	private deferred;
	constructor(config: Config, erc4337?: {
		name: string;
		version: string;
	}, signInRpc?: string);
	ensureSmartAccount(smartAccount?: SmartAccount): void;
	ready(fn: (accessToken: string) => void): void;
	signin(payload: {
		eoa: string;
		aa_address?: string;
		session_data?: {
			privateKey: string;
			sessionKey: FeeQuotesResponse;
		};
	}): Promise<void>;
	set user(userInfo: UserInfo | null);
	get user(): UserInfo | null;
	login(options?: LoginOptions): Promise<UserInfo | null>;
	logout(): Promise<void>;
	getBalance(): Promise<bigint>;
	createSession(options?: {
		validUntil: number;
		validAfter: number;
	}): Promise<{
		sessionKey: FeeQuotesResponse;
		privateKey: string;
	} | undefined>;
}

import type { Config, LoginOptions, UserInfo } from "@particle-network/auth";
import { SmartAccount } from "@particle-network/aa";
import type { FeeQuotesResponse } from "@particle-network/aa";
import { Deferred } from "./deferred";
export type { UserInfo } from "@particle-network/auth";
interface IdentifyState {
	access_token: string;
	session_data: {
		privateKey: string;
		sessionKey: FeeQuotesResponse;
	};
	[K: string]: any;
}
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
	isReady(): boolean;
	ready(fn: (data: {
		access_token: string;
		session_data: {
			privateKey: string;
			sessionKey: FeeQuotesResponse;
		};
	}) => void): void;
	signin(payload: {
		eoa: string;
		aa_address?: string;
		session_data?: {
			privateKey: string;
			sessionKey: FeeQuotesResponse;
		};
	}): Promise<void>;
	updateIdentify(data: IdentifyState, deferred?: Deferred<IdentifyState>): void;
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
	sendUserOp(smartAddress: string, value: string): Promise<string | undefined>;
}

import type { Auth, LoginOptions, UserInfo } from "@particle-network/auth";
import { Deferred } from "./deferred";
import { SmartAccount } from "./SmartAccount";
export type { UserInfo } from "@particle-network/auth";
interface IdentifyState {
	access_token: string;
	[K: string]: any;
}
export declare class GokiteNetwork {
	private smartAccount;
	private auth;
	private signInRpc?;
	private deferred;
	constructor(smartAccount: SmartAccount, auth: Auth, signInRpc?: string);
	getStorageKey(): string;
	isReady(): boolean;
	ready(fn: (data: { access_token: string }) => void): void;
	signin(payload: {
		eoa: string;
		aa_address?: string;
	}): Promise<IdentifyState | undefined>;
	updateIdentify(data: IdentifyState, deferred?: Deferred<IdentifyState>): void;
	set user(userInfo: UserInfo | null);
	get user(): UserInfo | null;
	login(options?: LoginOptions): Promise<UserInfo | null>;
	logout(): Promise<void>;
}

import { Deferred } from "./deferred";
import { encrypt } from "./aes";
export class GokiteNetwork {
	deferred;
	constructor(smartAccount, auth, signInRpc) {
		this.smartAccount = smartAccount;
		this.auth = auth;
		this.signInRpc = signInRpc;
		this.deferred = new Deferred();
	}
	getStorageKey() {
		return `pn_auth_user_session_${this.auth.config.appId}`;
	}
	isReady() {
		return this.deferred.fullfilled;
	}
	ready(fn) {
		this.deferred.promise.then(fn);
	}
	async signin(payload) {
		if (this.deferred.fullfilled) {
			return this.deferred.promise;
		}
		try {
			if (this.signInRpc) {
				const eoa = this.user?.wallets[0].public_address;
				return fetch(this.signInRpc, {
					method: "POST",
					mode: "cors",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
						Authorization: await encrypt(payload.eoa, "6a1c35292b7c5b769ff47d89a17e7bc4f0adfe1b462981d28e0e9f7ff20b8f8a")
					},
					body: JSON.stringify(payload)
				}).then(async (res) => {
					if (res.ok) {
						return res.json();
					} else if (res.status === 422) {
						const address = await this.smartAccount.getAddress();
						return await this.signin({
							eoa,
							aa_address: address
						});
					}
				}).then((ret) => {
					this.updateIdentify(ret.data, this.deferred);
					return ret.data;
				});
			} else {
				const data = JSON.parse(localStorage.getItem(this.getStorageKey()) || "null");
				if (data) {
					this.deferred.resolve(data);
				}
				return data;
			}
		} catch (e) {
			console.error(e);
		}
	}
	updateIdentify(data, deferred) {
		try {
			localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
		} catch (e) {
			console.error(e);
		}
		this.deferred = deferred || new Deferred();
		this.deferred.resolve(data);
	}
	set user(userInfo) {
		try {
			localStorage.setItem(`pn_auth_user_info_${this.auth.config.appId}`, JSON.stringify(userInfo));
		} catch (e) {}
	}
	get user() {
		return this.auth.getUserInfo();
	}
	async login(options = {}) {
		if (!this.auth.isLogin()) {
			return this.auth.getUserInfo();
		}
		return await this.auth.login(options);
	}
	async logout() {
		await this.auth.logout();
	}
}

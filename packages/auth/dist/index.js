"use client";
import { ParticleNetwork } from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";
import { SmartAccount, AAWrapProvider, SendTransactionMode } from "@particle-network/aa";
import { ethers, Wallet, Interface, getBytes } from "ethers";
import { Deferred } from "./deferred";
import { encrypt } from "./aes";
export default class GokiteNetwork {
	smartAccount;
	etherProvider;
	auth;
	deferred;
	constructor(config, erc4337 = {
		name: "BICONOMY",
		version: "2.0.0"
	}, signInRpc) {
		this.config = config;
		this.erc4337 = erc4337;
		this.signInRpc = signInRpc;
		const particle = new ParticleNetwork(config);
		particle.setERC4337(this.erc4337);
		this.auth = particle.auth;
		this.deferred = new Deferred();
	}
	ensureSmartAccount(smartAccount) {
		if (!this.smartAccount) {
			this.smartAccount = smartAccount || new SmartAccount(new ParticleProvider(this.auth), {
				...this.config,
				aaOptions: { accountContracts: { [this.erc4337.name]: [{
					chainIds: [this.config.chainId],
					version: this.erc4337.version
				}] } }
			});
		}
		if (!this.etherProvider) {
			this.etherProvider = new ethers.BrowserProvider(new AAWrapProvider(this.smartAccount, SendTransactionMode.Gasless), "any");
		}
		if (!this.deferred.fullfilled) {
			try {
				if (this.signInRpc) {
					const eoa = this.user?.wallets[0].public_address;
					this.signin({ eoa });
				} else {
					const data = JSON.parse(localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) || "null");
					if (data) {
						this.deferred.resolve(data);
					}
				}
			} catch (err) {
				console.error(err);
			}
		}
	}
	ready(fn) {
		this.deferred.promise.then(fn);
	}
	async signin(payload) {
		fetch(this.signInRpc, {
			method: "POST",
			mode: "cors",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
				Authorization: await encrypt(payload.eoa, "6a1c35292b7c5b769ff47d89a17e7bc4f0adfe1b462981d28e0e9f7ff20b8f8a")
			},
			body: JSON.stringify(payload)
		}).then((res) => {
			if (res.ok) {
				return res.json();
			} else if (res.status === 422) {
				this.createSession();
			}
		}).then((ret) => {
			this.updateIdentify(ret.data);
		});
	}
	updateIdentify(data) {
		try {
			localStorage.setItem(`pn_auth_user_session_${this.config.appId}`, JSON.stringify(data));
		} catch (e) {
			console.error(e);
		}
		this.deferred = new Deferred();
		this.deferred.resolve(data);
	}
	set user(userInfo) {
		try {
			localStorage.setItem(`pn_auth_user_info_${this.config.appId}`, JSON.stringify(userInfo));
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
	async getBalance() {
		if (!this.auth.isLogin()) {
			await this.login({});
		}
		this.ensureSmartAccount();
		const address = await this.smartAccount.getAddress();
		const balance = await this.etherProvider.getBalance(address);
		return balance;
	}
	async createSession(options = {
		validUntil: 0,
		validAfter: 0
	}) {
		try {
			if (this.signInRpc) {
				if (this.deferred.fullfilled) {
					return this.deferred.promise.then((data) => data.session_data);
				}
			} else {
				const data = JSON.parse(localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) || "null");
				if (data) {
					return data;
				}
			}
			const address = await this.smartAccount.getAddress();
			const sessionKey = await this.smartAccount.createSessions([{
				...options,
				sessionValidationModule: "0x8E09744b738e9Fec4A4df7Ab5621f1857F6Fa175",
				sessionKeyDataInAbi: [["address", "uint256"], [address, 1]]
			}]);
			const signer = Wallet.createRandom();
			const data = {
				privateKey: signer.privateKey,
				sessionKey
			};
			const eoa = this.user?.wallets[0].public_address;
			if (this.signInRpc) {
				await this.signin({
					eoa,
					aa_address: address,
					session_data: data
				});
			} else {
				localStorage.setItem(`pn_auth_user_session_${this.config.appId}`, JSON.stringify({ session_data: data }));
			}
			return data;
		} catch (err) {
			console.error(err);
		}
	}
	async sendUserOp(smartAddress, value) {
		let data;
		if (this.signInRpc) {
			if (this.deferred.fullfilled) {
				data = await this.deferred.promise;
			}
		} else {
			data = JSON.parse(localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) || "null");
		}
		if (data) {
			const address = await this.smartAccount.getAddress();
			const mintInterface = new Interface(["function mintTo(address, uint256, uint256) public"]);
			const encodedData = mintInterface.encodeFunctionData("mintTo", [
				address,
				1,
				1
			]);
			const tx = {
				to: smartAddress,
				value,
				data: encodedData
			};
			const userOp = await this.smartAccount.buildUserOperation({ tx });
			const walletNew = new Wallet(data.session_data.privateKey);
			const signature = await walletNew.signMessage(getBytes(userOp.userOpHash));
			const sessions = data.session_data.sessionKey.sessions;
			const hash = await this.smartAccount.sendSignedUserOperation({
				...userOp.userOp,
				signature
			}, {
				targetSession: sessions[0],
				sessions
			});
			return hash;
		}
		return undefined;
	}
}

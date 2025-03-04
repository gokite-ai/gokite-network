import { ParticleNetwork } from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";
import { SmartAccount, AAWrapProvider, SendTransactionMode } from "@particle-network/aa";
import { ethers, Wallet, Interface, getBytes } from "ethers";
export default class GokiteNetwork {
	smartAccount;
	etherProvider;
	signer;
	auth;
	constructor(config, erc4337 = {
		name: "BICONOMY",
		version: "2.0.0"
	}) {
		this.config = config;
		this.erc4337 = erc4337;
		const particle = new ParticleNetwork(config);
		particle.setERC4337(this.erc4337);
		this.auth = particle.auth;
		this.signer = Wallet.createRandom();
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
	}
	set user(userInfo) {
		if (!this.auth.isLogin()) {
			try {
				localStorage.setItem(`pn_auth_user_info_${this.config.appId}`, JSON.stringify(userInfo));
			} catch (e) {}
		}
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
		let data;
		try {
			data = JSON.parse(localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) || "");
			if (data) {
				return data.sessionKey;
			}
			this.ensureSmartAccount();
			const address = await this.smartAccount.getAddress();
			const sessionKData = await this.smartAccount.createSessions([{
				...options,
				sessionValidationModule: "0x8E09744b738e9Fec4A4df7Ab5621f1857F6Fa175",
				sessionKeyDataInAbi: [["address", "uint256"], [address, 1]]
			}]);
			await this.smartAccount.sendTransaction({ tx: sessionKData.transactions });
			data = {
				privateKey: this.signer.privateKey,
				sessionKey: sessionKData
			};
			localStorage.setItem(`pn_auth_user_session_${this.config.appId}`, JSON.stringify(data));
			return sessionKData;
		} catch (err) {
			console.error(err);
			return null;
		}
	}
	async sendUserOp(smartAddress, sessionData) {
		this.ensureSmartAccount();
		const walletNew = new Wallet(this.signer.privateKey);
		const address = await this.smartAccount.getAddress();
		const mintInterface = new Interface(["function mintTo(address, uint256, uint256) public"]);
		const encodedData = mintInterface.encodeFunctionData("mintTo", [
			address,
			1,
			1
		]);
		const tx = {
			to: smartAddress,
			value: "0x0",
			data: encodedData
		};
		const userOp = await this.smartAccount.buildUserOperation({ tx });
		const signature = await walletNew.signMessage(getBytes(userOp.userOpHash));
		const sessions = sessionData.sessions;
		const hash = await this.smartAccount.sendSignedUserOperation({
			...userOp.userOp,
			signature
		}, {
			targetSession: sessions[0],
			sessions
		});
		return hash;
	}
}

import { ParticleNetwork } from "@particle-network/auth";
import type {
  Auth,
  Config,
  LoginOptions,
  UserInfo,
} from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";
import {
  SmartAccount,
  AAWrapProvider,
  SendTransactionMode,
} from "@particle-network/aa";
import type { FeeQuotesResponse } from "@particle-network/aa";
import { ethers, Wallet, Interface, getBytes } from "ethers";
export type { UserInfo } from "@particle-network/auth";

export default class GokiteNetwork {
  private smartAccount?: SmartAccount;
  private etherProvider?: ethers.BrowserProvider;
  private signer: ethers.HDNodeWallet;
  private auth: Auth;

  constructor(
    private config: Config,
    private erc4337 = {
      name: "BICONOMY",
      version: "2.0.0",
    }
  ) {
    const particle = new ParticleNetwork(config as Config);
    particle.setERC4337(this.erc4337);
    this.auth = particle.auth;

    this.signer = Wallet.createRandom();
  }

  public ensureSmartAccount(smartAccount?: SmartAccount): void {
    if (!this.smartAccount) {
      this.smartAccount =
        smartAccount ||
        new SmartAccount(new ParticleProvider(this.auth), {
          ...this.config,
          aaOptions: {
            accountContracts: {
              [this.erc4337.name]: [
                {
                  chainIds: [this.config.chainId!],
                  version: this.erc4337.version,
                },
              ],
            },
          },
        });
    }
    if (!this.etherProvider) {
      this.etherProvider = new ethers.BrowserProvider(
        new AAWrapProvider(
          this.smartAccount,
          SendTransactionMode.Gasless
        ) as any,
        "any"
      );
    }
  }

  public set user(userInfo: UserInfo) {
    if (!this.auth.isLogin()) {
      try {
        localStorage.setItem(
          `pn_auth_user_info_${this.config.appId}`,
          JSON.stringify(userInfo)
        );
      } catch (e) {}
    }
  }

  public get user(): UserInfo | null {
    return this.auth.getUserInfo();
  }

  public async login(options: LoginOptions = {}): Promise<UserInfo | null> {
    if (!this.auth.isLogin()) {
      return this.auth.getUserInfo();
    }

    return await this.auth.login(options);
  }

  public async logout(): Promise<void> {
    await this.auth.logout();
  }

  public async getBalance(): Promise<bigint> {
    if (!this.auth.isLogin()) {
      await this.login({});
    }

    this.ensureSmartAccount();
    const address = await this.smartAccount!.getAddress();
    const balance = await this.etherProvider!.getBalance(address);
    return balance;
  }

  public async createSession(
    options = {
      validUntil: 0,
      validAfter: 0,
    }
  ): Promise<FeeQuotesResponse | null> {
    let data: any;
    try {
      data = JSON.parse(
        localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) || ""
      );
      if (data) {
        return data.sessionKey as FeeQuotesResponse
      }
      this.ensureSmartAccount();
      const address = await this.smartAccount!.getAddress();
      const sessionKData = await this.smartAccount!.createSessions([
        {
          ...options,
          sessionValidationModule: "0x8E09744b738e9Fec4A4df7Ab5621f1857F6Fa175",
          // function transfer(address to, uint256 value) external returns (bool)
          sessionKeyDataInAbi: [
            ["address", "uint256"],
            [address, 1],
          ],
        },
      ]);

      await this.smartAccount!.sendTransaction({
        tx: sessionKData.transactions as any,
      });

      data = {
        privateKey: this.signer.privateKey,
        sessionKey: sessionKData,
      };
      localStorage.setItem(
        `pn_auth_user_session_${this.config.appId}`,
        JSON.stringify(data)
      );

      return sessionKData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async sendUserOp(
    smartAddress: string,
    sessionData: FeeQuotesResponse
  ): Promise<string> {
    this.ensureSmartAccount();
    const walletNew = new Wallet(this.signer.privateKey);
    const address = await this.smartAccount!.getAddress();

    const mintInterface = new Interface([
      "function mintTo(address, uint256, uint256) public",
    ]);
    const encodedData = mintInterface.encodeFunctionData("mintTo", [
      address,
      1,
      1,
    ]);

    const tx = {
      to: smartAddress,
      value: "0x0",
      data: encodedData,
    };

    const userOp = await this.smartAccount!.buildUserOperation({ tx });

    const signature = await walletNew.signMessage(getBytes(userOp.userOpHash));

    const sessions = sessionData.sessions!;
    const hash = await this.smartAccount!.sendSignedUserOperation(
      { ...userOp.userOp, signature },
      {
        targetSession: sessions[0],
        sessions: sessions,
      }
    );

    return hash;
  }
}

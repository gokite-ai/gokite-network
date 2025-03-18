"use client";

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
import { Deferred } from "./deferred";
import { encrypt } from "./aes";
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
  private smartAccount?: SmartAccount;
  private etherProvider?: ethers.BrowserProvider;
  private auth: Auth;
  private deferred: Deferred<IdentifyState>;

  constructor(
    private config: Config,
    private erc4337 = {
      name: "BICONOMY",
      version: "2.0.0",
    },
    private signInRpc?: string
  ) {
    const particle = new ParticleNetwork(config as Config);
    particle.setERC4337(this.erc4337);
    this.auth = particle.auth;
    this.deferred = new Deferred();
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
    if (!this.deferred.fullfilled) {
      try {
        if (this.signInRpc) {
          const eoa = this.user?.wallets[0].public_address;
          this.signin({ eoa: eoa! });
        } else {
          const data = JSON.parse(
            localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) ||
              "null"
          );

          if (data) {
            this.deferred.resolve(data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  public ready(
    fn: (data: {
      access_token: string;
      session_data: {
        privateKey: string;
        sessionKey: FeeQuotesResponse;
      };
    }) => void
  ): void {
    this.deferred.promise.then(fn);
  }

  public async signin(payload: {
    eoa: string;
    aa_address?: string;
    session_data?: {
      privateKey: string;
      sessionKey: FeeQuotesResponse;
    };
  }): Promise<void> {
    fetch(this.signInRpc!, {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: await encrypt(
          payload.eoa,
          "6a1c35292b7c5b769ff47d89a17e7bc4f0adfe1b462981d28e0e9f7ff20b8f8a"
        ),
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else if (res.status === 422) {
          this.createSession();
        }
      })
      .then((ret: any) => {
        this.updateIdentify(ret.data);
      });
  }

  public updateIdentify(data: IdentifyState): void {
    try {
      localStorage.setItem(
        `pn_auth_user_session_${this.config.appId}`,
        JSON.stringify(data)
      );
    } catch (e) {
      console.error(e);
    }
    this.deferred = new Deferred();
    this.deferred.resolve(data);
  }

  public set user(userInfo: UserInfo) {
    try {
      localStorage.setItem(
        `pn_auth_user_info_${this.config.appId}`,
        JSON.stringify(userInfo)
      );
    } catch (e) {}
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
  ): Promise<
    { sessionKey: FeeQuotesResponse; privateKey: string } | undefined
  > {
    try {
      if (this.signInRpc) {
        if (this.deferred.fullfilled) {
          return this.deferred.promise.then((data) => data.session_data);
        }
      } else {
        const data = JSON.parse(
          localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) ||
            "null"
        );
        if (data) {
          return data;
        }
      }

      const address = await this.smartAccount!.getAddress();
      const sessionKey = await this.smartAccount!.createSessions([
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

      // await this.smartAccount!.sendTransaction({
      //   tx: sessionKey.transactions as any,
      // });

      const signer = Wallet.createRandom();

      const data = {
        privateKey: signer.privateKey,
        sessionKey: sessionKey,
      };
      const eoa = this.user?.wallets[0].public_address;
      if (this.signInRpc) {
        await this.signin({
          eoa: eoa!,
          aa_address: address,
          session_data: data,
        });
      } else {
        localStorage.setItem(
          `pn_auth_user_session_${this.config.appId}`,
          JSON.stringify({
            session_data: data,
          })
        );
      }

      return data;
    } catch (err) {
      console.error(err);
    }
  }

  public async sendUserOp(
    smartAddress: string,
    value: string
  ): Promise<string | undefined> {
    let data!: IdentifyState;

    if (this.signInRpc) {
      if (this.deferred.fullfilled) {
        data = await this.deferred.promise;
      }
    } else {
      data = JSON.parse(
        localStorage.getItem(`pn_auth_user_session_${this.config.appId}`) ||
          "null"
      );
    }
    // await this.smartAccount!.sendTransaction({
    //   tx: sessionKey.transactions as any,
    // });

    if (data) {
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
        value,
        data: encodedData,
      };

      const userOp = await this.smartAccount!.buildUserOperation({ tx });
      const walletNew = new Wallet(data.session_data.privateKey);
      const signature = await walletNew.signMessage(
        getBytes(userOp.userOpHash)
      );

      const sessions = data.session_data.sessionKey.sessions!;
      const hash = await this.smartAccount!.sendSignedUserOperation(
        { ...userOp.userOp, signature },
        {
          targetSession: sessions[0],
          sessions: sessions,
        }
      );

      return hash;
    }
    return undefined;
  }
}

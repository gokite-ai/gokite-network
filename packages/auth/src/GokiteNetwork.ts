import type { Auth, LoginOptions, UserInfo } from "@particle-network/auth";
import { Deferred } from "./deferred";
import { encrypt } from "./aes";
import { SmartAccount } from "./SmartAccount";
export type { UserInfo } from "@particle-network/auth";

interface IdentifyState {
  access_token: string;
  oea?: string;
  aa_address?: string;
  displayed_name?: string;
  avatar_url?: string;
  [K: string]: any;
}
export class GokiteNetwork {
  private deferred: Deferred<IdentifyState>;

  constructor(
    public smartAccount: SmartAccount,
    public auth: Auth,
    private signInRpc?: string
  ) {
    this.deferred = new Deferred();
  }

  public getStorageKey() {
    return `pn_auth_user_session_${this.auth.config.appId}`;
  }

  public isReady(): boolean {
    return this.deferred.fullfilled;
  }

  public ready(fn: (data: { access_token: string }) => void): void {
    this.deferred.promise.then(fn);
  }

  public async signin(payload: {
    eoa: string;
    aa_address?: string;
    user_name?: string;
    avatar_url?: string;
  }): Promise<IdentifyState | undefined> {
    if (this.deferred.fullfilled) {
      return this.deferred.promise;
    }

    try {
      const eoa = this.user?.wallets[0].public_address;
      const address = await this.smartAccount!.getAddress();
      if (this.signInRpc) {
        return fetch(this.signInRpc!, {
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
          .then(async (res) => {
            if (res.ok) {
              return res.json();
            } else if (res.status === 422) {
              return this.signin({
                eoa: eoa!,
                aa_address: address,
              });
            }
          })
          .then((ret: any) => {
            if (ret.aa_address && ret.aa_address !== address) {
              return this.signin({
                eoa: eoa!,
                aa_address: address,
              });
            } else {
              payload.aa_address = address
              const odata = Object.assign(payload, ret.data ?? {})
              this.updateIdentify(odata, this.deferred);
              return odata;
            }
          });
      } else {
        const data = JSON.parse(
          localStorage.getItem(this.getStorageKey()) || "null"
        );
        const odata = {
          eoa: eoa!,
          aa_address: address,
          ...data,
        }
        if (data?.aa_address) {
          this.deferred.resolve(odata);
        } else {
          this.updateIdentify(
            odata,
            this.deferred
          );
        }
        return odata;
      }
    } catch (e) {
      console.error(e);
    }
  }

  public updateIdentify(
    data: IdentifyState,
    deferred?: Deferred<IdentifyState>
  ): void {
    try {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(data));
    } catch (e) {
      console.error(e);
    }
    this.deferred = deferred || new Deferred();
    this.deferred.resolve(data);
  }

  public set user(userInfo: UserInfo) {
    try {
      localStorage.setItem(
        `pn_auth_user_info_${this.auth.config.appId}`,
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
}

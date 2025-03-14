"use client";

import {
  ConnectKitProvider,
  useAccount,
  useSmartAccount,
  useParticleAuth,
  useWallets,
} from "@particle-network/connectkit";
import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";

import { authConfig, chainsMap, gokiteNetwork } from "./auth.config";

export interface AuthContext {
  increase: number;
  dispatch: (nextState: Partial<AuthContext>) => void;
  account?: string;
  userId?: string;
  points: number;
}

const authContext = createContext({} as AuthContext);

export function useAuthContext() {
  const context = useContext(authContext);

  return context;
}

export function AuthWrapper({
  children,
  userId,
}: {
  children: ReactNode;
  userId?: string;
}) {
  const { address, isConnecting, isConnected } = useAccount();
  const auth = useParticleAuth();
  const wallets = useWallets();

  const smartAccount = useSmartAccount();
  useEffect(() => {
    if (!isConnecting) {
      if (address && wallets.length && smartAccount) {
        let userInfo: any;
        try {
          userInfo = auth.getUserInfo();
        } catch (err) {
          console.error(err);
          userInfo = {
            uuid: address,
            token: address,
            wallets: wallets.map((wallet) => ({
              uuid: address,
              chain_name: chainsMap[wallet.chainId]!.name,
              public_address: wallet.accounts[0],
            })),
          };
        }
        gokiteNetwork.user = userInfo;
        gokiteNetwork.ensureSmartAccount(smartAccount);

        const promise = headerPromise;
        headerPromise = new Promise((resolve) => {
          gokiteNetwork.ready((accessToken) => {
            promise.then((auth) => {
              auth.accessToken = accessToken;
              resolve(auth);
            });
          });
        });
      }
    }
  }, [address, isConnected, wallets, userId, isConnecting]);

  return children;
}

export default function AuthProvider({
  children,
  ...rest
}: Partial<AuthContext> & { children: ReactNode }) {
  const [state, setState] = useState({ ...rest, increase: 0 } as AuthContext);
  const dispatch = (newState: Partial<AuthContext>) => {
    setState({ ...state, ...newState });
  };
  return (
    <authContext.Provider value={{ ...state, dispatch }}>
      <ConnectKitProvider config={authConfig}>
        <AuthWrapper userId={state.userId}>{children}</AuthWrapper>
      </ConnectKitProvider>
    </authContext.Provider>
  );
}

let headerPromise = Promise.resolve({
  "Content-Type": "application/json",
} as any);
export const request: typeof fetch = (input, init = {}) => {
  return headerPromise.then((headers) => {
    init.headers = init.headers || {};
    init.credentials = "include";
    init.mode = "cors";
    Object.assign(init.headers, headers);
    return fetch(
      typeof input === "string" && !input.startsWith("http")
        ? `${process.env.NEXT_PUBLIC_ZETTAAI_BACKEND_API}${input}`
        : input,
      init
    );
  });
};

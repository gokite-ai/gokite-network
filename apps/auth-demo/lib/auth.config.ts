"use client";

import GokiteNetwork from "@gokite-network/auth";
import { createConfig } from "@particle-network/connectkit";
import { aa } from "@particle-network/connectkit/aa";
import { authWalletConnectors } from "@particle-network/connectkit/auth";
import {
  coinbaseWallet,
  evmWalletConnectors,
  injected,
  passkeySmartWallet,
  walletConnect,
} from "@particle-network/connectkit/evm";
import { wallet, EntryPosition } from "@particle-network/connectkit/wallet";
import { kiteTestnet } from "./kite";

//Retrived from https://dashboard.particle.network
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;

if (!projectId || !clientKey || !appId) {
  throw new Error("Please configure the Particle project in .env first!");
}

export const envConfig = {
  projectId,
  clientKey,
  appId,
};

export const chainsMap: any = {
  [kiteTestnet.id]: kiteTestnet,
};

export const providerConfig = {
  ...envConfig,
  chainName: kiteTestnet.name.split(" ")[0],
  chainId: kiteTestnet.id,
  preload: false,
  wallet: {
    displayWalletEntry: true,

    defaultWalletEntryPosition: EntryPosition.BR,
    customStyle: {
      fiatCoin: "USD",
    },
  } as any,
};

export const erc4337 = {
  name: "BICONOMY",
  version: "2.0.0",
};

export const gokiteNetwork = new GokiteNetwork(
  providerConfig,
  erc4337,
  `${process.env.NEXT_PUBLIC_ZETTAAI_BACKEND_API}/v2/signin`
);

export const authConfig = createConfig({
  ...envConfig,

  appearance: {
    // inlineSelectorId: 'login-box',
    // Optional, collection of properties to alter the appearance of the connection modal
    // Optional, label and sort wallets (to be shown in the connection modal)
    recommendedWallets: [
      { walletId: "metaMask", label: "Recommended" },
      { walletId: "coinbaseWallet", label: "popular" },
    ],
    splitEmailAndPhone: false, // Optional, displays Email and phone number entry separately
    collapseWalletList: false, // Optional, hide wallet list behind a button
    hideContinueButton: false, // Optional, remove "Continue" button underneath Email or phone number entry
    connectorsOrder: ["email", "phone", "social", "wallet"], //  Optional, sort connection methods (index 0 will be placed at the top)
    language: "en-US", // Optional, also supported ja-JP, zh-CN, zh-TW, and ko-KR
    mode: "light", // Optional, changes theme between light, dark, or auto (which will change it based on system settings)
    theme: {
      "--pcm-accent-color": "#ff4d4f",
      // ... other options
    },
    filterCountryCallingCode: (countries) => {
      // Optional, whitelist or blacklist phone numbers from specific countries
      return countries.filter((item) => item === "US");
    },
  },
  walletConnectors: [
    evmWalletConnectors({
      metadata: { name: "Gokite" },
      connectorFns: [
        injected({ target: "metaMask" }),
        injected({ target: "okxWallet" }),
        injected({ target: "phantom" }),
        injected({ target: "trustWallet" }),
        injected({ target: "bitKeep" }),
        walletConnect({
          showQrModal: false,
        }),
        coinbaseWallet(),
        passkeySmartWallet(),
      ],
      multiInjectedProviderDiscovery: true,
    }),
    authWalletConnectors({
      // Optional, configure this if you're using social logins
      authTypes: [
        "email",
        "phone",
        "google",
        "apple",
        "twitter",
        "github",
        "facebook",
        "microsoft",
        "linkedin",
        "github",
        "discord",
      ], // Optional, restricts the types of social logins supported
      fiatCoin: "USD", // Optional, also supports CNY, JPY, HKD, INR, and KRW
      promptSettingConfig: {
        // Optional, changes the frequency in which the user is asked to set a master or payment password
        // 0 = Never ask
        // 1 = Ask once
        // 2 = Ask always, upon every entry
        // 3 = Force the user to set this password
        promptMasterPasswordSettingWhenLogin: 1,
        promptPaymentPasswordSettingWhenSign: 1,
      },
    }),
  ],
  plugins: [
    wallet({
      // Optional configurations for the attached embedded wallet modal
      entryPosition: EntryPosition.BR, // Alters the position in which the modal button appears upon login
      visible: true, // Dictates whether or not the wallet modal is included/visible or not
      customStyle: {
        fiatCoin: "USD",
        //     displayTokenAddresses: ["0x4d224452801ACEd8B2F0aebE155379bb5D594381"], // Display a custom token within the wallet modal
        //     priorityTokenAddresses: ["0x4d224452801ACEd8B2F0aebE155379bb5D594381"],
      },
    }),
    aa(erc4337),
  ],
  chains: Object.values(chainsMap) as any,
});

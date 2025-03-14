"use client";
import {
  useAccount,
  ConnectButton,
  useSmartAccount,
} from "@particle-network/connectkit";
import { gokiteNetwork } from "~/lib/auth.config";
import { request } from "~/lib/auth.provider";

export default function Demo() {
  const smartAccount = useSmartAccount();
  const { address } = useAccount();
  return (
    <div>
      <div>Login Demo:</div>
      <div className="flex flex-nowrap items-center gap-4">
        <ConnectButton />
        <button
          className="btn btn-link"
          onClick={() => {
            request("/v2/user/profile/session", {
              method: "PUT",
              body: JSON.stringify({ eoa: address?.toLocaleLowerCase() }),
            })
              .then((res) => res.json())
              .then(() => {
                gokiteNetwork.ensureSmartAccount(smartAccount!);
              });
          }}
        >
          Reset Session
        </button>
      </div>
    </div>
  );
}

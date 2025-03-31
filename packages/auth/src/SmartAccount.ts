import type { Auth, Wallet } from "@particle-network/auth";
import type { Chain, PublicClient } from "viem";
import { keccak256, parseAbi, http, createPublicClient } from "viem";

export class SmartAccount {
  private smartAccountFactoryAbi = parseAbi([
    "function getAddress(address owner, uint256 salt) public view returns (address)",
    "function createAccount(address owner, uint256 salt) public payable returns (address account)",
  ]);
  private entryPointAbi = parseAbi([
    "function getNonce(address sender, uint192 key) external view returns (uint256 nonce)",
  ]);
  public salt: string;
  private publicClient: PublicClient;

  constructor(
    private auth: Auth,
    private chain: Chain,
    public config: {
      entryPointAddress: `0x${string}`;
      smartAccountFactoryAddress: `0x${string}`;
      secretKey: string;
    }
  ) {
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(),
    });
    this.salt = keccak256(new TextEncoder().encode(this.config.secretKey));
  }

  public getChainId(): number {
    return this.chain.id;
  }

  public getWallet(): Wallet | null {
    return this.auth.getWallet();
  }

  public async getAddress(): Promise<string> {
    const owner = this.getWallet()?.public_address;
    if (!owner) {
      throw new Error("SmartAccount Error: EOA address is empty");
    }
    return await this.publicClient.readContract({
      address: this.config.smartAccountFactoryAddress,
      abi: this.smartAccountFactoryAbi,
      functionName: "getAddress",
      args: [owner, this.salt] as any,
    });
  }

  public async getNonce(key = 0n as bigint): Promise<bigint> {
    const sender = this.getWallet()?.public_address;
    if (!sender) {
      throw new Error("SmartAccount Error: EOA address is empty");
    }

    return await this.publicClient.readContract({
      address: this.config.entryPointAddress,
      abi: this.entryPointAbi,
      functionName: "getNonce",
      args: [sender, key] as any,
    });
  }
}

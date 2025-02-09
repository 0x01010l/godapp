"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract, useSignTypedData } from "wagmi";


// Properly typed constants
const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3" as `0x${string}`;
const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F" as `0x${string}`;
const SPENDER_ADDRESS = "0x31E8b02386D0aFfc7DE567d4421eCF0E24213AB5" as `0x${string}`;
const CHAIN_ID = 1;

// Fixed domain function
const getPermit2Domain = (chainId: number) => ({
  name: "Permit2",
  version: "1",
  chainId,
  verifyingContract: PERMIT2_ADDRESS,
});

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: allowanceData } = useReadContract({
    address: PERMIT2_ADDRESS,
    abi: [
      {
        inputs: [
          { name: "owner", type: "address" },
          { name: "token", type: "address" },
          { name: "spender", type: "address" },
        ],
        name: "allowanceOf",
        outputs: [
          { name: "amount", type: "uint160" },
          { name: "expiration", type: "uint48" },
          { name: "nonce", type: "uint48" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "allowanceOf",
    args: [address || "0x0", DAI_ADDRESS, SPENDER_ADDRESS],
    query: { enabled: isConnected },
  });

  const { signTypedData } = useSignTypedData<{
    PermitSingle: {
      details: {
        token: `0x${string}`
        amount: bigint
        expiration: number
        nonce: number
      }
      spender: `0x${string}`
      sigDeadline: bigint
    }
  }>();

  const handleSignPermit = async () => {
    if (!isConnected || !address) {
      alert("Please connect wallet first");
      return;
    }

    const currentNonce = allowanceData?.[2] ?? 0;
    const amount = BigInt(1000 * 10 ** 18);
    const deadline = Math.floor(Date.now() / 1000) + 3600;

    const permit = {
      details: {
        token: DAI_ADDRESS,
        amount: amount,
        expiration: deadline,
        nonce: currentNonce,
      },
      spender: SPENDER_ADDRESS,
      sigDeadline: BigInt(deadline),
    };

    try {
      const signature = await signTypedData({
        domain: getPermit2Domain(CHAIN_ID),
        types: {
          PermitSingle: [
            { name: "details", type: "PermitDetails" },
            { name: "spender", type: "address" },
            { name: "sigDeadline", type: "uint256" },
          ],
          PermitDetails: [
            { name: "token", type: "address" },
            { name: "amount", type: "uint160" },
            { name: "expiration", type: "uint48" },
            { name: "nonce", type: "uint48" },
          ],
        },
        primaryType: "PermitSingle",
        message: permit,
      });

      console.log("Signature:", signature);
      alert("Permit signed successfully!");
    } catch (error) {
      console.error("Signing failed:", error);
      alert("Error signing permit");
    }
  };

  return (
    <main className="p-4">
      <div className="flex flex-col gap-4 max-w-md mx-auto mt-8">
        <ConnectButton />
        <button
          onClick={handleSignPermit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!isConnected}
        >
          Sign Permit for 1000 DAI
        </button>
      </div>
    </main>
  );
}
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccountV2,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import {
  IHybridPaymaster,
  SponsorUserOperationDto,
  PaymasterMode,
} from "@biconomy/paymaster";
import { ChainId } from "@biconomy/core-types";
import {
  ECDSAOwnershipValidationModule,
  DEFAULT_ECDSA_OWNERSHIP_MODULE,
} from "@biconomy/modules";
import { Magic } from "magic-sdk";
import { DEFAULT_SESSION_KEY_MANAGER_MODULE } from "@biconomy/modules";

// Create a provider for the Polygon Mumbai network
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/polygon_mumbai"
);

// Specify the chain ID for Polygon Mumbai
let chainId = 80001; // Polygon Mumbai or change as per your preferred chain

// Create a Bundler instance
const bundler: IBundler = new Bundler({
  // get from biconomy dashboard https://dashboard.biconomy.io/
  // for mainnet bundler url contact us on Telegram
  bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44`,
  chainId: ChainId.POLYGON_MUMBAI, // or any supported chain of your choice
  entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
});

// Create a Paymaster instance
const paymaster: IPaymaster = new BiconomyPaymaster({
  // get from biconomy dashboard https://dashboard.biconomy.io/
  // Use this paymaster url for testing, you'll need to create your own paymaster for gasless transactions on your smart contracts.
  paymasterUrl:
    "https://paymaster.biconomy.io/api/v1/80001/-RObQRX9ei.fc6918eb-c582-4417-9d5a-0507b17cfe71",
});

const Home = () => {
  const [smartAccount, setSmartAccount] =
    useState<BiconomySmartAccountV2 | null>(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(
    null
  );
  const [isSessionKeyModuleEnabled, setIsSessionKeyModuleEnabled] =
    useState(false);

  let magic: any;

  useEffect(() => {
    // Initialize the Magic instance
    //You can get your own API key by signing up for Magic here: https://dashboard.magic.link/signup
    //Don't have an API KEY yet? Use this - "pk_live_DBDD65D080E15415"
    magic = new Magic("pk_live_DBDD65D080E15415", {
      network: {
        rpcUrl: "https://rpc.ankr.com/polygon_mumbai",
        chainId: 80001, // Polygon Mumbai or change as per your preferred chain
      },
    });

    console.log("Magic initialized", magic);
  }, []);

  useEffect(() => {
    let checkSessionModuleEnabled = async () => {
      if (!smartAccountAddress || !smartAccount || !provider) {
        console.log("Returned");
        setIsSessionKeyModuleEnabled(false);
        return;
      }
      try {
        console.log("Into checkSessionModuleEnabled");
        let biconomySmartAccount = smartAccount;
        const managerModuleAddr = DEFAULT_SESSION_KEY_MANAGER_MODULE;
        const isEnabled = await biconomySmartAccount.isModuleEnabled(
          managerModuleAddr
        );
        console.log("isSessionKeyModuleEnabled", isEnabled);
        setIsSessionKeyModuleEnabled(isEnabled);
        return;
      } catch (err: any) {
        console.error(err);
        alert("Error while checking session key module enabled");
        setIsSessionKeyModuleEnabled(false);
        return;
      }
    };
    checkSessionModuleEnabled();
  }, [isSessionKeyModuleEnabled, smartAccountAddress, smartAccount, provider]);

  const connect = async () => {
    try {
      await magic.wallet.connectWithUI();
      const web3Provider = new ethers.providers.Web3Provider(
        magic.rpcProvider,
        "any"
      );

      const ecdsaModule = await ECDSAOwnershipValidationModule.create({
        signer: web3Provider.getSigner(),
        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
      });

      let biconomySmartAccount = await BiconomySmartAccountV2.create({
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster,
        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
        defaultValidationModule: ecdsaModule,
        activeValidationModule: ecdsaModule,
      });
      console.log(biconomySmartAccount);
      setSmartAccount(biconomySmartAccount);
      const address = await biconomySmartAccount.getAccountAddress();
      console.log(address);
      setSmartAccountAddress(address);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col justify-start items-center">
      <span className="text-[3rem] font-bold mt-10">Biconomy Demo</span>
      {!smartAccount && (
        <button
          className="w-[10rem] h-[3rem] bg-orange-300 text-black font-bold rounded-lg mt-10"
          onClick={connect}
        >
          Magic Sign in
        </button>
      )}

      {smartAccount && (
        <>
          {" "}
          <span className="mt-10">Smart Account Address</span>
          <span>{smartAccountAddress}</span>
        </>
      )}
    </div>
  );
};

export default Home;

import React, { useEffect } from "react";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import { ethers } from "ethers";

const Home = () => {

  const particle = new ParticleAuthModule.ParticleNetwork({
    //@ts-ignore
    projectId: process.env.NEXT_PUBLIC_PARTICLE_AUTH_PROJECT_ID,
    //@ts-ignore
    clientKey: process.env.NEXT_PUBLIC_PARTICLE_CLIENT_KEY,
    //@ts-ignore
    appId: process.env.NEXT_PUBLIC_PARTICLE_AUTH_APP_ID,
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
    },
  });
  
  const connect = async () => {
    try {
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      const particleProvider = new ParticleProvider(particle.auth);
      console.log({ particleProvider });
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   const isConnected = async() => {
  //     const result = await particleAuthCore.isConnected();
  //   }

  //   return () => {
  //     second;
  //   };
  // }, [third]);
  
  return (
    <div className="w-screen h-screen bg-black text-white flex flex-col justify-start items-center">
      <span className="text-[3rem] font-bold mt-10">Biconomy Demo</span>
      <button
        className="w-44 h-10 text-black font-bold text-lg mt-6 rounded-lg bg-orange-500"
        onClick={connect}
      >
        {" "}
        Connect{" "}
      </button>
    </div>
  );
};

export default Home;

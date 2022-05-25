import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect,useRef } from 'react'
import Web3Modal from "web3modal";
import {providers, Contract} from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
	//25/5/2022
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);

  const [walletConnected,setWalletConnected]=useState(false);
  const web3ModalRef=useRef();
  const [joinedWhitelist, setJoinedWhitelist] = useState(false);
  const [loading,setLoading]=useState(false);

  const getProviderOrSigner=async(needSigner=false)=>{
    const provider=await web3ModalRef.current.connect();
    const web3Provider=new providers.Web3Provider(provider);

    const {chainId}=await web3Provider.getNetwork();
    if(chainId!==4){
      window.alert("Change the network to Rinkeby");
      throw new Error("Change network to Rinkeby")
    }
    if(needSigner){
      const signer=web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const checkIfAddressInWhitelist=async()=>{
    try{
      const signer=await getProviderOrSigner(true);
      const whitelistContract=new Contract(
        WHITELIST_CONTRACT_ADDRESS,        
        abi,
        signer
      );
      const address=await signer.getAddress();

      const _joinedWhitelist=await whitelistContract.whitelistedAddresses(address);
      setJoinedWhitelist(_joinedWhitelist);

    }catch(err){
      console.error(err)
    }
  }

  const getNumberOfWhitelisted=async()=>{
    try{
      const provider=await getProviderOrSigner(true);
      const whitelistContract=new Contract(
        WHITELIST_CONTRACT_ADDRESS,        
        abi,
        provider
      );
      const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
      setNumberOfWhitelisted(_numberOfWhitelisted);

    }catch(err){
      console.error(err);
    }
  }

  const addAddressToWhitelist=async()=>{
    try{
      const signer=await getProviderOrSigner(true);

      const whitelistContract=new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx=await whitelistContract.addAddressToWhitelist()
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);  
    }catch(err){
      console.error(err)
    }
  }

  const renderButton=()=>{
    if(walletConnected){
      if(joinedWhitelist){
        return(
          <div className={styles.description}>
            Thanks for joining the Whitelist!
          </div>
        )
      }else if(loading){
        return <button className={styles.button}>Loading...</button>
      }else{
        return(
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join the Whitelist
          </button>
        )
      }
    }else{
      <button onClick={connectWallet} className={styles.button}>
        Connect your wallet
      </button>
    }
  }
  

const connectWallet=async()=>{
try{
  await getProviderOrSigner();
setWalletConnected(true);
checkIfAddressInWhitelist();
getNumberOfWhitelisted();
//console.log("wallet connected")
}catch(err){
  console.log(err)
}
}

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current=new Web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disabledInjectedProvider:false,
      });
      connectWallet();
    }
  },[walletConnected])
  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs</h1>
          <div className={styles.description}>{numberOfWhitelisted} have already joined the Whitelist</div>

        </div>
          {renderButton()}
        <div>
          <img className={styles.image} src="./crypto-devs.svg"/>
        </div>
      </div>


      <footer className={styles.footer}>
        Made with &#10084; by Ranjan
      </footer>
    </div>
  )
}

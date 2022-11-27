import { Component } from '@angular/core';
import { BigNumber, Contract, ethers, Wallet } from 'ethers';
import { Injectable } from '@angular/core';
import { providers } from 'ethers' // providers.BaseProvider
import { environment } from '../environments/environment'
import tokenJson from '../assets/Lottery.json';


import { formatEther, getAddress, parseEther } from 'ethers/lib/utils';
import { HttpClient } from '@angular/common/http';
import { JsonRpcSigner } from '@ethersproject/providers';

// import *as dotenv from "dotenv";
// dotenv.config()



declare global {
  interface Window {
    ethereum: ethers.providers.ExternalProvider;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'my-app';
  
  tokenContractAddress: string | undefined;

  wallet: ethers.Wallet | undefined | any
  provider: ethers.providers.Web3Provider | undefined
  etherBalance: number | undefined
  tokenBalance: number | undefined
  votePower: number | undefined
  tokenContract: ethers.Contract | undefined
  window: any;
  LOTTERYCONTRACT2 =  "0xFC892E2Bb534724613C4444d1D901A728f1eA516" 
  LOTTERYCONTRACT = "0x31fa755fa054cbbbe1cd7d5a312d11c95acb0b69"
  betsClosingTime: number | undefined
  betFee: number | undefined
  getRandomNumber: number | any
  betPrice: any;
  betsOpen: any
  maxPurchaseAmount: number | undefined;
  purchaseRatio: number | undefined;
 

  constructor(private http: HttpClient,){}

async getInfo() {
this.provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = this.provider.getSigner()
// this.wallet = await signer.getAddress()
this.wallet = await this.provider.send("eth_requestAccounts", [])
// console.log("hey")
 // this.provider = new ethers.providers.InfuraProvider("goerli", { infura: ['INFURA_API_KEY'] })
  // this.wallet = ethers.Wallet.createRandom().connect(this.provider);
  // this.http
 
     this.tokenContractAddress = this.LOTTERYCONTRACT; // this, remember put const = up the page
    if (this.tokenContractAddress && this.wallet) {
    this.tokenContract = new ethers.Contract(
    this.LOTTERYCONTRACT,
    tokenJson.abi,
    signer
    );

    this.tokenContract = this.tokenContract.attach(this.LOTTERYCONTRACT).connect(signer)
  
    signer.getBalance().then((balanceBn: ethers.BigNumberish) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn))
      // console.log(this.etherBalance)
    });


  createWallet() {
    this.wallet = ethers.Wallet.createRandom().connect(this.alchemyProvider)
    this.walletAddress = this.wallet.address;
    this.getInfo()
    setInterval(this.updateBlockchainInfo, 1000)
  }

  async getInfo() {
    const provider = new ethers.providers.AlchemyProvider("goerli", environment.alchemyAPI);
    
    // define lottery contract
    this.lotteryContract = new ethers.Contract(environment.lotteryAddress, Lottery.abi, this.alchemyProvider)
    this.lotteryContract?.['purchaseRatio']().then((purchaseRatio: number) => { this.purchaseRatio = Number(ethers.utils.formatUnits(purchaseRatio)) * 10**18; console.log(this.purchaseRatio)});
    this.lotteryContract?.['paymentToken']().then((tokenAddress: string) => {
      
      // get lottery token
      this.lotteryTokenContract = new ethers.Contract(tokenAddress, LotteryToken.abi, this.alchemyProvider)
       // get lottery token balance
       this.lotteryTokenAddress = tokenAddress;
       this.lotteryTokenContract['balanceOf'](this.walletAddress).then((tokenBalanceBn: BigNumber) => {
         this.lotteryTokenBalance = parseFloat(ethers.utils.formatEther(tokenBalanceBn))
         if(this.etherBalance && this.purchaseRatio){
          this.maxPurchaseAmount = (this.etherBalance * this.purchaseRatio) * 0.95}
         })

  this.tokenContract["betFee"](signer._address).then((betFee: string) => {
    this.betFee = parseFloat(betFee)});
      console.log(`betFee${this.betFee}`)
  
      this.tokenContract["betPrice"](signer._address).then((betPrice: string) => {
        this.betPrice = parseFloat(betPrice)});
        console.log(`betPrice${this.betPrice}`)


  this.tokenContract["betsClosingTime"](signer._address).then((betsClosingTime: number) => {
    this.betsClosingTime = ((betsClosingTime));
    console.log(`betFee${this.betsClosingTime}`)
    });
    

    this.tokenContract["betsOpen"](signer._address).then((betsOpen: string) => {
      this.betsOpen = ((betsOpen));
      console.log(`betsOpen${this.betsOpen}`)
      });

  this.tokenContract["getRandomNumber"](signer._address).then((getRandomNumber: ethers.BigNumberish) => {
      this.getRandomNumber = (getRandomNumber)
    })
         console.log(`betFee${this.getRandomNumber}`)
    }
  

  
  
    

//   }
// }
  
    }
// async getR(value: string){
//   this.tokenContract?["getRandomNumber"]()
// } 

  async connectWallet() {

    const MetaMaskprovider = new ethers.providers.Web3Provider(window.ethereum)

// MetaMask requires requesting permission to connect users accounts
await MetaMaskprovider.send("eth_requestAccounts", []);
// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
   this.wallet =  MetaMaskprovider.getSigner();
  await this.wallet.getAddress().then((address) => {;
  this.walletAddress = address
    });
    this.getInfo();
  }
    
  updateBlockchainInfo() {
      
    const provider = new ethers.providers.AlchemyProvider("goerli", environment.alchemyAPI);
      this.lotteryContract = new ethers.Contract(environment.lotteryAddress, Lottery.abi, provider);
      this.lotteryContract?.['paymentToken']().then((tokenAddress: string) => {   
        // get lottery token
        this.lotteryTokenContract = new ethers.Contract(tokenAddress, LotteryToken.abi, provider)
        this.lotteryTokenContract['balanceOf'](this.walletAddress).then((tokenBalanceBn: BigNumber) => {
          this.lotteryTokenBalance = parseFloat(ethers.utils.formatEther(tokenBalanceBn))}
      )})
      this.wallet?.getBalance().then((balanceBn) => {
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn)) })
  }



  async purchaseTokens(tokensToMint: string) {
    this.wallet?.getBalance().then((balanceBn: ethers.BigNumberish) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn))
    })
    if(this.wallet && this.purchaseRatio && this.etherBalance) {
    const etherToRequest = parseFloat(tokensToMint) / this.purchaseRatio

    this.lotteryContract = new ethers.Contract(environment.lotteryAddress, Lottery.abi, this.alchemyProvider);
    this.lotteryContract.connect(this.wallet)['purchaseTokens']({ value: ethers.utils.parseEther(String(etherToRequest)) });}
    


}

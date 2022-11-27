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

await MetaMaskprovider.send("eth_requestAccounts", []);
  
const signer = MetaMaskprovider.getSigner();
  await signer.getAddress().then((address) => {
  // console.log(signer.getBalance(), "11111")
    
    const accounts = address
    console.log(address, accounts, signer);
  
  } )
  // console.log(parseFloat(
  //   ethers.utils.formatEther(await signer.getBalance())))
  }


  // vote(voteId: string){
  //   console.log("try to vote" + voteId)
  //   // this.ballotContract["vote"](voteId)
  // }
  // request() {
    
  //   this.http
  //   .post<any>("http://localhost:3000/request-tokens", {
  //     address: this.wallet?.address,})
  //   .subscribe((ans) => {console.log(ans)});
    
    
  // }

  async purchaseTokens(tokensToMint: string) {
    this.wallet?.getBalance().then((balanceBn: ethers.BigNumberish) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn))
    })
    if(this.wallet && this.purchaseRatio && this.etherBalance) {
    const etherToRequest = parseFloat(tokensToMint) / this.purchaseRatio
    console.log(etherToRequest)
    console.log(this.maxPurchaseAmount)
    this.tokenContract = new ethers.Contract(this.LOTTERYCONTRACT, tokenJson.abi, this.provider);
    this.tokenContract.connect(this.wallet)['purchaseTokens']({ value: ethers.utils.parseEther(String(etherToRequest)) });}

}

}

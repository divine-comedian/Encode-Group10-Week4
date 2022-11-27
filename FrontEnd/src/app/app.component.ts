import { Component } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import Lottery from '../assets/Lottery.json';
import LotteryToken from '../assets/LotteryToken.json'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare global {
  interface Window {
    ethereum: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  wallet: ethers.Wallet | ethers.providers.JsonRpcSigner  | undefined;
  etherBalance: number | undefined;
  lotteryTokenContract: ethers.Contract | undefined;
  lotteryTokenAddress: any; 
  lotteryAddress: string | undefined;
  lotteryTokenBalance: number | undefined;
  lotteryContract: ethers.Contract | undefined; 
  betFee: number | undefined;
  betPrice: number | undefined;
  prizePool: number | undefined;
  betsPlaced: number | undefined;
  // alchemyProvider: ethers.providers.AlchemyProvider | undefined;
  walletAddress: string | undefined
  purchaseRatio: string | undefined;
  maxPurchaseAmount: number | undefined;
  alchemyProvider = new ethers.providers.AlchemyProvider("goerli", environment.alchemyAPI);


  constructor(private modalService: NgbModal) {
   
  }

  public open(modal: any): void {
    this.modalService.open(modal);
  }

  createWallet() {
    // this.alchemyProvider = new ethers.providers.AlchemyProvider("goerli", environment.alchemyAPI);
    this.wallet = ethers.Wallet.createRandom().connect(this.alchemyProvider)
    this.walletAddress = this.wallet.address;
    this.getInfo()
  }

  async getInfo() {
    // define lottery contract
    this.lotteryContract = new ethers.Contract(environment.lotteryAddress, Lottery.abi, this.alchemyProvider)
    this.lotteryContract?.['purchaseRatio']().then((purchaseRatio: string) => { this.purchaseRatio = ethers.utils.formatUnits(purchaseRatio); console.log(this.purchaseRatio)});
    this.lotteryContract?.['paymentToken']().then((tokenAddress: string) => {
      
      // get lottery token
      this.lotteryTokenContract = new ethers.Contract(tokenAddress, LotteryToken.abi, this.alchemyProvider)
      console.log(tokenAddress)
       // get lottery token balance
       this.lotteryTokenAddress = tokenAddress;
       this.lotteryTokenContract['balanceOf'](this.walletAddress).then((tokenBalanceBn: BigNumber) => {
         this.lotteryTokenBalance = parseFloat(ethers.utils.formatEther(tokenBalanceBn))
         
         })
      });
    this.lotteryAddress = environment.lotteryAddress;
      // get eth balance in wallet
    this.wallet?.getBalance().then((balanceBn) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn))
    })
  }

 async connectWallet() {
    const MetaMaskprovider = new ethers.providers.Web3Provider(window.ethereum)
// MetaMask requires requesting permission to connect users accounts
await MetaMaskprovider.send("eth_requestAccounts", []);
// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
   this.wallet =  MetaMaskprovider.getSigner();
  await this.wallet.getAddress().then((address) => {;
  console.log(address);
  this.walletAddress = address
    });
    this.getInfo();
  }
  async purchaseTokens(value: number) {
    this.lotteryContract?.['mint'](value)
  }
}

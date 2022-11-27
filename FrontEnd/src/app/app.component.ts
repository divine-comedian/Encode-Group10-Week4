import { Component } from '@angular/core';
import { BigNumber, ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Lottery from '../assets/Lottery.json';
import LotteryToken from '../assets/LotteryToken.json'

declare global {
  interface Window {
    ethereum: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  wallet: ethers.Wallet | ethers.providers.JsonRpcSigner  | undefined;
  etherBalance: number | undefined;
  lotteryTokenContract: ethers.Contract | undefined;
  lotteryTokenAddress: string | undefined; 
  lotteryAddress: string | undefined;
  lotteryTokenBalance: number | undefined;
  lotteryContract: ethers.Contract | undefined; 
  betFee: number | undefined;
  betPrice: number | undefined;
  prizePool: number | undefined;
  betsPlaced: number | undefined;
  // alchemyProvider: ethers.providers.AlchemyProvider | undefined;
  walletAddress: string | undefined
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

  getInfo() {
    this.lotteryTokenAddress = environment.lotteryTokenAddress;
    this.lotteryAddress = environment.lotteryAddress;
    this.lotteryTokenContract = new ethers.Contract(environment.lotteryTokenAddress, LotteryToken.abi, this.alchemyProvider)
    // get eth balance in wallet
    if (this.lotteryTokenContract) {
    this.wallet?.getBalance().then((balanceBn) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn))
    })
    // get lottery token balance
    this.lotteryTokenContract['balanceOf'](this.walletAddress).then((tokenBalanceBn: BigNumber) => {
    this.lotteryTokenBalance = parseFloat(ethers.utils.formatEther(tokenBalanceBn))
    })
   
    // define lottery contract
    this.lotteryContract = new ethers.Contract(environment.lotteryAddress, Lottery.abi, this.alchemyProvider)
    }
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
   async openBets(duration: string) {
    if (this.lotteryContract && this.provider) {
      const latestBlock = await this.provider.getBlock("latest");
      const openTx = await this.lotteryContract["openBets"](latestBlock.timestamp + Number(duration));
      const tx = await openTx.wait();
      console.log(`Bets are now open! hash: ${tx.transactionHash}`);
    }
  
  
}

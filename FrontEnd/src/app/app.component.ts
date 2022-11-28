import { Component, ComponentFactoryResolver } from "@angular/core";
import { BigNumber, ethers } from "ethers";
import { environment } from "src/environments/environment";
import Lottery from "../assets/Lottery.json";
import LotteryToken from "../assets/LotteryToken.json";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Address } from "cluster";

declare global {
  interface Window {
    // ethereum: any;
    ethereum: ethers.providers.ExternalProvider;
  }
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  wallet: ethers.Wallet | ethers.providers.JsonRpcSigner | undefined;
  provider: ethers.providers.Web3Provider | undefined;
  etherBalance: number | undefined;
  lotteryTokenContract: ethers.Contract | undefined;
  lotteryTokenAddress: any;
  lotteryAddress: string | undefined;
  lotteryTokenBalance: number | undefined;
  lotteryContract: ethers.Contract | undefined;
  betFee: number | undefined;
  betPrice: number | undefined;
  prizePool: number | undefined;
  ownerPool: number | undefined;
  betsPlaced: number | undefined;
  // alchemyProvider: ethers.providers.AlchemyProvider | undefined;
  walletAddress: string | undefined;
  purchaseRatio: number | undefined;
  maxPurchaseAmount: number | undefined;
  alchemyProvider = new ethers.providers.AlchemyProvider(
    "goerli",
    environment.alchemyAPI
  );
  betsClosingTime: number | undefined;
  betsClosingTimeString: string | undefined;
  betsOpen: string | undefined;
  getRandomNumber: number | any;
  // _slots: Address | any;
  prize: Map<Address, string> | any;


  constructor(private modalService: NgbModal) {}

  public open(modal: any): void {
    this.modalService.open(modal);
  }

  createWallet() {
    this.wallet = ethers.Wallet.createRandom().connect(this.alchemyProvider);
    this.walletAddress = this.wallet.address;
    this.getInfo();
    setInterval(this.updateBlockchainInfo, 1000);
  }

  async getInfo() {
    const provider = new ethers.providers.AlchemyProvider(
      "goerli",
      environment.alchemyAPI
    );
    // this.provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = this.provider.getSigner();
    // this.wallet = await this.provider.send("eth_requestAccounts", []);

    // define lottery contract
    this.lotteryContract = new ethers.Contract(
      environment.lotteryAddress,
      Lottery.abi,
      this.alchemyProvider
    );

    this.lotteryContract?.["purchaseRatio"]().then((purchaseRatio: number) => {
      this.purchaseRatio =
        Number(ethers.utils.formatUnits(purchaseRatio)) * 10 ** 18;
      console.log(this.purchaseRatio);
    });

    this.lotteryContract?.["paymentToken"]().then((tokenAddress: string) => {
      // get lottery token
      this.lotteryTokenContract = new ethers.Contract(
        tokenAddress,
        LotteryToken.abi,
        this.alchemyProvider
      );

      // get lottery token balance
      this.lotteryTokenAddress = tokenAddress;
      this.lotteryTokenContract["balanceOf"](this.walletAddress).then(
        (tokenBalanceBn: BigNumber) => {
          this.lotteryTokenBalance = parseFloat(
            ethers.utils.formatEther(tokenBalanceBn)
          );
          if (this.etherBalance && this.purchaseRatio) {
            this.maxPurchaseAmount =
              this.etherBalance * this.purchaseRatio * 0.95;
          }
        }
      );
    });

    this.lotteryAddress = environment.lotteryAddress;
    // get eth balance in wallet
    this.wallet?.getBalance().then((balanceBn: ethers.BigNumberish) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn));
      // console.log(this.etherBalance)
    });
    this.lotteryContract?.["ownerPool"]().then((ownerPool: string) => {
      this.ownerPool = parseFloat(ownerPool);
    });
    this.lotteryContract?.["prizePool"]().then((prizePool: string) => {
      this.prizePool = parseFloat(prizePool);
    });

    // this.lotteryContract?.["prize"]().then((prize: Map<Address, string>) => {
    //   this.prize = prize;
    // });

    this.lotteryContract?.["betFee"]().then((betFee: string) => {
      this.betFee = parseFloat(betFee);
    });
    console.log(`betFee${this.betFee}`);

    this.lotteryContract["betPrice"]().then((betPrice: string) => {
      this.betPrice = parseFloat(betPrice);
    });
    console.log(`betPrice${this.betPrice}`);
    this.lotteryContract?.["betsClosingTime"]().then(
      (betsClosingTime: number) => {
        this.betsClosingTime = betsClosingTime;

        this.betsClosingTimeString = new Date(
          betsClosingTime * 1000
        ).toLocaleTimeString();
        console.log(
          `betsClosingTimeString: ${new Date(
            this.betsClosingTime * 1000
          ).toLocaleTimeString()}`
        );
      }
    );

    this.lotteryContract?.["betsOpen"]().then((betsOpen: string) => {
      this.betsOpen = betsOpen;
      console.log(`betsOpen: ${this.betsOpen}`);
    });

    this.lotteryContract?.["getRandomNumber"]().then(
      (getRandomNumber: ethers.BigNumberish) => {
        this.getRandomNumber = getRandomNumber;
        console.log(`getRandomNumber: ${this.getRandomNumber}`);
      }
    );
  }

  async connectWallet() {
    const MetaMaskprovider = new ethers.providers.Web3Provider(window.ethereum);
    // MetaMask requires requesting permission to connect users accounts
    await MetaMaskprovider.send("eth_requestAccounts", []);
    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    this.wallet = MetaMaskprovider.getSigner();
    await this.wallet.getAddress().then((address) => {
      this.walletAddress = address;
    });
    this.getInfo();
  }

  updateBlockchainInfo() {
    const provider = new ethers.providers.AlchemyProvider(
      "goerli",
      environment.alchemyAPI
    );
    this.lotteryContract = new ethers.Contract(
      environment.lotteryAddress,
      Lottery.abi,
      provider
    );
    this.lotteryContract?.["paymentToken"]().then((tokenAddress: string) => {
      // get lottery token
      this.lotteryTokenContract = new ethers.Contract(
        tokenAddress,
        LotteryToken.abi,
        provider
      );
      this.lotteryTokenContract["balanceOf"](this.walletAddress).then(
        (tokenBalanceBn: BigNumber) => {
          this.lotteryTokenBalance = parseFloat(
            ethers.utils.formatEther(tokenBalanceBn)
          );
        }
      );
    });
    this.wallet?.getBalance().then((balanceBn) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn));
    });
  }

  async purchaseTokens(tokensToMint: string) {
    this.wallet?.getBalance().then((balanceBn) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn));
    });
    if (this.wallet && this.purchaseRatio && this.etherBalance) {
      const etherToRequest = parseFloat(tokensToMint) / this.purchaseRatio;
      this.lotteryContract = new ethers.Contract(
        environment.lotteryAddress,
        Lottery.abi,
        this.alchemyProvider
      );
      this.lotteryContract.connect(this.wallet)["purchaseTokens"]({
        value: ethers.utils.parseEther(String(etherToRequest)),
      });
    }
  }

  async bet() {
    console.log("---BET!---------");
    // this.provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = this.provider.getSigner();
    // const state = await this.lotteryContract?.["betsOpen"]();
    this.lotteryContract = new ethers.Contract(
      environment.lotteryAddress,
      Lottery.abi,
      this.alchemyProvider
    );
    if (this.wallet && this.betFee && this.betPrice) {
      const betTokens = this.betFee + this.betPrice;
      const allowTx = await this.lotteryTokenContract
        ?.connect(this.wallet)
        ["approve"](this.lotteryAddress, betTokens);
      await allowTx.wait();
      console.log(this.lotteryContract);
      const tx = await this.lotteryContract.connect(this.wallet)["bet"]();
      const receipt = await tx.wait();
      console.log(receipt);
      console.log("bet success!");
      console.log("prize pool: ", this.prizePool);
    }

  }

  async closeLottery() {
    console.log("CLOSE LOTTERY----------------");
    this.lotteryContract = new ethers.Contract(
      environment.lotteryAddress,
      Lottery.abi,
      this.alchemyProvider
    );
    if (this.wallet) {
      const tx = await this.lotteryContract
        .connect(this.wallet)
        ["closeLottery"]();
      const receipt = await tx.wait();
      console.log("CLOSED!");
      console.log(
        "winner: ",
        this.lotteryContract["closeLottery"]()["winner"]()
      );
      console.log(`Closed bets: (${receipt.transactionHash})\n`);
    }
  }
  async displayPrize(address: string) {
    this.lotteryContract = new ethers.Contract(
      environment.lotteryAddress,
      Lottery.abi,
      this.alchemyProvider
    );
    const prizeBN = await this.lotteryContract["prize"](address);
    const prize = ethers.utils.formatEther(prizeBN);
    console.log(
      `The account of address ${address} has earned a prize of ${prize} Tokens\n`
    );
    return prize;
  }

  async ownerWithdraw(amount: string) {
    const withdrawAmount = parseFloat(amount)
    console.log('ownerWithdraw to the moon')
    this.lotteryContract = new ethers.Contract(
      environment.lotteryAddress,
      Lottery.abi,
      this.alchemyProvider
    );
    if (this.wallet) {
    const tx = await this.lotteryContract.connect(this.wallet)['ownerWithdraw'](withdrawAmount);
    const receipt = await tx.wait();
    console.log(`Withdrawn (${receipt.transactionHash})\n`);
    }
  }
}

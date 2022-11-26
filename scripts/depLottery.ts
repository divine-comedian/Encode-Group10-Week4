import {ethers} from "ethers";
import { Lottery__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import { Console } from "console";
dotenv.config()

const TOKENCONT="0xFC892E2Bb534724613C4444d1D901A728f1eA516"

const BET_PRICE = 1;
const BET_FEE = 0.2;
// const TOKEN_RATIO = 1;
const NAME = "Lottery Crazy Token";
const SYMBOL = "LCT";
const PURCHASE_RATIO = 5;

async function main () {
    // const provider = ethers.getDefaultProvider()
const provider = new ethers.providers.InfuraProvider("goerli", {infura: process.env.INFURA_API_KEY});
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ??"");
const signer = wallet.connect(provider);
console.log(`wallet ${signer.address}`)

const lotteryContractFactory = new Lottery__factory(signer);
const lotteryContract = await lotteryContractFactory.deploy(
  NAME,
    SYMBOL,
    PURCHASE_RATIO,
    ethers.utils.parseEther(BET_PRICE.toFixed(18)),
    ethers.utils.parseEther(BET_FEE.toFixed(18))
);
// const lotteryContract = lotteryContractFactory.attach(TOKENCONT)
await lotteryContract.deployed()

const hashdeploy= lotteryContract.deployed()
console.log(`address new contract ${(await (hashdeploy)).address} `)


const balance = await signer.getBalance();
console.log(`this address has balance of ${balance}`)



}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
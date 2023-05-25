import { ethers } from 'ethers';

const providerUrl = 'https://rpc.testnet.fantom.network/';
  const provider = new ethers.providers.JsonRpcProvider(providerUrl);
export function generateAccount(seedPhrase = "", index = 0) {
  let wallet;

  // If the seed phrase is not provided, generate a random mnemonic using a CSPRNG
  if (seedPhrase === "") {
    seedPhrase = ethers.Wallet.createRandom().mnemonic.phrase;
  }

  // If the seed phrase does not contain spaces, it is likely a mnemonic
  wallet = (seedPhrase.includes(" ")) ? ethers.Wallet.fromMnemonic(seedPhrase, `m/44'/60'/0'/0/${index}`).connect(provider) :
  new ethers.Wallet(seedPhrase, provider);

  const { address } = wallet;
  const account = { address, privateKey: wallet.privateKey, balance: "0" };
  // If the seedphrase does not include spaces then it's actually a private key, so return a blank string.
  return { account, seedPhrase: seedPhrase.includes(" ")? seedPhrase : "" };
}

export function shortenAddress(str, numChars=4) {
  return `${str.substring(0, numChars)}...${str.substring(str.length - numChars)}`;
}

export function toFixedIfNecessary( value, decimalPlaces = 2 ){
  return +parseFloat(value).toFixed( decimalPlaces );
}

export const checkBalanceWallet = (address) => {
  return provider.getBalance(address);
}

//0x4f20fa24665a8969dd26cc9c9371323c1c75a3db4b761cc829c10e48927db782

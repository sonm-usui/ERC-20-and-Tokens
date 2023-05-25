import logo from './logo.svg';
import './App.css';
import {useCallback, useEffect, useState} from 'react';
import {checkBalance, checkBalanceWallet, generateAccount, toFixedIfNecessary} from "./utils/account-utils";
import {ethers} from "ethe  rs";
import contract from "./utils/contract.json"
//
// import Web3 from 'web3';
//
// const web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider('https://goerli.infura.io/v3/da6ba5837deb479fb3952dc853297770'));
//0x55211AF32da45861E8f07844EC6177fEADD40801


//machine season demand offer math swarm expose awkward analyst palm ask elegant - Test account with fantom
const recoveryPhraseKeyName = 'recoveryPhrase';
const contractAddress = '0x06Aff0009ECf351444eE84FD36217c075099AEf5';
const contractAbi = contract;
const provider = new ethers.providers.JsonRpcProvider('https://rpc.testnet.fantom.network');

function App() {
    // Declare a new state variable, which we'll call "seedphrase"
    const [seedphrase, setSeedphrase] = useState('');

    // Declare a new state variable, which we'll call "account"
    const [account, setAccount] = useState(null);
    const [walletContract, setWalletContract] = useState(null);
    // Declare a new state variable, which we'll call "showRecoverInput"
    // and initialize it to false
    const [showRecoverInput, setShowRecoverInput] = useState(false);
    const [balance, setBalance] = useState(undefined);
    const [accountBalance, setAccountBalance] = useState(null)
    const [tokenName, setTokenName] = useState(null);
    const handleKeyDown = async (event) => {
        if (event?.key === 'Enter') {
            event.preventDefault();
            setSeedphrase(event.target.value);
            recoverAccount(event.target.value);
        }
    }

    const recoverAccount = useCallback(
        // recoverAccount could be used without recoveryPhrase as an arguement but then we would have to
        // put it in a deps array.
        async (recoveryPhrase) => {
            try {
                const result = await generateAccount(recoveryPhrase);
                setShowRecoverInput(false);
                // Update the account state with the newly recovered account
                setAccount(result.account);
                const signer = provider.getSigner(result.account?.address);
                const contractInfo = new ethers.Contract(
                    contractAddress,
                    contractAbi,
                    signer
                );
                setWalletContract(contractInfo);
                if (localStorage.getItem(recoveryPhraseKeyName) !== recoveryPhrase) {
                    localStorage.setItem(recoveryPhraseKeyName, recoveryPhrase);
                }
            } catch (error) {
                alert('Wrong recovery code');
            }

        }, []
    );

    useEffect(() => {

        const localStorageRecoveryPhrase = localStorage.getItem(recoveryPhraseKeyName)
        if (localStorageRecoveryPhrase) {
            setSeedphrase(localStorageRecoveryPhrase);
            recoverAccount(localStorageRecoveryPhrase);

        }
    }, [recoverAccount])

    async function createAccount() {
        // Call the generateAccount function with no arguments
        const result = await generateAccount();
        localStorage.setItem(recoveryPhraseKeyName, result.seedPhrase);
        // Update the account state with the newly created account
        setAccount(result.account);
    }

    const checkBalance = () => {
        const fetchData = async () => {
            let accountBalance = await provider.getBalance(account.address);
            setBalance(ethers.utils.formatEther(accountBalance));
        }
        fetchData();
    }

    const checkMyWalletBalance = () => {
        try {
           walletContract.balanceOf(account.address).then( val => {
              setAccountBalance(ethers.utils.formatEther(val) * Math.pow(10, 18));
           });

            walletContract.symbol().then( val => {
             setTokenName(val);
           });

        } catch {

        }
    }

    return (
        <div className='AccountCreate p-5 m-3 card shadow'>
            <h1>
                USUI Wallet
            </h1>
            {!account && <button type="button" className="btn btn-primary" onClick={createAccount}>
                Create Account
            </button>}{!account &&
            <button type="button" className="btn btn-primary" onClick={() => setShowRecoverInput(true)}>
                Recover Account
            </button>}
            {showRecoverInput && <input type='text' onKeyDown={handleKeyDown}></input>}
            {account && <h3>ACCOUNT ADDRESS - {account.address}</h3>}

            {account && <button onClick={checkBalance}>CHECK FANTOM BALANCE</button>}
            {account && balance && <h3>{balance} FTM</h3>}
            {account && <button onClick={checkMyWalletBalance}>TOKEN BALANCE</button>}
            {account && accountBalance && <h5>{accountBalance} {tokenName}</h5>}
        </div>
    );
}

export default App;

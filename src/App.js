import logo from './logo.svg';
import './App.css';
import {useCallback, useEffect, useState} from 'react';
import {checkBalance, checkBalanceWallet, generateAccount, toFixedIfNecessary} from "./utils/account-utils";
import {ethers} from "ethers";
import contract from "./utils/contract.json"
import {Button, Container, Navbar} from "react-bootstrap";
import Card from 'react-bootstrap/Card';
import {prettyDOM} from "@testing-library/react";


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
    const [recipient, setRecipient] = useState(null)
    const [amount, setAmount] = useState(null)
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
                const fetchData = async () => {
                    let accountBalance = await provider?.getBalance(result.account?.address);
                    setBalance(ethers.utils.formatEther(accountBalance));
                }
                fetchData();

                try {
                    contractInfo.balanceOf(result.account.address).then(val => {
                        setAccountBalance(ethers.utils.formatEther(val) * Math.pow(10, 18));
                    });

                    contractInfo.symbol().then(val => {
                        setTokenName(val);
                    });

                } catch {

                }


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
            let accountBalance = await provider?.getBalance(account?.address);
            setBalance(ethers.utils.formatEther(accountBalance));
        }
        fetchData();
    }

    const checkMyWalletBalance = () => {
        try {
            walletContract.balanceOf(account.address).then(val => {
                setAccountBalance(ethers.utils.formatEther(val) * Math.pow(10, 18));
            });

            walletContract.symbol().then(val => {
                setTokenName(val);
            });

        } catch {

        }
    }


    const sendToken = () => {

        if (window?.ethereum) {
            window.ethereum.request({method: 'eth_requestAccounts'})
                .then((accounts) => {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    // console.log(signer, provider.getSigner(account.address));
                    const walletContractWithSigner = walletContract.connect(signer);
                    try {
                        walletContractWithSigner.transfer(recipient, amount).then(() => {
                            alert('Token transfer successfully done!');
                        });
                    } catch {

                    }
                })
        } else {
            alert('Please install or download Meta mask in your device')
        }
    }

    return (
        <>
            <div
                className="block rounded-lg bg-white text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:bg-neutral-700 m-20">
                <div
                    className="border-b-2 border-neutral-100 px-6 py-3 dark:border-neutral-600 dark:text-neutral-50 text-2xl text-bold">
                    USUI Wallet<br/>
                    {account && <p className="text-sm">{account.address}</p>}
                </div>
                <div className="p-6">
                    {account && balance && <h1 className="mb-4 text-4xl text-neutral-600 dark:text-neutral-200">
                        {balance} FTM
                    </h1>}
                    {account && balance && <h1 className="mb-4 text-1xl text-neutral-600 dark:text-neutral-200">
                        $ {balance / 5 || 0} USD
                    </h1>}
                    {!account && <button
                        type="button"
                        className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                        data-te-ripple-init
                        data-te-ripple-color="light" onClick={createAccount}>
                        CREATE
                    </button>}
                    {!account && <button
                        type="button"
                        className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                        data-te-ripple-init
                        data-te-ripple-color="light" onClick={() => setShowRecoverInput(true)}>
                        RECOVER
                    </button>}
                    {showRecoverInput && <input type='text' onKeyDown={handleKeyDown}></input>}

                    <div className="flex flex-col justify-center items-center gap-2">
                        <input type="text"
                               className="peer block w-[40%] rounded border-0  px-3 py-[0.32rem] leading-[1.6] outline-none"
                               id="exampleFormControlInput1"
                               placeholder="Recipient"
                           onChange={ (event) => setRecipient(event.target.value)}
                               />
                        <input type="text"
                               className="peer block w-[40%] rounded border-0  px-3 py-[0.32rem] leading-[1.6] outline-none"
                               id="exampleFormControlInput1"
                               placeholder="Amount" onChange={ (event) => setAmount(event.target.value)}/>
                        <button type="button"
                                className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] text-xl"
                                data-te-ripple-init
                                data-te-ripple-color="light" onClick={sendToken}>
                            SEND
                        </button>
                    </div>
                </div>
                <div
                    className="border-t-2 border-neutral-100 px-6 py-3 dark:border-neutral-600 dark:text-neutral-50">
                    {account && accountBalance && <p>TOKEN - {accountBalance} {tokenName}</p>}
                </div>
            </div>
        </>

    )
}

export default App;

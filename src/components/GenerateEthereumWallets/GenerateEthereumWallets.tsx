import React, { useState } from "react";
import EthWallet from 'ethereumjs-wallet'
import './GenerateEthereumWallets.css';

// API Key from https://etherscan.io/
const apiKey = ""

const generateWallets = (walletCount: number): IWalletMap => {
    if (walletCount > 20) {
        console.log("Sorry, 20 is the max.")
        walletCount = 20;
    }

    const walletMap: IWalletMap = {}

    for (let i = 0; i < walletCount; i++) {
        const newWallet = EthWallet.generate();
        const publicAddress: string = newWallet.getAddressString();
        const privateKey: string = newWallet.getPrivateKeyString()

        walletMap[publicAddress] = privateKey;
    }
    return walletMap;
}

const addressQueryParam = (wallets: {}): string => {
    return Object.keys(wallets).join(",");
}

const GenerateEthereumWallets: React.FunctionComponent = () => {
    const [wallets, setWallets] = useState<IWallets>({});
    const [jackpot, setJackpot] = useState<IWallets>({})

    const generateOnce = (): void => {
        const walletMap = generateWallets(20);

        const onSuccess = (response: IResponse): void => {
            setWallets({});

            const tempWallets: IWallets = {};
            const jackpotWallets: IWallets = {};

            response.result.forEach((account: IAccount) => {
                const accountInfo = {
                    balance: account.balance,
                    privateKey: walletMap[account.account]
                }

                if (account.balance !== "0") {
                    jackpotWallets[account.account] = accountInfo;
                }

                tempWallets[account.account] = accountInfo;
            });

            setJackpot(jackpotWallets);
            setWallets(tempWallets);
        }

        const onError = (error: any): void => {
            console.log(error);
        }

        const getWalletBalanceURL = `https://api.etherscan.io/api?module=account&action=balancemulti&address=${addressQueryParam(walletMap)}&tag=latest&apikey=${apiKey}`

        fetch(getWalletBalanceURL)
            .then(response => response.json())
            .then(onSuccess)
            .catch(onError)
    }

    const generateMultipleTimes = (): void => {
        // currently set to 100 to test. However, the stop condition in reality would be to check if we hit a jackpot.
        const maxIterations = 100;

        let currentIterationCount = 0;

        const intervalCallback = setInterval(() => {
            if (currentIterationCount >= maxIterations) clearInterval(intervalCallback);
            currentIterationCount++
            generateOnce();
        }, 1000)
    }

    return (
        <div>
            <button className="generate-wallets-button" onClick={generateOnce}>Generate Ethereum Wallets Once</button>
            <button className="generate-wallets-button" onClick={generateMultipleTimes}>Generate Ethereum Wallets Many Times</button>

            <table className="wallet-table">
                <thead>
                <tr>
                    <th>Balance</th>
                    <th>Public Key</th>
                    <th>Private Key</th>
                </tr>
                </thead>
                <tbody>
                {Object.keys(jackpot).map(jackpotKey => (
                    <tr key={jackpotKey}>
                        <th className="wallet-table__balance">{jackpot[jackpotKey].balance}</th>
                        <th className="wallet-table__public-key">
                            <a className="wallet-table__jackpot" href={`https://etherscan.io/address/${jackpotKey}`} target="_blank" rel="noreferrer">{jackpotKey}</a>
                        </th>
                        <th className="wallet-table__private-key">{jackpot[jackpotKey].privateKey}</th>
                    </tr>
                ))}
                </tbody>
            </table>

            <table className="wallet-table">
                <thead>
                <tr>
                    <th>Balance</th>
                    <th>Public Key</th>
                    <th>Private Key</th>
                </tr>
                </thead>
                <tbody>
                {Object.keys(wallets).map(walletKey => (
                    <tr key={walletKey}>
                        <th className="wallet-table__balance">{wallets[walletKey].balance}</th>
                        <th className="wallet-table__public-key">
                            <a href={`https://etherscan.io/address/${walletKey}`} target="_blank" rel="noreferrer">{walletKey}</a>
                        </th>
                        <th className="wallet-table__private-key">{wallets[walletKey].privateKey}</th>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

interface IWalletMap {
    [key: string]: string;
}

interface IWallets {
    [key: string]: {
        balance: string;
        privateKey: string;
    }
}

interface IResponse {
    status: string;
    message: string;
    result: [IAccount];
}

interface IAccount {
    account: string;
    balance: string;
}

export default GenerateEthereumWallets;

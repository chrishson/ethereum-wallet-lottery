import React, { useState } from "react";
import EthWallet from 'ethereumjs-wallet'
import './GenerateEthereumWallets.css';
import {getWalletsAsync, IWallet, IWalletsQueryResults} from "../../api/etherscan";

interface IWalletPublicPrivateKeyPair {
    [key: string]: string;
}

interface IWalletBalanceAndPrivateKeys {
    [key: string]: {
        balance: string;
        privateKey: string;
    }
}

const generateWallets = (walletCount: number): IWalletPublicPrivateKeyPair => {
    if (walletCount > 20) {
        console.log("Sorry, 20 is the max.")
        walletCount = 20;
    }

    const walletMap: IWalletPublicPrivateKeyPair = {}

    for (let i = 0; i < walletCount; i++) {
        const newWallet = EthWallet.generate();
        const publicAddress: string = newWallet.getAddressString();
        const privateKey: string = newWallet.getPrivateKeyString()

        walletMap[publicAddress] = privateKey;
    }
    return walletMap;
}

const walletAddressQueryParam = (wallets: {}): string => {
    return Object.keys(wallets).join(",");
}

const GenerateEthereumWallets: React.FunctionComponent = () => {
    const [wallets, setWallets] = useState<IWalletBalanceAndPrivateKeys>({});
    const [jackpot, setJackpot] = useState<IWalletBalanceAndPrivateKeys>({})

    const generateOnce = async () => {
        const walletMap = generateWallets(20);
        const walletBalances: IWalletsQueryResults = await getWalletsAsync(walletAddressQueryParam(walletMap))

        setWallets({});

        const tempWallets: IWalletBalanceAndPrivateKeys = {};
        const jackpotWallets: IWalletBalanceAndPrivateKeys = {};

        walletBalances.result.forEach((wallet: IWallet) => {
            const accountInfo = {
                balance: wallet.balance,
                privateKey: walletMap[wallet.account]
            }

            if (wallet.balance !== "0") {
                jackpotWallets[wallet.account] = accountInfo;
            }

            tempWallets[wallet.account] = accountInfo;
        });

        setWallets(tempWallets);
        setJackpot(jackpotWallets);

    }

    const generateMultipleTimes = (): void => {
        // currently set to 100 to test. However, the stop condition in reality would be to check if we hit a jackpot.
        const maxIterations = 10000;

        let currentIterationCount = 0;

        const intervalCallback = setInterval(async () => {
            if (currentIterationCount >= maxIterations) clearInterval(intervalCallback);
            currentIterationCount++
            await generateOnce();
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

export default GenerateEthereumWallets;

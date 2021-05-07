import {getWalletsQuery} from "./endpoints";

export interface IWallet {
    account: string;
    balance: string;
}

export interface IWalletsQueryResults {
    status: string;
    message: string;
    result: [IWallet];
}
export const getWalletsAsync = async (
    wallets: string
): Promise<IWalletsQueryResults> => {

    const res = await fetch(getWalletsQuery(wallets))

    if (res.status >= 400) {
        throw new Error('Bad response from server');
    }

    return res.json() as Promise<IWalletsQueryResults>;
}
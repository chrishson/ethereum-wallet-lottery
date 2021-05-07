const ETHERSCAN_URI = `https://api.etherscan.io`
const API_KEY = ``

export const getWalletsQuery = (
    wallets: string
) => {
    return `${ETHERSCAN_URI}/api?module=account&action=balancemulti&address=${wallets}&tag=latest&apikey=${API_KEY}`
}

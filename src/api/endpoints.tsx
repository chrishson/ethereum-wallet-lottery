const ETHERSCAN_URI = `https://api.etherscan.io`
const API_KEY = `52Z4PW9K9MJPHK95FNFA7T57F4G6S2PPCE`

export const getWalletsQuery = (
    wallets: string
) => {
    return `${ETHERSCAN_URI}/api?module=account&action=balancemulti&address=${wallets}&tag=latest&apikey=${API_KEY}`
}

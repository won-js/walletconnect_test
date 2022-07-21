import axios, { AxiosInstance } from "axios";
import {IAssetData, IParsedTx} from "./types";
import {getChainData, isAvalanche, sanitizeHex} from "./utilities";
import Web3 from "web3"
import {convertAmountToRawNumber, convertStringToHex} from "./bignumber";

const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function apiGetAccountAssets(address: string, chainId: number): Promise<IAssetData[]> {
  if(isAvalanche(chainId) === true) {
    const rpcUrl = getChainData(chainId).rpc_url;
    const avaResult = getChainData(chainId).native_currency;
    const web3 = new Web3(rpcUrl);
    const balance = await web3.eth.getBalance(address);
    avaResult.balance = balance;
    return new Array(avaResult);
  } else {
    const response = await api.get(`/account-assets?address=${address}&chainId=${chainId}`);
    const {result} = response.data;
    return result;
  }
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: number,
): Promise<IParsedTx[]> {
  const response = await api.get(`/account-transactions?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export const apiGetAccountNonce = async (address: string, chainId: number): Promise<string> => {
  if(isAvalanche(chainId) === true) {
    const rpcUrl = getChainData(chainId).rpc_url;
    const web3 = new Web3(rpcUrl);
    const nonce = await web3.eth.getTransactionCount(address, "pending")
    return String(nonce);
  } else {
    const response = await api.get(`/account-nonce?address=${address}&chainId=${chainId}`);
    const {result} = response.data;
    return result;
  }
};

export const apiGetGasPrices = async (chainId: number): Promise<string> => {
  if(isAvalanche(chainId) === true) {
    const rpcUrl = getChainData(chainId).rpc_url;
    const web3 = new Web3(rpcUrl);
    const gasPrice = await web3.eth.getGasPrice();
    return sanitizeHex(convertStringToHex(gasPrice));
  } else {
    const response = await api.get(`/gas-prices`);
    const {result} = response.data
    const gasPrice = result.slow.price;
    return sanitizeHex(convertStringToHex(convertAmountToRawNumber(gasPrice, 9)));
  }
};

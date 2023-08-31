import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { abi } from "../../constants/abi";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

export const injected = new InjectedConnector();

export default function SimplePay({ cartTotalPrice, buyerInfo, cartData, }) {
  const [hasMetamask, setHasMetamask] = useState(false);
  const [ethToUsdPrice, setEthToUsdPrice] = useState(0)
  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

  useEffect(() => {
    fetch('https://api.binance.com/api/v3/avgPrice?symbol=ETHUSDT')
      .then(res => res.json())
      .then(data => setEthToUsdPrice(+data.price))
  })

  const {
    active,
    activate,
    chainId,
    account,
    library: provider,
  } = useWeb3React();

  async function connect() {
    if (typeof window.ethereum !== "undefined") {
      try {
        await activate(injected);
        setHasMetamask(true);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async function paymentHandler() {
    if (active) {
      const signer = provider.getSigner();
      const contractAddress = "0xac6c600f0f21a3882CcCcd3a784A6B653E78De7B";
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const valueToSendInEther = cartTotalPrice / ethToUsdPrice; // Amount of Ether to send
      const valueToSendInWei = ethers.utils.parseEther(valueToSendInEther.toString());


      try {
        await contract.createOrder(buyerInfo, cartData, 0, { value: valueToSendInWei });
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <>
      {hasMetamask ? (
        active ? (
          "Connected! "
        ) : (
          <button onClick={() => connect()}>Connect Your MetaMask</button>
        )
      ) : (
        <p>Please install <a href="https://metamask.io/download/" target="_blank">metamask</a> </p>
      )}
      {active ? <button onClick={() => paymentHandler()}>Pay {cartTotalPrice}</button> : ""}
    </>
  );
}
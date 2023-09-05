import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Button } from '@material-ui/core'
import { red } from "@material-ui/core/colors";

import contractsData from "../../constants/contractsData";


export const injected = new InjectedConnector();

export default function SimplePay({ cartTotalPrice, buyerInfo, cartData, }) {
  const [hasMetamask, setHasMetamask] = useState(false);
  const [paymentError, setPaymentError] = useState(false);

  const receiverAddress = '0xF6865bca2BD92336E68Bbb6E2B3F4F7838307826'

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
  });

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

  async function paymentHandler(contractAddress, abi, decimals) {
    if (active) {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const weiAmount = ethers.utils.parseUnits(`${cartTotalPrice}`, decimals);
      console.log(weiAmount)
      try {
        await contract.transfer(receiverAddress, weiAmount);
      } catch (error) {
        console.error(error.code)
        error.code === -32000 || 'UNPREDICTABLE_GAS_LIMIT' ?
          setPaymentError("You don't have enuogh fund for this transaction") :
          setPaymentError('An error has occurred')
      }
    } else {
      console.log("Please install MetaMask");
    }
  }

  return (
    <>
      {hasMetamask ? (
        active ? (
          ""
        ) : (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            size="large"
            onClick={() => connect()}
          >Connect Your MetaMask</Button>
        )
      ) : (
        <p>Please install <a href="https://metamask.io/download/" target="_blank">metamask</a> </p>
      )}
      {active ?
        Object.entries(contractsData).map(([key, value]) => (
          <Button
            key={key}
            variant="contained"
            color="primary"
            fullWidth
            type="submit"
            size="large"
            onClick={() => paymentHandler(value.address, value.abi, value.decimals)}
          >Pay ${cartTotalPrice} with {key}
          </Button >
        ))
        : "null"
      }
      {paymentError && <p style={{ "color": red[700] }}>{paymentError}</p>}
    </>
  );
}
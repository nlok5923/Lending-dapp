import React from "react"
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import "./App.scss"
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
import contractArtifact from "./ethereum/LendNSST.json";
import getEthToUsdPrice from "./Services/getEthUsdPrice";
import toast, { Toaster } from "react-hot-toast";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { Rings } from "react-loader-spinner";

const App = () => {

  const [ethAmount, setEthAmount] = React.useState(0)
  const [currentAddress, setCurrentAddress] = useState('');
  const [etherProvider, setEtherProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState('0x66A88B2EE9a9a0Fe1681DbE23Eca2AA33a846518');
  const [ethToUsd, setEthToUsd] = useState(0);
  const [token, setTokens] = useState(0);
  const [tokenToWithdraw, setTokenToWithdraw] = useState(0);
  const [isLoad, setIsLoad] = useState(false);

  const _raiseError = () => {
    // need to notify user
    toast.error("Prolly you'll need metamask!");
  }

  const _initEthers = async () => {
    let ethProvider = new ethers.providers.Web3Provider(window.ethereum);
    setEtherProvider(ethProvider);
    let contractInstance = new ethers.Contract(contractAddress, contractArtifact.abi, ethProvider.getSigner(0));
    setContract(contractInstance);
    _setTokens();
  }

  const _setCurrentAddress =  async () => {
    if (window.ethereum === undefined) {
      _raiseError();
      return;
    }
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log(selectedAddress);
    setCurrentAddress(selectedAddress)
    if(selectedAddress !== '') {
     await _initEthers();
    }
    window.ethereum.on("accountsChanged", async ([newAddress]) => {
      if (newAddress === undefined) {
        return this._resetState();
      }
      const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAddress(selectedAddress);
    });
  } 

  const _setTokens = async () => {
    if(contract != null) {
      let noOfTokens = await contract.status(currentAddress);
      console.log("tokens", noOfTokens);
      setTokens(parseInt(noOfTokens.debt) / 100000000);
      let price = await getEthToUsdPrice();
      console.log(price);
      setEthToUsd(price);
    }
  }

  useEffect(() => {
    _setCurrentAddress();
    console.log("called");
  }, [])

  useEffect(() => {
    _setTokens();
  },[contract])

  const stakeEth = async () => {
    try {
      console.log("called");
      let _usdCoins = ethAmount * ethToUsd * 100000000;
      console.log(_usdCoins.toFixed(0) + " " + "ans" + ethers.utils.parseEther(ethAmount).toString());
      let transaction = await contract.depositEther(_usdCoins.toFixed(0), { value: ethers.utils.parseEther(ethAmount) });
      setIsLoad(true);
      let receipt = await transaction.wait();
      setIsLoad(false);
      toast.success("Deposit succesfull !!");
      window.location.reload();
    } catch(err) {
      toast.error("Something may be wrong");
      console.log(err.message);
    }
  }

  const withDrawEth = async () => {

    try {

      if(tokenToWithdraw > token) { 
        toast.error("You don't have enough tokens");
        return;
      }
      let ethValue = tokenToWithdraw / ethToUsd;
      console.log(ethValue);
      let value = ethers.utils.parseEther(ethValue.toFixed(5).toString());
      console.log(ethAmount, tokenToWithdraw, ethToUsd, value);
      console.log(value.toString());
      const txn = await contract.withDrawEther(value.toString(), tokenToWithdraw * 100000000);
      setIsLoad(true);
      const txnReceipt = await txn.wait();
      setIsLoad(false);
      toast.success("Withdraw succesfull !!");
      window.location.reload();
    } catch(err) {
      toast.error("Something may be wrong");
      console.log(err.message);
    }
  }

  return (
    <div>
      <Toaster />
      <div className="bg"></div>
      <div className="bg bg2"></div>
      <div className="bg bg3"></div>
      <div className="content">
        <input type="number" name="ethAmount" className="mail" required placeholder="Enter eth to deposit" onChange={e => setEthAmount(e.target.value)} /> <br />
        <button className="btn" onClick={() => stakeEth()} > Deposit </button>
      </div>
      <div className="withDraw">
        <input type="number" name="ethAmount" className="mail" required placeholder="Enter tokens" onChange={e => setTokenToWithdraw(e.target.value)} /> <br />
        <button className="btn" onClick={() => withDrawEth()} > Widthdraw </button>
        <p>PS: Withdraw only integer no of stable coins currently 😅</p>
      </div>
      <div className="loader">
      {isLoad && <Rings color="rgb(230, 182, 230)" height={80} width={80} />}
      </div>
      { !isLoad && <h1 className="balance">Balance: {token} NSST</h1> }
    </div>
  );
}

export default App;

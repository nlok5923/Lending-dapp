import React from "react"
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import "./App.scss"
import { useState, useEffect } from "react"
import { ethers } from 'ethers';
import contractArtifact from "./ethereum/LendNSST.json";
import getEthToUsdPrice from "./Services/getEthUsdPrice";
import toast, { Toaster } from "react-hot-toast";

const App = () => {

  const [ethAmount, setEthAmount] = React.useState(0)
  const [currentAddress, setCurrentAddress] = useState('');
  const [etherProvider, setEtherProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [contractAddress, setContractAddress] = useState('0x879055f042F748D1A7163dA8BAA2dc0fa801a088');
  const [ethToUsd, setEthToUsd] = useState(0);
  const [token, setTokens] = useState(0);
  const [tokenToWithdraw, setTokenToWithdraw] = useState(0);

  const _raiseError = () => {
    // need to notify user
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
      console.log("tokens", );
      setTokens(parseInt(noOfTokens.debt, 16));
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
      let _usdCoins = ethAmount * ethToUsd * 100000000;
      console.log(_usdCoins.toFixed(0));
      await contract.depositEther(_usdCoins.toFixed(0), { value: ethers.utils.parseEther(ethAmount) });
      toast.success("Deposit succesfull !!");
    } catch(err) {
      toast.error("Something may be wrong");
      console.log(err.message);
    }
  }

  const withDrawEth = async () => {

    try {
      let ethValue = tokenToWithdraw / ethToUsd;
      let value = ethers.utils.parseEther(ethValue.toString());
      console.log(ethAmount, tokenToWithdraw, ethToUsd, value);
      console.log(value.toString());
      await contract.withDrawEther(value.toString(), tokenToWithdraw * 100000000);
      toast.success("Withdraw succesfull !!");
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
        <input type="number" name="ethAmount" className="mail" required placeholder="Enter eth" onChange={e => setEthAmount(e.target.value)} /> <br />
        <button className="btn" onClick={() => stakeEth()} > Deposit </button>
      </div>
      <div className="withDraw">
        <input type="number" name="ethAmount" className="mail" required placeholder="Enter tokens" onChange={e => setEthAmount(e.target.value)} /> <br />
        <button className="btn" onClick={() => withDrawEth()} > Widthdraw </button>
      </div>
      <h1 className="balance">Balance: {token} NSST</h1>
    </div>
  );
}

export default App;

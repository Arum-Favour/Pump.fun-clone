"use client"

import { useEffect, useState } from "react"
import { ethers } from 'ethers'

// Components
import Header from "./components/Header"
import List from "./components/List"
import Token from "./components/Token"
import Trade from "./components/Trade"


// ABIs & Config
import Factory from "./abis/Factory.json"
import config from "./config.json"
import images from "./images.json"

export default function Home() {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [factory, setFactory] = useState(null);
  const [fee, setFee] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [tokens, setTokens] = useState([]);

  function toggleCreate() {
    showCreate ? setShowCreate(false) : setShowCreate(true);
  }

  async function loadBlockchain() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(provider);

    const network = await provider.getNetwork();


    const factory = new ethers.Contract(config[network.chainId].factory.address, Factory, provider);
    setFactory(factory)

    const fee = await factory.i_fee();
    setFee(fee);

    const totalTokens = await factory.totalTokens()
    const tokens = []

    for (let i = 0; i < totalTokens; i++) {
      const tokenSale = await factory.getTokenSale(i)
      const token = {
        token: tokenSale.token,
        name: tokenSale.name,
        creator: tokenSale.creator,
        sold: tokenSale.sold,
        raised: tokenSale.raised,
        isOpen: tokenSale, isOpen,
        image: images[i]
      }
      tokens.push(token)

    }

    setTokens(tokens.reverse())
  }

  useEffect(() => {
    loadBlockchain()
  }, [])
  return (
    <div className="page">
      <Header account={account} setAccount={setAccount} />

      <main>
        <div className="create">
          <button onClick={factory && account && toggleCreate} className="btn--fancy">
            {!factory ? ("[contract not deployed]") : !account ? ("[Please Connect]") : ("[Start a new Token]")}

          </button>
        </div>
      </main>

      {showCreate && (
        <List toggleCreate={toggleCreate} fee={fee} provider={provider} factory={factory} />
      )}


    </div>
  );
}

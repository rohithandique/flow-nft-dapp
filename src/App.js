//importing required libraries
import React, { useState, useEffect } from "react";
import './App.css';
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import twitterLogo from "./assets/twitter-logo.svg";

//importing cadence scripts & transactions
import { mintNFT } from "./cadence/transactions/mintNFT_tx"
import { getMetadata } from "./cadence/scripts/getMetadata_script";
import { getIDs } from "./cadence/scripts/getID_script"
import { getTotalSupply } from "./cadence/scripts/getTotalSupply_script"

const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

//required fcl configuration
fcl.config({
  "flow.network": "testnet",
  "app.detail.title": "Test App",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "app.detail.icon": "https://placekitten.com/g/200/200",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
});

function App() {

  //creating the state variables
  const [ user, setUser ] = useState();
  const [ images, setImages ] = useState([])
  const [ network, setNetwork ] = useState();

  //logging in and out functions
  const logIn = () => {
    fcl.authenticate();
  }

  const logOut = () => {
    setImages([]); //clears all images stored in state when an user logs out
    fcl.unauthenticate();
  }

  const mint = async() => {

    let _totalSupply;

    try{
      _totalSupply = await fcl.query({
        cadence: `${getTotalSupply}`
      })
    } catch(err) {
      console.log(err)
    }

    const _id = parseInt(_totalSupply) + 1;

    const transactionId = await fcl.mutate({
      cadence: `${mintNFT}`,
      args: (arg, t) => [
        arg(user.addr, types.Address), //address to which NFT should be minted
        arg("Cryptopunk "+_id.toString(), types.String),
        arg("CryptoPunk", types.String),
        arg("https://cryptopunks.app/cryptopunks/cryptopunk"+_id+".png", types.String),
      ],
      proposer: fcl.currentUser,
      payer: fcl.currentUser,
      limit: 99
    })
    console.log(transactionId)
  }

  const view = async() => {

    setImages([]);
    let IDs = [];

    try {
      IDs = await fcl.query({
        cadence: `${getIDs}`,
        args: (arg, t) => [
          arg(user.addr, types.Address), 
        ],
      })
    } catch(err) {
      console.log("No NFTs Owned")
    }

    console.log(IDs)
    
    let _imageSrc = []
    try{
      for(let i=0; i<IDs.length; i++) {
          const result = await fcl.query({
            cadence: `${getMetadata}`,
            args: (arg, t) => [
              arg(user.addr, types.Address), 
              arg(IDs[i].toString(), types.UInt64),
            ],
          })
          _imageSrc.push(result["thumbnail"])
      }
    } catch(err) {
      console.log(err)
    }
    
    console.log(_imageSrc)

    if(images.length < _imageSrc.length) {
      setImages((Array.from({length: _imageSrc.length}, (_, i) => i).map((number, index)=>
        <img style={{margin:"10px", height: "150px"}} src={_imageSrc[index]} key={number} alt={"NFT #"+number}
        />
      )))
    }
  }

  useEffect(() => {
    //listens to changes in the user objects
    //changes when the user logs in or logs out
    fcl.currentUser().subscribe(setUser);
  }, [])

  useEffect(()=>{
    //adding an event listener to check for network changes
    //only works for lilico - testnet to mainnet - changes
    window.addEventListener("message", d => {
      if(d.data.type==='LILICO:NETWORK') setNetwork(d.data.network)
    })
  }, [])

  const RenderGif = () => {
    const gifUrl = user?.addr
        ? "https://i.giphy.com/media/QhHpAbDuUp1mJTA6JI/giphy.webp"
        : "https://i.giphy.com/media/Y2ZUWLrTy63j9T6qrK/giphy.webp";
    return <img className="gif-image" src={gifUrl} height="150px" alt="meme"/>;
  };

  const RenderButton = () => {
    return (
      <div>
        {user && user.addr ? (
          <div>

            <div className="button-container">
              <button className="cta-button" onClick={() => mint()}>
                Mint
              </button>

              <button className="cta-button" onClick={() => view()}>
                View
              </button>
            </div>

            {images ? images : ""}
          </div>
        ) : (
          <button className="cta-button button-glow" onClick={() => logIn()}>
            Log In
          </button>
        )}
      </div>
    );
  };

  const RenderLogout = () => {
    if (user && user.addr) {
      return (
        <div className="logout-container">
          <button className="cta-button logout-btn" onClick={() => logOut()}>
              {user.addr}
          </button>
        </div>
      );
    }
    return undefined;
  };

  return (
    <div className="App">
      {network === "mainnet" ? alert("You're on Mainnet. Please change it to Testnet") : ""}
      <RenderLogout />

      <div className="container">
        <div className="header-container">
          <div className="logo-container">
            <img src="./logo.png" className="flow-logo" alt="flow logo"/>
            <p className="header">Flow</p>
          </div>

          <RenderGif />
          <p className="sub-text">Built for the next generation of apps and games</p>
        </div>

        <RenderButton />

        <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a className="footer-text" href={TWITTER_LINK} target="_blank" rel="noreferrer">{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
}

export default App;
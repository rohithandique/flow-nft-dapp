//importing required libraries
import React, { useState, useEffect } from "react";
import './App.css';
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

//importing cadence scripts & transactions
import {mintNFT} from "./cadence/transactions/mintNFT_tx"
import {viewNFT} from "./cadence/scripts/viewNFT_script"
import { getIDs } from "./cadence/scripts/getID_script"

//required fcl configuration
fcl.config()
  .put("flow.network", "testnet")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")

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

    const _id = Math.floor(Math.random() * 10000);
    
    const transactionId = await fcl.send([
      fcl.transaction(mintNFT),
      fcl.args([
        fcl.arg("https://cryptopunks.app/cryptopunks/cryptopunk"+_id.toString()+".png", types.String),
        fcl.arg("Cryptopunk "+_id.toString(), types.String)
      ]),
      fcl.payer(fcl.currentUser),
      fcl.proposer(fcl.currentUser),
      fcl.authorizations([fcl.currentUser]),
      fcl.limit(9999)
    ]).then(fcl.decode)
    console.log(transactionId)
  }

  const view = async() => {
    setImages([]);
    let IDs = [];
    try {
      IDs = await fcl.send([
        fcl.script(getIDs),
        fcl.args([
          fcl.arg(user.addr, types.Address),
        ]),
      ]).then(fcl.decode);
    } catch(err) {

    }

    let _imageSrc = []
    for(let i=0; i<IDs.length; i++) {
      const result = await fcl.send([
        fcl.script(viewNFT),
        fcl.args([
          fcl.arg(user.addr, types.Address),
          fcl.arg(IDs[i], types.UInt64),
        ]),
      ]).then(fcl.decode);
      _imageSrc.push(result[0])
    }
    if(images.length < _imageSrc.length) {
      setImages((Array.from({length: _imageSrc.length}, (_, i) => i).map((number, index)=>
        <img src={_imageSrc[index]} key={number} alt={"NFT #"+number}
        />
      )))
    }
  }

  useEffect(() => {
    fcl.currentUser().subscribe(setUser);
  }, [])

  useEffect(()=>{
    window.addEventListener("message", d => {
      if(d.data.type==='LILICO:NETWORK') setNetwork(d.data.network)
    })
  }, [])

  return (
    <div className="App">
      {network === 'mainnet' ? alert("You're on Mainnet. Please change it to Testnet") : ""}
      <h1>Hello</h1>
      { user && user.addr ? <h3>{user.addr}</h3> : "" }
      <div>
      { user && user.addr ? 
        <button className="auth-button" onClick={()=>logOut()}>
        Log Out
        </button> 
        : 
        <button className="auth-button" onClick={()=>logIn()}>
        Log In
        </button>
      }
      </div>
      <div>
      { user && user.addr ? 
        <>
          <button className="cta-button" onClick={()=>mint()}>
            Mint
            </button>
          <div>
            <button className="cta-button" onClick={()=>view()}>
            View
            </button>
          </div>
      
        </>
      : "" }
      </div>
      <div>
      { user && user.addr && images ? images : ""}
      </div>
    </div>
  );
}

export default App;

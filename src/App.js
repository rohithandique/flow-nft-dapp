import React, { useState, useEffect } from "react";
import './App.css';
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

import {mintNFT} from "./cadence/transactions/mintNFT_tx"
import {viewNFT} from "./cadence/scripts/viewNFT_script"
import { getIDs } from "./cadence/scripts/getID_script"

fcl.config()
  .put("flow.network", "testnet")
  .put("accessNode.api", "https://rest-testnet.onflow.org")
  .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn")

function App() {

  const [ user, setUser ] = useState();
  const [ images, setImages ] = useState([])

  const logIn = () => {
    fcl.authenticate();
  }

  const logOut = () => {
    fcl.unauthenticate();
  }

  const mint = async() => {
    const IDs = await fcl.send([
      fcl.script(getIDs),
      fcl.args([
        fcl.arg(user.addr, types.Address),
      ]),
    ]).then(fcl.decode);
    const _id = IDs.length
    const transactionId = await fcl.send([
      fcl.transaction(mintNFT),
      fcl.args([
        fcl.arg("https://cryptopunks.app/cryptopunks/cryptopunk3"+_id.toString()+".png", types.String),
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
    const IDs = await fcl.send([
      fcl.script(getIDs),
      fcl.args([
        fcl.arg(user.addr, types.Address),
      ]),
    ]).then(fcl.decode);
    console.log(IDs)
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
  
  return (
    <div className="App">
      <h1>Hello</h1>
      { user && user.addr ? <h3>{user.addr}</h3> : "" }
      { user && user.addr ? 
        <button className="auth-button" onClick={()=>logOut()}>
        Log Out
        </button> 
        : 
        <button className="auth-button" onClick={()=>logIn()}>
        Log In
        </button>
      }
      { user && user.addr ? 
        <>
          <button className="cta-button" onClick={()=>mint()}>
          Mint
          </button>
          <button className="cta-button" onClick={()=>view()}>
          View
          </button>
        </>
      : "" }
      <div>
      { user && user.addr && images ? images : ""}
      </div>
    </div>
  );
}

export default App;

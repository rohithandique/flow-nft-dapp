//importing required libraries
import React, { useState, useEffect } from "react";
import "./App.css";
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import twitterLogo from "./assets/twitter-logo.svg";

//importing cadence scripts & transactions
import { mintNFT } from "./cadence/transactions/mintNFT_tx";
import { viewNFT } from "./cadence/scripts/viewNFT_script";
import { getIDs } from "./cadence/scripts/getID_script";
import { getTotalSupply } from "./cadence/scripts/getTotalSupply_script";

const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

//required fcl configuration
fcl.config()
    .put("flow.network", "testnet")
    .put("accessNode.api", "https://rest-testnet.onflow.org")
    .put("discovery.wallet", "https://fcl-discovery.onflow.org/testnet/authn");

function App() {
    //creating the state variables
    const [user, setUser] = useState();
    const [images, setImages] = useState([]);
    const [network, setNetwork] = useState();

    //logging in and out functions
    const logIn = () => {
        fcl.authenticate();
    };

    const logOut = () => {
        setImages([]); //clears all images stored in state when an user logs out
        fcl.unauthenticate();
    };

    const mint = async () => {
        const _id = Math.floor(Math.random() * 10000);

        /*const transactionId = await fcl.send([
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
    console.log(transactionId)*/

        const transactionId = await fcl.mutate({
            cadence: `${mintNFT}`,
            args: (arg, t) => [
                arg("https://cryptopunks.app/cryptopunks/cryptopunk" + _id.toString() + ".png", types.String),
                arg("Cryptopunk " + _id.toString(), types.String),
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            limit: 99,
        });
        console.log(transactionId);
        const transaction = await fcl.tx(transactionId).onceSealed();
        console.log(transaction);
    };

    const view = async () => {
        setImages([]);
        let IDs = [];
        let _totalSupply;

        try {
            _totalSupply = await fcl.query({
                cadence: `${getTotalSupply}`,
            });
        } catch (err) {
            console.log(err);
        }

        try {
            IDs = await fcl.query({
                cadence: `${getIDs}`,
                args: (arg, t) => [arg(user.addr, types.Address)],
            });
        } catch (err) {
            console.log(err);
        }

        console.log(_totalSupply);
        console.log(IDs);

        let _imageSrc = [];
        try {
            for (let i = 0; i < IDs.length; i++) {
                const result = await fcl.query({
                    cadence: `${viewNFT}`,
                    args: (arg, t) => [arg(user.addr, types.Address), arg(IDs[i], types.UInt64)],
                });
                _imageSrc.push(result[0]);
            }
        } catch (err) {
            console.log(err);
        }

        if (images.length < _imageSrc.length) {
            setImages(
                Array.from({ length: _imageSrc.length }, (_, i) => i).map((number, index) => (
                    <img src={_imageSrc[index]} key={number} alt={"NFT #" + number} />
                ))
            );
        }
    };

    useEffect(() => {
        //listens to changes in the user objects
        //changes when the user logs in or logs out
        fcl.currentUser().subscribe(setUser);
    }, []);

    useEffect(() => {
        //adding an event listener to check for network changes
        //only works for lilico - testnet to mainnet - changes
        window.addEventListener("message", (d) => {
            if (d.data.type === "LILICO:NETWORK") setNetwork(d.data.network);
        });
    }, []);

    const RenderButton = () => {
        return (
            <div>
                {user && user.addr ? (
                    <div>
                        {network === "mainnet" ? alert("You're on Mainnet. Please change it to Testnet") : ""}
                        {user && user.addr ? <h3>Your address: {user.addr}</h3> : ""}

                        <div className="button-container">
                            <button className="cta-button" onClick={() => mint()}>
                                Mint
                            </button>

                            <button className="cta-button" onClick={() => view()}>
                                View
                            </button>

                            <button className="cta-button" onClick={() => logOut()}>
                                Log Out
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

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <div className="logo-container">
                        <img src="./logo.png" className="flow-logo" />
                        <p className="header">Flow</p>
                    </div>
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

To Do:
1. Add input form, instead of hardcoding NFT data and user address

**Important**
To make the app work -
1. Deploy ExampleNFT.cdc from your account.
2. In line 4 of 'setupAccount_tx.js`, line 4 of 'mintNFT_tx.js' and line 3 of 'getTotalSupply_script.js'
   - `import ExampleNFT from 0xb25c3b0e6ed6d79a;`
   - Replace the address with your wallet address with which you deployed the contract.
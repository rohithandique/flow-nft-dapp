export const mintNFT = 
`
import GenericNFT from 0xfc3432b757958af5

transaction(image: String, name: String) {

  prepare(acct: AuthAccount) {

    if acct.borrow<&GenericNFT.Collection>(from: /storage/GenericNFTCollection) == nil {
      acct.save(<- GenericNFT.createEmptyCollection(), to: /storage/GenericNFTCollection)
      acct.link<&GenericNFT.Collection{GenericNFT.CollectionPublic}>(/public/GenericNFTCollection, target: /storage/GenericNFTCollection)
    }

    let nftCollection = acct.borrow<&GenericNFT.Collection>(from: /storage/GenericNFTCollection)!
    nftCollection.deposit(token: <- GenericNFT.mintNFT(image: image, name: name))
  }

  execute {
    log("Minted NFT")
  }
}
`
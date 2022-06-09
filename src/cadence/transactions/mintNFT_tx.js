export const mintNFT = 
`
import GenericNFT from 0xb25c3b0e6ed6d79a

transaction(image: String, name: String) {

  prepare(acct: AuthAccount) {

    if acct.borrow<&GenericNFT.Collection>(from: /storage/NewGenericNFTCollection) == nil {
      acct.save(<- GenericNFT.createEmptyCollection(), to: /storage/NewGenericNFTCollection)
      acct.link<&GenericNFT.Collection{GenericNFT.CollectionPublic}>(/public/NewGenericNFTCollection, target: /storage/NewGenericNFTCollection)
    }

    let nftCollection = acct.borrow<&GenericNFT.Collection>(from: /storage/NewGenericNFTCollection)!
    nftCollection.deposit(token: <- GenericNFT.mintNFT(image: image, name: name))
  }

  execute {
    log("Minted NFT")
  }
}
`
export const getIDs =
`
import GenericNFT from 0xfc3432b757958af5

pub fun main(account: Address): [UInt64] {  

  let nftCollection = getAccount(account).getCapability(/public/GenericNFTCollection)
    .borrow<&GenericNFT.Collection{GenericNFT.CollectionPublic}>()
    ?? panic("Non Existing NFT Collection")

  return nftCollection.getIDs()

}
`
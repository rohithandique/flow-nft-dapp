export const getIDs =
`
import GenericNFT from 0xb25c3b0e6ed6d79a

pub fun main(account: Address): [UInt64] {  

  let nftCollection = getAccount(account).getCapability(/public/NewGenericNFTCollection)
    .borrow<&GenericNFT.Collection{GenericNFT.CollectionPublic}>()
    ?? panic("Non Existing NFT Collection")

  return nftCollection.getIDs()

}
`
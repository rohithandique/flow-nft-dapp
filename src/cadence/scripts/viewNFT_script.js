export const viewNFT =
`
import GenericNFT from 0xfc3432b757958af5

pub fun main(account: Address, id: UInt64): [String] {

  let nftCollection = getAccount(account).getCapability(/public/GenericNFTCollection)
    .borrow<&GenericNFT.Collection{GenericNFT.CollectionPublic}>()
    ?? panic("Non Existing NFT Collection")

  let info: [String] = []
  let nftRef = nftCollection.borrowEntireNFT(id: id)
  info.append(nftRef.image)
  info.append(nftRef.name)
  return info
}
`
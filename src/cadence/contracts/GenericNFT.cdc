import NonFungibleToken from 0x631e88ae7f1d7c20;

pub contract GenericNFT: NonFungibleToken {
    
  pub var totalSupply: UInt64 

  pub event ContractInitialized()
  pub event Withdraw(id: UInt64, from: Address?)
  pub event Deposit(id: UInt64, to: Address?)

  pub resource NFT: NonFungibleToken.INFT {

    pub let id: UInt64;
    pub var image: String;
    pub var name: String;

    init(_image: String, _name: String) {
      self.id = GenericNFT.totalSupply;
      GenericNFT.totalSupply = GenericNFT.totalSupply + 1;

      self.image = _image;
      self.name = _name;
    }
  }

  pub resource interface CollectionPublic {
    pub fun deposit(token: @NonFungibleToken.NFT)
    pub fun getIDs(): [UInt64]
    pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
    pub fun borrowEntireNFT(id: UInt64): &NFT
  }

  pub resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, CollectionPublic {
    
    pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
        let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("non existing NFT")

        emit Withdraw(id: token.id, from: self.owner?.address)
        return <- token;
    }

    pub fun deposit(token: @NonFungibleToken.NFT) {
        let token <- token as! @GenericNFT.NFT

        emit Deposit(id: token.id, to: self.owner?.address)

        self.ownedNFTs[token.id] <-! token
    }

    pub fun getIDs(): [UInt64] {
      return self.ownedNFTs.keys;
    }

    pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
      return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
    }

    pub fun borrowEntireNFT(id: UInt64): &NFT {
      let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT?;
      return ref as! &NFT;
    }

    init() {
        self.ownedNFTs <- {}
    }

    destroy() {
      destroy self.ownedNFTs;
    }
 
  }

  pub fun createEmptyCollection(): @NonFungibleToken.Collection {
    return <- create Collection()
  }

  pub fun mintNFT(image: String, name: String): @NonFungibleToken.NFT {
    return <- create NFT(_image: image, _name: name)
  }

  init() {
    self.totalSupply = 0;
  }

}
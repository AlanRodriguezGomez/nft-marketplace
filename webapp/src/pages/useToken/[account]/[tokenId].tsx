import { useRouter } from 'next/router'
import { useEffect,useState } from 'react'
import ConnectMetamask from '../../../components/ConnectMetamask'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from "@ethersproject/contracts";
import { addressNFTContract, addressMarketContract }  from '../../../projectsetting'
import { BigNumber, ethers } from 'ethers';
import { Button, Text } from "@chakra-ui/react"



export default function CommentPage() {
  const router = useRouter()
  const id = router.query.tokenId as string
  const address = router.query.account as string

  const abiJSON = require("../../../abi/NFTMarketplace.json")
  const abi = abiJSON.abi
  const [items,setItems] = useState<[]>()

  const {  account, active, library} = useWeb3React<Web3Provider>()

  useEffect( () => {
    if(! active)
      setItems(undefined)

    if(!(active && account && library)) return

    // console.log(addressContract,abi,library)
    const market:Contract = new Contract(addressMarketContract, abi, library.getSigner());
    console.log(market.provider)
    console.log(account)
    console.log(address)
    console.log(id)

},[active,account])

async function useNFTMarket(event:React.FormEvent,itemId:BigNumber) {
  event.preventDefault()

  if(!(active && account && library)) return

     //TODO check whether item is available beforehand

    const market:Contract = new Contract(addressMarketContract, abi, library.getSigner());
  
    market.usedMarketItemMerchant( 
      id, 
      address
    ).catch('error', console.error)

  //called only when changed to active
  }


  return (
    <>

      <ConnectMetamask />
      
      <h1>TokenId: {id}</h1>
      { active && typeof account === 'string' ? <Button width={220} type="submit" onClick={(e)=>useNFTMarket(e,BigNumber.from(id))}>Redeem NFT</Button> : <Text>Conectate para redeemer el token</Text>}
    </>
  )
}
import { useEffect,useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Contract } from "@ethersproject/contracts";
import { addressNFTContract, addressMarketContract, pinataKey, pinataSecret }  from '../projectsetting'
import { BigNumber, ethers } from 'ethers';
import { Button, Grid, Input, GridItem, FormControl, FormLabel, Center, Box  } from "@chakra-ui/react"
import ConnectMetamask from '../components/ConnectMetamask'
import axios from 'axios';




export default function CommentPage() {
  
    const [imageFile, setImageFile] = useState('')
    const [image, setImage] = useState('')
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [currId, setCurrId] = useState(null);

    const abiJSON = require("../abi/BadgeToken.json")
    const abi = abiJSON.abi
    
    const abiJSONMarket = require("../abi/NFTMarketplace.json")
    const abiMarket = abiJSONMarket.abi

    const {  account, active, library} = useWeb3React<Web3Provider>()


    async function createNFTMarketItem(uri:string, name: string,description:string) {

        if(!(active && account && library)) return
      
        const nft:Contract = new Contract(addressNFTContract, abi, library.getSigner());
        console.log(nft.provider)
        console.log(account)


        await(await nft.mintTo(account, uri).catch('error', console.error)).wait()

        const nftGet:Contract = new Contract(addressNFTContract, abi, library);
        
        let result = await nftGet._getCurrentTokenId().then((result:any)=>{
            return result._hex
        });

        console.log('result', result);

        let id = parseInt(result.replace('0x',''));

        console.log('id', id);

        await(await nft.approve(addressMarketContract, id).catch('error', console.error)).wait();

        console.log('approved!');

        const market:Contract = new Contract(addressMarketContract, abiMarket, library.getSigner());

        const auctionPrice = ethers.utils.parseUnits('1', 'ether')
        const listingFee = ethers.utils.parseUnits('0.025', 'ether')

        await (await market.createMarketItem(addressNFTContract, id, auctionPrice, name, description, { value: listingFee}).catch('error', console.error)).wait();

        console.log('created Item!');

    }

    const sendFileToIPFS = async (e) => {
        e.preventDefault()
        console.log('Creating NFT!');
        if (!imageFile || !name || !description) return
        
        try {

            const formData = new FormData();
            formData.append("file", imageFile);

            const resFile = await axios({
                method: "post",
                url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                data: formData,
                headers: {
                    'pinata_api_key': pinataKey,
                    'pinata_secret_api_key': pinataSecret,
                    "Content-Type": "multipart/form-data"
                },
            });

            const ImgHash = `https://ipfs.io/ipfs/${resFile.data.IpfsHash}`;
            console.log('image to NFT', ImgHash);
            createNFTMarketItem(ImgHash, name, description); 

        } catch (error) {
            console.log("Error sending File to IPFS: ")
            console.log(error)
        }
        
    }

  return (
    <>
      <Box h='calc(100vh)'>
        <ConnectMetamask />

        <form onSubmit={sendFileToIPFS}>
            <Grid templateColumns='repeat(2, 1fr)' gap={6}>
                <GridItem w='100%' h='75'>
                    <FormControl>
                        <FormLabel>Nombre</FormLabel>
                        <Input variant='outline' placeholder='Nombre' onChange={event => setName(event.currentTarget.value)}/>
                    </FormControl>
                </GridItem>
                <GridItem w='100%' h='75'>
                    <FormControl>
                        <FormLabel>Descripción</FormLabel>
                        <Input variant='outline' placeholder='Descripción' onChange={event => setDescription(event.currentTarget.value)}/>
                    </FormControl>
                </GridItem>
            </Grid>

            <Grid templateColumns='repeat(1, 1fr)' gap={6}>
                <GridItem w='100%' h='75'>
                    <Center>
                        <FormControl>
                            <FormLabel>Imagen NFT</FormLabel>
                            <input type="file" onChange={(e) =>setImageFile(e.target.files[0])} required /> 
                        </FormControl>
                    </Center>
                </GridItem>
            </Grid>
            
            
            <Center>
                <Button width={250} type="submit">Guardar Ticket en Marketplace</Button>
            </Center>          
        </form>
      </Box>
    </>
  )
}
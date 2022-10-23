import { ethers } from "hardhat"

async function main() {
  const BadgeToken = await ethers.getContractFactory("BadgeToken")
  console.log('Deploying BadgeToken ERC721 token...')
  const token = await BadgeToken.deploy('BadgeToken','BADGE')

  await token.deployed()
  console.log("BadgeToken deployed to:", token.address)

  /* deploy the marketplace */
  const Market = await ethers.getContractFactory("NFTMarketplace")
  const market = await Market.deploy()

  console.log("Marketplace deployed to:",market.address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
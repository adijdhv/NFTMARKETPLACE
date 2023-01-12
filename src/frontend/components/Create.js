import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { JWT, pinata_key, secret } from '../api';

//import { create as ipfsHttpClient } from 'ipfs-http-client'
import axios from "axios";
const FormData = require('form-data')
        
const formData = new FormData();
//const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')
const fs = require('fs');
const Create = ({ marketplace, nft }) => {
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [CID,setCID] = useState('')
  const uploadToIPFS = async (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    if (typeof file !== 'undefined') {
      try {
       
       console.log("IMAGE: ",file)
        let formData = new FormData();
        formData.append("file", file);

        const resFile = await axios({
            method: "post",
            url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data: formData,
            headers: {
                'pinata_api_key': `${pinata_key}`,
                'pinata_secret_api_key': `${secret}`,
                "Content-Type": "multipart/form-data"
            },
        });

        const ImgHash = `ipfs://${resFile.data.IpfsHash}`;
        setCID(resFile.data.IpfsHash)
     console.log(ImgHash); 
   



    

 

 
        //const result = await client.add(file)
        
      } catch (error){
        console.log("ipfs image upload error: ", error)
      }
    }
  }
  const createNFT = async () => {
    console.log("IN CREATE NFT")
     
    try{
      //const result = await client.add(JSON.stringify({image, price, name, description}))
         let JSON_METADATA = {
        name: name,
        desc: description,
        image: `https://gateway.ipfs.io/ipfs/${CID}`
      }
       
        var data = JSON.stringify({
        "pinataOptions": {
          "cidVersion": 1
        },
        "pinataMetadata": {
          "name": "testing",
          "keyvalues": {
            "customKey": "customValue",
            "customKey2": "customValue2"
          }
        },
        "pinataContent": JSON_METADATA
        
      },
    );
   
      
       
      
      var config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        headers: { 
          'Content-Type': 'application/json', 
          'pinata_api_key': `${pinata_key}`,
                'pinata_secret_api_key': `${secret}`,
        },
        data : data
      };
      
      console.log("AFTER CONFIG")
      const result = await axios(config);
      console.log("AFTER RESULT")
      
      console.log("result data",result.data.IpfsHash);
      console.log("result path: ",result.path);
      mintThenList(result);
    } catch(error) {
      console.log("upload error: ", error)
    }
  }
  const mintThenList = async (result) => {
    const uri = `https://gateway.pinata.cloud/ipfs/${result.data.IpfsHash}`
    
    await(await nft.mint(uri)).wait()
    console.log("NFT MINTED!")

     
    const id = await nft.tokenCount()
    console.log("TOKEN ID",id)
   console.log("SETTING APPROVAL")
    await(await nft.setApprovalForAll(marketplace.address, true)).wait()
    console.log("Approved!")

    const listingPrice = ethers.utils.parseEther(price.toString())

    await(await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    console.log("NFT MINTED AND LISTED SUCCESSFULLY")
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
              <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Create
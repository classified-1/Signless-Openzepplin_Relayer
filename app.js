
/*
You can get below in this doc
https://docs.openzeppelin.com/defender/v1/relay#using-web3.js


if you downloaded this code from github, you must install all the modules use
`npm install` to install all modules within project
*/

const { DefenderRelayProvider } = require('defender-relay-client/lib/web3');
const Web3 = require('web3');

//This is node requirement not to create node app server
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const cors = require('cors'); 



app.use(cors()); // Enable CORS for all routes (Node App requirement, not related to WEB3.JS)

/*
  You can get API-KEY and API-SECRECT when you make a new relayer in 
  openzepplin(https://defender.openzeppelin.com/#/relay) in that relayer click setting and 
  in that setting there is option to create new api key, when new api key created you will also get
  API-SECRECT,save it cause it will show only one time
*/
const credentials = { apiKey: process.env.MYAPIKEY, apiSecret: process.env.MYAPISECRETBNBMAINNET }; 
const provider = new DefenderRelayProvider(credentials, { speed: 'fast' });
const web3 = new Web3(provider);

///feed that API-KEY and API-SECRECT  to Relayer
const { Relayer } = require('defender-relay-client');
const relayer = new Relayer({ apiKey: process.env.MYAPIKEY, apiSecret: process.env.MYAPISECRETBNBMAINNET }); 

///Address of contract of which you want to call function and its ABI-CODE
const CONTRACT_ADDRESS = '0x8d2c70E2B981003f5A77373Ba9F9A5ccD86674aa';
const ABI = [ { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "addOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "roomId", "type": "string" }, { "internalType": "address", "name": "winner", "type": "address" } ], "name": "declareWinner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "getAllOwners", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "roomId", "type": "string" } ], "name": "getRoom", "outputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "bool", "name": "", "type": "bool" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bool", "name": "", "type": "bool" }, { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getRoomIds", "outputs": [ { "internalType": "string[]", "name": "", "type": "string[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "roomId", "type": "string" } ], "name": "joinRoom", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "ownerToRemove", "type": "address" } ], "name": "removeOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ]


///feed that address and abi code to WEB3
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);


/*
  i have created this end point, you can modify it according to your requirement, I'm calling `declareWinner` function
  of my smart contract that function need 2 parameter `roomID` and `winnerAddress`. That `roomID` and `winnerAddress`
  can be anything and change everytime as provided by the user(in my case any one of owner), so i make  
  `:roomId` `:winner` dynamic parameter of URL. that will be provided by user, and before that there is `winner`
  that is fixed that will always same, so choose as per requirement.  
  
  break down of endpoint /winner/:roomId/:winner'
  `/winner` => it a URL e.g if our app is deployed on my own domain name as hassan.com, then if i want to call this
                 endpoint it can be call as hassan.com/winner/testroomId/testPlayerAddress

   `/:roomId` => as mentioned above it can be anything and can be change 
   `/:winner` => as mentioned above it can be anything and can be change 

*/
app.post('/winner/:roomId/:winner', async (req, res) => {
  const roomId = req.params.roomId;
  const winner = req.params.winner;

  /// the method of contract you want to call in my case `declareWinner`
  const encodedData = contract.methods.declareWinner(roomId, winner).encodeABI();

  /*
   This will send transaction(call function) to Our contract on behalf of us, the address that will used
   to call/sending transaction will be the address of relayer account address
  */
  const tx = await relayer.sendTransaction({
    to: CONTRACT_ADDRESS,
    value: '0',
    data: encodedData,
    speed: 'fast',
    gasLimit: 100000,
  });

  res.send(tx);
});


///NODE CODE
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//For local host
//http://127.0.0.1:3000/winner/roomId/winnerAddress
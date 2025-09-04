const path = require("path"); 

const express = require("express");
const router = express.Router();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync(path.join(__dirname, "../proto/user.proto"), {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObj.user;

const client = new userPackage.UserService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );

// Create User 
router.post("/create-user", (req, res) => {
    const { name, balance } = req.body;
  
    client.CreateUser({ name, balance: parseFloat(balance) }, (err, response) => {
      if (err) return res.status(500).json({ error: err.details });
      res.json(response);
    });
  });
    // Get User by ID
    router.get('/:id', (req , res) => {
        const { id } = req.params;
      
        client.GetUserById({ id: parseInt(id) }, (err, user) => {
          if (err) return res.status(404).json({ error: err.details });
          res.json(user);
        });
      });
      

  
// Deposit Wallet 
router.post("/wallet/deposit/:id", (req, res) => {
   const {id} = req.params;
   const {amount } = req.body;
  
    client.DepositWallet({ id, amount: parseFloat(amount) }, (err, response) => {
      if (err) return res.status(500).json({ error: err.details });
      res.json(response);
    });
  });
  
module.exports = router;

  
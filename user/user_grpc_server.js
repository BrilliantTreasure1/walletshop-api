const grpc = require("@grpc/grpc-js");
require('dotenv').config({ path: '../.env' }); 
const protoLoader = require("@grpc/proto-loader");
const pool = require('../db');

const packageDef = protoLoader.loadSync("../proto/user.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObj.user;

// Create User
async function createUser(call, callback) {
    try {
      const { name, balance } = call.request;
      const result = await pool.query(
        "INSERT INTO users (name, balance) VALUES ($1, $2) RETURNING *",
        [name, balance]
      );
      callback(null, result.rows[0]);
    } catch (err) {
      callback(err, null);
    }
  }

  // Get User by ID
async function getUserById(call, callback) {
    try {
      const { id } = call.request;
      const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  
      if (result.rows.length === 0) {
        return callback({ code: grpc.status.NOT_FOUND, details: "User not found" });
      }
  
      callback(null, result.rows[0]);
    } catch (err) {
      callback(err, null);
    }
  }

  // Deposit Wallet
async function depositWallet(call, callback) {
    try {
      const { id, amount } = call.request;
  
      if (!amount || amount <= 0) {
        return callback({
          code: grpc.status.INVALID_ARGUMENT,
          details: "Invalid amount",
        });
      }
  
      const result = await pool.query(
        "UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING *",
        [amount, id]
      );
  
      if (result.rows.length === 0) {
        return callback({ code: grpc.status.NOT_FOUND, details: "User not found" });
      }
  
      callback(null, {
        message: "Wallet deposit successful",
        user: result.rows[0],
      });
    } catch (err) {
      callback(err, null);
    }
  }


function main() {
    const server = new grpc.Server();
    server.addService(userPackage.UserService.service, {
      CreateUser: createUser,
      GetUserById: getUserById,
      DepositWallet: depositWallet,
    });
  
    server.bindAsync(
      "0.0.0.0:50052",
      grpc.ServerCredentials.createInsecure(),
      () => {
        console.log("User gRPC server running on port 50052");
        server.start();
      }
    );
  }
  
  main();
  
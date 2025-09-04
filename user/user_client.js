const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync("../proto/user.proto", {});
const grpcObj = grpc.loadPackageDefinition(packageDef);
const userPackage = grpcObj.user;

const client = new userPackage.UserService(
    "localhost:50052",
    grpc.credentials.createInsecure()
  );

  // Create User
client.CreateUser({ name: "Abolfazl", balance: 1000 }, (err, res) => {
    if (err) return console.error("Error creating user:", err.details);
    console.log("Created user:", res);
  
    // Get User by ID
    client.GetUserById({ id: res.id }, (err, user) => {
      if (err) return console.error("Error fetching user:", err.details);
      console.log("Fetched user:", user);
  
      // Deposit Wallet
      client.DepositWallet({ id: user.id, amount: 500 }, (err, result) => {
        if (err) return console.error("Error depositing:", err.details);
        console.log("Deposit result:", result);
      });
    });
  });
  
  
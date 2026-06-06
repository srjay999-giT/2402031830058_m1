const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function run() {
  await client.connect();
  console.log("Connected to MongoDB!");
  await client.close();
}
run();

const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  const db = client.db("studentDB");
  await db.collection("students").insertOne({
    name: "Jay",
    age: 20
  });

  console.log("Document inserted");
  await client.close();
}
run();

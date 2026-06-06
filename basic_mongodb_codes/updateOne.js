const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  await client.db("studentDB")
    .collection("students")
    .updateOne(
      { name: "Jay" },
      { $set: { age: 21 } }
    );

  console.log("Updated");
  await client.close();
}
run();

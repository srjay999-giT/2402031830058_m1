const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  await client.db("studentDB")
    .collection("students")
    .deleteOne({ name: "Jay" });

  console.log("Deleted");
  await client.close();
}
run();

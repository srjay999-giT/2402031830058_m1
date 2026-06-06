const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient("mongodb://localhost:27017");
  await client.connect();

  const docs = await client.db("studentDB")
    .collection("students")
    .find({})
    .toArray();

  console.log(docs);
  await client.close();
}
run();

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbURL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  console.log("All listings deleted!");
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "68e9b510f674a32340e11d0a",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};
initDB();

const { default: mongoose } = require("mongoose");

const connectDb = async () => {
  try {
    const resp = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDb connected: ${resp.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDb;

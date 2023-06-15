const mongoose = require("mongoose");

exports.db = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((data) => {
        console.log(`connected DB ${data.connection.host}`);
      });
  } catch (error) {
    console.log(process.env.MONGODB_URI);
    console.log("Database connection error: ", error);
  }
};

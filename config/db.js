const mongoose = require("mongoose");

const connectDB = async () => {
  const strConn =
    process.env.NODE_ENV === "development"
      ? process.env.MONGO_URI_DEV
      : process.env.MONGO_URI_PROD;

  // console.log("connect string: ", strConn);
  // console.log("connect mode: ", process.env.NODE_ENV);

  try {
    const conn = await mongoose.connect(`${strConn}`, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      `MongoDB connected: ${conn.connection.host}`.cyan.underline.bold
    );
  } catch (error) {
    console.log(`MongDB connected error: `, error);
  }
};

module.exports = connectDB;

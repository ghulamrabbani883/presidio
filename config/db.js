const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {})
  .then((some) => console.log(`Database connected ${some}`))
  .catch((error) => console.log(`Error in connecting db ${error}`));

  
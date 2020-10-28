const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger("dev"));

app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

/*
mongoose.connect("mongodb://localhost/budget", {
  useNewUrlParser: true,
  useFindAndModify: false
});
*/



mongoose.connect(
  process.env.MONGODB_URI || 'mongodb+srv://oako:ihyc-mongod-db-python-20-dollars@oako-uconn-fsf-hw.hypvl.mongodb.net/HW18?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

// routes
app.use(require("./routes/api.js"));
app.get("/", function(req,res){
  res.sendFile(path.join(__dirname, "public/index.html"));
})

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});

//
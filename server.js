const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const cors = require("cors")
const valuePropositionRoutes = require("./routes/valuePropositionRoutes");


app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
const MongodbURI = process.env.MONGO_URI;
app.use(cors());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//mounting routes
app.use("/api/value-proposition", valuePropositionRoutes);


app.use('/test1', (req, res) => {
   
    res.json("Congratulations on deployement")
})



const port = process.env.PORT || 3004;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Error handling 
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
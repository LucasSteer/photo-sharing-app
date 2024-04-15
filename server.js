const express = require("express");
const app = express();
const photoRoute = express.Router();
const uri = process.env.MongoDBConnectionString;
const mongoose = require("mongoose");

let db;
mongoose.connect(uri).then(() => {
  db = mongoose.connection;
});

app.use("/photos", photoRoute);

photoRoute.get("/:photoID", (req, res) => {
  try {
    var photoID = new mongoose.Types.ObjectId(req.params.photoID);
  } catch (err) {
    return res.status(400).json({
      message:
        "Invalid PhotoID in URL parameter. Must be a single String of 12 bytes or a string of 24 hex characters",
    });
  }

  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "photos",
  });
  let downloadStream = bucket.openDownloadStream(photoID);

  downloadStream.on("data", (chunk) => {
    res.write(chunk);
  });

  downloadStream.on("error", () => {
    res.sendStatus(404);
  });

  downloadStream.on("end", () => {
    res.end();
  });
});

app.use("/", express.static("dist/photo-sharing-app/browser"));

app.listen(3000, function () {
  console.log("listening on 3000");
});

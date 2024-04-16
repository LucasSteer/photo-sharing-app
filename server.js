const express = require("express");
const app = express();
const photoRoute = express.Router();
const uri = process.env.MongoDBConnectionString;
const mongoose = require("mongoose");
const { Readable } = require("stream");

const multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({
  storage: storage,
  limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 },
});

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

photoRoute.post("/", (req, res) => {
  // TODO: permit only image files
  upload.single("photo")(req, res, (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "Upload Request Validation Failed" });
    }

    const readablePhotoStream = new Readable();
    readablePhotoStream.push(req.file.buffer);
    readablePhotoStream.push(null);

    let bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: "photos",
    });

    let uploadStream = bucket.openUploadStream(`${Date.now()}-user-photo`);
    readablePhotoStream.pipe(uploadStream);

    uploadStream.on("error", () => {
      return res.status(500).json({ message: "Error uploading file" });
    });

    uploadStream.on("finish", () => {
      return res.status(201).json({
        message:
          "File uploaded successfully, stored under Mongo ObjectID: " +
          uploadStream.id,
      });
    });
  });
});

app.use("/", express.static("dist/photo-sharing-app/browser"));

app.listen(3000, function () {
  console.log("listening on 3000");
});

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
(() => {
  mongoose.connect(uri).then(async () => {
    db = mongoose.connection;
  });
})();

app.use("/photos", photoRoute);

photoRoute.get("/", async (req, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "photos",
  });

  const cursor = bucket.find({});
  const photos = [];
  for await (const doc of cursor) {
    photos.push(doc.filename); // TODO: create a type for this
  }
  // TODO: error handling

  res.send(photos);
});

photoRoute.get("/:filename", (req, res) => {
  if (!req.params.filename) {
    return res.status(400).json({
      message: "Invalid filename in URL parameter.",
    });
  }

  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "photos",
  });
  let downloadStream = bucket.openDownloadStreamByName(req.params.filename);

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

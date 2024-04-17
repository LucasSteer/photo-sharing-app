import express from "express";
const app = express();
const photosRoute = express.Router(); // TODO: RESTful naming convention for routes
const usersRoute = express.Router();
const uri = process.env.MongoDBConnectionString;
import mongoose from "mongoose";
import { Readable } from "stream";
import multer from "multer";
var storage = multer.memoryStorage();
var upload = multer({
  storage: storage,
  limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 },
});

await mongoose.connect(uri);
let db = mongoose.connection;

const userSchema = new mongoose.Schema({
  email: String,
});
const User = mongoose.model("User", userSchema);

import bodyParser from "body-parser";
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

// TODO: investigate idiomatic gridfs with mongoose
app.use("/photos", photosRoute);

photosRoute.get("/", async (req, res) => {
  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "photos",
  });

  const cursor = bucket.find({});
  const photos = [];
  for await (const doc of cursor) {
    photos.push(doc.filename); // TODO: create a type for this
  }
  // TODO: error handling

  return res.send(photos);
});

photosRoute.get("/:filename", (req, res) => {
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

// TODO: confirm POST is RESTful
photosRoute.post("/", (req, res) => {
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

photosRoute.delete("/:filename", async (req, res) => {
  if (!req.params.filename) {
    return res.status(400).json({
      message: "Invalid filename in URL parameter.",
    });
  }

  const bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "photos",
  });

  try {
    // delete the first image that matches the filename
    const photo = await bucket.find({ filename: req.params.filename }).next();
    bucket.delete(photo._id);
    return res.status(200).json({
      message: `Photo with filename ${req.params.filename} and id ${photo._id} successfully deleted`,
    });
  } catch {
    return res.status(400).json({
      message: `Unable to delete photo with filename ${req.params.filename}`,
    });
  }
});

app.use("/users", usersRoute);

usersRoute.post("/", async (req, res) => {
  if (!req.body.email) {
    return res.status(400).json({ message: "Error creating user" });
  }

  const newUser = new User({
    email: req.body.email,
  });

  await newUser.save();

  return res.status(201).json({
    message: "New user created: " + newUser.email,
  });
});

app.use("/", express.static("dist/photo-sharing-app/browser"));

app.listen(3000, function () {
  console.log("listening on 3000");
});

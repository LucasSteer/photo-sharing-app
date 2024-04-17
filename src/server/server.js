import express from "express";
const app = express();
// TODO: RESTful naming convention for routes
// TODO: refactor out routes to clean up server.js
const photosRoute = express.Router();
const usersRoute = express.Router();
const uri = process.env.MongoDBConnectionString;
import mongoose from "mongoose";
import bcrypt from "bcrypt";
const SALT_WORK_FACTOR = 10;
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
  email: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
});
userSchema.pre("save", async function (next) {
  const user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  try {
    // generate a salt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    // hash the password along with our new salt
    const hash = await bcrypt.hash(user.password, salt);

    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  } catch (err) {
    if (err) {
      return next(err);
    }
  }
});
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    if (err) console.error(err);
  }
};
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
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Error creating user" });
  }

  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
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
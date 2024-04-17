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
import jwt from "jsonwebtoken";
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

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // get the token after 'Bearer'
    const decodedToken = jwt.verify(token, process.env.JWTSecret);

    req.userData = {
      email: decodedToken.email,
      userId: decodedToken.userId,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication failed, invalid JWT" });
  }
};

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

  const filter = req.query.userId
    ? { "metadata.userId": req.query.userId }
    : {};

  const cursor = bucket.find(filter);
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
photosRoute.post("/", authMiddleware, (req, res) => {
  // TODO: allow multiple image uploads
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

    let uploadStream = bucket.openUploadStream(`${Date.now()}-user-photo`, {
      metadata: {
        userId: req.userData.userId,
      },
    });
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

// TODO: auth for deletion, check JWT and ensure that logged in user owns the image
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

// TODO: is it a bad pattern for post and use on same route?
app.post("/login", async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Error logging in" });
  }

  try {
    const fetchedUser = await User.findOne({ email: req.body.email });
    const isMatch = await fetchedUser.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password does not match" });
    }

    const token = jwt.sign(
      {
        email: fetchedUser.email,
        userId: fetchedUser._id,
      },
      process.env.JWTSecret,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      token: token,
      expiresIn: 3600,
      userId: fetchedUser._id,
    });
  } catch (err) {
    return res.status(400).json({ message: "Error logging in" });
  }
});

app.use("/", express.static("dist/photo-sharing-app/browser"));
app.use("/signup", express.static("dist/photo-sharing-app/browser"));
app.use("/login", express.static("dist/photo-sharing-app/browser"));
app.use("/profile", express.static("dist/photo-sharing-app/browser"));

app.listen(3000, function () {
  console.log("listening on 3000");
});

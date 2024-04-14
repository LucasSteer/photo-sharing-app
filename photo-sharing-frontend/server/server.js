const express = require("express");
const app = express();

app.use("/", express.static("../dist/photo-sharing-frontend/browser"));

app.listen(3000, function () {
  console.log("listening on 3000");
});

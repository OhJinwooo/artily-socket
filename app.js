require("dotenv").config();
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");
const app = express();
const app_low = express(); //http
const httpsPort = process.env.HTTPSPORT;
const httpPort = process.env.PORT;
const socket = require("./socket");
const connect = require("./schemas/index.schemas");
const cors = require("cors");
//접속로그 남기기
const requestMiddleware = (req, res, next) => {
  console.log(
    "ip:",
    req.ip,
    "domain:",
    req.rawHeaders[1],
    "method:",
    req.method,
    "Request URL:",
    req.originalUrl,
    "-",
    new Date()
  );
  next();
};

connect();

app.use(cors());
app.use(express.json());
app.use(requestMiddleware);
app.get("/", (req, res) => {
  return res.send("good");
});
// 인증서 파트
const privateKey = fs.readFileSync(__dirname + "/rusy7225_shop.key");
const certificate = fs.readFileSync(__dirname + "/rusy7225_shop__crt.pem");
const ca = fs.readFileSync(__dirname + "/rusy7225_shop__ca.pem");
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};
//HTTP 리다이렉션 하기
//app_low : http전용 미들웨어
app_low.use((req, res, next) => {
  if (req.secure) {
    next();
  } else {
    const to = `https://${req.hostname}:${httpsPort}${req.url}`;
    console.log(to);
    res.redirect(to);
  }
});

const server = https.createServer(credentials, app);
socket(server);

// app.listen(httpPort, () => {
//   console.log("http " + httpPort + " server start");
// });
http.createServer(app_low).listen(httpPort, () => {
  console.log("http " + httpPort + " server start test test");
});
server.listen(httpsPort, () => {
  console.log("https " + httpsPort + " server start test test");
});

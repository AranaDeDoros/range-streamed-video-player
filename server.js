import http from "http";
import fs from "fs";
import path from "path";

const VIDEO_DIR = process.env.VIDEO_DIR || "E:\\Vid";
const hostname = "127.0.0.1";
const __dirname = import.meta.dirname;

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/") {
      const indexPath = path.join(__dirname, "index.html");
      fs.readFile(indexPath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end("Error loading index.html");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
      return;
    }

    if (url.pathname === "/list") {
      const videoList = fs
        .readdirSync(VIDEO_DIR)
        .filter((f) => f.endsWith(".mp4"));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(videoList));
      return;
    }

    if (url.pathname !== "/video") {
      res.writeHead(404);
      res.end();
      return;
    }

    const rawName = url.searchParams.get("name");
    const videoName = decodeURIComponent(rawName);

    if (
      !videoName.endsWith(".mp4") ||
      videoName.includes("..") ||
      videoName.includes("/") ||
      videoName.includes("\\")
    ) {
      res.writeHead(400);
      res.end("Invalid filename");
      return;
    }

    const videoPath = path.join(VIDEO_DIR, videoName);
    console.log(videoPath);

    if (!fs.existsSync(videoPath)) {
      res.writeHead(404);
      res.end("Video not found");
      return;
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      res.writeHead(416, {
        "Accept-Ranges": "bytes",
        "Content-Type": "video/mp4",
      });
      res.end();
      return;
    }

    const matches = range.match(/bytes=(\d+)-(\d*)/);
    if (!matches) {
      res.writeHead(400);
      res.end();
      return;
    }

    const start = parseInt(matches[1], 10);
    const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.writeHead(416, {
        "Content-Range": `bytes */${fileSize}`,
      });
      res.end();
      return;
    }

    const chunkSize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    const stream = fs.createReadStream(videoPath, { start, end });
    stream.pipe(res);
    req.on("close", () => {
      console.log("Connection closed by client");
      stream.destroy();
    });
  })
  .listen(3000, hostname, () => {
    console.log(`Server running at http://${hostname}:3000/`);
  });

// Servidor estático de desarrollo (solo local, no se sube al hosting).
// Uso: node tools/serve.js  →  http://localhost:8765/
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const file = path.normalize(path.join(root, urlPath));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("404"); }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-cache"
    });
    res.end(data);
  });
}).listen(8765, () => console.log("Da Mimì → http://localhost:8765/"));

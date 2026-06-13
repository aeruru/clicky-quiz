const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath.split("?")[0]);
  const safePath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const requestedPath = path.join(root, safePath);

  if (!requestedPath.startsWith(root)) {
    return null;
  }

  return requestedPath;
}

const server = http.createServer((req, res) => {
  if (!req.url || req.method !== "GET") {
    send(res, 405, "Method not allowed");
    return;
  }

  let filePath = resolveRequestPath(req.url);

  if (!filePath) {
    send(res, 403, "Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      send(res, error.code === "ENOENT" ? 404 : 500, "Not found");
      return;
    }

    const type = contentTypes[path.extname(filePath).toLowerCase()];
    send(res, 200, content, { "Content-Type": type || "application/octet-stream" });
  });
});

server.listen(port, () => {
  console.log(`Clicky Quiz server running at http://localhost:${port}/`);
});

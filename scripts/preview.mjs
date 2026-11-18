// Local preview of the whole site, laid out like the real one at /obsidian/.
// The picker reloads in the browser whenever you save site/index.html or vaults.json.
//
// Run it with: node scripts/preview.mjs   (then open http://localhost:8090/obsidian/)
// Pass --no-build to skip rebuilding the vaults first.

import { spawnSync } from "node:child_process"
import fs from "node:fs"
import http from "node:http"
import path from "node:path"
import { readVaults, renderPicker } from "./picker.mjs"

const root = path.resolve(import.meta.dirname, "..")
const publicDir = path.join(root, "public")
const prefix = "/obsidian/"
const port = 8090

if (!process.argv.includes("--no-build")) {
  const result = spawnSync("node", [path.join(root, "scripts", "build-vaults.mjs")], {
    stdio: "inherit",
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

const reloadClients = new Set()
const reloadScript = `<script>new EventSource("/__reload").onmessage = () => location.reload()</script>`

let timer
const notify = () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    console.log("Picker changed, reloading")
    for (const res of reloadClients) res.write("data: reload\n\n")
  }, 50)
}
fs.watch(path.join(root, "site"), notify)
fs.watch(path.join(root, "vaults.json"), notify)

// Quartz writes pages as `note.html` and folders as `folder/index.html`.
function findFile(urlPath) {
  const target = path.join(publicDir, urlPath)
  if (!target.startsWith(publicDir)) return null
  for (const candidate of [target, `${target}.html`, path.join(target, "index.html")]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
  }
  return null
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`)

    if (url.pathname === "/__reload") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" })
      reloadClients.add(res)
      req.on("close", () => reloadClients.delete(res))
      return
    }

    if (url.pathname === "/" || url.pathname === "/obsidian") {
      res.writeHead(302, { Location: prefix })
      return res.end()
    }
    if (!url.pathname.startsWith(prefix)) {
      res.writeHead(404)
      return res.end("Not found")
    }

    const rest = decodeURIComponent(url.pathname.slice(prefix.length))

    // The picker is rendered fresh on every request, so saved edits show up right away.
    if (rest === "" || rest === "index.html") {
      const built = readVaults(root).filter((vault) =>
        fs.existsSync(path.join(publicDir, vault.id)),
      )
      const html = renderPicker(root, built).replace("</body>", `${reloadScript}</body>`)
      res.writeHead(200, { "Content-Type": types[".html"], "Cache-Control": "no-store" })
      return res.end(html)
    }

    // A folder without a trailing slash would break its relative links, so redirect like GitHub Pages.
    const folder = path.join(publicDir, rest)
    if (!rest.endsWith("/") && fs.existsSync(path.join(folder, "index.html"))) {
      res.writeHead(301, { Location: `${url.pathname}/` })
      return res.end()
    }

    const file = findFile(rest)
    if (!file) {
      res.writeHead(404)
      return res.end("Not found")
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] ?? "application/octet-stream",
    })
    fs.createReadStream(file).pipe(res)
  })
  .listen(port, () => {
    console.log(`\nPreview running at http://localhost:${port}${prefix}`)
    console.log("Edit site/index.html or vaults.json and the picker reloads. Ctrl+C to stop.")
  })

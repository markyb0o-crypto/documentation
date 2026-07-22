#!/usr/bin/env node
/**
 * Serviert den lokalen Build im WLAN — iPhone öffnet die URL einmal,
 * dann „Zum Home-Bildschirm“ → danach offline ohne Cloud.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { networkInterfaces } from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = resolve(__dirname, "../dist");
const port = Number(process.env.PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
  ".json": "application/json",
  ".map": "application/json",
};

if (!existsSync(join(root, "index.html"))) {
  console.error("Kein Build gefunden. Bitte zuerst: npm run build");
  process.exit(1);
}

function lanAddresses() {
  const nets = networkInterfaces();
  const out = [];
  for (const entries of Object.values(nets)) {
    for (const net of entries || []) {
      if (net.family === "IPv4" && !net.internal) out.push(net.address);
    }
  }
  return out;
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let rel = urlPath === "/" ? "/index.html" : urlPath;
    let filePath = normalize(join(root, rel));
    if (!filePath.startsWith(root)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    let info;
    try {
      info = await stat(filePath);
    } catch {
      filePath = join(root, "index.html");
      info = await stat(filePath);
    }

    if (info.isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    const type = TYPES[extname(filePath).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": "*",
    });
    createReadStream(filePath).pipe(res);
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" }).end(String(err));
  }
});

server.listen(port, "0.0.0.0", async () => {
  const addrs = lanAddresses();
  console.log("\nKlarsicht läuft lokal (ohne Cloud)\n");
  console.log(`  Auf diesem Gerät:  http://127.0.0.1:${port}/`);
  if (addrs.length) {
    console.log("  Vom iPhone (gleiches WLAN):");
    for (const ip of addrs) console.log(`    http://${ip}:${port}/`);
  } else {
    console.log("  Keine LAN-IP gefunden — WLAN prüfen.");
  }
  console.log(`
iPhone-Setup (danach offline):
  1. Safari öffnen → obige WLAN-URL aufrufen
  2. Teilen-Button → „Zum Home-Bildschirm“
  3. Klarsicht-Icon starten — funktioniert ohne Internet/Cloud
`);

  // Touch index so CI/scripts know server is up
  try {
    await readFile(join(root, "index.html"));
  } catch {
    /* ignore */
  }
});

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { spawn, spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const manifestPath = path.resolve(root, process.argv[2] || "");
const failures = [];

function fail(message) {
  failures.push(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function cssBlock(css, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, "gm"))]
    .map((match) => match[1])
    .join("\n");
}

function svgSize(content) {
  const viewBox = content.match(/viewBox="[^\"]*?([\d.]+)\s+([\d.]+)"/);
  return viewBox ? [Number(viewBox[1]), Number(viewBox[2])] : null;
}

function closeEnough(actual, expected) {
  return Math.abs(actual - expected) < 0.02;
}

function checkManifest(manifest) {
  for (const field of ["name", "page", "fileKey", "nodeId", "sourceFrame", "renderScale", "viewport", "frameSelector", "assets"]) {
    if (manifest[field] == null) fail(`manifest missing ${field}`);
  }
}

function checkPage(manifest) {
  const pagePath = path.join(root, manifest.page);
  if (!fs.existsSync(pagePath)) return fail(`missing page ${manifest.page}`);

  const html = read(manifest.page);
  const required = [
    `data-figma-id="${manifest.nodeId}"`,
    `data-figma-file-key="${manifest.fileKey}"`,
    `data-figma-frame-width="${manifest.sourceFrame.width}"`,
    `data-figma-frame-height="${manifest.sourceFrame.height}"`,
    `data-render-scale="${manifest.renderScale}"`,
  ];
  for (const value of required) if (!html.includes(value)) fail(`${manifest.page} missing ${value}`);
  for (const banned of ["figma.com/api/mcp/asset", "figma-crop-fallback", "-crop.png", "<svg"]) {
    if (html.includes(banned)) fail(`${manifest.page} contains banned fallback ${banned}`);
  }
  for (const value of manifest.texts || []) if (!html.includes(value)) fail(`${manifest.page} missing text ${value}`);

  return html;
}

function checkAssets(manifest, html) {
  for (const asset of manifest.assets) {
    const assetPath = path.join(root, asset.path);
    if (!fs.existsSync(assetPath)) {
      fail(`missing asset ${asset.path}`);
      continue;
    }
    if (!html.includes(`./${asset.path.replaceAll("\\", "/")}`)) fail(`${manifest.page} does not reference ${asset.path}`);
    if (path.extname(asset.path).toLowerCase() !== ".svg") continue;

    const svg = fs.readFileSync(assetPath, "utf8");
    if (!svg.trimStart().startsWith("<svg")) fail(`${asset.path} is not an SVG`);
    if (!asset.allowExportedBackground) {
      for (const color of ["#F5F5F5", "#F2F2F7"]) if (svg.includes(`fill="${color}"`)) fail(`${asset.path} contains exported background ${color}`);
    }
    if (asset.naturalSize) {
      const actual = svgSize(svg);
      if (!actual || !closeEnough(actual[0], asset.naturalSize[0]) || !closeEnough(actual[1], asset.naturalSize[1])) {
        fail(`${asset.path} natural size mismatch: expected ${asset.naturalSize.join("x")}, got ${actual ? actual.join("x") : "unknown"}`);
      }
    }
  }
}

function checkCss(manifest) {
  const css = read(manifest.stylesheet || "styles.css");
  for (const check of manifest.cssChecks || []) {
    const block = cssBlock(css, check.selector);
    if (!block) fail(`missing CSS selector ${check.selector}`);
    for (const declaration of check.declarations) if (!block.includes(declaration)) fail(`${check.selector} missing ${declaration}`);
  }
}

function runAudits(manifest) {
  for (const audit of manifest.audits || []) {
    const result = spawnSync(process.execPath, [path.join(root, audit)], { cwd: root, encoding: "utf8" });
    if (result.status !== 0) fail(`${audit} failed\n${result.stdout}${result.stderr}`.trim());
  }
}

function request(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      response.resume();
      response.statusCode === 200 ? resolve() : reject(new Error(`HTTP ${response.statusCode}`));
    }).on("error", reject);
  });
}

async function ensureServer(url) {
  try {
    await request(url);
    return null;
  } catch {
    const server = spawn(process.execPath, [path.join(root, "server.mjs")], { cwd: root, stdio: "ignore" });
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      try {
        await request(url);
        return server;
      } catch {}
    }
    server.kill();
    fail("local preview server did not start");
    return null;
  }
}

function findChrome() {
  return [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ].find(fs.existsSync);
}

function loadPlaywright() {
  const moduleRoot = path.resolve(path.dirname(process.execPath), "..", "node_modules");
  process.env.NODE_PATH = [moduleRoot, path.join(moduleRoot, ".pnpm", "node_modules")].join(path.delimiter);
  require("node:module").Module._initPaths();
  try {
    return require("playwright");
  } catch {
    return null;
  }
}

async function capture(manifest) {
  const url = `http://127.0.0.1:5173/${encodeURI(manifest.page)}`;
  const server = await ensureServer(url);
  const chrome = findChrome();
  if (!chrome) {
    fail("Chrome or Edge is required for screenshot verification");
    server?.kill();
    return null;
  }

  const playwright = loadPlaywright();
  if (!playwright) {
    fail("Playwright runtime is required for an exact browser viewport; run with the Codex bundled Node.js runtime");
    server?.kill();
    return null;
  }

  const outputDir = path.join(root, "_figma_tmp", "pipeline");
  const screenshot = path.join(outputDir, `${path.basename(manifest.page, ".html")}.png`);
  fs.mkdirSync(outputDir, { recursive: true });
  const browser = await playwright.chromium.launch({ headless: true, executablePath: chrome });
  const page = await browser.newPage({ viewport: manifest.viewport, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: "networkidle" });
  const browserCheck = await page.evaluate((selector) => {
    const frame = document.querySelector(selector)?.getBoundingClientRect();
    return {
      failedImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      frame: frame && { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    };
  }, manifest.frameSelector);
  await page.screenshot({ path: screenshot });
  await browser.close();
  server?.kill();

  if (browserCheck.failedImages.length) fail(`browser failed to load images: ${browserCheck.failedImages.join(", ")}`);
  if (!browserCheck.frame) fail(`browser could not find ${manifest.frameSelector}`);
  else {
    if (browserCheck.frame.x !== 0 || browserCheck.frame.y !== 0) fail(`frame must start at 0,0; got ${browserCheck.frame.x},${browserCheck.frame.y}`);
    if (browserCheck.frame.width !== manifest.viewport.width || browserCheck.frame.height !== manifest.viewport.height) {
      fail(`rendered frame mismatch: expected ${manifest.viewport.width}x${manifest.viewport.height}, got ${browserCheck.frame.width}x${browserCheck.frame.height}`);
    }
  }
  if (browserCheck.overflowX || browserCheck.overflowY) fail(`browser overflow detected: x=${browserCheck.overflowX}, y=${browserCheck.overflowY}`);

  const png = fs.readFileSync(screenshot);
  const size = [png.readUInt32BE(16), png.readUInt32BE(20)];
  if (size[0] !== manifest.viewport.width || size[1] !== manifest.viewport.height) {
    fail(`screenshot size mismatch: expected ${manifest.viewport.width}x${manifest.viewport.height}, got ${size.join("x")}`);
  }
  return path.relative(root, screenshot);
}

async function main() {
  if (!process.argv[2] || !fs.existsSync(manifestPath)) {
    console.error("Usage: node scripts/restore-pipeline.cjs <manifest.json>");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  checkManifest(manifest);
  const html = checkPage(manifest);
  if (html) checkAssets(manifest, html);
  checkCss(manifest);
  runAudits(manifest);
  const screenshot = await capture(manifest);

  if (failures.length) {
    console.error(`Restore pipeline failed for ${manifest.name}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Restore pipeline passed: ${manifest.name}`);
  console.log(`Screenshot: ${screenshot}`);
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

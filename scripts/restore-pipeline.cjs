const fs = require("node:fs");
const crypto = require("node:crypto");
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

function pngDataUrl(file) {
  return `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
}

function writeDataUrl(file, dataUrl) {
  fs.writeFileSync(file, Buffer.from(dataUrl.replace(/^data:image\/png;base64,/, ""), "base64"));
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

function withinTolerance(actual, expected, tolerance = 0.5) {
  return Math.abs(actual - expected) <= tolerance;
}

function checkManifest(manifest) {
  for (const field of ["name", "page", "fileKey", "nodeId", "sourceFrame", "renderScale", "viewport", "frameSelector", "assets", "browserChecks", "visualBaseline", "visualBaselineSha256", "visualDiff", "visualRegions"]) {
    if (manifest[field] == null) fail(`manifest missing ${field}`);
  }
  if (!Array.isArray(manifest.browserChecks)) fail("manifest browserChecks must be an array");
  if (!Array.isArray(manifest.visualRegions)) fail("manifest visualRegions must be an array");
  if (manifest.visualDiff?.rawColorDelta == null) fail("manifest visualDiff missing rawColorDelta");
  if (manifest.visualDiff?.colorDelta == null) fail("manifest visualDiff missing colorDelta");
  if (manifest.visualDiff?.maxMismatchRatio == null) fail("manifest visualDiff missing maxMismatchRatio");
}

function checkVisualBaseline(manifest) {
  const baselinePath = path.join(root, manifest.visualBaseline || "");
  if (!fs.existsSync(baselinePath)) return fail(`missing visual baseline ${manifest.visualBaseline}`);
  const png = fs.readFileSync(baselinePath);
  const hash = crypto.createHash("sha256").update(png).digest("hex");
  if (hash !== manifest.visualBaselineSha256.toLowerCase()) {
    fail(`visual baseline hash mismatch for ${manifest.visualBaseline}`);
  }
  const size = [png.readUInt32BE(16), png.readUInt32BE(20)];
  if (size[0] !== manifest.sourceFrame.width || size[1] !== manifest.sourceFrame.height) {
    fail(`visual baseline mismatch: expected ${manifest.sourceFrame.width}x${manifest.sourceFrame.height}, got ${size.join("x")}`);
  }
}

function checkDocumentation() {
  const expected = new Set(["README.md", "还原规则.md", "还原流水线.md"]);
  const rootDocs = fs.readdirSync(root).filter((file) => file.toLowerCase().endsWith(".md"));
  for (const file of expected) if (!rootDocs.includes(file)) fail(`missing documentation entry ${file}`);
  for (const file of rootDocs) if (!expected.has(file)) fail(`root documentation must be archived: ${file}`);
  if (!fs.existsSync(path.join(root, "docs", "history", "README.md"))) fail("missing docs/history/README.md");
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
  for (const banned of ["figma.com/api/mcp/asset", "figma-crop-fallback", "-crop.png", "visual-baselines/", "<svg"]) {
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
  await page.evaluate(() => document.fonts?.ready);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  const browserCheck = await page.evaluate((selector) => {
    const frame = document.querySelector(selector)?.getBoundingClientRect();
    return {
      failedImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src),
      frame: frame && { x: frame.x, y: frame.y, width: frame.width, height: frame.height },
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      overflowY: document.documentElement.scrollHeight > document.documentElement.clientHeight,
    };
  }, manifest.frameSelector);

  for (const check of manifest.browserChecks || []) {
    const target = page.locator(check.selector).first();
    const targetBox = await target.boundingBox();
    if (!targetBox) {
      fail(`browser check could not find ${check.selector}`);
      continue;
    }

    if (check.type === "bounds") {
      for (const key of ["x", "y", "width", "height"]) {
        if (check.expected[key] == null) continue;
        if (!withinTolerance(targetBox[key], check.expected[key], check.tolerance)) {
          fail(`${check.selector} ${key} mismatch: expected ${check.expected[key]}, got ${targetBox[key]}`);
        }
      }
    } else if (check.type === "align") {
      const referenceBox = await page.locator(check.relativeTo).first().boundingBox();
      if (!referenceBox) {
        fail(`browser check could not find ${check.relativeTo}`);
        continue;
      }
      const values = {
        left: (box) => box.x,
        right: (box) => box.x + box.width,
        top: (box) => box.y,
        bottom: (box) => box.y + box.height,
        centerX: (box) => box.x + box.width / 2,
        centerY: (box) => box.y + box.height / 2,
      };
      const value = values[check.axis];
      if (!value) {
        fail(`unsupported align axis ${check.axis}`);
        continue;
      }
      const delta = Math.abs(value(targetBox) - value(referenceBox));
      if (delta > (check.tolerance ?? 0.5)) {
        fail(`${check.selector} ${check.axis} differs from ${check.relativeTo} by ${delta}px`);
      }
    } else if (check.type === "textFit") {
      const fit = await target.evaluate((element) => ({
        horizontal: element.scrollWidth <= element.clientWidth + 1,
        vertical: element.scrollHeight <= element.clientHeight + 1,
      }));
      if (!fit.horizontal || !fit.vertical) {
        fail(`${check.selector} text overflow: horizontal=${!fit.horizontal}, vertical=${!fit.vertical}`);
      }
    } else {
      fail(`unsupported browser check type ${check.type}`);
    }
  }

  await page.screenshot({ path: screenshot });

  const baselinePath = path.join(root, manifest.visualBaseline);
  const baselineUrl = pngDataUrl(baselinePath);
  const browserUrl = pngDataUrl(screenshot);
  const regions = [{
    name: "full-page",
    rect: { x: 0, y: 0, width: manifest.viewport.width, height: manifest.viewport.height },
    colorDelta: manifest.visualDiff.colorDelta,
    rawColorDelta: manifest.visualDiff.rawColorDelta,
    blurRadius: manifest.visualDiff.blurRadius,
    maxMismatchRatio: manifest.visualDiff.maxMismatchRatio,
  }];

  for (const region of manifest.visualRegions || []) {
    let box = region.rect;
    if (!box) box = await page.locator(region.selector).first().boundingBox();
    if (!box) {
      fail(`visual region could not find ${region.selector}`);
      continue;
    }
    const padding = region.padding || 0;
    const x = Math.max(0, Math.floor(box.x - padding));
    const y = Math.max(0, Math.floor(box.y - padding));
    regions.push({
      name: region.name,
      rect: {
        x,
        y,
        width: Math.min(manifest.viewport.width, Math.ceil(box.x + box.width + padding)) - x,
        height: Math.min(manifest.viewport.height, Math.ceil(box.y + box.height + padding)) - y,
      },
      colorDelta: region.colorDelta ?? manifest.visualDiff.colorDelta,
      rawColorDelta: region.rawColorDelta ?? manifest.visualDiff.rawColorDelta,
      blurRadius: region.blurRadius ?? manifest.visualDiff.blurRadius,
      maxMismatchRatio: region.maxMismatchRatio ?? manifest.visualDiff.maxMismatchRatio,
    });
  }

  const comparison = await page.evaluate(async ({ baselineUrl, browserUrl, viewport, regions }) => {
    const load = (src) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
    const [baselineImage, browserImage] = await Promise.all([load(baselineUrl), load(browserUrl)]);
    const makeCanvas = (width, height) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    };
    const baselineCanvas = makeCanvas(viewport.width, viewport.height);
    baselineCanvas.getContext("2d").drawImage(baselineImage, 0, 0, viewport.width, viewport.height);
    const browserCanvas = makeCanvas(viewport.width, viewport.height);
    browserCanvas.getContext("2d").drawImage(browserImage, 0, 0, viewport.width, viewport.height);

    return regions.map((region) => {
      const { x, y, width, height } = region.rect;
      const reference = makeCanvas(width, height);
      const actual = makeCanvas(width, height);
      reference.getContext("2d").drawImage(baselineCanvas, x, y, width, height, 0, 0, width, height);
      actual.getContext("2d").drawImage(browserCanvas, x, y, width, height, 0, 0, width, height);
      const referenceData = reference.getContext("2d").getImageData(0, 0, width, height);
      const actualData = actual.getContext("2d").getImageData(0, 0, width, height);
      const compareReference = makeCanvas(width, height);
      const compareActual = makeCanvas(width, height);
      const referenceCompareContext = compareReference.getContext("2d");
      const actualCompareContext = compareActual.getContext("2d");
      referenceCompareContext.filter = `blur(${region.blurRadius || 0}px)`;
      actualCompareContext.filter = `blur(${region.blurRadius || 0}px)`;
      referenceCompareContext.drawImage(reference, 0, 0);
      actualCompareContext.drawImage(actual, 0, 0);
      const compareReferenceData = referenceCompareContext.getImageData(0, 0, width, height);
      const compareActualData = actualCompareContext.getImageData(0, 0, width, height);
      const diff = makeCanvas(width, height);
      const diffContext = diff.getContext("2d");
      const diffData = diffContext.createImageData(width, height);
      let mismatchPixels = 0;
      let rawMismatchPixels = 0;
      let deltaTotal = 0;
      let maxDelta = 0;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;

      for (let index = 0; index < referenceData.data.length; index += 4) {
        const rawDr = referenceData.data[index] - actualData.data[index];
        const rawDg = referenceData.data[index + 1] - actualData.data[index + 1];
        const rawDb = referenceData.data[index + 2] - actualData.data[index + 2];
        const rawDa = referenceData.data[index + 3] - actualData.data[index + 3];
        const rawDelta = Math.sqrt(rawDr * rawDr + rawDg * rawDg + rawDb * rawDb + rawDa * rawDa * 0.25);
        if (rawDelta > region.rawColorDelta) rawMismatchPixels += 1;
        const dr = compareReferenceData.data[index] - compareActualData.data[index];
        const dg = compareReferenceData.data[index + 1] - compareActualData.data[index + 1];
        const db = compareReferenceData.data[index + 2] - compareActualData.data[index + 2];
        const da = compareReferenceData.data[index + 3] - compareActualData.data[index + 3];
        const delta = Math.sqrt(dr * dr + dg * dg + db * db + da * da * 0.25);
        deltaTotal += delta;
        maxDelta = Math.max(maxDelta, delta);
        const pixel = index / 4;
        const px = pixel % width;
        const py = Math.floor(pixel / width);
        const different = delta > region.colorDelta;
        if (different) {
          mismatchPixels += 1;
          minX = Math.min(minX, px);
          minY = Math.min(minY, py);
          maxX = Math.max(maxX, px);
          maxY = Math.max(maxY, py);
          diffData.data[index] = 255;
          diffData.data[index + 1] = 45;
          diffData.data[index + 2] = 85;
          diffData.data[index + 3] = 255;
        } else {
          const luminance = Math.round(referenceData.data[index] * 0.299 + referenceData.data[index + 1] * 0.587 + referenceData.data[index + 2] * 0.114);
          diffData.data[index] = luminance;
          diffData.data[index + 1] = luminance;
          diffData.data[index + 2] = luminance;
          diffData.data[index + 3] = 45;
        }
      }
      diffContext.putImageData(diffData, 0, 0);
      const totalPixels = width * height;
      return {
        name: region.name,
        rect: region.rect,
        colorDelta: region.colorDelta,
        rawColorDelta: region.rawColorDelta,
        blurRadius: region.blurRadius,
        maxMismatchRatio: region.maxMismatchRatio,
        mismatchPixels,
        mismatchRatio: mismatchPixels / totalPixels,
        rawMismatchPixels,
        rawMismatchRatio: rawMismatchPixels / totalPixels,
        meanDelta: deltaTotal / totalPixels,
        maxDelta,
        differenceBounds: mismatchPixels ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 } : null,
        figma: reference.toDataURL("image/png"),
        browser: actual.toDataURL("image/png"),
        diff: diff.toDataURL("image/png"),
      };
    });
  }, { baselineUrl, browserUrl, viewport: manifest.viewport, regions });

  const pageName = path.basename(manifest.page, ".html");
  const visualDir = path.join(outputDir, `${pageName}-visual-diff`);
  fs.mkdirSync(visualDir, { recursive: true });
  const visualReport = [];
  for (const result of comparison) {
    const safeName = result.name.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
    const figmaPath = path.join(visualDir, `${safeName}--figma.png`);
    const browserPath = path.join(visualDir, `${safeName}--browser.png`);
    const diffPath = path.join(visualDir, `${safeName}--diff.png`);
    writeDataUrl(figmaPath, result.figma);
    writeDataUrl(browserPath, result.browser);
    writeDataUrl(diffPath, result.diff);
    const reportEntry = { ...result };
    delete reportEntry.figma;
    delete reportEntry.browser;
    delete reportEntry.diff;
    reportEntry.images = {
      figma: path.relative(root, figmaPath),
      browser: path.relative(root, browserPath),
      diff: path.relative(root, diffPath),
    };
    reportEntry.status = result.mismatchRatio > result.maxMismatchRatio ? "fail" : "pass";
    visualReport.push(reportEntry);
    if (result.mismatchRatio > result.maxMismatchRatio) {
      fail(`visual diff ${result.name} mismatch ${(result.mismatchRatio * 100).toFixed(2)}% exceeds ${(result.maxMismatchRatio * 100).toFixed(2)}%`);
    }
  }
  const reportPath = path.join(visualDir, "report.json");
  fs.writeFileSync(reportPath, `${JSON.stringify({
    page: manifest.page,
    baseline: manifest.visualBaseline,
    baselineSha256: manifest.visualBaselineSha256,
    regions: visualReport,
  }, null, 2)}\n`);
  const reviewPath = path.join(visualDir, "index.html");
  const cards = visualReport.map((region) => `
    <section class="region ${region.status}">
      <h2>${region.name} <span>${region.status.toUpperCase()}</span></h2>
      <p>raw ${(region.rawMismatchRatio * 100).toFixed(2)}% · gate ${(region.mismatchRatio * 100).toFixed(2)}% / ${(region.maxMismatchRatio * 100).toFixed(2)}%</p>
      <div class="images">
        <figure><figcaption>Figma</figcaption><img src="${path.basename(region.images.figma)}" alt="Figma baseline"></figure>
        <figure><figcaption>Browser</figcaption><img src="${path.basename(region.images.browser)}" alt="Browser render"></figure>
        <figure><figcaption>Diff</figcaption><img src="${path.basename(region.images.diff)}" alt="Visual difference"></figure>
      </div>
    </section>`).join("");
  fs.writeFileSync(reviewPath, `<!doctype html><html><head><meta charset="utf-8"><title>${manifest.name} visual diff</title><style>
    body{margin:0;padding:24px;background:#f5f5f5;color:#171717;font:14px/1.5 Arial,sans-serif}h1{margin:0 0 20px}.region{margin:0 0 24px;padding:16px;background:#fff;border-left:5px solid #1f9d55}.region.fail{border-color:#e11d48}.region h2{margin:0}.region h2 span{font-size:12px;color:#1f9d55}.region.fail h2 span{color:#e11d48}.region p{margin:4px 0 12px;color:#666}.images{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}figure{margin:0}figcaption{margin-bottom:6px;font-weight:700}img{display:block;max-width:100%;border:1px solid #ddd;background:#fff;image-rendering:auto}@media(max-width:800px){.images{grid-template-columns:1fr}}
  </style></head><body><h1>${manifest.name} visual diff</h1>${cards}</body></html>`);
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
  return {
    screenshot: path.relative(root, screenshot),
    visualReport: path.relative(root, reportPath),
    visualReview: path.relative(root, reviewPath),
    regions: visualReport,
  };
}

async function main() {
  if (!process.argv[2] || !fs.existsSync(manifestPath)) {
    console.error("Usage: node scripts/restore-pipeline.cjs <manifest.json>");
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  checkDocumentation();
  checkManifest(manifest);
  checkVisualBaseline(manifest);
  const html = checkPage(manifest);
  if (html) checkAssets(manifest, html);
  checkCss(manifest);
  runAudits(manifest);
  const captureResult = await capture(manifest);

  if (failures.length) {
    console.error(`Restore pipeline failed for ${manifest.name}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
  console.log(`Restore pipeline passed: ${manifest.name}`);
  console.log(`Screenshot: ${captureResult.screenshot}`);
  console.log(`Visual report: ${captureResult.visualReport}`);
  console.log(`Visual review: ${captureResult.visualReview}`);
  for (const region of captureResult.regions) {
    console.log(`Visual region ${region.name}: ${(region.mismatchRatio * 100).toFixed(2)}% mismatch`);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const failures = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

function cssBlock(selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`, "gm"))].map((m) => m[1]).join("\n");
}

function checkDecl(selector, declaration) {
  check(cssBlock(selector).includes(declaration), `${selector} missing ${declaration}`);
}

function hasLocalAsset(html, file) {
  return html.includes(`./assets/${file}`);
}

function checkAssetFile(file) {
  check(fs.existsSync(path.join(root, "assets", file)), `missing localized asset ${file}`);
}

function checkAssetDoesNotContain(file, pattern, message) {
  const content = fs.readFileSync(path.join(root, "assets", file), "utf8");
  check(!content.includes(pattern), message);
}

function checkSvgHasNoExportedBackground(file) {
  for (const pattern of ['fill="#F5F5F5"', 'fill="#F2F2F7"']) {
    checkAssetDoesNotContain(file, pattern, `${file} must not contain exported background rect ${pattern}`);
  }
}

const calendar = read("typhur-calendar.html");
const wellness = read("typhur-wellness.html");
const ice = read("typhur-ice-maker.html");
const cook = read("typhur-cook.html");
const probe = read("typhur-probe-cooking.html");
const probeLost = read("typhur-probe-lost.html");
const overheat = read("typhur-overheat.html");
const share = read("typhur-share-cooking.html");
const alerts = read("typhur-alerts.html");
const alertsV2 = read("typhur-alerts-v2.html");
const alertsTemp = read("typhur-alerts-temperature.html");
const recipeDetail = read("typhur-recipe-detail.html");
const customTime = read("typhur-custom-time.html");
const testCustom = read("typhur-test-custom.html");
const testProfessional = read("typhur-test-professional.html");

check(calendar.includes('data-figma-id="66:7779"'), "calendar donor id missing");
check(calendar.includes('data-figma-frame-width="393"'), "calendar width mismatch");
check(calendar.includes('data-figma-frame-height="852"'), "calendar height mismatch");
for (const text of ["2026.03", "Mar", "Apr", "SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]) {
  check(calendar.includes(text), `calendar missing text ${text}`);
}
for (const file of ["typhur-status-66-7781.svg", "typhur-calendar-header-66-8135.svg"]) {
  check(hasLocalAsset(calendar, file), `calendar missing Figma SVG asset ${file}`);
}
check(!calendar.includes("ty-status-icons"), "calendar status bar must not use hand-drawn status icons");

check(wellness.includes('data-figma-id="66:8208"'), "wellness donor id missing");
check(wellness.includes('data-figma-frame-height="1102"'), "wellness height mismatch");
for (const text of ["AI Wellness", "1,333", "Calories Left", "2,000", "Daily Goal", "777", "Intake", "Upload food", "Air Fryer Tilapia With...", "Add Meal", "Daily Health Score", "7", "/10", "Explore", "AI Chef", "Devices", "Profile"]) {
  check(wellness.includes(text), `wellness missing text ${text}`);
}
check(wellness.includes("./assets/typhur-food-raw-3.jpeg"), "wellness food raw image not localized");
check(!wellness.includes("figma.com/api/mcp/asset"), "wellness must not depend on temporary MCP URLs");
for (const file of [
  "typhur-status-66-8209.svg",
  "typhur-wellness-nav-66-8564.svg",
  "typhur-stats-dots-66-8228.svg",
  "typhur-stats-center-66-8222.svg",
  "typhur-stats-arc-66-8223.svg",
  "typhur-stats-arc-66-8224.svg",
  "typhur-food-calories-66-8384.svg",
  "typhur-food-protein-66-8388.svg",
  "typhur-food-carbs-66-8391.svg",
  "typhur-food-fats-66-8394.svg",
  "typhur-add-meal-66-8559.svg",
  "typhur-tabbar-66-8131.svg",
]) {
  check(hasLocalAsset(wellness, file), `wellness missing Figma SVG asset ${file}`);
}
check(!wellness.includes("ty-status-icons"), "wellness status bar must not use hand-drawn status icons");
check(!wellness.includes("ty-nav-actions"), "wellness nav icons must come from the Figma nav asset");
check(!wellness.includes('data-restoration="approximate"'), "wellness must not keep approximate replacements after real Figma assets were exported");

check(ice.includes('data-figma-id="66:9531"'), "ice maker donor id missing");
check(ice.includes('data-figma-frame-height="852"'), "ice maker height mismatch");
for (const text of ["Typhur Fast Nugget Ice Maker", "Cleaning", "Schedule", "Ice Made Today", "Ice Made Total", "1.2 lbs", "13 lbs", "Ice Making"]) {
  check(ice.includes(text), `ice maker missing text ${text}`);
}
check(ice.includes("./assets/typhur-icemaker-66-9534@3x.png"), "ice maker product export not localized");
check(!ice.includes("figma.com/api/mcp/asset"), "ice maker must not depend on temporary MCP URLs");
for (const file of ["typhur-status-66-9532.svg", "typhur-ice-nav-66-9551.svg"]) {
  check(hasLocalAsset(ice, file), `ice maker missing Figma SVG asset ${file}`);
}
for (const source of ["./assets/typhur-clean-66-9538.svg", "./assets/typhur-calendar-icon-66-9550.svg", "./assets/typhur-arrow-66-9537.svg"]) {
  check(ice.includes(`data-asset-source="${source}"`), `ice maker missing inline SVG source marker ${source}`);
}
check(!ice.includes("ty-status-icons"), "ice maker status bar must not use hand-drawn status icons");
check(!cssBlock(".ty-ice-nav .back").includes("transform:"), "ice maker back arrow must not be flipped");

check(cook.includes('data-figma-id="80:9748"'), "cook donor id missing");
check(cook.includes('data-figma-frame-width="750"'), "cook source width mismatch");
check(cook.includes('data-figma-frame-height="1624"'), "cook source height mismatch");
check(cook.includes('data-render-scale="0.5"'), "cook 2x render scale must be explicit");
check(!cook.includes("figma.com/api/mcp/asset"), "cook must not depend on temporary MCP URLs");
for (const text of ["Typhur Dome", "Cooking", "2:30:00", "Remaining Time", "Target Temp", "190°F", "Cooking Time", "02h 30min", "Pause", "Stop"]) {
  check(cook.includes(text), `cook missing text ${text}`);
}
for (const file of [
  "typhur-cook-status-right-80-9752.svg",
  "typhur-cook-status-time-80-9769.svg",
  "typhur-cook-back-80-9771.svg",
  "typhur-cook-settings-80-9771.svg",
  "typhur-cook-ring-base-80-9773.svg",
  "typhur-cook-ring-progress-80-9774.svg",
  "typhur-cook-title-icon-80-9778.svg",
  "typhur-cook-arrow-forward-80-9787.svg",
]) {
  check(hasLocalAsset(cook, file), `cook missing Figma SVG asset ${file}`);
}
check(!cook.includes("ty-status-icons"), "cook status bar must not use hand-drawn status icons");
check(!cook.includes("<svg"), "cook must not inline hand-drawn SVG; use localized Figma assets");

checkDecl(".typhur-frame", "width: 393px;");
checkDecl(".ty-calendar-frame", "height: 852px;");
check(calendar.includes("ty-calendar-frame"), "calendar frame class mismatch");
checkDecl(".typhur-wellness-frame", "height: 1102px;");
checkDecl(".typhur-ice-frame", "height: 852px;");
checkDecl(".typhur-cook-frame", "width: 375px;");
checkDecl(".typhur-cook-frame", "height: 812px;");
checkDecl(".ty-calendar-sheet", "top: 59px;");
checkDecl(".ty-calendar-sheet", "border-radius: 24px 24px 0 0;");
checkDecl(".ty-week-strip", "top: 123px;");
checkDecl(".ty-stats-card", "top: 203px;");
checkDecl(".ty-stats-card", "height: 344px;");
checkDecl(".calorie-dots", "left: 24px;");
checkDecl(".calorie-dots", "top: 24px;");
checkDecl(".calorie-dots", "width: 200px;");
checkDecl(".calorie-center-ellipse", "left: 62px;");
checkDecl(".calorie-arc", "width: 176px;");
checkDecl(".calorie-arc", "height: 161px;");
checkDecl(".calorie-arc.gray", "width: 173px;");
checkDecl(".calorie-arc.gray", "height: 161px;");
checkDecl(".calorie-center", "left: 74px;");
checkDecl(".calorie-center", "top: 99px;");
checkDecl(".calorie-center span", "font-size: 12px;");
checkDecl(".calorie-center span", "line-height: 16px;");
checkDecl(".food-card > img", "width: 118px;");
checkDecl(".food-card > img", "height: 118px;");
checkDecl(".food-card .cal img", "width: 18px;");
checkDecl(".food-macros img", "width: 12px;");
checkDecl(".add-meal", "top: 755px;");
checkDecl(".health-score", "top: 827px;");
checkDecl(".ty-tabbar", "top: 1019px;");
checkDecl(".ice-maker-img", "left: 107px;");
checkDecl(".ice-maker-img", "top: 115px;");
checkDecl(".ice-maker-img", "width: 180px;");
checkDecl(".ice-maker-img", "height: 180px;");
checkDecl(".ice-row.cleaning", "top: 327px;");
checkDecl(".ice-row.schedule", "top: 411px;");
checkDecl(".ice-metrics", "top: 495px;");
checkDecl(".ice-cta", "bottom: 32px;");
checkDecl(".cook-status", "height: 44px;");
checkDecl(".cook-nav", "top: 44px;");
checkDecl(".cook-nav", "height: 48px;");
checkDecl(".cook-nav h1", "left: 64px;");
checkDecl(".cook-nav h1", "width: 247px;");
checkDecl(".cook-nav h1", "white-space: nowrap;");
checkDecl(".cook-back", "left: 20px;");
check(!cssBlock(".cook-back").includes("transform:"), "cook back arrow must not be flipped");
checkDecl(".cook-title", "left: 135px;");
checkDecl(".cook-title", "top: 132px;");
checkDecl(".cook-temp", "left: 67.5px;");
checkDecl(".cook-temp", "top: 190px;");
checkDecl(".cook-temp", "width: 240px;");
checkDecl(".cook-ring-base", "width: 240px;");
checkDecl(".cook-ring-progress", "height: 240px;");
checkDecl(".cook-temp strong", "font-size: 40px;");
checkDecl(".cook-temp strong", "letter-spacing: -1.6px;");
checkDecl(".cook-list", "top: 490px;");
checkDecl(".cook-row", "height: 56px;");
checkDecl(".cook-row-value", "right: 44px;");
checkDecl(".cook-row-arrow", "right: 20px;");
checkDecl(".cook-button", "top: 742px;");
checkDecl(".cook-button", "height: 50px;");

for (const file of [
  "typhur-food-raw-3.jpeg",
  "typhur-icemaker-66-9534@3x.png",
  "typhur-status-66-7781.svg",
  "typhur-calendar-header-66-8135.svg",
  "typhur-status-66-8209.svg",
  "typhur-wellness-nav-66-8564.svg",
  "typhur-stats-dots-66-8228.svg",
  "typhur-stats-center-66-8222.svg",
  "typhur-stats-arc-66-8223.svg",
  "typhur-stats-arc-66-8224.svg",
  "typhur-food-calories-66-8384.svg",
  "typhur-food-protein-66-8388.svg",
  "typhur-food-carbs-66-8391.svg",
  "typhur-food-fats-66-8394.svg",
  "typhur-add-meal-66-8559.svg",
  "typhur-tabbar-66-8131.svg",
  "typhur-status-66-9532.svg",
  "typhur-ice-nav-66-9551.svg",
  "typhur-clean-66-9538.svg",
  "typhur-calendar-icon-66-9550.svg",
  "typhur-arrow-66-9537.svg",
  "typhur-cook-status-right-80-9752.svg",
  "typhur-cook-status-time-80-9769.svg",
  "typhur-cook-back-80-9771.svg",
  "typhur-cook-settings-80-9771.svg",
  "typhur-cook-ring-base-80-9773.svg",
  "typhur-cook-ring-progress-80-9774.svg",
  "typhur-cook-title-icon-80-9778.svg",
  "typhur-cook-arrow-forward-80-9787.svg",
]) {
  checkAssetFile(file);
}

for (const file of [
  "typhur-stats-dots-66-8228.svg",
  "typhur-stats-center-66-8222.svg",
  "typhur-stats-arc-66-8223.svg",
  "typhur-stats-arc-66-8224.svg",
  "typhur-food-calories-66-8384.svg",
  "typhur-food-protein-66-8388.svg",
  "typhur-food-carbs-66-8391.svg",
  "typhur-food-fats-66-8394.svg",
  "typhur-cook-status-right-80-9752.svg",
  "typhur-cook-status-time-80-9769.svg",
  "typhur-cook-back-80-9771.svg",
  "typhur-cook-settings-80-9771.svg",
  "typhur-cook-ring-progress-80-9774.svg",
  "typhur-cook-title-icon-80-9778.svg",
  "typhur-cook-arrow-forward-80-9787.svg",
]) {
  checkSvgHasNoExportedBackground(file);
}

checkSvgHasNoExportedBackground("typhur-cook-ring-base-80-9773.svg");
check(fs.readFileSync(path.join(root, "assets", "typhur-cook-ring-progress-80-9774.svg"), "utf8").includes('viewBox="0 0 479.87 479.87"'), "cook progress ring natural viewBox changed; do not stretch a wrong export");

check(
  wellness.includes("typhur-stats-dots-66-8228.svg") &&
    wellness.includes("typhur-stats-center-66-8222.svg") &&
    wellness.includes("typhur-stats-arc-66-8223.svg") &&
    wellness.includes("typhur-stats-arc-66-8224.svg"),
  "wellness stats chart must explicitly reference every real Figma chart child asset"
);

check(
  cook.includes("typhur-cook-ring-base-80-9773.svg") && cook.includes("typhur-cook-ring-progress-80-9774.svg"),
  "cook timer must explicitly reference both real Figma ring child assets"
);

check(probe.includes('data-figma-id="80:9847"'), "probe donor id missing");
check(probe.includes('data-figma-frame-width="750"'), "probe source width mismatch");
check(probe.includes('data-figma-frame-height="1624"'), "probe source height mismatch");
check(probe.includes('data-render-scale="0.5"'), "probe 2x render scale must be explicit");
check(!probe.includes("figma.com/api/mcp/asset"), "probe must not depend on temporary MCP URLs");
for (const text of ["Probe 1", "Device Name - MU4A", "Remove From Heat", "Rib Roast Medium Rare", "Internal", "Target", "Ambient", "132.9", "245.5", "138", "Remaining", "Elapsed", "1hr 30min", "Stop"]) {
  check(probe.includes(text), `probe missing text ${text}`);
}
for (const file of [
  "typhur-probe-status-right-80-9848.svg",
  "typhur-probe-status-time-80-9848.svg",
  "typhur-probe-legend-internal-80-9851.svg",
  "typhur-probe-legend-target-80-9854.svg",
  "typhur-probe-legend-ambient-80-9857.svg",
  "typhur-probe-info-80-9860.svg",
  "typhur-probe-battery-80-9864.svg",
  "typhur-probe-scrollbar-80-9909.svg",
  "typhur-probe-nav-back-80-9940.svg",
  "typhur-probe-nav-switch-80-9940.svg",
  "typhur-probe-nav-edit-80-9940.svg",
  "typhur-probe-chart-80-9871.svg",
  "typhur-probe-alerts-80-9913.svg",
]) {
  check(hasLocalAsset(probe, file), `probe missing Figma SVG asset ${file}`);
}
check(!probe.includes("<svg"), "probe must not inline hand-drawn SVG; use localized Figma assets");
check(probe.includes("typhur-probe-chart-80-9871.svg"), "probe chart must use the real localized Figma Chart asset");
checkDecl(".typhur-probe-frame", "width: 375px;");
checkDecl(".typhur-probe-frame", "height: 812px;");
checkDecl(".probe-scrollbar", "left: 187.5px;");
checkDecl(".probe-info", "left: 207px;");
checkDecl(".probe-chart", "left: 20px;");
checkDecl(".probe-chart", "top: 214px;");
checkDecl(".probe-chart", "width: 335px;");
checkDecl(".probe-chart", "height: 304px;");
checkDecl(".probe-card", "top: 534px;");
checkDecl(".probe-card", "width: 343px;");
checkDecl(".probe-card", "height: 140.5px;");
checkDecl(".probe-button", "top: 742px;");
check(!cssBlock(".probe-nav-back").includes("transform:"), "probe back arrow must not be flipped");
for (const file of [
  "typhur-probe-status-right-80-9848.svg",
  "typhur-probe-status-time-80-9848.svg",
  "typhur-probe-legend-internal-80-9851.svg",
  "typhur-probe-legend-target-80-9854.svg",
  "typhur-probe-legend-ambient-80-9857.svg",
  "typhur-probe-info-80-9860.svg",
  "typhur-probe-battery-80-9864.svg",
  "typhur-probe-scrollbar-80-9909.svg",
  "typhur-probe-nav-back-80-9940.svg",
  "typhur-probe-nav-switch-80-9940.svg",
  "typhur-probe-nav-edit-80-9940.svg",
  "typhur-probe-chart-80-9871.svg",
  "typhur-probe-alerts-80-9913.svg",
]) {
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkAssetDoesNotContain("typhur-probe-chart-80-9871.svg", '<rect width="670" height="608" fill="#F5F5F5"/>', "probe chart must not contain exported gray background");
checkAssetDoesNotContain("typhur-probe-alerts-80-9913.svg", '<rect width="80" height="80" fill="#F5F5F5"/>', "probe alerts must not contain exported gray background");

check(probeLost.includes('data-figma-id="92:10513"'), "probe lost donor id missing");
check(probeLost.includes('data-figma-frame-width="750"'), "probe lost source width mismatch");
check(probeLost.includes('data-figma-frame-height="1624"'), "probe lost source height mismatch");
check(probeLost.includes('data-render-scale="0.5"'), "probe lost 2x render scale must be explicit");
check(!probeLost.includes("figma.com/api/mcp/asset"), "probe lost must not depend on temporary MCP URLs");
check(!probeLost.includes("<svg"), "probe lost must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["Probe 1", "Device Name - MU4A", "Unpaired", "No Cook Yet", "Internal", "Target", "Ambient", "248°", "32°", "1h30m", "Pair Probe"]) {
  check(probeLost.includes(text), `probe lost missing text ${text}`);
}
for (const file of [
  "typhur-probe-lost-status-right-92-10514.svg",
  "typhur-probe-lost-status-time-92-10514.svg",
  "typhur-probe-lost-back-92-10515.svg",
  "typhur-probe-lost-switch-92-10515.svg",
  "typhur-probe-lost-edit-92-10515.svg",
  "typhur-probe-lost-scrollbar-92-10516.svg",
  "typhur-probe-lost-legend-internal-92-10522.svg",
  "typhur-probe-lost-legend-target-92-10525.svg",
  "typhur-probe-lost-legend-ambient-92-10528.svg",
  "typhur-probe-lost-chart-hline-92-10544.svg",
  "typhur-probe-lost-chart-vline-92-10545.svg",
  "typhur-probe-lost-chart-union-92-10557.svg",
]) {
  check(hasLocalAsset(probeLost, file), `probe lost missing Figma SVG asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-probe-lost-frame", "width: 375px;");
checkDecl(".typhur-probe-lost-frame", "height: 812px;");
checkDecl(".probe-lost-scrollbar", "left: 176px;");
checkDecl(".probe-lost-state", "top: 112px;");
checkDecl(".probe-lost-legend", "top: 181px;");
checkDecl(".probe-lost-chart", "left: 20px;");
checkDecl(".probe-lost-chart", "top: 214px;");
checkDecl(".probe-lost-axis", "width: 288px;");
checkDecl(".probe-lost-axis", "height: 284px;");
checkDecl(".probe-lost-card", "top: 534px;");
checkDecl(".probe-lost-card", "width: 343px;");
checkDecl(".probe-lost-card", "height: 140.5px;");
checkDecl(".probe-lost-button", "top: 742px;");
checkDecl(".probe-lost-button", "width: 335px;");
check(!cssBlock(".probe-lost-back").includes("transform:"), "probe lost back icon must not be flipped");
check(!cssBlock(".probe-lost-edit").includes("transform:"), "probe lost edit icon must not be flipped");
check(!cssBlock(".probe-lost-switch").includes("transform:"), "probe lost switch icon must not be flipped");
check(probeLost.includes("typhur-probe-lost-chart-union-92-10557.svg"), "probe lost chart axis must use real localized Figma Union asset");
check(probeLost.includes("typhur-probe-lost-chart-hline-92-10544.svg"), "probe lost chart hlines must use real localized Figma asset");
check(probeLost.includes("typhur-probe-lost-chart-vline-92-10545.svg"), "probe lost chart vlines must use real localized Figma asset");

check(overheat.includes('data-figma-id="83:9987"'), "overheat donor id missing");
check(overheat.includes('data-figma-frame-width="750"'), "overheat source width mismatch");
check(overheat.includes('data-figma-frame-height="1624"'), "overheat source height mismatch");
check(overheat.includes('data-render-scale="0.5"'), "overheat 2x render scale must be explicit");
check(!overheat.includes("figma.com/api/mcp/asset"), "overheat must not depend on temporary MCP URLs");
check(!overheat.includes("<svg"), "overheat must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["Maximum device name..", "Typhur Sync", "Probe 1 Overheat", "Please detach", "normal temperature range", "T1", "T2", "T3", "T4", "T5", "Ambient", "132.91", "1"]) {
  check(overheat.includes(text), `overheat missing text ${text}`);
}
for (const file of [
  "typhur-overheat-status-right-83-9990.svg",
  "typhur-overheat-status-time-83-9990.svg",
  "typhur-overheat-close-83-9991.svg",
  "typhur-overheat-error-83-9993.svg",
  "typhur-overheat-badge-dot-83-10002.svg",
  "typhur-overheat-probe-body-83-10007.svg",
  "typhur-overheat-probe-dot-muted-83-10036.svg",
  "typhur-overheat-probe-dot-active-83-10038.svg",
  "typhur-overheat-probe-marker-83-10042.svg",
]) {
  check(hasLocalAsset(overheat, file), `overheat missing Figma SVG asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-overheat-frame", "width: 375px;");
checkDecl(".typhur-overheat-frame", "height: 812px;");
checkDecl(".overheat-top-glow", "height: 92px;");
checkDecl(".overheat-close", "left: 20px;");
checkDecl(".overheat-error", "width: 60px;");
checkDecl(".overheat-probe-body", "left: 29.5px;");
checkDecl(".overheat-probe-body", "top: 450.5px;");
checkDecl(".overheat-probe-body", "width: 317.5px;");
checkDecl(".overheat-probe-body", "height: 28px;");
checkDecl(".overheat-home span", "width: 125px;");
check(!cssBlock(".overheat-close").includes("transform:"), "overheat close icon must not be flipped");

check(share.includes('data-figma-id="85:10235"'), "share cooking donor id missing");
check(share.includes('data-figma-frame-width="750"'), "share cooking source width mismatch");
check(share.includes('data-figma-frame-height="1624"'), "share cooking source height mismatch");
check(share.includes('data-render-scale="0.5"'), "share cooking 2x render scale must be explicit");
check(!share.includes("figma.com/api/mcp/asset"), "share cooking must not depend on temporary MCP URLs");
check(!share.includes("<svg"), "share cooking must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["视频区域", "Share your cooking!", "Create a video", "Don&rsquo;t show this again", "Share Now"]) {
  check(share.includes(text), `share cooking missing text ${text}`);
}
for (const file of [
  "typhur-share-status-time-85-10238.svg",
  "typhur-share-status-right-85-10238.svg",
  "typhur-share-close-85-10237.svg",
  "typhur-share-card-85-10247.svg",
]) {
  check(hasLocalAsset(share, file), `share cooking missing Figma asset ${file}`);
  checkAssetFile(file);
}
for (const file of [
  "typhur-share-status-time-85-10238.svg",
  "typhur-share-status-right-85-10238.svg",
  "typhur-share-close-85-10237.svg",
]) {
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-share-frame", "width: 375px;");
checkDecl(".typhur-share-frame", "height: 812px;");
checkDecl(".share-card", "left: 75px;");
checkDecl(".share-card", "top: 112px;");
checkDecl(".share-card", "width: 225px;");
checkDecl(".share-card", "height: 400px;");
checkDecl(".share-close", "left: 331px;");
checkDecl(".share-primary", "top: 49px;");
checkDecl(".share-primary", "width: 335px;");
check(!cssBlock(".share-close").includes("transform:"), "share cooking close icon must not be flipped");

check(alerts.includes('data-figma-id="85:10368"'), "alerts donor id missing");
check(alerts.includes('data-figma-frame-width="750"'), "alerts source width mismatch");
check(alerts.includes('data-figma-frame-height="1624"'), "alerts source height mismatch");
check(alerts.includes('data-render-scale="0.5"'), "alerts 2x render scale must be explicit");
check(!alerts.includes("figma.com/api/mcp/asset"), "alerts must not depend on temporary MCP URLs");
check(!alerts.includes("<svg"), "alerts must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["Alerts", "Add Alerts", "Add", "Alert me ...min before the cook ends", "03", "30", "hr", "min", "Notes (Optional)", "Probe 1 Cooking Complete"]) {
  check(alerts.includes(text), `alerts missing text ${text}`);
}
for (const file of [
  "typhur-alerts-status-time-85-10369.svg",
  "typhur-alerts-status-right-85-10369.svg",
  "typhur-alerts-back-85-10391.svg",
  "typhur-alerts-plus-85-10391.svg",
  "typhur-alerts-close-85-10398.svg",
]) {
  check(hasLocalAsset(alerts, file), `alerts missing Figma SVG asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-alerts-frame", "width: 375px;");
checkDecl(".typhur-alerts-frame", "height: 812px;");
checkDecl(".alerts-sheet", "top: 56px;");
checkDecl(".alerts-sheet", "height: 756px;");
checkDecl(".alerts-sheet", "border-radius: 12px 12px 0 0;");
checkDecl(".alerts-picker", "top: 133.5px;");
checkDecl(".picker-highlight", "left: 25px;");
checkDecl(".picker-highlight", "width: 325px;");
checkDecl(".picker-unit", "top: 52px;");
checkDecl(".alerts-notes", "top: 320px;");
checkDecl(".alerts-field", "width: 335px;");
checkDecl(".alerts-home span", "width: 125px;");
check(!cssBlock(".alerts-back").includes("transform:"), "alerts back icon must not be flipped");
check(!cssBlock(".alerts-plus").includes("transform:"), "alerts plus icon must not be flipped");
check(!cssBlock(".alerts-close").includes("transform:"), "alerts close icon must not be flipped");

check(alertsV2.includes('data-figma-id="85:10368"'), "alerts v2 donor id missing");
check(alertsV2.includes('data-figma-frame-width="750"'), "alerts v2 source width mismatch");
check(alertsV2.includes('data-figma-frame-height="1624"'), "alerts v2 source height mismatch");
check(alertsV2.includes('data-render-scale="0.5"'), "alerts v2 2x render scale must be explicit");
check(!alertsV2.includes("figma.com/api/mcp/asset"), "alerts v2 must not depend on temporary MCP URLs");
check(!alertsV2.includes("<svg"), "alerts v2 must not inline hand-drawn SVG; use localized Figma assets");
check(!alertsV2.includes("picker-unit"), "alerts v2 must not return to separately positioned picker units");
for (const text of ["Alerts", "Add Alerts", "Add", "Alert me ...min before the cook ends", "03", "30", "hr", "min", "Notes (Optional)", "Probe 1Cooking Complete"]) {
  check(alertsV2.includes(text), `alerts v2 missing text ${text}`);
}
for (const file of [
  "typhur-alerts-v2-status-time-85-10369.svg",
  "typhur-alerts-v2-status-right-85-10369.svg",
  "typhur-alerts-v2-back-85-10391.svg",
  "typhur-alerts-v2-plus-85-10391.svg",
  "typhur-alerts-v2-close-85-10398.svg",
]) {
  check(hasLocalAsset(alertsV2, file), `alerts v2 missing Figma SVG asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-alerts-v2-frame", "width: 375px;");
checkDecl(".typhur-alerts-v2-frame", "height: 812px;");
checkDecl(".alerts-v2-sheet", "top: 56px;");
checkDecl(".alerts-v2-sheet", "height: 756px;");
checkDecl(".alerts-v2-sheet", "border-radius: 12px 12px 0 0;");
checkDecl(".alerts-v2-picker-highlight", "left: 25px;");
checkDecl(".alerts-v2-picker-highlight", "top: 187.5px;");
checkDecl(".alerts-v2-picker-highlight", "width: 325px;");
checkDecl(".alerts-v2-picker-value", "align-items: baseline;");
checkDecl(".alerts-v2-hour-selected", "left: 130px;");
checkDecl(".alerts-v2-minute-selected", "left: 215px;");
checkDecl(".alerts-v2-divider", "top: 307.5px;");
checkDecl(".alerts-v2-notes", "top: 320px;");
checkDecl(".alerts-v2-field", "width: 335px;");
checkDecl(".alerts-v2-home span", "width: 125px;");
check(!cssBlock(".alerts-v2-back").includes("transform:"), "alerts v2 back icon must not be flipped");
check(!cssBlock(".alerts-v2-plus").includes("transform:"), "alerts v2 plus icon must not be flipped");
check(!cssBlock(".alerts-v2-close").includes("transform:"), "alerts v2 close icon must not be flipped");

check(alertsTemp.includes('data-figma-id="91:10443"'), "alerts temperature donor id missing");
check(alertsTemp.includes('data-figma-frame-width="750"'), "alerts temperature source width mismatch");
check(alertsTemp.includes('data-figma-frame-height="1624"'), "alerts temperature source height mismatch");
check(alertsTemp.includes('data-render-scale="0.5"'), "alerts temperature 2x render scale must be explicit");
check(!alertsTemp.includes("figma.com/api/mcp/asset"), "alerts temperature must not depend on temporary MCP URLs");
check(!alertsTemp.includes("<svg"), "alerts temperature must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["Alerts", "Edit Alerts", "Done", "Alert me when ambient temperature rises above...", "105", "°F", "32°F", "194°F", "Notes (Optional)", "Probe 1 Cooking Complete"]) {
  check(alertsTemp.includes(text), `alerts temperature missing text ${text}`);
}
for (const file of [
  "typhur-alerts-temp-status-time-91-10444.svg",
  "typhur-alerts-temp-status-right-91-10444.svg",
  "typhur-alerts-temp-back-91-10466.svg",
  "typhur-alerts-temp-nav-plus-91-10466.svg",
  "typhur-alerts-temp-knob-91-10486.svg",
  "typhur-alerts-temp-minus-91-10489.svg",
  "typhur-alerts-temp-plus-91-10492.svg",
  "typhur-alerts-temp-close-91-10497.svg",
]) {
  check(hasLocalAsset(alertsTemp, file), `alerts temperature missing Figma SVG asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-alerts-temp-frame", "width: 375px;");
checkDecl(".typhur-alerts-temp-frame", "height: 812px;");
checkDecl(".alerts-temp-sheet", "top: 56px;");
checkDecl(".alerts-temp-sheet", "height: 756px;");
checkDecl(".alerts-temp-sheet", "border-radius: 12px 12px 0 0;");
checkDecl(".alerts-temp-control", "left: 30px;");
checkDecl(".alerts-temp-control", "top: 157.5px;");
checkDecl(".alerts-temp-control", "width: 315px;");
checkDecl(".alerts-temp-value", "display: flex;");
checkDecl(".alerts-temp-value", "top: 2px;");
checkDecl(".alerts-temp-value strong", "font-size: 40px;");
checkDecl(".alerts-temp-value strong", "letter-spacing: -1.6px;");
checkDecl(".alerts-temp-track", "width: 315px;");
checkDecl(".alerts-temp-fill", "width: 155px;");
checkDecl(".alerts-temp-knob", "width: 24px;");
checkDecl(".alerts-temp-knob", "height: 24px;");
checkDecl(".alerts-temp-divider", "top: 307.5px;");
checkDecl(".alerts-temp-notes", "top: 320px;");
checkDecl(".alerts-temp-field", "width: 335px;");
checkDecl(".alerts-temp-home span", "width: 125px;");
check(!cssBlock(".alerts-temp-back").includes("transform:"), "alerts temperature back icon must not be flipped");
check(!cssBlock(".alerts-temp-nav-plus").includes("transform:"), "alerts temperature nav plus icon must not be flipped");
check(!cssBlock(".alerts-temp-close").includes("transform:"), "alerts temperature close icon must not be flipped");

check(recipeDetail.includes('data-figma-id="93:10684"'), "recipe detail donor id missing");
check(recipeDetail.includes('data-figma-frame-width="750"'), "recipe detail source width mismatch");
check(recipeDetail.includes('data-figma-frame-height="6124"'), "recipe detail source height mismatch");
check(recipeDetail.includes('data-render-scale="0.5"'), "recipe detail 2x render scale must be explicit");
check(!recipeDetail.includes("figma.com/api/mcp/asset"), "recipe detail must not depend on temporary MCP URLs");
check(!recipeDetail.includes("<svg"), "recipe detail must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["New York Strip Steaks", "Air Fryer", "Servings", "Total Time", "Ingredients", "Equipment", "Steps 1", "Start Cooking", "Parameters", "Air Fry", "25min", "450°F/230℃", "Bon Appétit!"]) {
  check(recipeDetail.includes(text), `recipe detail missing text ${text}`);
}
for (const file of [
  "typhur-recipe-detail-cover-93-10685.jpeg",
  "typhur-recipe-detail-status-right-93-10687.svg",
  "typhur-recipe-detail-status-time-93-10687.svg",
  "typhur-recipe-detail-top-btn-1-93-10710.svg",
  "typhur-recipe-detail-top-btn-2-93-10714.svg",
  "typhur-recipe-detail-back-circle-93-10721.svg",
  "typhur-recipe-detail-back-icon-93-10722.svg",
  "typhur-recipe-detail-icon-servings-93-10731.svg",
  "typhur-recipe-detail-icon-total-93-10732.svg",
  "typhur-recipe-detail-icon-prep-93-10733.svg",
  "typhur-recipe-detail-icon-difficulty-93-10734.svg",
  "typhur-recipe-detail-ingredient-93-10763.svg",
  "typhur-recipe-detail-pot-93-10763.svg",
]) {
  check(hasLocalAsset(recipeDetail, file), `recipe detail missing Figma asset ${file}`);
  checkAssetFile(file);
  if (file.endsWith(".svg")) checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-recipe-frame", "width: 375px;");
checkDecl(".typhur-recipe-frame", "height: 3062px;");
checkDecl(".typhur-recipe-frame", '"Segoe UI", Arial, sans-serif;');
checkDecl(".recipe-cover", "height: 425px;");
checkDecl(".recipe-cover-img", "object-fit: cover;");
checkDecl(".recipe-detail-sheet", "top: 415px;");
checkDecl(".recipe-detail-sheet", "border-radius: 12px 12px 0 0;");
checkDecl(".recipe-stat-row img", "width: 40px;");
checkDecl(".recipe-summary h1", "font-size: 20px;");
checkDecl(".recipe-summary h1", "font-weight: 700;");
checkDecl(".recipe-description", "font-size: 15px;");
checkDecl(".recipe-description", "line-height: 21px;");
checkDecl(".recipe-step > p", "font-size: 15px;");
checkDecl(".recipe-step > p", "line-height: 21px;");
checkDecl(".recipe-step-meta img", "width: 18px;");
checkDecl(".recipe-step-meta img", "height: 18px;");
checkDecl(".recipe-parameters", "width: 335px;");
checkDecl(".recipe-parameters", "background: #f7f7f7;");
checkDecl(".recipe-floating", "bottom: 20px;");
checkDecl(".recipe-floating", "width: 150px;");
check(!cssBlock(".recipe-back-icon").includes("transform:"), "recipe detail back icon must not be flipped");

check(customTime.includes('data-figma-id="97:11112"'), "custom time donor id missing");
check(customTime.includes('data-figma-frame-width="750"'), "custom time source width mismatch");
check(customTime.includes('data-figma-frame-height="1720"'), "custom time source height mismatch");
check(customTime.includes('data-render-scale="0.5"'), "custom time 2x render scale must be explicit");
check(!customTime.includes("figma.com/api/mcp/asset"), "custom time must not depend on temporary MCP URLs");
check(!customTime.includes("<svg"), "custom time must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["Custom", "Name", "Name Your Cooking", "Main Ingredient", "Beef", "Pork", "Seafood", "Poultry", "Eggs", "Desserts", "Veggies", "Other", "Parameters", "Target Temp", "Cooking Time", "Note", "Set Cooking Time", "03", "hr", "30", "min", "Cancel", "Set", "Save"]) {
  check(customTime.includes(text), `custom time missing text ${text}`);
}
for (const file of [
  "typhur-custom-status-right-97-11116.svg",
  "typhur-custom-status-time-97-11133.svg",
  "typhur-custom-arrow-back-97-11135.svg",
  "typhur-custom-steak-97-11139.svg",
  "typhur-custom-dessert-97-11144.svg",
  "typhur-custom-vegetable-97-11145.svg",
  "typhur-custom-dish-97-11146.svg",
  "typhur-custom-arrow-forward-97-11149.svg",
]) {
  check(hasLocalAsset(customTime, file), `custom time missing Figma asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
check(!customTime.includes("figma-crop-fallback"), "custom time must not use screenshot crop fallbacks without explicit user approval");
check(!customTime.includes("-crop.png"), "custom time must not use cropped screenshot assets as icon substitutes");
checkDecl(".typhur-custom-time-frame", "width: 375px;");
checkDecl(".typhur-custom-time-frame", "height: 860px;");
checkDecl(".typhur-custom-time-frame", '"Segoe UI", Arial, sans-serif;');
checkDecl(".custom-time-input", "top: 46px;");
checkDecl(".custom-time-grid", "top: 38px;");
checkDecl(".custom-time-sheet", "height: 323px;");
checkDecl(".custom-time-sheet", "border-radius: 12px 12px 0 0;");
checkDecl(".custom-time-picker-highlight", "width: 325px;");
checkDecl(".custom-time-picker-value", "display: flex;");
checkDecl(".custom-time-picker-value", "align-items: baseline;");
checkDecl(".custom-time-picker-value strong", "font-size: 20px;");
checkDecl(".custom-time-picker-value span", "font-size: 16px;");
checkDecl(".custom-time-cancel", "width: 161.5px;");
checkDecl(".custom-time-set", "left: 193.5px;");
check(!cssBlock(".custom-time-back").includes("transform:"), "custom time back icon must not be flipped");

check(testCustom.includes('data-figma-id="9:1674"'), "test custom donor id missing");
check(testCustom.includes('data-figma-file-key="H9GTGgnI0rzfnrKSt1Hlui"'), "test custom file key missing");
check(testCustom.includes('data-figma-frame-width="750"'), "test custom source width mismatch");
check(testCustom.includes('data-figma-frame-height="2190"'), "test custom source height mismatch");
check(testCustom.includes('data-render-scale="0.5"'), "test custom 2x render scale must be explicit");
check(!testCustom.includes("figma.com/api/mcp/asset"), "test custom must not depend on temporary MCP URLs");
check(!testCustom.includes("figma-crop-fallback"), "test custom must not use screenshot crop fallbacks");
check(!testCustom.includes("-crop.png"), "test custom must not use cropped screenshot assets as icon substitutes");
check(!testCustom.includes("<svg"), "test custom must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["Custom", "Name", "Cooking Name", "Main Ingredient", "Beef", "Pork", "Seafood", "Poultry", "Eggs", "Desserts", "Veggies", "Other", "Parameters", "Target Temp", "190°F", "Cooking Time", "45min", "Note", "Save"]) {
  check(testCustom.includes(text), `test custom missing text ${text}`);
}
for (const file of [
  "typhur-test-status-right-9-1678.svg",
  "typhur-test-status-time-9-1695.svg",
  "typhur-test-arrow-back-9-1697.svg",
  "typhur-test-steak-9-1701.svg",
  "typhur-test-pork-9-1702.svg",
  "typhur-test-seafood-9-1703.svg",
  "typhur-test-poultry-9-1704.svg",
  "typhur-test-eggs-9-1705.svg",
  "typhur-test-dessert-9-1706.svg",
  "typhur-test-vegetable-9-1707.svg",
  "typhur-test-dish-9-1708.svg",
  "typhur-test-arrow-forward-9-1711.svg",
]) {
  check(hasLocalAsset(testCustom, file), `test custom missing Figma asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-test-custom-frame", "width: 375px;");
checkDecl(".typhur-test-custom-frame", "height: 1095px;");
checkDecl(".ty-test-input", "top: 46px;");
checkDecl(".ty-test-grid", "top: 38px;");
checkDecl(".ty-test-param-title", "top: 633px;");
checkDecl(".ty-test-note", "top: 801px;");
checkDecl(".ty-test-save", "bottom: 20px;");
check(!cssBlock(".ty-test-back").includes("transform:"), "test custom back icon must not be flipped");

check(testProfessional.includes('data-figma-id="15:1859"'), "test professional donor id missing");
check(testProfessional.includes('data-figma-file-key="H9GTGgnI0rzfnrKSt1Hlui"'), "test professional file key missing");
check(testProfessional.includes('data-figma-frame-width="750"'), "test professional source width mismatch");
check(testProfessional.includes('data-figma-frame-height="1624"'), "test professional source height mismatch");
check(testProfessional.includes('data-render-scale="0.5"'), "test professional 2x render scale must be explicit");
check(!testProfessional.includes("figma.com/api/mcp/asset"), "test professional must not depend on temporary MCP URLs");
check(!testProfessional.includes("figma-crop-fallback"), "test professional must not use screenshot crop fallbacks");
check(!testProfessional.includes("-crop.png"), "test professional must not use cropped screenshot assets");
check(!testProfessional.includes("<svg"), "test professional must not inline hand-drawn SVG; use localized Figma assets");
for (const text of ["Probe 1", "Device Name - MU4A", "Connect your base to the Internet", "Cooking", "Rib Roast Medium Rare", "132.9", "Target", "Ambient", "Remaining", "Cook Duration", "Edit", "Stop"]) {
  check(testProfessional.includes(text), `test professional missing text ${text}`);
}
for (const file of [
  "typhur-prof-status-right-15-1860.svg",
  "typhur-prof-status-time-15-1860.svg",
  "typhur-prof-back-15-1861.svg",
  "typhur-prof-switch-15-1861.svg",
  "typhur-prof-edit-15-1861.svg",
  "typhur-prof-scrollbar-15-1862.svg",
  "typhur-prof-wifi-15-1867.svg",
  "typhur-prof-alerts-15-1888.svg",
  "typhur-prof-battery-15-1892.svg",
  "typhur-prof-sensors-15-1899.svg",
  "typhur-prof-chart-15-1938.svg",
]) {
  check(hasLocalAsset(testProfessional, file), `test professional missing Figma asset ${file}`);
  checkAssetFile(file);
  checkSvgHasNoExportedBackground(file);
}
checkDecl(".typhur-test-professional-frame", "width: 375px;");
checkDecl(".typhur-test-professional-frame", "height: 812px;");
checkDecl(".ty-prof-notify", "top: 115px;");
checkDecl(".ty-prof-sensors", "top: 252px;");
checkDecl(".ty-prof-chart", "top: 362px;");
checkDecl(".ty-prof-card", "top: 617.5px;");
checkDecl(".ty-prof-bottom", "top: 722px;");
check(!cssBlock(".ty-prof-back").includes("transform:"), "test professional back icon must not be flipped");

if (failures.length) {
  console.error("Typhur pages audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Typhur pages audit passed.");

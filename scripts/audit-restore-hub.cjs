const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "figma-restore-pages.html"), "utf8");
const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const pages = [
  ["sy-v1.html", "我的 V1"],
  ["v3.html", "我的 V3"],
  ["v5.html", "我的 V5"],
  ["service.html", "服务"],
  ["mall.html", "商城"],
  ["activity-form.html", "活动信息填写"],
  ["order-detail.html", "订单详情-待收货"],
  ["checkout.html", "订单结算"],
  ["order-list.html", "小程序商城订单"],
  ["order-pay-detail.html", "订单详情-待付款"],
  ["product-detail.html", "商品详情"],
  ["community-activity.html", "社区活动"],
  ["typhur-calendar.html", "Typhur 月历"],
  ["typhur-wellness.html", "AI Wellness"],
  ["typhur-ice-maker.html", "制冰机详情"],
  ["typhur-cook.html", "Typhur 烹饪中"],
  ["typhur-probe-cooking.html", "Typhur 探针烹饪"],
  ["typhur-probe-lost.html", "Typhur 探针未配对"],
  ["typhur-overheat.html", "Typhur 探针过热"],
  ["typhur-share-cooking.html", "Typhur 分享烹饪"],
  ["typhur-alerts-temperature.html", "Typhur 温度提醒"],
  ["typhur-alerts-v2.html", "Typhur 添加提醒 V2"],
  ["typhur-alerts.html", "Typhur 添加提醒"],
  ["typhur-recipe-detail.html", "Typhur 食谱详情"],
  ["typhur-custom-time.html", "Typhur 自定义烹饪时间"],
  ["typhur-test-custom.html", "Typhur Test Custom"],
  ["typhur-test-custom-time.html", "Typhur Test Custom Time"],
  ["typhur-test-professional.html", "Typhur Test Professional"],
  ["typhur-test-schedule.html", "Typhur Test Schedule"],
  ["typhur-test-preheat.html", "Typhur Test Preheat"],
  ["untitled-date-picker.html", "类型日期"],
  ["untitled-coupon-redemption.html", "优惠券核销"],
  ["untitled-schedule.html", "Schedule"],
  ["untitled-pair-devices-list.html", "选择设备"],
  ["untitled-pair-devices-empty.html", "设备空状态"],
  ["untitled-pair-pairing-progress.html", "设备配对中"],
  ["untitled-pair-success.html", "设备配对成功"],
  ["untitled-pair-failed.html", "设备配对失败"],
  ["untitled-pair-offline-failed.html", "离线配对失败"],
  ["untitled-pair-wifi-list-loading.html", "Wi-Fi 列表加载"],
  ["untitled-pair-wifi-list.html", "Wi-Fi 列表"],
  ["untitled-pair-connect-state.html", "设备连接状态"],
  ["untitled-pair-bluetooth-confirm.html", "蓝牙配对确认"],
  ["untitled-pair-wifi-password-keyboard.html", "Wi-Fi 密码键盘"],
  ["untitled-pair-wifi-password.html", "Wi-Fi 密码错误"],
  ["untitled-pair-wifi-connecting.html", "Wi-Fi 连接中"],
  ["untitled-pair-rename.html", "设备重命名"],
  ["untitled-pair-region-details.html", "设备区域说明"],
  ["untitled-pair-nearby-devices.html", "附近设备"],
  ["售后小程序项目/index.html", "售后小程序-首页"],
  ["售后小程序项目/my.html", "售后小程序-我的"],
  ["售后小程序项目/products.html", "售后小程序-全部产品"],
  ["售后小程序项目/product-detail.html", "售后小程序-产品详情"],
  ["售后小程序项目/register-product.html", "售后小程序-注册产品"],
  ["售后小程序项目/after-sales.html", "售后小程序-售后申请"],
];

check(html.includes("<h1>figma还原页面</h1>"), "first-level nav title missing");
check((html.match(/data-page="/g) || []).length === pages.length, "second-level page count mismatch");
check((html.match(/class="restore-page-button/g) || []).length === pages.length, "page button count mismatch");
check(html.includes("sy 设计稿还原"), "sy design group title missing");
check(html.includes("typhur测试还原页面"), "typhur test group title missing");
check(html.includes("sy售后小程序设计"), "after-sales mini program group title missing");
check(html.includes("Untitled 一级 Frame"), "Untitled frame group title missing");
check(html.includes("Untitled 设备配网页面"), "Untitled pairing group title missing");
check((html.match(/class="restore-nav-group"/g) || []).length === 5, "restore nav groups mismatch");
check(html.includes("<details class=\"restore-nav-group\" open>"), "restore nav groups must be collapsible details");
check(html.includes('id="restoreHubFrame"'), "preview iframe missing");
check(html.includes('id="restoreRegisterNote"'), "register product SN hint missing");
check(indexHtml.includes('id="restoreRegisterNote"'), "root register product SN hint missing");
check(html.includes("TB202607100001") && html.includes("SN-OK-001"), "register product demo credentials missing");
check(indexHtml.includes("TB202607100001") && indexHtml.includes("SN-OK-001"), "root register product demo credentials missing");
check(css.includes(".restore-hub"), "hub css missing");
check(css.includes(".restore-register-note"), "register product SN hint css missing");
check(css.includes(".restore-nav-group summary"), "collapsible nav group css missing");

for (const [file, title] of pages) {
  check(fs.existsSync(path.join(root, file)), `${file} does not exist`);
  check(html.includes(`data-page="${file}"`), `${file} nav link missing`);
  check(html.includes(`data-title="${title}"`), `${title} nav title missing`);
  check(indexHtml.includes(`data-page="${file}"`), `${file} root nav link missing`);
  check(indexHtml.includes(`data-title="${title}"`), `${title} root nav title missing`);
}

if (failures.length) {
  console.error("Restore hub audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Restore hub audit passed.");

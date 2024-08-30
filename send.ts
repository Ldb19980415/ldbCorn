const puppeteer = require("puppeteer");
const path = require("path");
const os = require("os");
const autoCheckInJueJin = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 0,
      height: 0,
    },
    slowMo: 200,
    // userDataDir: path.join(os.homedir(), "./puppeteer-data"), //指定用户数据目录的路径，用于存储浏览器的用户数据
    userDataDir: "./puppeteer-data",
  });
  const page = await browser.newPage();
  await page.goto("https://juejin.cn/user/center/signin?from=sign_in_menu_bar");
  //   // 就是玩
  //   await page.waitForSelector("a.byte-menu-item");

  //   // 获取所有 a.byte-menu-item 元素
  //   const elements = await page.$$("a.byte-menu-item");
  //   console.log(elements)
  //   for (let i = 0; i < 10; i++) {
  //     for (let element of elements) {
  //       await element.click(); // 点击每个元素
  //       await sleep(1000);
  //     }
  //   }

  await sleep(3000); // 等待渲染页面
  const checkedBtn = await page.$$("button.signedin"); // 获取已签到按钮
  if (checkedBtn?.length) {
    // 已经签到过了，结束
    console.error("今天已经签到过了");
    await browser.close();
    return;
  }

  // 签到
  await page.waitForSelector("button.signin");
  await page.click("button.signin");
  await page.waitForSelector("div.btn-area > button.btn");
  await page.click("div.btn-area > button.btn");

  // 去抽奖
  await page.waitForSelector("#turntable-item-0");
  await page.click("#turntable-item-0");
  await page.waitForSelector(".wrapper .submit");
  await page.click(".wrapper .submit");
  // 关闭浏览器
  await browser.close();
};

const ai = async () => {
  await autoCheckInJueJin();
};
ai();

const sleep = (ms: number) => {
  return new Promise((resolve: any) => setTimeout(() => resolve(), ms));
};

import puppeteer, { Browser, Page } from "puppeteer";

export class BrowserClass {
  private browser!: Browser;
  private page!: Page;

  async init() {
    this.browser = await puppeteer.launch({ headless: false });
    this.page = await this.browser.newPage();
  }

  async navigateTo(url: string, waitForSelector: string = "") {
    await this.page.goto(url, { waitUntil: "networkidle2" });
    if (typeof waitForSelector === "string" && waitForSelector?.length !== 0) {
      await this.page.waitForSelector(waitForSelector);
    }
  }

  async extractHtml(): Promise<string> {
    return this.page.evaluate(() => document.querySelector("*")!.outerHTML);
  }

  async terminateBrowser() {
    await this.browser.close();
  }
}

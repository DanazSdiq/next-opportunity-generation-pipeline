import { Opportunity } from "../../scrapers/scrapers.schema";
import { BrowserClass, PageConfig } from "../";
import { CacheConfig } from "./base.schema";

export class BaseClass {
  public cacheConfig: CacheConfig = {
    shouldCachePages: true,
    shouldReadFromCache: true
  };

  public parentPages: PageConfig[] = [];
  public isProcessingParentPages: boolean = false;

  public childPages: PageConfig[] = [];
  public isProcessingChildPages: boolean = false;

  public activePage!: PageConfig;
  public opportunities: Opportunity[] = [];

  async beginToRetrieve() {
    const activePages = this.parentPages;
    let shouldAppendMorePagesIfExists: boolean = true;
    const browser = new BrowserClass();
    await browser.init();

    for (let index = 0; index < activePages.length; index++) {
      const { url, waitForSelector } = this.parentPages[index];
      this.isProcessingParentPages = true;
      this.activePage = {
        url: url,
        waitForSelector: waitForSelector
      };

      await browser.navigateTo(url, waitForSelector);
      const body: string = await browser.extractHtml();

      this.handlePageContent(body);

      if (index === activePages.length - 1 && shouldAppendMorePagesIfExists) {
        shouldAppendMorePagesIfExists = false;
        this.isProcessingParentPages = false;
        this.isProcessingChildPages = true;
        activePages.push(...this.childPages);
      }
    }

    await browser.terminateBrowser();
    await this.postOpportunities();
  }

  handlePageContent(body: string) {
    body;
  }

  async postOpportunities() {}
}

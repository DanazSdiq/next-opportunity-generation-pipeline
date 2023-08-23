import { Opportunity } from "../../opportunities/opportunities.schema";
import { BrowserClass, PageConfig, instance } from "../";
import { CacheConfig, Organization } from "./base.schema";
import { Cache } from "../";

export class BaseClass {
  public cacheConfig: CacheConfig = {
    shouldCachePages: true,
    shouldReadFromCache: true
  };

  public organizations: Organization[] = [];

  public parentPages: PageConfig[] = [];
  public isProcessingParentPages: boolean = false;

  public childPages: PageConfig[] = [];
  public isProcessingChildPages: boolean = false;

  public activePage!: PageConfig;
  public opportunities: Opportunity[] = [];

  async beginToRetrieve() {
    const activePages = this.parentPages;
    let shouldAppendMorePagesIfExists: boolean = true;
    const caching = new Cache();
    const browser = new BrowserClass();
    await browser.init();

    for (let index = 0; index < activePages.length; index++) {
      const { url, waitForSelector } = this.parentPages[index];
      this.isProcessingParentPages = true;
      this.activePage = {
        url: url,
        waitForSelector: waitForSelector
      };

      let body: string = this.cacheConfig.shouldReadFromCache
        ? caching.readFromCache(url)
        : "";

      if (body.length === 0) {
        await browser.navigateTo(url, waitForSelector);
        body = await browser.extractHtml();
        if (this.cacheConfig.shouldCachePages) {
          caching.cacheContent(body, url);
        }
      }

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

  async postOpportunities() {
    await instance.post("/organizations", this.organizations);
    await instance.post("/opportunities", this.opportunities);
  }
}

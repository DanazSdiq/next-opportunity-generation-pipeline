import * as cheerio from "cheerio";

import { OpportunityCommitment } from "./opportunities.schema";
import { BaseClass } from "../shared/BaseClass/Base.class";
import { PageConfig } from "../shared";

export class OpportunityClass extends BaseClass {
  parentPages: PageConfig[] = [{ url: "https://jobs.lever.co/coingecko" }];

  async start() {
    await this.beginToRetrieve();
  }

  handlePageContent(body: string) {
    if (this.isProcessingParentPages) this.handlePrimaryPage(body);
    if (this.isProcessingChildPages) this.handleOpportunityPage(body);
  }

  private handlePrimaryPage(body: string) {
    const $ = cheerio.load(body);

    $(".posting-title").each((_index: number, element: cheerio.Element) => {
      const opportunityUrl = $(element).attr("href")?.trim() || "";
      if (opportunityUrl.length !== 0) {
        this.childPages.push({ url: opportunityUrl });
      }
    });
  }

  private handleOpportunityPage(body: string): void {
    const $ = cheerio.load(body);

    const company = this.getCompanyName();
    const heading: string = $(".posting-headline h2").text() || "";
    const description: string = $("[data-qa='job-description']").text();

    $(".posting-categories").each((_i: number, el: cheerio.Element) => {
      const location: string =
        $(el)
          .find(".location")
          .text()
          .replace(/\/$/g, "")
          .replace(/^\//g, "")
          .trim() || "";

      const department: string =
        $(el)
          .find(".department")
          .text()
          .replace(/\/$/g, "")
          .replace(/^\//g, "")
          .trim() || "";

      const { commitment } = this.getCommitment($, el);
      const type: string =
        $(el)
          .find(".workplaceTypes")
          .text()
          .replace(/\/$/g, "")
          .replace(/^\//g, "")
          .trim() || "";

      this.opportunities.push({
        url: this.activePage.url,
        company,
        title: heading,
        description,
        labels: [location, department, type],
        commitment
      });
    });
  }

  private getCompanyName = (): string => {
    return this.parentPages[0].url.replace(/.*jobs.lever.co\//, "").trim();
  };

  private getCommitment = (
    $: cheerio.CheerioAPI,
    el: cheerio.Element
  ): OpportunityCommitment => {
    const commitment = $(el)
      .find(".commitment")
      .text()
      .toLowerCase()
      .replace("/", "");

    if (commitment.includes("part")) {
      return { commitment: "part-time" };
    } else if (commitment.includes("full")) {
      return { commitment: "full-time" };
    } else if (commitment.includes("contract")) {
      return { commitment: "contract" };
    }

    return { commitment: "unknown" };
  };
}

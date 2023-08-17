import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";

import { OpportunityCommitment } from "./opportunities.schema";
import { BaseClass } from "../shared/BaseClass/Base.class";
import { Organization, PageConfig } from "../shared";

export class OpportunityClass extends BaseClass {
  organizations: Organization[] = [
    { name: "CoinGecko", main_url: "https://jobs.lever.co/coingecko" }
  ];
  parentPages: PageConfig[] = [{ url: this.organizations[0].main_url }];

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

    const organization = this.getOrganizationName();
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
        id: uuidv4(),
        url: this.activePage.url,
        organization_name: organization,
        title: heading,
        description,
        labels: [location, department, type],
        commitment
      });
    });
  }

  private getOrganizationName = (): string => {
    const nameFromUrl = this.parentPages[0].url
      .replace(/.*jobs.lever.co\//, "")
      .trim();
    const registeredName = this.organizations.find(
      (org) => org.name.toLowerCase() === nameFromUrl
    );

    return registeredName?.name || "";
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

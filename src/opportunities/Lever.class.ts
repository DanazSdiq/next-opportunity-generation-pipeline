import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

import { OpportunityCommitment } from "./opportunities.schema";
import { BaseClass } from "../shared/BaseClass/Base.class";
import { Organization, PageConfig, convertHTMLToMarkdown } from "../shared";

export default class OpportunityClass extends BaseClass {
  organizations: Organization[] = [
    {
      name: "CoinGecko",
      main_url: "https://jobs.lever.co/coingecko",
      created_at: format(new Date(), "yyyy-MM-dd")
    },
    {
      name: "Polygon",
      main_url: "https://jobs.lever.co/Polygon",
      created_at: format(new Date(), "yyyy-MM-dd")
    },
    {
      name: "Chainlink",
      main_url: "https://jobs.lever.co/chainlink",
      created_at: format(new Date(), "yyyy-MM-dd")
    }
  ];
  parentPages: PageConfig[] = [
    { url: this.organizations[0].main_url },
    { url: this.organizations[1].main_url },
    { url: this.organizations[2].main_url }
  ];

  async start() {
    await this.beginToRetrieve();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handlePageContent(body: string, url: string) {
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
    const description: string = convertHTMLToMarkdown(
      $("[data-qa='job-description']").html() || ""
    );

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
        commitment,
        created_at: format(new Date(), "yyyy-MM-dd")
      });
    });
  }

  private getOrganizationName = (): string => {
    const nameFromUrl = this.activePage.url
      .replace(/.*jobs.lever.co\//, "")
      .replace(/\/.*/g, "")
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

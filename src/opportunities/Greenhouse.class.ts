import * as cheerio from "cheerio";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

import {
  BaseClass,
  Organization,
  PageConfig,
  convertHTMLToMarkdown
} from "../shared";
import { OpportunityCommitment } from "./opportunities.schema";

export class OpportunityClass extends BaseClass {
  organizations: Organization[] = [
    {
      name: "Avalanche Labs",
      main_url: "https://boards.greenhouse.io/avalabs",
      created_at: format(new Date(), "yyyy-MM-dd")
    },
    {
      name: "OP Labs",
      main_url: "https://boards.greenhouse.io/oplabs",
      created_at: format(new Date(), "yyyy-MM-dd")
    },
    {
      name: "O(1) Labs - Mina",
      main_url: "https://boards.greenhouse.io/o1labs",
      created_at: format(new Date(), "yyyy-MM-dd")
    },
    {
      name: "Aptos",
      main_url: "https://boards.greenhouse.io/aptoslabs",
      created_at: format(new Date(), "yyyy-MM-dd")
    }
  ];
  parentPages: PageConfig[] = [
    { url: this.organizations[0].main_url },
    { url: this.organizations[1].main_url },
    { url: this.organizations[2].main_url },
    { url: this.organizations[3].main_url }
  ];

  async start() {
    await this.beginToRetrieve();
  }

  handlePageContent(body: string, url: string) {
    if (this.isProcessingParentPages) this.handlePrimaryPage(body);
    if (this.isProcessingChildPages) this.handleOpportunityPage(body, url);
  }

  private handlePrimaryPage(body: string) {
    const baseUrl: string = "https://boards.greenhouse.io";
    const $ = cheerio.load(body);

    $(".opening a").each((_index: number, element: cheerio.Element) => {
      const opportunityUrl = $(element).attr("href")?.trim() || "";
      this.childPages.push({ url: baseUrl + opportunityUrl });
    });
  }

  private handleOpportunityPage(body: string, url: string): void {
    const $ = cheerio.load(body);

    const title: string = $(".app-title").first().text() || "";
    const organizationName: string = this.extractOrganizationName(url);
    const content: string = $("#content").html() || "";
    const description: string = convertHTMLToMarkdown(content);
    const commtiment: string = $(".location").first().text().trim() || "";
    const { commitment: normalizedCommitment } = this.getCommitment(commtiment);
    const location: string = commtiment;

    this.opportunities.push({
      id: uuidv4(),
      url: url,
      organization_name: organizationName,
      title,
      description,
      labels: [location, commtiment],
      commitment: normalizedCommitment,
      created_at: format(new Date(), "yyyy-MM-dd")
    });
  }

  private extractOrganizationName(url: string): string {
    return (
      this.organizations.find((p) => url.startsWith(p.main_url))?.name || ""
    );
  }

  private getCommitment = (commitment: string): OpportunityCommitment => {
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

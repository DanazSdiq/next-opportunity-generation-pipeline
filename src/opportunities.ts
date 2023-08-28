import Opportunities from "./opportunities/index";

(async () => {
  const [argName]: string[] = process.argv.slice(2);

  const filteredOpportunity = Object.entries(Opportunities).filter(
    ([name]) => name === argName
  );
  const entries =
    filteredOpportunity.length !== 0
      ? filteredOpportunity
      : Object.entries(Opportunities);

  for (const [opportunityName, OpportunityClass] of entries) {
    if (argName?.length !== 0 && opportunityName === argName) {
      const op = new OpportunityClass();
      await op.start();

      break;
    } else {
      const op = new OpportunityClass();
      await op.start();
    }
  }
})();

import { OpportunityClass } from "./opportunities/Greenhouse.class";

(async () => {
  const op = new OpportunityClass();
  await op.start();
})();

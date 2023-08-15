import { OpportunityClass } from "./opportunities/Lever.class";

(async () => {
  const op = new OpportunityClass();
  await op.start();
})();

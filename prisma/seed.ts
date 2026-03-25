import { PrismaClient } from "@prisma/client";
import { DEFAULT_VEHICLES } from "../src/lib/vehicles/default-vehicles";
import { DEFAULT_MVP_SETTINGS } from "../src/lib/settings/default-settings";

const prisma = new PrismaClient();

const run = async () => {
  for (const vehicle of DEFAULT_VEHICLES) {
    await prisma.vehicleType.upsert({
      where: { id: vehicle.id },
      update: {
        ...vehicle
      },
      create: {
        ...vehicle
      }
    });
  }

  await prisma.settings.upsert({
    where: { id: "mvp-default-settings" },
    update: {
      defaultCurrency: "PLN",
      defaultFuelSource: "fallback-static",
      defaultCurrencySource: "nbp",
      fallbackFuelPrice: DEFAULT_MVP_SETTINGS.fallbackFuelPricePlnPerLiter,
      fallbackExchangeRate: DEFAULT_MVP_SETTINGS.fallbackPlnToEurRate,
      permitCostPln: DEFAULT_MVP_SETTINGS.permitCostPln,
      oversizeSurchargePln: DEFAULT_MVP_SETTINGS.oversizeSurchargePln,
      craneCostPln: DEFAULT_MVP_SETTINGS.craneCostPln
    },
    create: {
      id: "mvp-default-settings",
      defaultCurrency: "PLN",
      defaultFuelSource: "fallback-static",
      defaultCurrencySource: "nbp",
      fallbackFuelPrice: DEFAULT_MVP_SETTINGS.fallbackFuelPricePlnPerLiter,
      fallbackExchangeRate: DEFAULT_MVP_SETTINGS.fallbackPlnToEurRate,
      permitCostPln: DEFAULT_MVP_SETTINGS.permitCostPln,
      oversizeSurchargePln: DEFAULT_MVP_SETTINGS.oversizeSurchargePln,
      craneCostPln: DEFAULT_MVP_SETTINGS.craneCostPln
    }
  });
};

run()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log("Prisma seed finished.");
  })
  .catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

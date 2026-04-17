import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding rewards catalog...");

  const rewards = [
    {
      name: "Amazon Gift Card",
      slug: "amazon-gift-card-50",
      description: "A platform-funded Amazon gift card for referrers who consistently help serious candidates.",
      category: "GIFT_CARD" as const,
      coinCost: 1000,
      stock: 12,
    },
    {
      name: "Swag Kit",
      slug: "referrly-swag-kit",
      description: "Referrly hoodie, desk mat, notebook, and stickers for trusted referrers.",
      category: "GOODIES" as const,
      coinCost: 1000,
      stock: 29,
    },
  ];

  for (const reward of rewards) {
    await prisma.rewardItem.upsert({
      where: { slug: reward.slug },
      update: {
        name: reward.name,
        description: reward.description,
        category: reward.category,
        coinCost: reward.coinCost,
        stock: reward.stock,
        active: true,
      },
      create: {
        ...reward,
        active: true,
      },
    });
  }

  console.log(`Rewards catalog seeded successfully: ${rewards.length} item(s).`);
}

main()
  .catch((error) => {
    console.error("Failed to seed rewards catalog", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

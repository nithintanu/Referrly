import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  await prisma.coinTransaction.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.referralRequest.deleteMany();
  await prisma.rewardItem.deleteMany();

  const seeker1 = await prisma.user.upsert({
    where: { email: "seeker1@example.com" },
    update: {
      password,
      name: "John Doe",
      role: "SEEKER",
      company: "Targeting product roles in top SaaS companies",
      skills: JSON.stringify(["React", "TypeScript", "Node.js", "PostgreSQL"]),
      experience: 2,
      referallyCoins: 0,
      profile: {
        upsert: {
          create: {
            bio: "Frontend developer looking for opportunities",
            portfolioUrl: "https://johndoe.com",
          },
          update: {
            bio: "Frontend developer looking for opportunities",
            portfolioUrl: "https://johndoe.com",
          },
        },
      },
    },
    create: {
      email: "seeker1@example.com",
      password,
      name: "John Doe",
      role: "SEEKER",
      company: "Targeting product roles in top SaaS companies",
      skills: JSON.stringify(["React", "TypeScript", "Node.js", "PostgreSQL"]),
      experience: 2,
      referallyCoins: 0,
      profile: {
        create: {
          bio: "Frontend developer looking for opportunities",
          portfolioUrl: "https://johndoe.com",
        },
      },
    },
  });

  const seeker2 = await prisma.user.upsert({
    where: { email: "seeker2@example.com" },
    update: {
      password,
      name: "Jane Smith",
      role: "SEEKER",
      company: "Open to cloud and backend opportunities",
      skills: JSON.stringify(["Java", "Spring Boot", "AWS", "Kubernetes"]),
      experience: 3,
      referallyCoins: 0,
      profile: {
        upsert: {
          create: {
            bio: "Backend engineer seeking new challenges",
            portfolioUrl: "https://janesmith.dev",
          },
          update: {
            bio: "Backend engineer seeking new challenges",
            portfolioUrl: "https://janesmith.dev",
          },
        },
      },
    },
    create: {
      email: "seeker2@example.com",
      password,
      name: "Jane Smith",
      role: "SEEKER",
      company: "Open to cloud and backend opportunities",
      skills: JSON.stringify(["Java", "Spring Boot", "AWS", "Kubernetes"]),
      experience: 3,
      referallyCoins: 0,
      profile: {
        create: {
          bio: "Backend engineer seeking new challenges",
          portfolioUrl: "https://janesmith.dev",
        },
      },
    },
  });

  const referrer1 = await prisma.user.upsert({
    where: { email: "referrer1@google.com" },
    update: {
      password,
      name: "Alex Johnson",
      role: "REFERRER",
      company: "Google",
      skills: JSON.stringify(["React", "TypeScript", "Python", "Cloud"]),
      experience: 8,
      referallyCoins: 90,
      profile: {
        upsert: {
          create: {
            bio: "Senior Software Engineer at Google, helping others join the team",
            linkedinUrl: "https://linkedin.com/in/alex-johnson",
          },
          update: {
            bio: "Senior Software Engineer at Google, helping others join the team",
            linkedinUrl: "https://linkedin.com/in/alex-johnson",
          },
        },
      },
    },
    create: {
      email: "referrer1@google.com",
      password,
      name: "Alex Johnson",
      role: "REFERRER",
      company: "Google",
      skills: JSON.stringify(["React", "TypeScript", "Python", "Cloud"]),
      experience: 8,
      referallyCoins: 90,
      profile: {
        create: {
          bio: "Senior Software Engineer at Google, helping others join the team",
          linkedinUrl: "https://linkedin.com/in/alex-johnson",
        },
      },
    },
  });

  const referrer2 = await prisma.user.upsert({
    where: { email: "referrer2@microsoft.com" },
    update: {
      password,
      name: "Sarah Williams",
      role: "REFERRER",
      company: "Microsoft",
      skills: JSON.stringify(["C#", ".NET", "Azure", "ML"]),
      experience: 10,
      referallyCoins: 20,
      profile: {
        upsert: {
          create: {
            bio: "Tech lead on the Microsoft Azure team",
            linkedinUrl: "https://linkedin.com/in/sarah-williams",
          },
          update: {
            bio: "Tech lead on the Microsoft Azure team",
            linkedinUrl: "https://linkedin.com/in/sarah-williams",
          },
        },
      },
    },
    create: {
      email: "referrer2@microsoft.com",
      password,
      name: "Sarah Williams",
      role: "REFERRER",
      company: "Microsoft",
      skills: JSON.stringify(["C#", ".NET", "Azure", "ML"]),
      experience: 10,
      referallyCoins: 20,
      profile: {
        create: {
          bio: "Tech lead on the Microsoft Azure team",
          linkedinUrl: "https://linkedin.com/in/sarah-williams",
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@referrly.com" },
    update: {
      password,
      name: "Platform Admin",
      role: "ADMIN",
      referallyCoins: 0,
      profile: {
        upsert: {
          create: {
            bio: "Admin account for dashboard and moderation workflows",
          },
          update: {
            bio: "Admin account for dashboard and moderation workflows",
          },
        },
      },
    },
    create: {
      email: "admin@referrly.com",
      password,
      name: "Platform Admin",
      role: "ADMIN",
      referallyCoins: 0,
      profile: {
        create: {
          bio: "Admin account for dashboard and moderation workflows",
        },
      },
    },
  });

  const rewards = await Promise.all([
    prisma.rewardItem.create({
      data: {
        name: "Amazon Gift Card",
        slug: "amazon-gift-card-50",
        description: "A platform-funded Amazon gift card for referrers who consistently help serious candidates.",
        category: "GIFT_CARD",
        coinCost: 1000,
        stock: 12,
      },
    }),
    prisma.rewardItem.create({
      data: {
        name: "Swag Kit",
        slug: "referrly-swag-kit",
        description: "Referrly hoodie, desk mat, notebook, and stickers for trusted referrers.",
        category: "GOODIES",
        coinCost: 1000,
        stock: 29,
      },
    }),
  ]);

  const request1 = await prisma.referralRequest.create({
    data: {
      seekerId: seeker1.id,
      referrerId: referrer1.id,
      company: "Google",
      jobRole: "Frontend Engineer",
      jobDescription: "Looking for an experienced React developer to join our team",
      message: "I'm interested in joining Google and would appreciate your support.",
      status: "REFERRED",
    },
  });

  const request2 = await prisma.referralRequest.create({
    data: {
      seekerId: seeker2.id,
      referrerId: referrer1.id,
      company: "Google",
      jobRole: "Full Stack Engineer",
      jobDescription: "Building internal tools across React, Node.js, and analytics workflows.",
      message: "I would love your perspective on whether my background is a fit.",
      status: "ACCEPTED",
    },
  });

  const request3 = await prisma.referralRequest.create({
    data: {
      seekerId: seeker2.id,
      referrerId: referrer2.id,
      company: "Microsoft",
      jobRole: "Backend Engineer",
      jobDescription: "Seeking talented backend developers for cloud services.",
      message: "I'd love to contribute to Microsoft's cloud infrastructure.",
      status: "REQUESTED",
    },
  });

  await prisma.review.create({
    data: {
      requestId: request1.id,
      reviewerId: seeker1.id,
      rating: 5,
      comment: "Alex was fast, thoughtful, and actually followed through with a real referral update.",
    },
  });

  await prisma.coinTransaction.createMany({
    data: [
      {
        userId: referrer1.id,
        type: "REQUEST_ACCEPTED_BONUS",
        amount: 20,
        balanceAfter: 20,
        reason: "You responded positively to a seeker for Frontend Engineer at Google.",
        requestId: request1.id,
      },
      {
        userId: referrer1.id,
        type: "REFERRAL_COMPLETED_BONUS",
        amount: 30,
        balanceAfter: 50,
        reason: "You marked a referral complete for Frontend Engineer at Google.",
        requestId: request1.id,
      },
      {
        userId: referrer1.id,
        type: "REVIEW_RECEIVED_BONUS",
        amount: 20,
        balanceAfter: 70,
        reason: "You received verified seeker feedback for Frontend Engineer at Google.",
        requestId: request1.id,
      },
      {
        userId: referrer1.id,
        type: "REQUEST_ACCEPTED_BONUS",
        amount: 20,
        balanceAfter: 90,
        reason: "You responded positively to a seeker for Full Stack Engineer at Google.",
        requestId: request2.id,
      },
      {
        userId: referrer2.id,
        type: "REQUEST_ACCEPTED_BONUS",
        amount: 20,
        balanceAfter: 20,
        reason: "Fast response bonus from a prior verified referral cycle.",
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: referrer1.id,
        requestId: request1.id,
        type: "REQUEST_RECEIVED",
        message: `New referral request from ${seeker1.name} for ${request1.company}.`,
      },
      {
        userId: seeker1.id,
        requestId: request1.id,
        type: "REQUEST_REFERRED",
        message: "Your referral request for Frontend Engineer at Google has been marked as referred.",
      },
      {
        userId: referrer1.id,
        requestId: request1.id,
        type: "REVIEW_RECEIVED",
        message: `${seeker1.name} left you a 5-star review for Frontend Engineer at Google.`,
      },
      {
        userId: referrer1.id,
        requestId: request1.id,
        type: "COINS_AWARDED",
        message: "You earned 30 Referrly Coins. You marked a referral complete for Frontend Engineer at Google.",
      },
      {
        userId: referrer2.id,
        requestId: request3.id,
        type: "REQUEST_RECEIVED",
        message: `New referral request from ${seeker2.name} for ${request3.company}.`,
      },
    ],
  });

  console.log("Database seeded successfully!");
  console.log(`
    Demo accounts

    Seekers:
    - seeker1@example.com / password123
    - seeker2@example.com / password123

    Referrers:
    - referrer1@google.com / password123
    - referrer2@microsoft.com / password123

    Admin:
    - admin@referrly.com / password123
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

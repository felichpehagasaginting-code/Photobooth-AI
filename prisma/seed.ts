import { defineSchema, defineData } from "@electric-sql/pglite";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Default System Configs
  await prisma.systemConfig.upsert({
    where: { key: "max_retries" },
    create: { key: "max_retries", value: "3" },
    update: { value: "3" },
  });
  await prisma.systemConfig.upsert({
    where: { key: "default_duration" },
    create: { 
      key: "default_duration", 
      value: "60" 
    },
    update: { value: "60" },
  });

  // Premium Packages
  await prisma.package.createMany({
    data: [
      {
        name: "Basic Bundle",
        description: "Cukup untuk kebutuhan dokumentasi sederhana. Termasuk 10 foto dengan filter artistic pilihan.",
        price: 50000,
        filterCount: 3,
        active: true,
        sortOrder: 1,
      },
      {
        name: "Family Bundle",
        description: "Ideal untuk momen keluarga. Dapatkan hingga 20 foto dengan lebih banyak variasi filter.",
        price: 100000,
        filterCount: 5,
        active: true,
        sortOrder: 2,
      },
      {
        name: "Premium Collection",
        description: "Bundel lengkap dengan unlimited filter AI. Perfect untuk portrait sessions.",
        price: 250000,
        filterCount: 10,
        active: true,
        sortOrder: 3,
      },
    ],
    skipDuplicates: true,
  });

  // Sample Filters - Artistic
  await prisma.filter.createMany({
    data: [
      { name: "Cyberpunk Dreams", description: "Neon-lit dystopian future aesthetic", category: "artistic", style: "cyberpunk" },
      { name: "Watercolor Memories", description: "Soft artistik watercolor effect", category: "artistic", style: "watercolor" },
      { name: "Vintage Film", description: "Classic film look dengan warm tones", category: "artistic", style: "vintage" },
      { name: "Comic Book Pop", description: "Bold outlines dan vibrant colors", category: "artistic", style: "comic" },
    ],
    skipDuplicates: true,
  });

  // Sample Filters - Beauty
  await prisma.filter.createMany({
    data: [
      { name: "Glow Up", description: "Natural radiance smoothing dengan subtle enhancement", category: "beauty", style: "beauty" },
      { name: "Soft Focus", description: "Dreamy blurred edges untuk romantic mood", category: "beauty", style: "beauty" },
    ],
    skipDuplicates: true,
  });

  // Sample Filters - Virtual Background
  await prisma.filter.createMany({
    data: [
      { name: "Office Pro", description: "Clean modern workspace environment", category: "virtual_bg", style: "virtual_bg" },
      { name: "Studio Lights", description: "Professional photo studio backdrop", category: "virtual_bg", style: "virtual_bg" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log("🔌 Prisma client disconnected");
  });

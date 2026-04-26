import { seedDemoStyles } from "../lib/demo/seed-styles";

async function main(): Promise<void> {
  const result = await seedDemoStyles({ replaceExisting: true });
  console.log(`Seeded demo styles. Added ${result.added}, total now ${result.total}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

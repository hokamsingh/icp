// NOTE: No need to run this script,
// If not using `db:schema:push` script on staging or production env
import { Command } from 'commander';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const program = new Command();
program.option('--table <name>', 'Specify a table name').parse(process.argv);

async function main() {
  console.log('Running add constraint script...');

  const options = program.opts();

  await prisma.$transaction(async (tx) => {
    const constraints: Prisma.Sql[] = [];

    // Example
    if (!options.table || options.table === 'example') {
      // constraints.push(
      //   Prisma.sql`ALTER TABLE example
      //     ADD CONSTRAINT example_amount_check CHECK (amount >= 0)
      //   ;`,
      // );
    }

    await Promise.all(
      constraints.map(async (sql) => await tx.$executeRaw(sql)),
    );
  });

  console.log('✅ The constraints has been added.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

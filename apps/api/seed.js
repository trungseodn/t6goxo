const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://root:rootpassword@localhost:5432/ztreel?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedUser(email, password) {
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  await prisma.ztteam_users.upsert({
    where: { email },
    update: {
      password_hash,
      role: 'ADMIN',
    },
    create: {
      email,
      password_hash,
      role: 'ADMIN',
    },
  });

  console.log(`User created/updated: ${email} / ${password}`);
}

async function main() {
  await seedUser('admin@example.com', 'password123');
  await seedUser('trungseodn@gmail.com', 'password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

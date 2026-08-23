import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const email = process.env.ADMIN_EMAIL || 'admin@leads.com';
  const password = process.env.ADMIN_PASSWORD || 'agente77';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const adminUser = await prisma.usuario.upsert({
    where: { email },
    update: {
      nombre: 'Administrador',
      passwordHash,
      rol: 'admin',
      activo: true,
    },
    create: {
      nombre: 'Administrador',
      email,
      passwordHash,
      rol: 'admin',
      activo: true,
    },
  });

  console.log('Admin user seeded:', adminUser.email);
  console.log('Database seeding complete.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

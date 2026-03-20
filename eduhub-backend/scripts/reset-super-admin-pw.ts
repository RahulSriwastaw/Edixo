import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@eduhub.in';
  const password = 'SuperAdmin@123';
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  console.log('Password reset successful for:', email);
}

main().catch(console.error).finally(() => prisma.$disconnect());

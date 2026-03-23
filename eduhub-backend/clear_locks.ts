import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for active locks...");
  
  const locks = await prisma.$queryRaw`
    SELECT
      pid,
      usename,
      query,
      state,
      wait_event_type,
      wait_event,
      backend_type
    FROM pg_stat_activity
    WHERE state != 'idle' AND pid != pg_backend_pid();
  `;

  console.log("Active queries/locks:", locks);

  const blocking = await prisma.$queryRaw`
    SELECT
      waiter.pid AS waiting_pid,
      waiter.usename AS waiting_user,
      waiter.query AS waiting_query,
      blocker.pid AS blocking_pid,
      blocker.usename AS blocking_user,
      blocker.query AS blocking_query
    FROM pg_stat_activity waiter
    JOIN pg_locks wl ON waiter.pid = wl.pid AND NOT wl.granted
    JOIN pg_locks bl ON wl.transactionid = bl.transactionid AND bl.granted
    JOIN pg_stat_activity blocker ON bl.pid = blocker.pid
    WHERE waiter.pid != blocker.pid;
  `;

  console.log("Blocking queries:", blocking);

  if (Array.isArray(blocking) && blocking.length > 0) {
    for (const b of blocking as any[]) {
      console.log("Killing blocking PID:", b.blocking_pid);
      await prisma.$executeRawUnsafe(`SELECT pg_terminate_backend(${b.blocking_pid});`);
    }
    console.log("Killed blocking PIDs.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

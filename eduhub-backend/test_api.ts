import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';

const prisma = new PrismaClient();

async function main() {
  const attempt = await prisma.testAttempt.findFirst({
    where: { status: 'SUBMITTED' },
    include: { student: true, test: true }
  });

  if (!attempt) {
    console.log("No submitted attempts found to test with.");
    return;
  }

  console.log(`Found attempt for Test ID: ${attempt.test.id}, Student User ID: ${attempt.student.userId}`);

  // Find category ID containing this test
  const test = await prisma.mockTest.findUnique({
    where: { id: attempt.test.id },
  });

  if (!test) {
    console.log("No test found.");
    return;
  }

  // Assume test has examSubCategoryId
  // Wait, I can just get ANY category and see if the attempt shows up.
  const category = await prisma.examCategory.findFirst({
    include: { subCategories: { include: { mockTests: true } } }
  });

  if (!category) {
      console.log("No category found");
      return;
  }
  
  const categoryId = category.id;
  console.log(`Category ID to query: ${categoryId}`);

  require('dotenv').config();
  const actualSecret = process.env.JWT_SECRET || 'supersecret';
  const token = jwt.sign({ userId: attempt.student.userId, role: 'STUDENT' }, actualSecret);

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: `/api/mockbook/categories/${categoryId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      const json = JSON.parse(data);
      if (json.success) {
        let foundTest = null;
        for (const sc of json.data.subCategories) {
          const t = sc.mockTests.find((x: any) => x.id === attempt.test.id);
          if (t) foundTest = t;
        }
        if (foundTest) {
          console.log(`\nSuccess! API Response for Test:`);
          console.log(`attempts: ${foundTest.attempts}`);
          console.log(`inProgressAttempts: ${foundTest.inProgressAttempts}`);
          
          if (foundTest.attempts > 0) {
              console.log("VERIFIED: The API correctly returns SUBMITTED attempts!");
          } else {
              console.log("FAILED: The API returned 0 SUBMITTED attempts despite DB having them.");
          }
        } else {
          console.log("Test not found in category response. But API call succeeded.");
        }
      } else {
        console.log("API returned error:", json);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  req.end();
}

main().catch(console.error).finally(() => prisma.$disconnect());

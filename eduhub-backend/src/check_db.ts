import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const orgId = "GK-ORG-00001";
        const email = "rahulcodes88@gmail.com"; // Assuming this might be the user's email

        console.log(`Checking Org: ${orgId}`);
        const org = await prisma.organization.findUnique({
            where: { orgId }
        });

        if (!org) {
            console.log("❌ Organization not found");
        } else {
            console.log(`✅ Organization found: ${org.name} (ID: ${org.id})`);
            
            console.log(`Checking Student with email: ${email} in Org: ${orgId}`);
            const student = await prisma.student.findFirst({
                where: {
                    email: email,
                    org: { orgId }
                },
                include: { user: true }
            });

            if (!student) {
                console.log("❌ Student not found");
                console.log("Listing first 5 students in this Org:");
                const students = await prisma.student.findMany({
                    where: { orgId: org.id },
                    take: 5
                });
                students.forEach(s => console.log(`- ${s.name} (${s.email || 'no email'}) [ID: ${s.studentId}]`));
            } else {
                console.log(`✅ Student found: ${student.name}`);
                console.log(`✅ User linked: ${student.user ? 'Yes' : 'No'}`);
            }
        }
    } catch (err) {
        console.error("❌ Error checking database:", err);
    } finally {
        await prisma.$disconnect();
    }
}

check();

import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a super admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@wmoi.org' },
    update: {},
    create: {
      email: 'admin@wmoi.org',
      password: hashedPassword,
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
    },
  });

  console.log('Created super admin:', superAdmin.email);

  // Create sample churches
  const churches = [
    {
      name: 'Word Ministries - Delhi',
      city: 'Delhi',
      state: 'Delhi',
      address: '123 Main Street, Delhi',
      pastorName: 'Pastor John Doe',
      pastorPhone: '+91-9876543210',
      pastorEmail: 'pastor.delhi@wmoi.org',
      churchPhone: '+91-11-12345678',
      churchEmail: 'delhi@wmoi.org',
      status: 'Active',
    },
    {
      name: 'Word Ministries - Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: '456 Church Road, Mumbai',
      pastorName: 'Pastor Jane Smith',
      pastorPhone: '+91-9876543211',
      pastorEmail: 'pastor.mumbai@wmoi.org',
      churchPhone: '+91-22-12345679',
      churchEmail: 'mumbai@wmoi.org',
      status: 'Active',
    },
  ];

  for (const churchData of churches) {
    // Check if church exists, if not create it
    let church = await prisma.church.findFirst({
      where: { name: churchData.name },
    });

    if (!church) {
      church = await prisma.church.create({
        data: churchData,
      });
    }

    // Create a church admin for each church
    const adminEmail = `admin.${church.id}@wmoi.org`;
    let churchAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!churchAdmin) {
      const churchAdminPassword = await bcrypt.hash('church123', 10);
      churchAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          password: churchAdminPassword,
          name: `${churchData.pastorName} (Admin)`,
          role: UserRole.CHURCH_ADMIN,
          churchId: church.id,
        },
      });
    }

    console.log(`Created church: ${church.name}`);
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


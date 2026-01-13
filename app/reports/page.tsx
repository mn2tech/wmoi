import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { ReportsDashboard } from '@/components/ReportsDashboard';

async function getReportsData(userRole: string, churchId: string | null) {
  if (userRole === 'SUPER_ADMIN') {
    const [
      churches,
      totalMembers,
      activeMembers,
      membersByChurch,
      membersByGender,
      membersByAge,
    ] = await Promise.all([
      prisma.church.findMany({
        include: {
          _count: {
            select: { members: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.member.count(),
      prisma.member.count({
        where: { membershipStatus: 'ACTIVE' },
      }),
      prisma.member.groupBy({
        by: ['churchId'],
        _count: {
          id: true,
        },
      }),
      prisma.member.groupBy({
        by: ['gender'],
        _count: {
          id: true,
        },
      }),
      prisma.member.findMany({
        select: {
          dateOfBirth: true,
        },
      }),
    ]);

    // Get church names for membersByChurch
    const churchMap = new Map(
      churches.map((c) => [c.id, c.name])
    );

    const membersByChurchWithNames = membersByChurch.map((item) => ({
      churchName: churchMap.get(item.churchId) || 'Unknown',
      count: item._count.id,
    }));

    // Calculate age groups
    const ageGroups = {
      '0-17': 0,
      '18-30': 0,
      '31-50': 0,
      '51-70': 0,
      '71+': 0,
    };

    membersByAge.forEach((member) => {
      if (member.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(member.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        if (age < 18) ageGroups['0-17']++;
        else if (age < 31) ageGroups['18-30']++;
        else if (age < 51) ageGroups['31-50']++;
        else if (age < 71) ageGroups['51-70']++;
        else ageGroups['71+']++;
      }
    });

    return {
      churches,
      totalMembers,
      activeMembers,
      membersByChurch: membersByChurchWithNames,
      membersByGender: membersByGender.map((g) => ({
        gender: g.gender || 'Unknown',
        count: g._count.id,
      })),
      ageGroups,
    };
  } else {
    const church = await prisma.church.findUnique({
      where: { id: churchId! },
    });

    if (!church) {
      return null;
    }

    const [
      totalMembers,
      activeMembers,
      membersByGender,
      membersByAge,
    ] = await Promise.all([
      prisma.member.count({
        where: { churchId: churchId! },
      }),
      prisma.member.count({
        where: {
          churchId: churchId!,
          membershipStatus: 'ACTIVE',
        },
      }),
      prisma.member.groupBy({
        by: ['gender'],
        where: { churchId: churchId! },
        _count: {
          id: true,
        },
      }),
      prisma.member.findMany({
        where: { churchId: churchId! },
        select: {
          dateOfBirth: true,
        },
      }),
    ]);

    // Calculate age groups
    const ageGroups = {
      '0-17': 0,
      '18-30': 0,
      '31-50': 0,
      '51-70': 0,
      '71+': 0,
    };

    membersByAge.forEach((member) => {
      if (member.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(member.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
          age--;
        }

        if (age < 18) ageGroups['0-17']++;
        else if (age < 31) ageGroups['18-30']++;
        else if (age < 51) ageGroups['31-50']++;
        else if (age < 71) ageGroups['51-70']++;
        else ageGroups['71+']++;
      }
    });

    return {
      churches: [church],
      totalMembers,
      activeMembers,
      membersByChurch: [{ churchName: church.name, count: totalMembers }],
      membersByGender: membersByGender.map((g) => ({
        gender: g.gender || 'Unknown',
        count: g._count.id,
      })),
      ageGroups,
    };
  }
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const data = await getReportsData(session.user.role, session.user.churchId);

  if (!data) {
    return <div>Error loading reports</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>
          <ReportsDashboard data={data} userRole={session.user.role} />
        </div>
      </div>
    </div>
  );
}


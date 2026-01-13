import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { MembersList } from '@/components/MembersList';

async function getMembers(
  userRole: string,
  churchId: string | null,
  searchParams: { [key: string]: string | string[] | undefined }
) {
  const churchIdFilter = searchParams.churchId as string | undefined;
  const search = searchParams.search as string | undefined;
  const status = searchParams.status as string | undefined;

  let where: any = {};

  if (userRole === 'CHURCH_ADMIN') {
    where.churchId = churchId;
  } else if (churchIdFilter) {
    where.churchId = churchIdFilter;
  }

  if (status && status !== 'all') {
    where.membershipStatus = status.toUpperCase();
  }

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phoneNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  const members = await prisma.member.findMany({
    where,
    include: {
      church: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const churches = await prisma.church.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });

  return { members, churches };
}

export default async function MembersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { members, churches } = await getMembers(
    session.user.role,
    session.user.churchId,
    searchParams
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Members</h1>
            <Link
              href="/members/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
            >
              Add New Member
            </Link>
          </div>

          <MembersList
            members={members}
            churches={churches}
            userRole={session.user.role}
            userChurchId={session.user.churchId}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}


import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getChurch(id: string, userRole: string, churchId: string | null) {
  if (userRole === 'SUPER_ADMIN') {
    return await prisma.church.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  } else {
    if (id !== churchId) {
      return null;
    }
    return await prisma.church.findUnique({
      where: { id },
      include: {
        _count: {
          select: { members: true },
        },
        members: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }
}

export default async function ChurchDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const church = await getChurch(
    params.id,
    session.user.role,
    session.user.churchId
  );

  if (!church) {
    notFound();
  }

  const activeMembers = await prisma.member.count({
    where: {
      churchId: church.id,
      membershipStatus: 'ACTIVE',
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/churches"
              className="text-primary-600 hover:text-primary-900 text-sm font-medium mb-4 inline-block"
            >
              ← Back to Churches
            </Link>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                {church.name}
              </h1>
              {session.user.role === 'SUPER_ADMIN' && (
                <Link
                  href={`/churches/${church.id}/edit`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Edit Church
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Church Information
              </h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {church.city}, {church.state}
                  </dd>
                </div>
                {church.address && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {church.address}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pastor</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {church.pastorName}
                  </dd>
                </div>
                {church.pastorPhone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Pastor Phone
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {church.pastorPhone}
                    </dd>
                  </div>
                )}
                {church.pastorEmail && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Pastor Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {church.pastorEmail}
                    </dd>
                  </div>
                )}
                {church.churchPhone && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Church Phone
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {church.churchPhone}
                    </dd>
                  </div>
                )}
                {church.churchEmail && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Church Email
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {church.churchEmail}
                    </dd>
                  </div>
                )}
                {church.establishedDate && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Established
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(church.establishedDate).toLocaleDateString()}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {church.status}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Statistics
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Total Members
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {church._count.members}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Active Members
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {activeMembers}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Inactive Members
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">
                    {church._count.members - activeMembers}
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <Link
                  href={`/members?churchId=${church.id}`}
                  className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                >
                  View All Members →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Members
              </h2>
              <Link
                href={`/members/new?churchId=${church.id}`}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Add Member
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {church.members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.dateJoined).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {member.membershipStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/members/${member.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


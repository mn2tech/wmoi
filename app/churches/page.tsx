import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

async function getChurches(userRole: string, churchId: string | null) {
  if (userRole === 'SUPER_ADMIN') {
    return await prisma.church.findMany({
      include: {
        _count: {
          select: { members: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  } else {
    return await prisma.church.findMany({
      where: { id: churchId! },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });
  }
}

export default async function ChurchesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const churches = await getChurches(session.user.role, session.user.churchId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Churches</h1>
            {session.user.role === 'SUPER_ADMIN' && (
              <Link
                href="/churches/new"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Add New Church
              </Link>
            )}
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {churches.map((church) => (
                <li key={church.id}>
                  <Link
                    href={`/churches/${church.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-600 text-lg">
                              ⛪
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {church.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {church.city}, {church.state}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {church._count.members} Members
                            </div>
                            <div className="text-sm text-gray-500">
                              Pastor: {church.pastorName}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {church.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {churches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No churches found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


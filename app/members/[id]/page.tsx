import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getMember(id: string, userRole: string, churchId: string | null) {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      church: true,
    },
  });

  if (!member) {
    return null;
  }

  // Check access
  if (userRole === 'CHURCH_ADMIN' && member.churchId !== churchId) {
    return null;
  }

  return member;
}

function calculateAge(dateOfBirth: Date | null) {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const member = await getMember(
    params.id,
    session.user.role,
    session.user.churchId
  );

  if (!member) {
    notFound();
  }

  const age = calculateAge(member.dateOfBirth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/members"
              className="text-primary-600 hover:text-primary-900 text-sm font-medium mb-4 inline-block"
            >
              ← Back to Members
            </Link>
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                {member.firstName} {member.lastName}
              </h1>
              <Link
                href={`/members/${member.id}/edit`}
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Edit Member
              </Link>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Personal Information
                </h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Full Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.firstName} {member.lastName}
                    </dd>
                  </div>
                  {member.dateOfBirth && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Date of Birth
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(member.dateOfBirth).toLocaleDateString()}
                        {age && ` (Age: ${age})`}
                      </dd>
                    </div>
                  )}
                  {member.gender && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Gender
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.gender}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Membership Status
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.membershipStatus === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : member.membershipStatus === 'INACTIVE'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {member.membershipStatus}
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Contact Information
                </h2>
                <dl className="space-y-3">
                  {member.phoneNumber && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.phoneNumber}
                      </dd>
                    </div>
                  )}
                  {member.email && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.email}
                      </dd>
                    </div>
                  )}
                  {(member.street || member.city || member.state) && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.street && <div>{member.street}</div>}
                        {member.city && member.state && (
                          <div>
                            {member.city}, {member.state} {member.zip}
                          </div>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Church Information
                </h2>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Church</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {member.church.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Date Joined
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(member.dateJoined).toLocaleDateString()}
                    </dd>
                  </div>
                  {member.baptismDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Baptism Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(member.baptismDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Family Information
                </h2>
                <dl className="space-y-3">
                  {member.spouseName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Spouse
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.spouseName}
                      </dd>
                    </div>
                  )}
                  {member.childrenInfo && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Children
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {member.childrenInfo}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {member.notes && (
                <div className="sm:col-span-2">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Notes
                  </h2>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {member.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


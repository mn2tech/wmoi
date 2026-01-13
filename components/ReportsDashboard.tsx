'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportsDashboardProps {
  data: {
    churches: any[];
    totalMembers: number;
    activeMembers: number;
    membersByChurch: { churchName: string; count: number }[];
    membersByGender: { gender: string; count: number }[];
    ageGroups: {
      '0-17': number;
      '18-30': number;
      '31-50': number;
      '51-70': number;
      '71+': number;
    };
  };
  userRole: string;
}

const COLORS = ['#0ea5e9', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'];

export function ReportsDashboard({ data, userRole }: ReportsDashboardProps) {
  const ageGroupData = [
    { name: '0-17', value: data.ageGroups['0-17'] },
    { name: '18-30', value: data.ageGroups['18-30'] },
    { name: '31-50', value: data.ageGroups['31-50'] },
    { name: '51-70', value: data.ageGroups['51-70'] },
    { name: '71+', value: data.ageGroups['71+'] },
  ];

  const genderData = data.membersByGender.map((g) => ({
    name: g.gender,
    value: g.count,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Members
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.totalMembers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">✓</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Members
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.activeMembers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">⛪</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Churches
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.churches.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Members by Church */}
        {userRole === 'SUPER_ADMIN' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Members by Church
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.membersByChurch}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="churchName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gender Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gender Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Age Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Membership Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Active</span>
              <div className="flex items-center">
                <div className="w-48 bg-gray-200 rounded-full h-2.5 mr-4">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        (data.activeMembers / data.totalMembers) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {data.activeMembers} (
                  {((data.activeMembers / data.totalMembers) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Inactive</span>
              <div className="flex items-center">
                <div className="w-48 bg-gray-200 rounded-full h-2.5 mr-4">
                  <div
                    className="bg-red-600 h-2.5 rounded-full"
                    style={{
                      width: `${
                        ((data.totalMembers - data.activeMembers) /
                          data.totalMembers) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {data.totalMembers - data.activeMembers} (
                  {(((data.totalMembers - data.activeMembers) /
                    data.totalMembers) *
                    100).toFixed(1)}
                  %)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


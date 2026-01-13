import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const church = await prisma.church.create({
      data: {
        name: data.name,
        city: data.city,
        state: data.state,
        address: data.address || null,
        pastorName: data.pastorName,
        pastorPhone: data.pastorPhone || null,
        pastorEmail: data.pastorEmail || null,
        churchPhone: data.churchPhone || null,
        churchEmail: data.churchEmail || null,
        establishedDate: data.establishedDate
          ? new Date(data.establishedDate)
          : null,
        status: data.status || 'Active',
        registrationDetails: data.registrationDetails || null,
      },
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error('Error creating church:', error);
    return NextResponse.json(
      { error: 'Failed to create church' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'SUPER_ADMIN') {
      const churches = await prisma.church.findMany({
        include: {
          _count: {
            select: { members: true },
          },
        },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json(churches);
    } else {
      const churches = await prisma.church.findMany({
        where: { id: session.user.churchId! },
        include: {
          _count: {
            select: { members: true },
          },
        },
      });
      return NextResponse.json(churches);
    }
  } catch (error) {
    console.error('Error fetching churches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch churches' },
      { status: 500 }
    );
  }
}


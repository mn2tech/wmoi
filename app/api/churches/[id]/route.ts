import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const church = await prisma.church.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!church) {
      return NextResponse.json({ error: 'Church not found' }, { status: 404 });
    }

    // Check access
    if (
      session.user.role !== 'SUPER_ADMIN' &&
      session.user.churchId !== params.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(church);
  } catch (error) {
    console.error('Error fetching church:', error);
    return NextResponse.json(
      { error: 'Failed to fetch church' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const church = await prisma.church.update({
      where: { id: params.id },
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
    console.error('Error updating church:', error);
    return NextResponse.json(
      { error: 'Failed to update church' },
      { status: 500 }
    );
  }
}


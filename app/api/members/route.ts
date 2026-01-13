import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Church admins can only add members to their own church
    if (
      session.user.role === 'CHURCH_ADMIN' &&
      data.churchId !== session.user.churchId
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const member = await prisma.member.create({
      data: {
        churchId: data.churchId,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        phoneNumber: data.phoneNumber || null,
        email: data.email || null,
        street: data.street || null,
        city: data.city || null,
        state: data.state || null,
        zip: data.zip || null,
        dateJoined: data.dateJoined
          ? new Date(data.dateJoined)
          : new Date(),
        membershipStatus: data.membershipStatus || 'ACTIVE',
        baptismDate: data.baptismDate ? new Date(data.baptismDate) : null,
        spouseName: data.spouseName || null,
        childrenInfo: data.childrenInfo || null,
        notes: data.notes || null,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'Failed to create member' },
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

    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('churchId');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let where: any = {};

    if (session.user.role === 'CHURCH_ADMIN') {
      where.churchId = session.user.churchId;
    } else if (churchId) {
      where.churchId = churchId;
    }

    if (status && status !== 'all') {
      where.membershipStatus = status.toUpperCase();
    }

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phoneNumber: { contains: search } },
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

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}


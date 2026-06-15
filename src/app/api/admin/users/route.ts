import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN role can view the users list
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('[Admin Users GET] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN role can create new users
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, roleId, isActive } = body;

    if (!email || !password || !roleId) {
      return NextResponse.json({ success: false, message: 'Email, password, and role are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'A user with this email already exists.' }, { status: 400 });
    }

    // Verify role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!role) {
      return NextResponse.json({ success: false, message: 'Selected role does not exist.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        roleId,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        role: {
          select: {
            name: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully.',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role.name,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      }
    });
  } catch (error) {
    console.error('[Admin Users POST] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

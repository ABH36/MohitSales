import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { userCreateSchema } from '@/lib/schemas/user';

export async function GET(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        isActive: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
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

export async function POST(request: NextRequest) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;

    const parsed = await parseBody(request, userCreateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { name, email, password, roleId, isActive } = parsed.data;

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

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireRole } from '@/lib/api/guard';
import { parseBody } from '@/lib/api/validate';
import { userUpdateSchema } from '@/lib/schemas/user';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;

    const targetUserId = params.id;
    const parsed = await parseBody(request, userUpdateSchema);
    if (parsed instanceof NextResponse) return parsed;
    const { name, email, password, roleId, isActive } = parsed.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    // Self-deactivation protection
    if (targetUserId === userId && isActive === false) {
      return NextResponse.json({ success: false, message: 'You cannot deactivate your own account.' }, { status: 400 });
    }

    // Email duplication check
    if (email && email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return NextResponse.json({ success: false, message: 'A user with this email already exists.' }, { status: 400 });
      }
    }

    // Verify role if changing
    if (roleId && roleId !== user.roleId) {
      const roleExists = await prisma.role.findUnique({ where: { id: roleId } });
      if (!roleExists) {
        return NextResponse.json({ success: false, message: 'Selected role does not exist.' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name || null;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = roleId;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Hash and update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
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
      message: 'User updated successfully.',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role.name,
        isActive: updatedUser.isActive,
      }
    });
  } catch (error) {
    console.error('[Admin User PUT] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = requireRole(request, ['ADMIN']);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;

    const targetUserId = params.id;

    // Self-deletion protection
    if (targetUserId === userId) {
      return NextResponse.json({ success: false, message: 'You cannot delete your own account.' }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    console.error('[Admin User DELETE] Error:', error);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}

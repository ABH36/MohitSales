import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN role can modify users
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

    const targetUserId = params.id;
    const body = await request.json();
    const { name, email, password, roleId, isActive } = body;

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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN role can delete users
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Forbidden: Insufficient permissions.' }, { status: 403 });
    }

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

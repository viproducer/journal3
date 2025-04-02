import { NextResponse } from 'next/server';
import { setAdminRole } from '@/lib/firebase/admin-auth';
import { auth } from '@/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    // Verify the request is from an authenticated user
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);

    // Only allow the first user to set up admin
    const usersSnapshot = await auth.listUsers();
    if (usersSnapshot.users.length > 1) {
      return NextResponse.json({ error: 'Admin setup is only allowed for the first user' }, { status: 403 });
    }

    // Set admin role
    const success = await setAdminRole(decodedToken.uid);
    
    if (success) {
      return NextResponse.json({ message: 'Admin role set successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to set admin role' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in admin setup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
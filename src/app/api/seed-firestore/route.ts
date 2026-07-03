import { adminDb } from '@/lib/firebase-admin';
import { NextResponse } from 'next/server';
import { DEFAULT_FILTERS, DEFAULT_PACKAGES } from '@/types';

export async function GET() {
  try {
    // 1. Seed default admin
    const adminSnapshot = await adminDb.collection('admins').limit(1).get();
    let adminStatus = 'already_exists';
    if (adminSnapshot.empty) {
      await adminDb.collection('admins').add({
        username: 'admin',
        passwordHash: 'admin123',
        pin: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      adminStatus = 'created';
    }

    // 2. Seed default packages
    const packageSnapshot = await adminDb.collection('packages').limit(1).get();
    let packageStatus = 'already_exists';
    if (packageSnapshot.empty) {
      const batch = adminDb.batch();
      DEFAULT_PACKAGES.forEach((pkg, index) => {
        const docRef = adminDb.collection('packages').doc();
        batch.set(docRef, {
          ...pkg,
          sortOrder: index + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
      await batch.commit();
      packageStatus = 'created';
    }

    // 3. Seed default filters
    const filterSnapshot = await adminDb.collection('filters').limit(1).get();
    let filterStatus = 'already_exists';
    if (filterSnapshot.empty) {
      const batch = adminDb.batch();
      DEFAULT_FILTERS.forEach((filter, index) => {
        const docRef = adminDb.collection('filters').doc();
        batch.set(docRef, {
          ...filter,
          sortOrder: index + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
      await batch.commit();
      filterStatus = 'created';
    }

    return NextResponse.json({
      success: true,
      message: 'Firestore database seeded successfully',
      admin: adminStatus,
      packages: packageStatus,
      filters: filterStatus,
    });
  } catch (error) {
    console.error('Firestore seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed Firestore', details: String(error) },
      { status: 500 }
    );
  }
}

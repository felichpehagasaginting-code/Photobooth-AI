import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalSessions,
      paidTransactions,
      todayTransactions,
      todayPaidTransactions,
      activeFilters,
      recentTransactions,
    ] = await Promise.all([
      db.transaction.count(),
      db.transaction.findMany({
        where: { status: 'paid' },
        select: { amount: true },
      }),
      db.transaction.findMany({
        where: { createdAt: { gte: today } },
        select: { amount: true, status: true },
      }),
      db.transaction.findMany({
        where: {
          status: 'paid',
          paymentTime: { gte: today },
        },
        select: { amount: true },
      }),
      db.filter.count({ where: { active: true } }),
      db.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          package: true,
          photos: true,
        },
      }),
    ]);

    const totalRevenue = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
    const todaySessions = todayTransactions.length;
    const todayRevenue = todayPaidTransactions.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      totalSessions,
      totalRevenue,
      todaySessions,
      todayRevenue,
      activeFilters,
      recentTransactions,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

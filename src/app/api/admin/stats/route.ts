import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalSessions,
      paidTransactions,
      todayTransactions,
      todayPaidTransactions,
      recentPaidTransactions,
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
      db.transaction.findMany({
        where: {
          status: 'paid',
          paymentTime: { gte: sevenDaysAgo },
        },
        select: { amount: true, paymentTime: true, createdAt: true },
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

    const revenueHistory = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayRevenue = recentPaidTransactions
        .filter(t => {
          const time = t.paymentTime || t.createdAt;
          return time >= d && time < nextD;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      revenueHistory.push({
        name: dayNames[d.getDay()],
        revenue: dayRevenue
      });
    }

    return NextResponse.json({
      totalSessions,
      totalRevenue,
      todaySessions,
      todayRevenue,
      revenueHistory,
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

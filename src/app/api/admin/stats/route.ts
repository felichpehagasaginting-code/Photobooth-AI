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
      todayTransactions,
      recentTransactionsList,
      activeFilters,
      recentTransactions,
    ] = await Promise.all([
      db.transaction.count(),
      db.transaction.findMany({
        where: { createdAt: { gte: today } },
        select: { status: true },
      }),
      db.transaction.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        select: { createdAt: true },
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

    const todaySessions = todayTransactions.length;

    const sessionHistory: { name: string; sessions: number }[] = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const daySessionsCount = recentTransactionsList
        .filter(t => {
          return t.createdAt >= d && t.createdAt < nextD;
        }).length;

      sessionHistory.push({
        name: dayNames[d.getDay()],
        sessions: daySessionsCount
      });
    }

    return NextResponse.json({
      totalSessions,
      todaySessions,
      sessionHistory,
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

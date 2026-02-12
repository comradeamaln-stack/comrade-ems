import { NextRequest, NextResponse } from 'next/server';
import { getPerformanceMetrics } from '@/lib/performance-actions';

// Dashboard API Routes
export async function GET(request: NextRequest) {
    try {
        const stats = await getPerformanceMetrics();

        return NextResponse.json({
            ...stats,
            chartData: {
                weeklyTrends: [
                    { week: '2024-W15', collections: 45, target: 5000, actual: 4200, efficiency: 84 },
                    { week: '2024-W22', collections: 38, target: 4500, actual: 3900, efficiency: 86.7 },
                    { week: '2024-W29', collections: 52, target: 5500, actual: 4950, efficiency: 90 },
                    { week: '2024-W36', collections: 48, target: 5200, actual: 5100, efficiency: 98 }
                ],
                monthlyTrends: [
                    { month: '2024-01', collections: 186, target: 15000, actual: 13200, efficiency: 88 },
                    { month: '2024-02', collections: 142, target: 12000, actual: 10500, efficiency: 87.5 }
                ]
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch performance metrics' }, { status: 500 });
    }
}
"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp,
    Users,
    Target,
    Award,
    ArrowUpRight,
    ArrowDownRight,
    BarChart2
} from "lucide-react";
import { getPerformanceStats, getUsers, getEnquiries } from "@/lib/actions";

export default function PerformancePage() {
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [perfData, usersData, enquiriesData] = await Promise.all([
                getPerformanceStats(),
                getUsers(),
                getEnquiries()
            ]);
            
            setPerformanceData(perfData || []);
            setUsers(usersData || []);
            setEnquiries(enquiriesData || []);
        } catch (error) {
            console.error("Failed to load performance data:", error);
        }
        setLoading(false);
    }

    // Calculate metrics from real data
    const calculateMetrics = () => {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        
        const metrics = users.map(user => {
            // Get user's enquiries
            const userEnquiries = enquiries.filter(eq => eq.assignedToId === user.id);
            const convertedEnquiries = userEnquiries.filter(eq => 
                eq.status === 'closed_won'
            );
            
            // Get performance stats for current month
            const currentStats = performanceData.find(stat => 
                stat.staffId === user.id && stat.month === currentMonth
            );
            
            const conversionRate = userEnquiries.length > 0 
                ? (convertedEnquiries.length / userEnquiries.length * 100).toFixed(1)
                : '0.0';
            
            return {
                id: user.id,
                name: user.name,
                enquiries: userEnquiries.length,
                converted: convertedEnquiries.length,
                rate: parseFloat(conversionRate),
                revenue: currentStats?.revenueGenerated || 0,
                trend: '+5%' // TODO: Calculate actual trend
            };
        }).sort((a, b) => b.rate - a.rate);

        return metrics;
    };

    const teamMetrics = calculateMetrics();
    const avgConversionRate = teamMetrics.length > 0 
        ? (teamMetrics.reduce((sum, m) => sum + m.rate, 0) / teamMetrics.length).toFixed(1)
        : '0.0';
    const topPerformer = teamMetrics[0];
    const totalRevenue = teamMetrics.reduce((sum, m) => sum + m.revenue, 0);

    return (
        <div className="animate-in">
            <header style={{ marginBottom: "2.5rem" }}>
                <h1 className="h1">Staff Performance</h1>
                <p className="text-muted">Analyze sales performance, conversion rates, and team productivity.</p>
            </header>

            <div className="grid grid-cols-3" style={{ marginBottom: "2rem" }}>
                <div className="card metric-card">
                    <div style={{ background: "#6366f115", padding: "0.5rem", borderRadius: "0.5rem", color: "#6366f1", width: "fit-content" }}>
                        <Target size={24} />
                    </div>
                    <div className="metric-value">{avgConversionRate}%</div>
                    <div className="metric-label">Average Conversion Rate</div>
                    <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600", marginTop: "0.5rem" }}>
                        <ArrowUpRight size={12} /> Based on current data
                    </div>
                </div>

                <div className="card metric-card">
                    <div style={{ background: "#10b98115", padding: "0.5rem", borderRadius: "0.5rem", color: "#10b981", width: "fit-content" }}>
                        <Award size={24} />
                    </div>
                    <div className="metric-value">{topPerformer?.name || 'N/A'}</div>
                    <div className="metric-label">Top Performer</div>
                    <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600", marginTop: "0.5rem" }}>
                        {topPerformer?.converted || 0} Conversions
                    </div>
                </div>

                <div className="card metric-card">
                    <div style={{ background: "#f59e0b15", padding: "0.5rem", borderRadius: "0.5rem", color: "#f59e0b", width: "fit-content" }}>
                        <BarChart2 size={24} />
                    </div>
                    <div className="metric-value">${(totalRevenue / 1000).toFixed(1)}k</div>
                    <div className="metric-label">Total Revenue Generated</div>
                    <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: "600", marginTop: "0.5rem" }}>
                        <ArrowUpRight size={12} /> Current month
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 className="h3">Performance Leaderboard</h3>
                <div style={{ overflowX: "auto", marginTop: "1.5rem" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                                <th style={{ padding: "1rem" }}>Sales Person</th>
                                <th style={{ padding: "1rem" }}>Total Enquiries</th>
                                <th style={{ padding: "1rem" }}>Conversions</th>
                                <th style={{ padding: "1rem" }}>Conversion Rate</th>
                                <th style={{ padding: "1rem" }}>Revenue</th>
                                <th style={{ padding: "1rem" }}>Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teamMetrics.map((staff, i) => (
                                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <Users size={16} />
                                            </div>
                                            <span style={{ fontWeight: "600" }}>{staff.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem" }}>{staff.enquiries}</td>
                                    <td style={{ padding: "1rem" }}>{staff.converted}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <span style={{ minWidth: "45px" }}>{staff.rate}%</span>
                                            <div style={{ flex: 1, height: "8px", background: "var(--secondary)", borderRadius: "4px", minWidth: "100px" }}>
                                                <div style={{ width: `${staff.rate}%`, height: "100%", background: "var(--primary)", borderRadius: "4px" }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1rem", fontWeight: "600" }}>{staff.revenue}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            color: staff.trend.startsWith('+') ? "#10b981" : "#ef4444",
                                            fontWeight: "600",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem"
                                        }}>
                                            {staff.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                            {staff.trend}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

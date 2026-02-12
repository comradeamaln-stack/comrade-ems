"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    BarChart3,
    TrendingUp,
    Download,
    Calendar,
    Users,
    DollarSign,
    PieChart
} from "lucide-react";

export default function CollectionReportPage() {
    const router = useRouter();
    const [selectedDateRange, setSelectedDateRange] = useState('7days');
    const [reportType, setReportType] = useState('summary');
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any>(null);

    useEffect(() => {
        async function loadInitialData() {
            // Simulated delay
            await new Promise(resolve => setTimeout(resolve, 500));
            setLoading(false);
        }

        loadInitialData();
    }, []);

    const mockSummary = {
        totalCollections: 12,
        completedCollections: 8,
        inProgressCollections: 3,
        failedCollections: 1,
        totalTargetAmount: 50000,
        totalCollected: 35000,
        averageEfficiency: 87.5,
        topStaffMember: { name: "Sarah Johnson", totalCollected: 8500, efficiency: 92.3 }
    };

    const mockDailyBreakdown = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
            date: date.toISOString().split('T')[0],
            totalCollected: Math.floor(Math.random() * 500 + 3000),
            completedCollections: Math.floor(Math.random() * 3 + 2),
            targetAmount: Math.floor(Math.random() * 800 + 600),
            staffCount: Math.floor(Math.random() * 2 + 1),
            efficiency: 78 + Math.random() * 15
        };
    });

    const generateReport = async (typeOverride?: string) => {
        const type = typeOverride || reportType;
        setLoading(true);

        // Mock report generation delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        let content;

        switch (type) {
            case 'summary':
                content = (
                    <div>
                        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--primary)" }}>
                            📊 Collection Summary Report
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                            <div className="card">
                                <h3>Overview</h3>
                                <p>Total Collections: {mockSummary.totalCollections}</p>
                                <p>Completed: {mockSummary.completedCollections}</p>
                                <p>Target Amount: ${mockSummary.totalTargetAmount.toLocaleString()}</p>
                                <p>Total Collected: ${mockSummary.totalCollected.toLocaleString()}</p>
                            </div>
                            <div className="card">
                                <h3>Efficiency</h3>
                                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>
                                    {mockSummary.averageEfficiency}%
                                </div>
                                <p>Average Efficiency across all collections</p>
                            </div>
                        </div>
                    </div>
                );
                break;

            case 'performance':
                content = (
                    <div>
                        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--primary)" }}>
                            📈 Staff Performance Report
                        </h2>
                        <div className="card" style={{ marginBottom: "2rem" }}>
                            <h3>Top Performer</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{mockSummary.topStaffMember.name}</div>
                                    <p>Total Collected: ${mockSummary.topStaffMember.totalCollected.toLocaleString()}</p>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>
                                        {mockSummary.topStaffMember.efficiency}%
                                    </div>
                                    <p>Efficiency</p>
                                </div>
                            </div>
                        </div>
                        <div className="card">
                            <h3>Daily Breakdown</h3>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                    <thead>
                                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                                            <th style={{ textAlign: "left", padding: "0.5rem" }}>Date</th>
                                            <th style={{ textAlign: "right", padding: "0.5rem" }}>Collected</th>
                                            <th style={{ textAlign: "right", padding: "0.5rem" }}>Efficiency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mockDailyBreakdown.map((day, i) => (
                                            <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                                                <td style={{ padding: "0.5rem" }}>{day.date}</td>
                                                <td style={{ textAlign: "right", padding: "0.5rem" }}>${day.totalCollected.toLocaleString()}</td>
                                                <td style={{ textAlign: "right", padding: "0.5rem" }}>{day.efficiency.toFixed(1)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
                break;

            case 'daily':
                content = (
                    <div>
                        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--primary)" }}>
                            📅 Daily Collections Report
                        </h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                            {mockDailyBreakdown.map((day, i) => (
                                <div key={i} className="card" style={{ padding: "1rem" }}>
                                    <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{day.date}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span>Collected:</span>
                                        <span>${day.totalCollected.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                        <span>Efficiency:</span>
                                        <span>{day.efficiency.toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                break;

            default:
                content = <div>Select a report type</div>;
        }

        setReportData(content);
        setLoading(false);
    };

    if (loading && !reportData) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <div style={{
                    width: "60px",
                    height: "60px",
                    border: "4px solid var(--border)",
                    borderTop: "4px solid var(--primary)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }}></div>
                <p style={{ marginTop: "1rem", color: "var(--muted-foreground)" }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <h1 className="h1">Collection Management Reports</h1>
                <div>
                    <button
                        onClick={() => router.push('/collections')}
                        className="btn btn-outline"
                        style={{ marginRight: "1rem" }}
                    >
                        <BarChart3 size={20} />
                        View All Collections
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
                <div className="card">
                    <h3>Quick Reports</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                        <button
                            onClick={() => generateReport('summary')}
                            className="btn btn-primary"
                            style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <FileText size={16} style={{ marginRight: "0.5rem" }} />
                            <div>
                                <div>Summary</div>
                                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>Last 7 days</div>
                            </div>
                        </button>
                        <button
                            onClick={() => generateReport('performance')}
                            className="btn btn-primary"
                            style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <BarChart3 size={16} style={{ marginRight: "0.5rem" }} />
                            <div>
                                <div>Performance</div>
                                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>Last 7 days</div>
                            </div>
                        </button>
                        <button
                            onClick={() => generateReport('daily')}
                            className="btn btn-primary"
                            style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            <TrendingUp size={16} style={{ marginRight: "0.5rem" }} />
                            <div>
                                <div>Daily</div>
                                <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>Last 7 days</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Date Range Selection */}
            <div className="card">
                <h3>Report Settings</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "center" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--foreground)" }}>
                            Date Range:
                        </label>
                        <select
                            value={selectedDateRange}
                            onChange={(e) => setSelectedDateRange(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                border: "1px solid var(--border)",
                                borderRadius: "6px"
                            }}
                        >
                            <option value="7days">Last 7 days</option>
                            <option value="14days">Last 14 days</option>
                            <option value="30days">Last 30 days</option>
                            <option value="90days">Last 90 days</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", color: "var(--foreground)" }}>
                            Report Type:
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "0.5rem",
                                border: "1px solid var(--border)",
                                borderRadius: "6px"
                            }}
                        >
                            <option value="summary">Summary Report</option>
                            <option value="performance">Performance Report</option>
                            <option value="daily">Daily Breakdown</option>
                        </select>
                    </div>

                    <button
                        onClick={() => generateReport()}
                        className="btn btn-primary"
                        style={{ marginTop: "1rem", padding: "0.75rem 1.5rem", fontSize: "1rem" }}
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate Report"}
                    </button>
                </div>
            </div>

            {/* Report Display */}
            <div style={{ marginTop: "2rem", minHeight: "400px" }}>
                {reportData ? (
                    <div className="report-container" style={{ padding: "1.5rem", background: "white", borderRadius: "12px", border: "1px solid var(--border)" }}>
                        {reportData}
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "4rem", color: "var(--muted-foreground)" }}>
                        Select report options and click "Generate Report" to view analytics
                    </div>
                )}
            </div>
        </div>
    );
}
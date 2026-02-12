"use client";

import { useEffect, useState } from "react";
import { getActivityLogs } from "@/lib/activity-actions";
import { History, User, Clock, AlertCircle } from "lucide-react";

interface ActivityLogListProps {
    entityType: 'enquiry' | 'service_request' | 'collection';
    entityId: string;
}

export default function ActivityLogList({ entityType, entityId }: ActivityLogListProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadLogs() {
            try {
                const data = await getActivityLogs(entityType, entityId);
                setLogs(data || []);
            } catch (error) {
                console.error("Failed to load activity logs:", error);
            } finally {
                setLoading(false);
            }
        }
        loadLogs();
    }, [entityType, entityId]);

    const formatDateTime = (date: Date | null) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'created': return '#10b981';
            case 'status_changed': return '#3b82f6';
            case 'note_added': return '#f59e0b';
            case 'updated': return '#6b7280';
            case 'deleted': return '#ef4444';
            default: return 'var(--primary)';
        }
    };

    if (loading) return <p className="text-muted">Loading activity history...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {logs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
                    <AlertCircle size={32} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                    <p>No activity history found.</p>
                </div>
            ) : (
                logs.map((log) => (
                    <div key={log.id} style={{
                        display: "flex",
                        gap: "1rem",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        background: "var(--secondary)",
                        borderLeft: `4px solid ${getActionColor(log.action)}`
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <span style={{ fontWeight: "600", textTransform: "capitalize", fontSize: "0.875rem" }}>
                                    {log.action.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                    <Clock size={12} /> {formatDateTime(log.createdAt)}
                                </span>
                            </div>
                            <p style={{ fontSize: "0.875rem", margin: "0.25rem 0", lineHeight: "1.4" }}>{log.details}</p>
                            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <User size={12} /> {log.userName || 'System'}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { getEnquiries } from "@/lib/actions";
import SalesFunnel from "@/components/SalesFunnel";

export default function Dashboard() {
  const [allEnquiries, setAllEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getEnquiries();
      setAllEnquiries(data);
      setLoading(false);
    }
    load();
  }, []);

  const recentEnquiries = allEnquiries.slice(0, 5);

  const stats = [
    {
      label: "Total Enquiries",
      value: allEnquiries.length.toString(),
      icon: MessageSquare,
      delta: allEnquiries.filter(e => {
        const today = new Date();
        const created = new Date(e.createdAt);
        return created.toDateString() === today.toDateString();
      }).length + " today",
      color: "#6366f1"
    },
    {
      label: "High Priority",
      value: allEnquiries.filter(e => ['high', 'urgent'].includes(e.priority)).length.toString(),
      icon: Clock,
      delta: "Immediate action",
      color: "#f59e0b"
    },
    {
      label: "Qualified Leads",
      value: allEnquiries.filter(e => ['qualified', 'proposal', 'negotiation'].includes(e.status)).length.toString(),
      icon: Calendar,
      delta: "Active funnel",
      color: "#10b981"
    },
    {
      label: "Closed Won",
      value: allEnquiries.filter(e => e.status === 'closed_won').length.toString(),
      icon: CheckCircle2,
      delta: ((allEnquiries.filter(e => e.status === 'closed_won').length / Math.max(allEnquiries.length, 1)) * 100).toFixed(0) + "% rate",
      color: "#ec4899"
    },
  ];

  return (
    <div className="animate-in">
      <header style={{ marginBottom: "2.5rem" }}>
        <h1 className="h1">Dashboard Overview</h1>
        <p className="text-muted">Welcome back! Here's what's happening with your enquiries today.</p>
      </header>

      <section className="grid grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            className="card metric-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{
                background: `${stat.color}15`,
                padding: "0.5rem",
                borderRadius: "0.5rem",
                color: stat.color
              }}>
                <stat.icon size={24} />
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: "600", color: stat.color }}>{stat.delta}</span>
            </div>
            <div className="metric-value">{stat.value}</div>
            <div className="metric-label">{stat.label}</div>
          </motion.div>
        ))}
      </section>

      <section className="grid grid-cols-2" style={{ marginTop: "2.5rem" }}>
        <SalesFunnel data={[
          { label: "New Enquiries", count: allEnquiries.length, color: "#6366f1" },
          { label: "Contacted", count: allEnquiries.filter(e => e.status !== 'new').length, color: "#8b5cf6" },
          { label: "Qualified", count: allEnquiries.filter(e => ['qualified', 'proposal', 'negotiation', 'closed_won'].includes(e.status)).length, color: "#bc6cfb" },
          { label: "Proposed", count: allEnquiries.filter(e => ['proposal', 'negotiation', 'closed_won'].includes(e.status)).length, color: "#f59e0b" },
          { label: "Closed Won", count: allEnquiries.filter(e => e.status === 'closed_won').length, color: "#10b981" },
        ]} />

        {/* Upcomming Appointments */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 className="h3" style={{ margin: 0 }}>Performance Overview</h3>
            <span className="badge badge-success">On Track</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ padding: "1.5rem", background: "var(--background)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span className="text-muted" style={{ fontSize: "0.875rem" }}>Funnel Conversion</span>
                <span style={{ fontWeight: "700" }}>
                  {allEnquiries.length > 0 ? ((allEnquiries.filter(e => e.status === 'closed_won').length / allEnquiries.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div style={{ height: "8px", background: "var(--secondary)", borderRadius: "10px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${allEnquiries.length > 0 ? (allEnquiries.filter(e => e.status === 'closed_won').length / allEnquiries.length) * 100 : 0}%`,
                  background: "var(--primary)"
                }} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="card" style={{ background: "var(--secondary)", border: "none" }}>
                <div className="label">Avg. Lead Score</div>
                <div className="h2" style={{ fontSize: "1.25rem" }}>
                  {allEnquiries.length > 0 ? (allEnquiries.reduce((acc, curr) => acc + (curr.leadScore || 0), 0) / allEnquiries.length).toFixed(0) : 0}
                </div>
              </div>
              <div className="card" style={{ background: "var(--secondary)", border: "none" }}>
                <div className="label">Customer Rating</div>
                <div className="h2" style={{ fontSize: "1.25rem" }}>4.8/5.0</div>
              </div>
            </div>
          </div>

          <Link href="/performance">
            <button className="btn btn-secondary" style={{ width: "100%", marginTop: "1.5rem" }}>
              View Detailed Metrics
            </button>
          </Link>
        </div>
      </section>

      <section style={{ marginTop: "2.5rem" }}>
        {/* Recent Enquiries Container */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 className="h3" style={{ margin: 0 }}>Active Lead Activity</h3>
            <Link href="/enquiries">
              <button className="btn btn-outline" style={{ padding: "0.4rem 0.8rem" }}>Manage Leads</button>
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {loading ? (
              <p>Loading...</p>
            ) : recentEnquiries.length === 0 ? (
              <p className="text-muted">No recent enquiries found.</p>
            ) : recentEnquiries.map((enq) => (
              <div key={enq.id} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                borderRadius: "var(--radius)",
                background: "var(--background)",
                border: "1px solid var(--border)"
              }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                    color: "var(--primary)"
                  }}>
                    {enq.clientName.split(' ').map((n: any) => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{enq.clientName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      {enq.clientPhone} • {enq.source}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ textAlign: "right", marginRight: "1rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>Engagement Score</div>
                    <div style={{
                      fontWeight: "700",
                      color: (enq.leadScore || 0) > 70 ? '#10b981' : (enq.leadScore || 0) > 40 ? '#f59e0b' : 'var(--foreground)'
                    }}>
                      {enq.leadScore || 0}
                    </div>
                  </div>
                  <span className={`badge badge-${enq.status}`}>{enq.status}</span>
                  <Link href={`/enquiries/${enq.id}`}>
                    <ExternalLink size={18} className="text-muted hover-icon" style={{ cursor: "pointer" }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

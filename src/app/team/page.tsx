"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Users,
    Mail,
    Phone,
    Plus,
    Edit,
    Trash2,
    Award,
    TrendingUp,
    X
} from "lucide-react";
import { getUsers, createUser, deleteUser } from "@/lib/actions";

export default function TeamPage() {
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "staff",
        designation: "salesman",
        status: "active"
    });

    const loadTeam = async () => {
        const data = await getUsers();
        setTeamMembers(data);
        setLoading(false);
    };

    useEffect(() => {
        loadTeam();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            await createUser(formData);
            setFormData({ name: "", email: "", password: "", role: "staff", designation: "salesman", status: "active" });
            setShowForm(false);
            await loadTeam();
        });
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to remove ${name} from the team?`)) {
            startTransition(async () => {
                await deleteUser(id);
                await loadTeam();
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Mock performance data (you can later integrate with real data)
    const getPerformanceData = (email: string) => {
        const mockData: any = {
            "robert.fox@comradecrm.com": { enquiries: 124, conversions: 32, revenue: 45200 },
            "jane.cooper@comradecrm.com": { enquiries: 98, conversions: 41, revenue: 62800 },
            "cody.fisher@comradecrm.com": { enquiries: 156, conversions: 24, revenue: 28400 },
            "esther.howard@comradecrm.com": { enquiries: 112, conversions: 38, revenue: 51000 },
        };
        return mockData[email] || { enquiries: 0, conversions: 0, revenue: 0 };
    };

    const totalEnquiries = teamMembers.reduce((sum, m) => sum + getPerformanceData(m.email).enquiries, 0);
    const totalRevenue = teamMembers.reduce((sum, m) => sum + getPerformanceData(m.email).revenue, 0);

    return (
        <div className="animate-in">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 className="h1" style={{ marginBottom: "0.5rem" }}>Sales Team</h1>
                    <p className="text-muted">Manage your sales team members and their roles.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={20} />
                    Add Team Member
                </button>
            </header>

            {showForm && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "2rem"
                }}>
                    <div className="card" style={{
                        maxWidth: "500px",
                        width: "90%",
                        position: "relative",
                        maxHeight: "90vh",
                        overflowY: "auto"
                    }}>
                        <button
                            onClick={() => setShowForm(false)}
                            style={{ position: "absolute", top: "1rem", right: "1rem", background: "none", border: "none", cursor: "pointer" }}
                        >
                            <X size={24} />
                        </button>

                        <h2 className="h2" style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>Add New Team Member</h2>

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="label" style={{ fontSize: "0.8rem" }}>Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        className="input"
                                        placeholder="e.g. John Smith"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        style={{ padding: "0.5rem" }}
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="label" style={{ fontSize: "0.8rem" }}>Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        className="input"
                                        placeholder="john@company.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{ padding: "0.5rem" }}
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="label" style={{ fontSize: "0.8rem" }}>Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        className="input"
                                        placeholder="Initial password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        style={{ padding: "0.5rem" }}
                                    />
                                </div>

                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="label" style={{ fontSize: "0.8rem" }}>Role</label>
                                    <select
                                        name="role"
                                        className="input"
                                        value={formData.role}
                                        onChange={handleChange}
                                        style={{ padding: "0.5rem" }}
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="label" style={{ fontSize: "0.8rem" }}>Designation</label>
                                    <select
                                        name="designation"
                                        className="input"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        style={{ padding: "0.5rem" }}
                                    >
                                        <option value="salesman">Salesman</option>
                                        <option value="support">Support</option>
                                        <option value="developer">Developer</option>
                                        <option value="accounts">Accounts</option>
                                        <option value="manager">Manager</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="label" style={{ fontSize: "0.8rem" }}>Status</label>
                                    <select
                                        name="status"
                                        className="input"
                                        value={formData.status}
                                        onChange={handleChange}
                                        style={{ padding: "0.5rem" }}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={isPending}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isPending}>
                                    {isPending ? "Adding..." : "Add Team Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Stats */}
            <div className="grid grid-cols-4" style={{ marginBottom: "2.5rem" }}>
                <div className="card metric-card">
                    <div style={{ background: "#6366f115", padding: "0.5rem", borderRadius: "0.5rem", color: "#6366f1", width: "fit-content" }}>
                        <Users size={24} />
                    </div>
                    <div className="metric-value">{teamMembers.length}</div>
                    <div className="metric-label">Total Team Members</div>
                </div>
                <div className="card metric-card">
                    <div style={{ background: "#10b98115", padding: "0.5rem", borderRadius: "0.5rem", color: "#10b981", width: "fit-content" }}>
                        <Award size={24} />
                    </div>
                    <div className="metric-value">{teamMembers.length}</div>
                    <div className="metric-label">Active Members</div>
                </div>
                <div className="card metric-card">
                    <div style={{ background: "#f59e0b15", padding: "0.5rem", borderRadius: "0.5rem", color: "#f59e0b", width: "fit-content" }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="metric-value">{totalEnquiries}</div>
                    <div className="metric-label">Total Enquiries Handled</div>
                </div>
                <div className="card metric-card">
                    <div style={{ background: "#ec489915", padding: "0.5rem", borderRadius: "0.5rem", color: "#ec4899", width: "fit-content" }}>
                        <TrendingUp size={24} />
                    </div>
                    <div className="metric-value">${(totalRevenue / 1000).toFixed(0)}k</div>
                    <div className="metric-label">Total Revenue Generated</div>
                </div>
            </div>

            {/* Team Members Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>Loading team members...</div>
            ) : teamMembers.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                    <p className="text-muted">No team members yet. Click "Add Team Member" to get started!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2">
                    {teamMembers.map((member) => {
                        const perf = getPerformanceData(member.email);
                        return (
                            <div key={member.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                        <div style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontSize: "1.25rem",
                                            fontWeight: "700"
                                        }}>
                                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: "1.25rem", fontWeight: "700", margin: 0 }}>{member.name}</h3>
                                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.875rem", margin: "0.25rem 0 0 0", textTransform: "capitalize" }}>
                                                {member.designation || 'Staff'} {member.role === 'admin' && '• Admin'}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button className="btn btn-outline" style={{ padding: "0.4rem" }} title="Edit"><Edit size={16} /></button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: "0.4rem", color: "var(--destructive)" }}
                                            title="Delete"
                                            onClick={() => handleDelete(member.id, member.name)}
                                            disabled={isPending}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                                        <Mail size={16} color="var(--muted-foreground)" />
                                        <span>{member.email}</span>
                                    </div>
                                </div>

                                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                                    <div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--primary)" }}>{perf.enquiries}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Enquiries</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>{perf.conversions}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Conversions</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>${(perf.revenue / 1000).toFixed(0)}k</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Revenue</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

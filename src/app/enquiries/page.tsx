"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    Plus,
    Mail,
    Phone,
    Calendar,
    Trash2,
    ExternalLink
} from "lucide-react";
import { getEnquiries, deleteEnquiry } from "@/lib/actions";

export default function EnquiriesPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [enquiriesList, setEnquiriesList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    const loadEnquiries = async () => {
        const data = await getEnquiries();
        setEnquiriesList(data);
        setLoading(false);
    };

    useEffect(() => {
        loadEnquiries();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete the enquiry from ${name}?`)) {
            startTransition(async () => {
                await deleteEnquiry(id);
                await loadEnquiries();
            });
        }
    };

    const filteredEnquiries = enquiriesList.filter(enq =>
        enq.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enq.clientPhone.includes(searchTerm)
    );

    return (
        <div className="animate-in">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 className="h1" style={{ marginBottom: "0.5rem" }}>Enquiries</h1>
                    <p className="text-muted">Manage and track all customer enquiries and their current status.</p>
                </div>
                <Link href="/enquiries/new">
                    <button className="btn btn-primary">
                        <Plus size={20} />
                        Add New Enquiry
                    </button>
                </Link>
            </header>

            <div className="card" style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, position: "relative", minWidth: "300px" }}>
                        <Search size={18} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                        <input
                            type="text"
                            className="input"
                            placeholder="Search enquiries by name, email or phone..."
                            style={{ paddingLeft: "2.5rem" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-outline">
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", background: "var(--secondary)", borderBottom: "1px solid var(--border)" }}>
                                <th style={{ padding: "1.25rem 1.5rem", fontWeight: "600", color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>Client Details</th>
                                <th style={{ padding: "1.25rem 1.5rem", fontWeight: "600", color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>Source</th>
                                <th style={{ padding: "1.25rem 1.5rem", fontWeight: "600", color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>Status</th>
                                <th style={{ padding: "1.25rem 1.5rem", fontWeight: "600", color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>Priority</th>
                                <th style={{ padding: "1.25rem 1.5rem", fontWeight: "600", color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>Assigned To</th>
                                <th style={{ padding: "1.25rem 1.5rem", fontWeight: "600", color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>Date Added</th>
                                <th style={{ padding: "1.25rem 1.5rem", fontWeight: "600", color: "var(--muted-foreground)", fontSize: "0.75rem", textTransform: "uppercase" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center" }}>Loading enquiries...</td></tr>
                            ) : filteredEnquiries.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: "2rem", textAlign: "center" }}>No enquiries found.</td></tr>
                            ) : filteredEnquiries.map((enq) => (
                                <tr key={enq.id} style={{ borderBottom: "1px solid var(--border)" }}>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ fontWeight: "600" }}>{enq.clientName}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                                            {enq.clientEmail && <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Mail size={12} /> {enq.clientEmail}</span>}
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}><Phone size={12} /> {enq.clientPhone}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span className="badge" style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>{enq.source}</span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span className={`badge badge-${enq.status}`}>{enq.status}</span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span className={`badge badge-${enq.priority}`}>{enq.priority}</span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <span style={{ fontWeight: "500", fontSize: "0.875rem" }}>{enq.assignedTo?.name || "Unassigned"}</span>
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--muted-foreground)", fontSize: "0.875rem" }}>
                                        {enq.createdAt ? (() => {
                                            const date = typeof enq.createdAt === 'number'
                                                ? new Date(enq.createdAt < 10000000000 ? enq.createdAt * 1000 : enq.createdAt)
                                                : new Date(enq.createdAt);
                                            return date.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            });
                                        })() : 'N/A'}
                                    </td>
                                    <td style={{ padding: "1.25rem 1.5rem" }}>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <Link href={`/enquiries/${enq.id}`}>
                                                <button className="btn btn-outline" style={{ padding: "0.4rem" }} title="View Details"><ExternalLink size={16} /></button>
                                            </Link>
                                            <button className="btn btn-outline" style={{ padding: "0.4rem" }} title="Schedule Appointment"><Calendar size={16} /></button>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: "0.4rem", color: "var(--destructive)" }}
                                                title="Delete"
                                                onClick={() => handleDelete(enq.id, enq.clientName)}
                                                disabled={isPending}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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

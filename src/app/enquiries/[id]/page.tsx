"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Phone,
    Mail,
    MessageSquare,
    Calendar,
    Plus,
    History,
    CheckCircle,
    TrendingUp
} from "lucide-react";
import { getEnquiryById, getFollowups, createFollowup, updateEnquiryStatus } from "@/lib/actions";
import { logActivity } from "@/lib/activity-actions";
import CommunicationButtons from "@/components/CommunicationButtons";
import ActivityLogList from "@/components/ActivityLogList";

export default function EnquiryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [newNote, setNewNote] = useState("");
    const [followups, setFollowups] = useState<any[]>([]);
    const [enquiry, setEnquiry] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEnquiry() {
            if (params.id) {
                const [data, followupData] = await Promise.all([
                    getEnquiryById(params.id as string),
                    getFollowups(params.id as string)
                ]);
                setEnquiry(data);
                setFollowups(followupData || []);
                setLoading(false);
            }
        }
        loadEnquiry();
    }, [params.id]);

    async function handleLogNote() {
        if (!newNote.trim() || !enquiry) return;

        try {
            await createFollowup({
                enquiryId: enquiry.id,
                staffId: "1", // TODO: Get actual staff ID from auth
                content: newNote,
                type: "note"
            });

            // Log activity
            await logActivity('enquiry', enquiry.id, 'note_added', newNote, '1', 'John Smith');

            // Reload enquiry (for updated lead score) and followups
            const [updatedEnquiry, followupData] = await Promise.all([
                getEnquiryById(enquiry.id),
                getFollowups(enquiry.id)
            ]);
            setEnquiry(updatedEnquiry);
            setFollowups(followupData || []);
            setNewNote("");
        } catch (error) {
            console.error("Failed to log note:", error);
        }
    }


    async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const newStatus = e.target.value;
        if (!enquiry) return;

        try {
            await updateEnquiryStatus(enquiry.id, newStatus as any);
            // Optimistically update UI or reload
            setEnquiry({ ...enquiry, status: newStatus });

            // Log a system note
            await createFollowup({
                enquiryId: enquiry.id,
                staffId: "1",
                content: `Status changed to ${newStatus}`,
                type: "status"
            });

            // Log activity
            await logActivity('enquiry', enquiry.id, 'status_changed', `Status changed from ${enquiry.status} to ${newStatus}`, '1', 'John Smith');

            // Reload enquiry (for updated lead score) and followups
            const [updatedEnquiry, followupData] = await Promise.all([
                getEnquiryById(enquiry.id),
                getFollowups(enquiry.id)
            ]);
            setEnquiry(updatedEnquiry);
            setFollowups(followupData || []);
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status");
        }
    }


    const formatDateTime = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = typeof timestamp === 'number'
            ? new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
            : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="animate-in" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Loading enquiry details...</p>
            </div>
        );
    }

    if (!enquiry) {
        return (
            <div className="animate-in" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Enquiry not found.</p>
                <button className="btn btn-primary" onClick={() => router.push("/enquiries")} style={{ marginTop: "1rem" }}>
                    Back to Enquiries
                </button>
            </div>
        );
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = typeof timestamp === 'number'
            ? new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp)
            : new Date(timestamp);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="animate-in">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <button className="btn btn-outline" style={{ padding: "0.5rem" }} onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="h1" style={{ margin: 0 }}>{enquiry.clientName}</h1>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                            <select
                                className={`badge badge-${enquiry.status}`}
                                value={enquiry.status}
                                onChange={handleStatusChange}
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    appearance: 'none',
                                    cursor: 'pointer',
                                    paddingRight: '1rem',
                                    textAlign: 'center'
                                }}
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="proposal">Proposal</option>
                                <option value="negotiation">Negotiation</option>
                                <option value="closed_won">Closed Won</option>
                                <option value="closed_lost">Closed Lost</option>
                            </select>
                            <span className={`badge badge-${enquiry.priority}`}>{enquiry.priority}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--secondary)", padding: "0.25rem 0.75rem", borderRadius: "12px" }}>
                                <TrendingUp size={14} style={{ color: (enquiry.leadScore || 0) > 70 ? '#10b981' : (enquiry.leadScore || 0) > 40 ? '#f59e0b' : 'var(--primary)' }} />
                                <span style={{ fontWeight: "600", fontSize: "0.875rem" }}>
                                    Lead Score: {enquiry.leadScore || 0}
                                </span>
                            </div>
                            <span className="text-muted" style={{ fontSize: "0.875rem" }}>Added on {formatDate(enquiry.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <Link href={`/enquiries/${params.id}/edit`}>
                        <button className="btn btn-outline">Edit Enquiry</button>
                    </Link>
                    <Link href={`/appointments?enquiryId=${params.id}`}>
                        <button className="btn btn-primary"><Calendar size={18} /> Book Appointment</button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-3">
                {/* Left Column: Details */}
                <div>
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <h3 className="h3" style={{ fontSize: "1.1rem" }}>Contact Information</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                            {enquiry.clientEmail && (
                                <div>
                                    <div className="label">Email Address</div>
                                    <div style={{ fontWeight: "500" }}>{enquiry.clientEmail}</div>
                                </div>
                            )}
                            <div>
                                <div className="label">Phone Number</div>
                                <div style={{ fontWeight: "500" }}>{enquiry.clientPhone}</div>
                            </div>
                            <div>
                                <div className="label">Source</div>
                                <div style={{ fontWeight: "500" }}>{enquiry.source}</div>
                            </div>
                        </div>

                        <div style={{ borderTop: "1px solid var(--border)", marginTop: "1.5rem", paddingTop: "1rem" }}>
                            <div className="label" style={{ marginBottom: "0.5rem" }}>Quick Actions</div>
                            <CommunicationButtons
                                phone={enquiry.clientPhone}
                                name={enquiry.clientName}
                                subject={enquiry.description?.substring(0, 30)}
                            />
                        </div>
                    </div>

                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <h3 className="h3" style={{ fontSize: "1.1rem" }}>Enquiry Details</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                            <div>
                                <div className="label">Status</div>
                                <span className={`badge badge-${enquiry.status}`}>{enquiry.status}</span>
                            </div>
                            <div>
                                <div className="label">Priority</div>
                                <span className={`badge badge-${enquiry.priority}`}>{enquiry.priority}</span>
                            </div>
                            {enquiry.description && (
                                <div>
                                    <div className="label">Description</div>
                                    <div style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>{enquiry.description}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="h3" style={{ fontSize: "1.1rem" }}>Assigned Staff</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                            <div style={{ width: "40px", height: "40px", background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                {enquiry.assignedTo ? enquiry.assignedTo.name.split(' ').map((n: string) => n[0]).join('') : 'UN'}
                            </div>
                            <div>
                                <div style={{ fontWeight: "600" }}>{enquiry.assignedTo?.name || "Unassigned"}</div>
                                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                                    {enquiry.assignedTo?.role || "No staff assigned yet"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Trail/Activity */}
                <div style={{ gridColumn: "span 2", marginLeft: "2rem" }}>
                    <div className="card" style={{ marginBottom: "1.5rem" }}>
                        <h3 className="h3" style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <History size={20} /> Enquiry Trail
                        </h3>

                        {/* Quick Note Input */}
                        <div style={{ marginTop: "1.5rem", position: "relative" }}>
                            <textarea
                                className="input"
                                placeholder="Log a call note or follow-up details..."
                                rows={3}
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                style={{ paddingBottom: "3rem" }}
                            />
                            <div style={{ position: "absolute", bottom: "0.75rem", right: "0.75rem", display: "flex", gap: "0.5rem" }}>
                                <button className="btn btn-primary" style={{ padding: "0.4rem 1rem" }} onClick={handleLogNote}>
                                    <Plus size={16} /> Log Note
                                </button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {followups.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
                                    No activity logged yet. Add a note above to get started.
                                </div>
                            ) : (
                                followups.map((item: any) => (
                                    <div key={item.id} style={{ display: "flex", gap: "1.5rem" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{
                                                width: "36px",
                                                height: "36px",
                                                borderRadius: "50%",
                                                background: "var(--accent)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "var(--primary)"
                                            }}>
                                                {item.type === 'call' && <Phone size={18} />}
                                                {item.type === 'email' && <Mail size={18} />}
                                                {item.type === 'note' && <MessageSquare size={18} />}
                                                {item.type === 'status' && <CheckCircle size={18} />}
                                            </div>
                                            <div style={{ flex: 1, width: "2px", background: "var(--border)", margin: "0.5rem 0" }} />
                                        </div>
                                        <div style={{ paddingBottom: "1.5rem", flex: 1 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                                <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                                                    {item.staff?.name || "Unknown staff"} logged a {item.type}
                                                </span>
                                                <span className="text-muted" style={{ fontSize: "0.8rem" }}>{formatDateTime(item.createdAt)}</span>
                                            </div>
                                            <p style={{ color: "var(--muted-foreground)", fontSize: "0.9rem" }}>{item.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="card" style={{ marginTop: "1.5rem" }}>
                        <h3 className="h3" style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <History size={20} /> System Audit Trail
                        </h3>
                        <ActivityLogList entityType="enquiry" entityId={enquiry.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}

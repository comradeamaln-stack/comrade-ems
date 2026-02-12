"use client";

import { useState, useEffect, Suspense } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    Calendar as CalendarIcon,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Bell,
    ChevronLeft,
    ChevronRight,
    Plus,
    X
} from "lucide-react";
import { getAppointments, createAppointment, updateAppointmentStatus, deleteAppointment, getEnquiries } from "@/lib/actions";

function AppointmentsContent() {
    const searchParams = useSearchParams();
    const prefillEnquiryId = searchParams.get("enquiryId");

    const [activeTab, setActiveTab] = useState("upcoming");
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        enquiryId: ''
    });
    const [enquiries, setEnquiries] = useState<any[]>([]);

    useEffect(() => {
        loadAppointments();
        loadEnquiries();

        if (prefillEnquiryId) {
            setFormData(prev => ({ ...prev, enquiryId: prefillEnquiryId }));
            setShowForm(true);
        }
    }, [prefillEnquiryId]);

    async function loadEnquiries() {
        try {
            const data = await getEnquiries();
            setEnquiries(data || []);
        } catch (error) {
            console.error("Failed to load enquiries:", error);
        }
    }

    async function loadAppointments() {
        try {
            const data = await getAppointments();
            setAppointments(data || []);
        } catch (error) {
            console.error("Failed to load appointments:", error);
        }
        setLoading(false);
    }

    async function handleStatusChange(appointmentId: string, status: any) {
        try {
            await updateAppointmentStatus(appointmentId, status);
            await loadAppointments();
        } catch (error) {
            console.error("Failed to update appointment:", error);
        }
    }

    async function handleDelete(appointmentId: string) {
        if (confirm("Are you sure you want to delete this appointment?")) {
            try {
                await deleteAppointment(appointmentId);
                await loadAppointments();
            } catch (error) {
                console.error("Failed to delete appointment:", error);
            }
        }
    }

    async function handleCreateAppointment(e: React.FormEvent) {
        e.preventDefault();

        if (!formData.title || !formData.date || !formData.time) {
            alert("Please fill in all required fields (title, date, and time)");
            return;
        }

        try {
            console.log("Creating appointment:", formData);
            await createAppointment(formData);
            setFormData({
                title: '',
                description: '',
                date: '',
                time: '',
                enquiryId: ''
            });
            setShowForm(false);
            await loadAppointments();
        } catch (error) {
            console.error("Failed to create appointment:", error);
            alert("Failed to create appointment. Please check the console for details.");
        }
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (appointmentDate.getTime() === today.getTime()) return 'Today';
        if (appointmentDate.getTime() === tomorrow.getTime()) return 'Tomorrow';

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };



    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="animate-in">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 className="h1" style={{ marginBottom: "0.5rem" }}>Appointments & Alerts</h1>
                    <p className="text-muted">Schedule and manage follow-ups, calls, and meetings.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={20} />
                    Schedule New
                </button>
            </header>

            <div className="grid grid-cols-3" style={{ alignItems: "start" }}>
                {/* Calendar Sidebar Mockup */}
                <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h3 className="h3" style={{ margin: 0, fontSize: "1.1rem" }}>February 2026</h3>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button className="btn btn-outline" style={{ padding: "0.25rem" }}><ChevronLeft size={16} /></button>
                            <button className="btn btn-outline" style={{ padding: "0.25rem" }}><ChevronRight size={16} /></button>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", textAlign: "center", fontSize: "0.75rem", fontWeight: "600", color: "var(--muted-foreground)" }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={`day-${index}`}>{day}</div>)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", marginTop: "0.5rem" }}>
                        {Array.from({ length: 28 }).map((_, i) => (
                            <div key={i} style={{
                                height: "32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "4px",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                background: i + 1 === 1 ? "var(--primary)" : "transparent",
                                color: i + 1 === 1 ? "white" : "inherit"
                            }}>
                                {i + 1}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: "2rem" }}>
                        <h4 style={{ fontSize: "0.875rem", fontWeight: "600", marginBottom: "1rem" }}>Daily Summary</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                <span className="text-muted">Total Appointments</span>
                                <span style={{ fontWeight: "600" }}>8</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                <span className="text-muted">Completed</span>
                                <span style={{ fontWeight: "600" }}>3</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                                <span className="text-muted">Follow-ups Pending</span>
                                <span style={{ fontWeight: "600", color: "#f59e0b" }}>5</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Appointment List */}
                <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div className="card" style={{ padding: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            {["Upcoming", "Past", "Alerts"].map((tab) => (
                                <button
                                    key={tab}
                                    className={`btn ${activeTab === tab.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ flex: 1, border: "none" }}
                                    onClick={() => setActiveTab(tab.toLowerCase())}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {loading ? (
                            <div className="card">
                                <p style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>Loading appointments...</p>
                            </div>
                        ) : appointments.length === 0 ? (
                            <div className="card">
                                <p style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>No appointments scheduled</p>
                            </div>
                        ) : (
                            appointments.map((apt) => (
                                <div key={apt.id} className="card" style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                                    <div style={{
                                        width: "60px",
                                        textAlign: "center",
                                        borderRight: "1px solid var(--border)",
                                        paddingRight: "1.5rem"
                                    }}>
                                        <div style={{ fontWeight: "800", fontSize: "1.1rem" }}>
                                            {formatTime(apt.scheduledAt).split(':')[0]}
                                        </div>
                                        <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                                            {formatTime(apt.scheduledAt).split(' ')[1]}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <h4 style={{ fontSize: "1rem", fontWeight: "700" }}>{apt.title}</h4>
                                            {apt.status === 'missed' && <span style={{ color: "#ef4444" }}><Bell size={14} /></span>}
                                        </div>
                                        <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
                                            Client: {apt.enquiry?.clientName || 'Unknown'} • {formatDate(apt.scheduledAt)}
                                        </div>
                                        {apt.description && (
                                            <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginTop: "0.25rem" }}>
                                                {apt.description}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        {apt.status !== 'completed' && (
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: "0.4rem", color: "#10b981" }}
                                                title="Complete"
                                                onClick={() => handleStatusChange(apt.id, 'completed')}
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: "0.4rem", color: "#f59e0b" }}
                                            title="Reschedule"
                                            onClick={() => alert("Rescheduling coming soon!")}
                                        >
                                            <Clock size={18} />
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: "0.4rem", color: "#ef4444" }}
                                            title="Cancel"
                                            onClick={() => handleDelete(apt.id)}
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Appointment Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 className="h3">Schedule New Appointment</h3>
                            <button className="btn btn-outline" onClick={() => setShowForm(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="label">Appointment Title *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Client Meeting, Follow-up Call"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Related Enquiry</label>
                                <select
                                    className="input"
                                    value={formData.enquiryId}
                                    onChange={(e) => setFormData({ ...formData, enquiryId: e.target.value })}
                                >
                                    <option value="">Select Enquiry (Optional)</option>
                                    {enquiries.map((enq: any) => (
                                        <option key={enq.id} value={enq.id}>
                                            {enq.clientName} - {enq.status}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="label">Date *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="label">Time *</label>
                                    <input
                                        type="time"
                                        className="input"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Description</label>
                                <textarea
                                    className="input"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Additional details about the appointment..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <Plus size={16} /> Schedule Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AppointmentsPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading appointments...</div>}>
            <AppointmentsContent />
        </Suspense>
    );
}

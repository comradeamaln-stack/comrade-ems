"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus,
    AlertTriangle,
    Clock,
    CheckCircle,
    XCircle,
    MessageSquare,
    Paperclip,
    User,
    Calendar,
    Filter,
    Ticket,
    Mail,
    Download,
    FileText,
    Grid
} from "lucide-react";
import { getServiceRequests, createServiceRequest } from "@/lib/service-request-actions-mock";

export default function ServiceRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        subject: "",
        description: "",
        priority: "medium",
        category: "service"
    });
    const [activeFilter, setActiveFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Mock current user - in a real app this would come from authentication
    const currentUser = { name: "Support Staff", id: 1 };

    useEffect(() => {
        loadRequests();
    }, []);

    async function loadRequests() {
        try {
            const data = await getServiceRequests();
            setRequests(data || []);
        } catch (error) {
            console.error("Failed to load service requests:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateRequest(e: React.FormEvent) {
        e.preventDefault();
        try {
            await createServiceRequest(formData, "", "");
            setFormData({
                clientName: "",
                clientEmail: "",
                clientPhone: "",
                subject: "",
                description: "",
                priority: "medium",
                category: "service"
            });
            setShowForm(false);
            await loadRequests();
        } catch (error) {
            console.error("Failed to create service request:", error);
        }
    }

    function getStatusIcon(status: string) {
        switch (status) {
            case "open": return <AlertTriangle size={16} style={{ color: "#f59e0b" }} />;
            case "pending": return <Clock size={16} style={{ color: "#6b7280" }} />;
            case "in_progress": return <Clock size={16} style={{ color: "#3b82f6" }} />;
            case "resolved": return <CheckCircle size={16} style={{ color: "#10b981" }} />;
            case "closed": return <XCircle size={16} style={{ color: "#ef4444" }} />;
            default: return <AlertTriangle size={16} />;
        }
    }

    function getPriorityColor(priority: string) {
        switch (priority) {
            case "low": return '#6b7280';
            case "medium": return '#f59e0b';
            case "high": return '#ef4444';
            case "urgent": return '#dc2626';
            default: return '#6b7280';
        }
    }

    const filteredRequests = activeFilter === "all"
        ? requests
        : requests.filter(r => r.status === activeFilter);

    // Export functions
    const exportToExcel = () => {
        const headers = ['Ticket Number', 'Client Name', 'Email', 'Phone', 'Subject', 'Status', 'Priority', 'Category', 'Created Date'];
        const csvContent = [
            headers.join(','),
            ...filteredRequests.map(req => [
                req.ticketNumber || '',
                `"${req.clientName || ''}"`,
                `"${req.clientEmail || ''}"`,
                `"${req.clientPhone || ''}"`,
                `"${req.subject || ''}"`,
                req.status || '',
                req.priority || '',
                req.category || '',
                new Date(req.createdAt).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `service-requests-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const exportToPDF = () => {
        const printWindow = window.open('', '_blank');
        const html = `
            <html>
                <head>
                    <title>Service Requests Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .priority { padding: 2px 6px; border-radius: 3px; color: white; font-size: 0.8em; }
                        .priority-low { background-color: #6b7280; }
                        .priority-medium { background-color: #f59e0b; }
                        .priority-high { background-color: #ef4444; }
                        .priority-urgent { background-color: #dc2626; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Service Requests Report</h1>
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                        <p>Total Requests: ${filteredRequests.length}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Ticket #</th>
                                <th>Client Name</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Category</th>
                                <th>Created Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredRequests.map(req => `
                                <tr>
                                    <td>${req.ticketNumber || ''}</td>
                                    <td>${req.clientName || ''}</td>
                                    <td>${req.subject || ''}</td>
                                    <td>${req.status?.replace('_', ' ') || ''}</td>
                                    <td><span class="priority priority-${req.priority}">${req.priority || ''}</span></td>
                                    <td>${req.category || ''}</td>
                                    <td>${new Date(req.createdAt).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    const printTicket = (request: any) => {
        const printWindow = window.open('', '_blank');
        const html = `
            <html>
                <head>
                    <title>Service Request #${request.ticketNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { text-align: center; margin-bottom: 30px; }
                        .ticket-info { margin: 20px 0; }
                        .field { margin: 10px 0; }
                        .label { font-weight: bold; }
                        .priority { padding: 4px 8px; border-radius: 4px; color: white; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Service Request Ticket</h1>
                    </div>
                    <div class="ticket-info">
                        <div class="field"><span class="label">Ticket Number:</span> ${request.ticketNumber}</div>
                        <div class="field"><span class="label">Client Name:</span> ${request.clientName}</div>
                        <div class="field"><span class="label">Email:</span> ${request.clientEmail || 'N/A'}</div>
                        <div class="field"><span class="label">Phone:</span> ${request.clientPhone || 'N/A'}</div>
                        <div class="field"><span class="label">Subject:</span> ${request.subject}</div>
                        <div class="field"><span class="label">Status:</span> ${request.status?.replace('_', ' ')}</div>
                        <div class="field"><span class="label">Priority:</span> <span class="priority">${request.priority}</span></div>
                        <div class="field"><span class="label">Category:</span> ${request.category}</div>
                        <div class="field"><span class="label">Description:</span></div>
                        <div style="margin-left: 20px; white-space: pre-wrap;">${request.description}</div>
                        <div class="field"><span class="label">Created:</span> ${new Date(request.createdAt).toLocaleString()}</div>
                    </div>
                </body>
            </html>
        `;
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    };

    const downloadAttachment = (attachmentPath: string) => {
        if (!attachmentPath) return;
        window.open(attachmentPath, '_blank');
    };

    return (
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 1rem" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 className="h1">Service Requests</h1>
                    <p className="text-muted">Manage customer service requests with ticket numbers and email notifications.</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                        <div style={{ width: "8px", height: "8px", background: "#10b981", borderRadius: "50%" }}></div>
                        <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                            Logged in as: <strong>{currentUser.name}</strong>
                            <span style={{ marginLeft: "0.5rem", padding: "0.125rem 0.5rem", background: "#3b82f6", color: "white", borderRadius: "12px", fontSize: "0.75rem" }}>
                                Support Staff
                            </span>
                        </span>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ alignSelf: "flex-end" }}>
                    <Plus size={20} />
                    New Request
                </button>
            </header>

            <div className="card" style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        {["all", "open", "pending", "in_progress", "resolved", "closed"].map((filter) => (
                            <button
                                key={filter}
                                className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-outline'}`}
                                style={{ textTransform: "capitalize" }}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-outline" onClick={exportToExcel} title="Export to Excel">
                            <Download size={16} />
                            Excel
                        </button>
                        <button className="btn btn-outline" onClick={exportToPDF} title="Export to PDF">
                            <FileText size={16} />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="card">
                    <p style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
                        Loading service requests...
                    </p>
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="card">
                    <p style={{ textAlign: "center", padding: "2rem", color: "var(--muted-foreground)" }}>
                        No service requests found. Click "New Request" to create the first one.
                    </p>
                </div>
            ) : (
                <div className="card-container" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {filteredRequests.map((request) => (
                        <div key={request.id} className="card" style={{ width: "100%" }}>
                            <div style={{ display: "flex", gap: "1.5rem", alignItems: "start" }}>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    minWidth: "200px"
                                }}>
                                    <div style={{
                                        width: "80px",
                                        height: "80px",
                                        background: "var(--accent)",
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexDirection: "column",
                                        gap: "0.25rem"
                                    }}>
                                        <Ticket size={24} style={{ color: "var(--primary)" }} />
                                        <div style={{
                                            fontSize: "0.8rem",
                                            fontWeight: "700",
                                            color: "var(--primary)",
                                            textAlign: "center",
                                            lineHeight: "1.1"
                                        }}>
                                            {request.ticketNumber}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>
                                            {getStatusIcon(request.status)}
                                            <span style={{ marginLeft: "0.5rem" }}>
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                            {request.priority}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>{request.subject}</h3>
                                    <div style={{ marginTop: "0.5rem", display: "flex", gap: "1rem", fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                        <span>{request.clientName}</span>
                                        <span>•</span>
                                        <span>{request.category}</span>
                                        <span>•</span>
                                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <p style={{
                                        fontSize: "0.9rem",
                                        color: "var(--muted-foreground)",
                                        lineHeight: "1.5",
                                        margin: "0.5rem 0"
                                    }}>
                                        {request.description.substring(0, 150)}
                                        {request.description.length > 150 && "..."}
                                    </p>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <span
                                                style={{
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "4px",
                                                    fontSize: "0.75rem",
                                                    background: getPriorityColor(request.priority) + "15",
                                                    color: getPriorityColor(request.priority)
                                                }}
                                            >
                                                {request.priority}
                                            </span>
                                            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                                Raised by: <strong>{request.submittedByName || 'Unknown'}</strong>
                                                <span style={{ marginLeft: "0.5rem", padding: "0.125rem 0.5rem", background: "#f59e0b", color: "white", borderRadius: "12px", fontSize: "0.75rem" }}>
                                                    Support Staff
                                                </span>
                                            </span>
                                            {request.assignedToUser && (
                                                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                                    Assigned to {request.assignedToUser.name}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button className="btn btn-outline" onClick={() => printTicket(request)} title="Print Ticket" style={{ padding: "0.4rem 0.8rem" }}>
                                                <FileText size={14} />
                                            </button>
                                            {request.attachmentPath && (
                                                <button className="btn btn-outline" onClick={() => downloadAttachment(request.attachmentPath)} title="Download Attachment" style={{ padding: "0.4rem 0.8rem" }}>
                                                    <Download size={14} />
                                                </button>
                                            )}
                                            <Link href={`/service-requests/${request.id}`}>
                                                <button className="btn btn-outline" style={{ padding: "0.4rem 1rem" }}>
                                                    View Details
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Service Request Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card" style={{
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '95vh',
                        overflow: 'auto',
                        position: 'relative',
                        animation: 'modalSlideIn 0.3s ease-out'
                    }}>
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, var(--primary), #2563eb)',
                            color: 'white',
                            padding: '2rem',
                            margin: '-1rem -1rem 2rem -1rem',
                            borderRadius: 'var(--border-radius) var(--border-radius) 0 0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Ticket size={24} />
                                        </div>
                                        <div>
                                            <h2 className="h2" style={{ margin: 0, color: 'white', fontSize: '1.5rem' }}>
                                                Create New Service Request
                                            </h2>
                                            <p style={{ margin: '0.25rem 0 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>
                                                Submit a ticket for technical support, billing, or general inquiries
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0.5rem',
                                        cursor: 'pointer',
                                        color: 'white',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                            {/* Client Information Section */}
                            <div style={{
                                background: 'var(--accent)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <User size={18} style={{ color: 'var(--primary)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>
                                        Client Information
                                    </h3>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="label">Client Name *</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.clientName}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                            placeholder="Enter client's full name"
                                            required
                                            style={{ width: '100%', fontSize: '0.95rem' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Email Address</label>
                                        <input
                                            type="email"
                                            className="input"
                                            value={formData.clientEmail}
                                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                                            placeholder="client@example.com"
                                            style={{ width: '100%', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label className="label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="input"
                                        value={formData.clientPhone}
                                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                                        placeholder="+1 (555) 123-4567"
                                        style={{ width: '100%', fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>

                            {/* Request Details Section */}
                            <div style={{
                                background: 'var(--accent)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: 'var(--primary)' }}>
                                        Request Details
                                    </h3>
                                </div>

                                <div className="form-group">
                                    <label className="label">Subject *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Brief summary of your issue or request"
                                        required
                                        style={{ width: '100%', fontSize: '0.95rem' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div className="form-group">
                                        <label className="label">Priority Level</label>
                                        <select
                                            className="input"
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            style={{ width: '100%', fontSize: '0.95rem' }}
                                        >
                                            <option value="low">🟢 Low - Routine maintenance</option>
                                            <option value="medium">🟡 Medium - Standard issue</option>
                                            <option value="high">🟠 High - Important issue</option>
                                            <option value="urgent">🔴 Urgent - Critical problem</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="label">Category</label>
                                        <select
                                            className="input"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            style={{ width: '100%', fontSize: '0.95rem' }}
                                        >
                                            <option value="technical">💻 Technical Support</option>
                                            <option value="billing">💳 Billing & Payment</option>
                                            <option value="service">🛎️ Customer Service</option>
                                            <option value="feature">✨ Feature Request</option>
                                            <option value="bug">🐛 Bug Report</option>
                                            <option value="other">📋 Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label className="label">Detailed Description *</label>
                                    <textarea
                                        className="input"
                                        rows={6}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Please provide as much detail as possible including:&#10;• What happened and when&#10;• Steps to reproduce the issue&#10;• Any error messages you received&#10;• What you expected to happen&#10;• Browser/device information (if applicable)"
                                        required
                                        style={{
                                            minHeight: '160px',
                                            width: '100%',
                                            resize: 'vertical',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'flex-end',
                                paddingTop: '1.5rem',
                                borderTop: '2px solid var(--border)',
                                marginTop: '0.5rem'
                            }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowForm(false)}
                                    style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ padding: '0.75rem 2rem', fontSize: '1rem', fontWeight: '600' }}
                                >
                                    <Plus size={18} style={{ marginRight: '0.5rem' }} />
                                    Create Service Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add CSS animation */}
            <style jsx>{`
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
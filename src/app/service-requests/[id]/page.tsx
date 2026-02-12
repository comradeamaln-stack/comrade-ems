"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Upload,
    X,
    User,
    Calendar,
    Paperclip,
    MessageSquare,
    CheckCircle,
    Clock,
    AlertTriangle,
    Reply,
    Send,
    Ticket,
    Mail,
    Download,
    ZoomIn,
    Image
} from "lucide-react";
import { getServiceRequestById, addServiceRequestReply, updateServiceRequestStatus, addServiceRequestAttachment } from "@/lib/service-request-actions-mock";
import { logActivity } from "@/lib/activity-actions";
import CommunicationButtons from "@/components/CommunicationButtons";
import ActivityLogList from "@/components/ActivityLogList";
import { History } from "lucide-react";

export default function ServiceRequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState("");
    const [replyStatus, setReplyStatus] = useState("pending");
    const [showImageUpload, setShowImageUpload] = useState(false);

    const [currentUser, setCurrentUser] = useState({
        id: "1",
        name: "John Smith"
    });

    useEffect(() => {
        // The service-request-actions.ts now handles user validation automatically
        // No need to validate user here
    }, []);



    useEffect(() => {
        loadRequest();
    }, [params.id]);

    async function loadRequest() {
        if (params.id) {
            const data = await getServiceRequestById(params.id as string);
            setRequest(data);
            setLoading(false);
        }
    }

    async function handleReply(e: React.FormEvent) {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            await addServiceRequestReply(params.id as string, {
                message: replyMessage,
                status: replyStatus
            }, currentUser.id, currentUser.name);

            setReplyMessage("");
            setReplyStatus("pending");

            // Log activity
            await logActivity('service_request', params.id as string, 'note_added', `Reply added: ${replyMessage.substring(0, 50)}${replyMessage.length > 50 ? '...' : ''}`, currentUser.id, currentUser.name);

            await loadRequest();
        } catch (error: any) {
            console.error("Failed to add reply:", error);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Validate that we have a valid request ID and user ID
        if (!params.id || !currentUser?.id) {
            console.error("Missing request ID or user ID for attachment upload");
            alert("Unable to upload attachment: Missing required information");
            return;
        }

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    // Validate file size (10MB max)
                    if (file.size > 10 * 1024 * 1024) {
                        alert(`${file.name} is too large. Maximum file size is 10MB.`);
                        continue;
                    }

                    // Upload to server using simplified API
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('requestId', params.id as string);
                    formData.append('uploadedBy', currentUser.id);

                    const response = await fetch('/api/upload-simple', {
                        method: 'POST',
                        body: formData,
                    });

                    const result = await response.json();

                    if (result.success) {
                        console.log("✅ Attachment uploaded successfully:", result.fileName);

                        // Log activity
                        await logActivity('service_request', params.id as string, 'updated', `Attachment uploaded: ${result.fileName}`, currentUser.id, currentUser.name);
                    } else {
                        console.error("❌ Attachment upload failed:", result.error);
                        alert(`Failed to upload ${file.name}: ${result.error}`);
                    }
                } catch (error: any) {
                    console.error("Failed to upload image:", error);
                    alert(`Failed to upload ${file.name}: ${error.message}`);
                }
            } else {
                alert(`${file.name} is not a valid image file. Please upload only images.`);
            }
        }

        await loadRequest();
        alert("Upload complete.");
        setShowImageUpload(false);
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return '#f59e0b';
            case 'pending': return '#6b7280';
            case 'in_progress': return '#3b82f6';
            case 'resolved': return '#10b981';
            case 'closed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle size={16} />;
            case 'pending': return <Clock size={16} />;
            case 'in_progress': return <Clock size={16} />;
            case 'resolved': return <CheckCircle size={16} />;
            case 'closed': return <X size={16} />;
            default: return <AlertTriangle size={16} />;
        }
    };

    const getReplyStatusColor = (status: string) => {
        switch (status) {
            case 'finished': return '#10b981';
            case 'investigating': return '#f59e0b';
            case 'pending': return '#6b7280';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", minHeight: "50vh" }}>
                <p>Loading service request details...</p>
            </div>
        );
    }

    if (!request) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", minHeight: "50vh" }}>
                <p>Service request not found.</p>
                <button className="btn btn-primary" onClick={() => router.push("/service-requests")} style={{ marginTop: "1rem" }}>
                    Back to Service Requests
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: "2rem" }}>
            {/* Header Section */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "2rem",
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "12px",
                border: "1px solid var(--border)"
            }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center", flex: 1 }}>
                    <button className="btn btn-outline" onClick={() => router.back()}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                            <Ticket size={24} style={{ color: "var(--primary)" }} />
                            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold" }}>
                                {request.ticketNumber}
                            </h1>
                        </div>
                        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: "500" }}>{request.subject}</p>
                        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                            <span className="badge" style={{
                                background: getStatusColor(request.status) + "15",
                                color: getStatusColor(request.status),
                                padding: "0.25rem 0.5rem",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem"
                            }}>
                                {getStatusIcon(request.status)}
                                {request.status.replace('_', ' ')}
                            </span>
                            <span className="badge badge-high" style={{
                                background: "#f59e0b15",
                                color: "#f59e0b",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "6px"
                            }}>
                                {request.priority}
                            </span>
                            <span className="badge" style={{
                                background: "#3b82f615",
                                color: "#3b82f6",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "6px"
                            }}>
                                {request.category}
                            </span>
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <select
                        style={{
                            width: "150px",
                            padding: "0.5rem",
                            border: "1px solid var(--border)",
                            borderRadius: "6px",
                            backgroundColor: "var(--background)"
                        }}
                        onChange={async (e) => {
                            const newStatus = e.target.value;
                            await updateServiceRequestStatus(params.id as string, newStatus);

                            // Log activity
                            await logActivity('service_request', params.id as string, 'status_changed', `Status changed from ${request.status} to ${newStatus}`, currentUser.id, currentUser.name);

                            await loadRequest();
                        }}
                        defaultValue={request.status}
                    >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                {/* Left Column - Client Details */}
                <div>
                    <div style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        marginBottom: "1.5rem"
                    }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Client Information</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Name</div>
                                <div style={{ fontWeight: "500" }}>{request.clientName}</div>
                            </div>
                            {request.clientEmail && (
                                <div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Email</div>
                                    <div style={{ fontWeight: "500" }}>{request.clientEmail}</div>
                                </div>
                            )}
                            {request.clientPhone && (
                                <div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Phone</div>
                                    <div style={{ fontWeight: "500" }}>{request.clientPhone}</div>
                                </div>
                            )}
                        </div>

                        {request.clientPhone && (
                            <div style={{ borderTop: "1px solid var(--border)", marginTop: "1.5rem", paddingTop: "1rem" }}>
                                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", marginBottom: "0.5rem", textTransform: "uppercase", fontWeight: "600" }}>Quick Actions</div>
                                <CommunicationButtons
                                    phone={request.clientPhone}
                                    name={request.clientName}
                                    ticketNumber={request.ticketNumber}
                                    subject={request.subject}
                                />
                            </div>
                        )}
                    </div>

                    <div style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border)"
                    }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Request Details</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div>
                                <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Subject</div>
                                <div style={{ fontWeight: "500" }}>{request.subject}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Description</div>
                                <div style={{ fontSize: "0.875rem", lineHeight: "1.5" }}>{request.description}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Submitted</div>
                                <div style={{ fontSize: "0.875rem" }}>
                                    {new Date(request.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Raised By</div>
                                <div style={{ fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <User size={14} />
                                    {request.submittedByName || 'Unknown'}
                                </div>
                            </div>
                            {request.emailSent && (
                                <div>
                                    <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Email Status</div>
                                    <div style={{ fontSize: "0.875rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Mail size={14} />
                                        Email sent to customer
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Attachments & Replies */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Attachments */}
                    <div style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Paperclip size={18} />
                                Attachments ({request.attachments?.length || 0})
                            </h3>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowImageUpload(true)}
                            >
                                <Upload size={16} /> Attach Images
                            </button>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.5rem" }}>
                            {request.attachments && request.attachments.length > 0 ? (
                                request.attachments.map((attachment: any) => (
                                    <div key={attachment.id} style={{
                                        position: "relative",
                                        borderRadius: "12px",
                                        border: "1px solid var(--border)",
                                        overflow: "hidden",
                                        backgroundColor: "var(--accent)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                                    }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = "translateY(-4px)";
                                            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                                        }}
                                        onClick={() => {
                                            // Use the stored API path directly
                                            const fileUrl = attachment.filePath;
                                            window.open(fileUrl, '_blank');
                                        }}>

                                        {/* Image Thumbnail Container */}
                                        {attachment.fileType.startsWith('image/') ? (
                                            <div style={{
                                                width: "100%",
                                                height: "140px",
                                                position: "relative",
                                                overflow: "hidden",
                                                background: "#f8fafc"
                                            }}>
                                                <img
                                                    src={attachment.filePath}
                                                    alt={attachment.fileName}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                        transition: "transform 0.3s ease"
                                                    }}
                                                    onError={(e) => {
                                                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='14'%3E📷%3C/text%3E%3C/svg%3E";
                                                    }}
                                                />

                                                {/* Image Type Badge */}
                                                <div style={{
                                                    position: "absolute",
                                                    top: "8px",
                                                    left: "8px",
                                                    background: "rgba(0, 0, 0, 0.7)",
                                                    color: "white",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.7rem",
                                                    fontWeight: "500",
                                                    backdropFilter: "blur(4px)"
                                                }}>
                                                    IMAGE
                                                </div>

                                                {/* View in Browser Button */}
                                                <div style={{
                                                    position: "absolute",
                                                    bottom: "8px",
                                                    right: "8px",
                                                    background: "rgba(0, 0, 0, 0.7)",
                                                    color: "white",
                                                    padding: "6px",
                                                    borderRadius: "6px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "0.8rem",
                                                    backdropFilter: "blur(4px)"
                                                }}>
                                                    <ZoomIn size={14} />
                                                </div>
                                            </div>
                                        ) : (
                                            // Document Thumbnail
                                            <div style={{
                                                width: "100%",
                                                height: "140px",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                background: "#f8fafc",
                                                border: "2px dashed #e2e8f0"
                                            }}>
                                                <div style={{
                                                    fontSize: "3rem",
                                                    marginBottom: "0.5rem",
                                                    opacity: 0.6
                                                }}>
                                                    📄
                                                </div>
                                                <div style={{
                                                    background: "rgba(0, 0, 0, 0.7)",
                                                    color: "white",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.7rem",
                                                    fontWeight: "500"
                                                }}>
                                                    DOCUMENT
                                                </div>
                                            </div>
                                        )}

                                        {/* File Info Section */}
                                        <div style={{
                                            padding: "1rem",
                                            background: "white"
                                        }}>
                                            <div style={{
                                                fontSize: "0.85rem",
                                                fontWeight: "600",
                                                marginBottom: "0.5rem",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                color: "var(--foreground)"
                                            }}>
                                                {attachment.fileName}
                                            </div>
                                            <div style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                fontSize: "0.75rem",
                                                color: "var(--muted-foreground)"
                                            }}>
                                                <span>{(attachment.fileSize / 1024).toFixed(1)} KB</span>
                                                <span style={{
                                                    padding: "2px 6px",
                                                    background: "var(--accent)",
                                                    borderRadius: "4px",
                                                    fontSize: "0.65rem",
                                                    fontWeight: "500"
                                                }}>
                                                    {attachment.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Click Hint Overlay */}
                                        <div style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: "rgba(59, 130, 246, 0.1)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            opacity: 0,
                                            transition: "opacity 0.3s ease"
                                        }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = "0"}
                                        >
                                            <div style={{
                                                background: "var(--primary)",
                                                color: "white",
                                                padding: "8px 16px",
                                                borderRadius: "8px",
                                                fontSize: "0.875rem",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
                                            }}>
                                                <ZoomIn size={16} />
                                                Open in Browser
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{
                                    textAlign: "center",
                                    padding: "4rem 2rem",
                                    color: "var(--muted-foreground)",
                                    gridColumn: "1 / -1",
                                    backgroundColor: "var(--accent)",
                                    borderRadius: "12px",
                                    border: "2px dashed var(--border)"
                                }}>
                                    <div style={{
                                        width: "80px",
                                        height: "80px",
                                        background: "#f3f4f6",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 1.5rem",
                                        fontSize: "2rem"
                                    }}>
                                        📷
                                    </div>
                                    <div style={{ fontSize: "1.25rem", fontWeight: "600", marginBottom: "0.75rem", color: "var(--foreground)" }}>
                                        No Attachments Yet
                                    </div>
                                    <div style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                                        Click "Attach Images" to add screenshots, photos, or documents to this service request.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Replies */}
                    <div style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border)"
                    }}>
                        <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            <MessageSquare size={18} />
                            Developer Replies ({request.replies?.length || 0})
                        </h3>

                        {/* Reply Form */}
                        <form onSubmit={handleReply} style={{ marginBottom: "2rem" }}>
                            <div style={{ marginBottom: "1rem" }}>
                                <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Add Reply</div>
                                <textarea
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px",
                                        fontSize: "0.875rem",
                                        lineHeight: "1.5",
                                        minHeight: "80px"
                                    }}
                                    placeholder="Add your reply or update..."
                                    rows={3}
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                <select
                                    style={{
                                        width: "150px",
                                        padding: "0.5rem",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px",
                                        backgroundColor: "var(--background)"
                                    }}
                                    value={replyStatus}
                                    onChange={(e) => setReplyStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="investigating">Investigating</option>
                                    <option value="finished">Finished</option>
                                </select>

                                <button type="submit" className="btn btn-primary">
                                    <Send size={16} /> Send Reply
                                </button>
                            </div>
                        </form>

                        {/* Replies List */}
                        {request.replies && request.replies.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {request.replies.map((reply: any) => (
                                    <div key={reply.id} style={{
                                        padding: "1rem",
                                        borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        background: "#f9fafb"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <div style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    borderRadius: "50%",
                                                    background: "#f3f4f6",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "0.75rem"
                                                }}>
                                                    {reply.repliedByName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{reply.repliedByName || 'Unknown'}</div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                                        {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="badge" style={{
                                                background: getReplyStatusColor(reply.status) + "15",
                                                color: getReplyStatusColor(reply.status),
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "6px"
                                            }}>
                                                {reply.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>{reply.message}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center",
                                padding: "2rem",
                                color: "var(--muted-foreground)",
                                backgroundColor: "var(--accent)",
                                borderRadius: "8px",
                                border: "1px solid var(--border)"
                            }}>
                                No replies yet. Add your first reply above.
                            </div>
                        )}
                    </div>

                    {/* System Audit Trail */}
                    <div style={{
                        backgroundColor: "white",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border)"
                    }}>
                        <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            <History size={18} />
                            System Audit Trail
                        </h3>
                        <ActivityLogList entityType="service_request" entityId={params.id as string} />
                    </div>
                </div>
            </div>

            {/* Image Upload Modal */}
            {showImageUpload && (
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
                    <div style={{
                        backgroundColor: "white",
                        padding: "2rem",
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        width: '90%',
                        maxWidth: '400px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: "1.2rem" }}>Upload Images</h3>
                            <button className="btn btn-outline" onClick={() => setShowImageUpload(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ textAlign: "center", padding: "2rem 0" }}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                                id="image-upload"
                            />
                            <label htmlFor="image-upload" className="btn btn-primary" style={{
                                cursor: "pointer",
                                display: "inline-block",
                                padding: "0.75rem 1.5rem"
                            }}>
                                <Upload size={16} /> Choose Images
                            </label>
                            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginTop: "1rem" }}>
                                Upload screenshots or images related to this service request
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
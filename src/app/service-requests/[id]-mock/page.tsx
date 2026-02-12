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
    Image,
    XCircle
} from "lucide-react";

// Mock service request data - in production this would come from API
const mockRequest = {
    id: "1",
    ticketNumber: "SR20240101001",
    clientName: "John Doe",
    clientEmail: "john@example.com",
    clientPhone: "+1234567890",
    subject: "Sample Service Request",
    description: "This is a sample service request for testing the file upload system.",
    priority: "high",
    category: "technical",
    status: "open",
    submittedBy: "user1",
    submittedByName: "Support Staff",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    emailSent: true,
    attachments: [
        {
            id: "att1",
            fileName: "screenshot.png",
            fileType: "image/png",
            fileSize: 245760,
            filePath: "/api/uploads/17041234567-screenshot.png",
            uploadedBy: "user1",
            createdAt: new Date().toISOString()
        }
    ],
    replies: []
};

export default function ServiceRequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [replyMessage, setReplyMessage] = useState("");
    const [replyStatus, setReplyStatus] = useState("pending");
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [currentUser] = useState({
        id: "1",
        name: "Support Staff"
    });

    useEffect(() => {
        // Simulate loading the request data
        setTimeout(() => {
            setRequest(mockRequest);
            setLoading(false);
        }, 1000);
    }, []);

    async function handleReply(e: React.FormEvent) {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            // Mock reply function
            console.log("Reply submitted:", { message: replyMessage, status: replyStatus });
            setReplyMessage("");
            setReplyStatus("pending");
            alert("Reply submitted successfully!");
        } catch (error) {
            console.error("Failed to add reply:", error);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    // Upload to simplified API
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
                        alert(`✅ ${file.name} uploaded successfully!`);

                        // Reload request to show new attachment
                        setTimeout(() => {
                            setRequest((prev: any) => ({
                                ...prev,
                                attachments: [...(prev?.attachments || []), result]
                            }));
                        }, 1000);
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
            case 'open': return <AlertTriangle size={16} style={{ color: "#f59e0b" }} />;
            case 'pending': return <Clock size={16} style={{ color: "#6b7280" }} />;
            case 'in_progress': return <Clock size={16} style={{ color: "#3b82f6" }} />;
            case 'resolved': return <CheckCircle size={16} style={{ color: "#10b981" }} />;
            case 'closed': return <XCircle size={16} style={{ color: "#ef4444" }} />;
            default: return <AlertTriangle size={16} />;
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        border: "4px solid var(--border)",
                        borderTop: "4px solid var(--primary)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}></div>
                    <p style={{ marginTop: "1rem", color: "var(--muted-foreground)" }}>Loading service request...</p>
                </div>
            </div>
        );
    }

    if (!request) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "var(--muted-foreground)" }}>Service request not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "0 1rem" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem"
            }}>
                <div style={{ textAlign: "center", alignItems: "flex-start" }}>
                    <h1 className="h1">Service Request</h1>
                    <p className="text-muted">Ticket: {request.ticketNumber}</p>
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
                <div>
                    <button
                        onClick={() => router.back()}
                        className="btn btn-outline"
                        style={{ alignSelf: "flex-end" }}
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                </div>
            </div>

            {/* Status */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <select
                    style={{
                        width: "200px",
                        padding: "0.5rem",
                        border: "1px solid var(--border)",
                        borderRadius: "6px",
                        backgroundColor: "var(--background)"
                    }}
                    onChange={async (e) => {
                        // Mock status update
                        console.log("Status updated to:", e.target.value);
                        setRequest((prev: any) => ({ ...prev, status: e.target.value }));
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
                                <div style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "0.5rem" }}>Status</div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    {getStatusIcon(request.status)}
                                    <span style={{ marginLeft: "0.5rem" }}>
                                        {request.status?.replace('_', ' ')}
                                    </span>
                                </div>
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
                                        transition: "all 0.3s ease"
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
                                            // Open the attachment in browser
                                            window.open(attachment.filePath, '_blank');
                                        }}>

                                        {/* Image Preview or File Icon */}
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
                                                }}>📄</div>
                                                <div style={{
                                                    background: "rgba(0, 0, 0, 0.7)",
                                                    color: "white",
                                                    padding: "4px 8px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.7rem",
                                                    fontWeight: "500"
                                                }}>DOCUMENT</div>
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
                                                marginBottom: "0.25rem",
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
                                                }}>{attachment.fileType.split('/')[1]?.toUpperCase() || 'FILE'}</span>
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
                                        fontSize: "2rem",
                                        opacity: 0.6
                                    }}>📷</div>
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
                            zIndex: 1000,
                            padding: '1rem'
                        }}>
                            <div style={{
                                backgroundColor: "white",
                                padding: "2rem",
                                borderRadius: "12px",
                                border: "1px solid var(--border)",
                                width: '90%',
                                maxWidth: '600px'
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
            </div>
        </div >
    );
}
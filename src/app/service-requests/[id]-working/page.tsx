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

// Mock service request data
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
    ]
};

export default function ServiceRequestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [currentUser] = useState({
        id: "1",
        name: "Support Staff"
    });

    useEffect(() => {
        setTimeout(() => {
            setRequest(mockRequest);
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "#f59e0b";
            case "pending": return "#6b7280";
            case "in_progress": return "#3b82f6";
            case "resolved": return "#10b981";
            case "closed": return "#ef4444";
            default: return "#6b7280";
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
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h1 className="h1">Service Request</h1>
                <p className="text-muted">Ticket: {request.ticketNumber}</p>
                <div>
                    <button onClick={() => router.back()} className="btn btn-outline" style={{ alignSelf: "flex-end" }}>
                        <ArrowLeft size={20} />
                        Back
                    </button>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Client Information</h3>
                    <div>
                        <div>Name: {request.clientName}</div>
                        <div>Email: {request.clientEmail}</div>
                        <div>Phone: {request.clientPhone}</div>
                    </div>
                </div>

                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Request Details</h3>
                    <div>
                        <div>Subject: {request.subject}</div>
                        <div>Description: {request.description}</div>
                        <div>Status: {request.status}</div>
                        <div>Submitted: {new Date(request.createdAt).toLocaleDateString()}</div>
                        <div>Raised By: {request.submittedByName}</div>
                    </div>
                </div>

                <div style={{ backgroundColor: "white", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border)" }}>
                    <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>Attachments ({request.attachments?.length || 0})</h3>
                    <button className="btn btn-primary" onClick={() => setShowImageUpload(true)}>
                        <Upload size={16} /> Attach Images
                    </button>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1.5rem" }}>
                        {request.attachments?.length ? (
                            request.attachments.map((attachment: any) => (
                                <div key={attachment.id} style={{
                                    borderRadius: "12px",
                                    border: "1px solid var(--border)",
                                    overflow: "hidden",
                                    backgroundColor: "var(--accent)",
                                    cursor: "pointer"
                                }}
                                    onClick={() => window.open(attachment.filePath, "_blank")}>
                                    <div style={{ width: "100%", height: "140px", position: "relative", overflow: "hidden", background: "#f8fafc" }}>
                                        <img src={attachment.filePath} alt={attachment.fileName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    </div>
                                    <div style={{ padding: "1rem", background: "white" }}>
                                        <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{attachment.fileName}</div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                            <span>{(attachment.fileSize / 1024).toFixed(1)} KB</span>
                                            <span style={{ padding: "2px 6px", background: "var(--accent)", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "500" }}>{attachment.fileType.split("/")[1]?.toUpperCase() || "FILE"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--muted-foreground)", backgroundColor: "var(--accent)", borderRadius: "12px", border: "2px dashed var(--border)" }}>
                                <div>📷 No attachments yet</div>
                                <div>Click "Attach Images" to add files</div>
                            </div>
                        )}
                    </div>
                </div>

                {showImageUpload && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem"
                    }}>
                        <div style={{ backgroundColor: "white", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border)", width: "90%", maxWidth: "600px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                                <h3>Upload Images</h3>
                                <button className="btn btn-outline" onClick={() => setShowImageUpload(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ textAlign: "center", padding: "2rem 0" }}>
                                <input type="file" accept="image/*" multiple onChange={(e) => {
                                    const files = e.target.files;
                                    if (files) {
                                        alert(`${files.length} file(s) selected for upload`);
                                    }
                                }} style={{ display: "none" }} id="image-upload" />
                                <label htmlFor="image-upload" className="btn btn-primary" style={{ cursor: "pointer", display: "inline-block", padding: "0.75rem 1.5rem" }}>
                                    <Upload size={16} /> Choose Images
                                </label>
                                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginTop: "1rem" }}>
                                    Upload screenshots or images
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
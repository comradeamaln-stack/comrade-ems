"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    X
} from "lucide-react";
import { getEnquiryById, updateEnquiry } from "@/lib/actions";

export default function EditEnquiryPage() {
    const params = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadEnquiry();
    }, [params.id]);

    async function loadEnquiry() {
        if (params.id) {
            const data = await getEnquiryById(params.id as string);
            if (data) {
                setFormData({
                    clientName: data.clientName,
                    clientEmail: data.clientEmail,
                    clientPhone: data.clientPhone,
                    source: data.source,
                    priority: data.priority,
                    status: data.status,
                    description: data.description
                });
            }
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData) return;

        setSaving(true);
        try {
            await updateEnquiry(params.id as string, formData);
            router.push(`/enquiries/${params.id}`);
        } catch (error) {
            console.error("Failed to update enquiry:", error);
            alert("Failed to update enquiry. Please try again.");
        }
        setSaving(false);
    }

    if (loading) {
        return (
            <div className="animate-in" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Loading enquiry details...</p>
            </div>
        );
    }

    if (!formData) {
        return (
            <div className="animate-in" style={{ padding: "2rem", textAlign: "center" }}>
                <p>Enquiry not found.</p>
            </div>
        );
    }

    return (
        <div className="animate-in">
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <button 
                        className="btn btn-outline" 
                        style={{ padding: "0.5rem" }} 
                        onClick={() => router.back()}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="h1" style={{ margin: 0 }}>Edit Enquiry</h1>
                        <p className="text-muted">Update enquiry details and information</p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button 
                        className="btn btn-outline" 
                        onClick={() => router.back()}
                    >
                        <X size={18} /> Cancel
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSubmit}
                        disabled={saving}
                    >
                        <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </header>

            <form onSubmit={handleSubmit} style={{ maxWidth: "600px" }}>
                <div className="card">
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div className="form-group">
                            <label className="label">Client Name *</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.clientName}
                                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Email Address</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.clientEmail || ''}
                                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Phone Number *</label>
                            <input
                                type="tel"
                                className="input"
                                value={formData.clientPhone}
                                onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Source</label>
                            <select
                                className="input"
                                value={formData.source}
                                onChange={(e) => setFormData({...formData, source: e.target.value})}
                            >
                                <option value="Website">Website</option>
                                <option value="Referral">Referral</option>
                                <option value="Google Ads">Google Ads</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Cold Call">Cold Call</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div className="form-group">
                                <label className="label">Status</label>
                                <select
                                    className="input"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="proposal">Proposal</option>
                                    <option value="negotiation">Negotiation</option>
                                    <option value="closed_won">Closed Won</option>
                                    <option value="closed_lost">Closed Lost</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="label">Priority</label>
                                <select
                                    className="input"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Description</label>
                            <textarea
                                className="input"
                                rows={4}
                                value={formData.description || ''}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder="Additional details about the enquiry..."
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Globe,
    AlertCircle,
    Briefcase
} from "lucide-react";
import { createEnquiry } from "@/lib/actions";

export default function NewEnquiryPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        companyName: "",
        source: "Website",
        priority: "medium",
        description: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await createEnquiry(formData);
            if (result.success) {
                router.push("/enquiries");
                router.refresh();
            }
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="animate-in">
            <header style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "2rem" }}>
                <button className="btn btn-outline" style={{ padding: "0.5rem" }} onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="h1" style={{ margin: 0 }}>Create New Enquiry</h1>
                    <p className="text-muted">Fill in the details to register a new lead in the system.</p>
                </div>
            </header>

            <div className="grid grid-cols-3">
                <div style={{ gridColumn: "span 2" }}>
                    <form className="card" style={{ display: "flex", flexDirection: "column", gap: "2rem" }} onSubmit={handleSubmit}>
                        <section>
                            <h3 className="h3" style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>
                                Client Information
                            </h3>
                            <div className="grid grid-cols-2">
                                <div className="input-group">
                                    <label className="label">Full Name</label>
                                    <div style={{ position: "relative" }}>
                                        <User size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                        <input name="clientName" type="text" className="input" style={{ paddingLeft: "2.5rem" }} placeholder="e.g. John Doe" required onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="label">Company Name</label>
                                    <div style={{ position: "relative" }}>
                                        <Briefcase size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                        <input name="companyName" type="text" className="input" style={{ paddingLeft: "2.5rem" }} placeholder="e.g. Acme Corp" onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="label">Email Address</label>
                                    <div style={{ position: "relative" }}>
                                        <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                        <input name="clientEmail" type="email" className="input" style={{ paddingLeft: "2.5rem" }} placeholder="john@example.com" onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="label">Phone Number</label>
                                    <div style={{ position: "relative" }}>
                                        <Phone size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                        <input name="clientPhone" type="tel" className="input" style={{ paddingLeft: "2.5rem" }} placeholder="+1 234 567 890" required onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="h3" style={{ fontSize: "1.25rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>
                                Enquiry Details
                            </h3>
                            <div className="grid grid-cols-2">
                                <div className="input-group">
                                    <label className="label">Source</label>
                                    <div style={{ position: "relative" }}>
                                        <Globe size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                        <select name="source" className="input" style={{ paddingLeft: "2.5rem" }} onChange={handleChange}>
                                            <option value="Website">Website</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Google Ads">Google Ads</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="label">Priority</label>
                                    <div style={{ position: "relative" }}>
                                        <AlertCircle size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                        <select name="priority" className="input" style={{ paddingLeft: "2.5rem" }} onChange={handleChange}>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="input-group">
                                <label className="label">Requirements / Notes</label>
                                <textarea name="description" className="input" rows={4} placeholder="Describe the client's needs..." style={{ resize: "vertical" }} onChange={handleChange} />
                            </div>
                        </section>

                        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                            <button type="button" className="btn btn-secondary" onClick={() => router.back()} disabled={isPending}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={isPending}>
                                <Save size={20} />
                                {isPending ? "Saving..." : "Create Enquiry"}
                            </button>
                        </div>
                    </form>
                </div>

                <div style={{ marginLeft: "2rem" }}>
                    <div className="card glass" style={{ border: "1px dashed var(--primary)" }}>
                        <h4 style={{ marginBottom: "1rem", color: "var(--primary)" }}>Quick Tips</h4>
                        <ul style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <li>Complete the Full Name and Phone Number fields.</li>
                            <li>New enquiries appear instantly in the main list.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

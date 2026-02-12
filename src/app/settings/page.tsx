"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Bell, Lock, Mail } from "lucide-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        whatsappNotifications: true,
        autoAssignment: false,
        darkMode: false,
    });

    const handleToggle = (key: string) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    };

    return (
        <div className="animate-in">
            <header style={{ marginBottom: "2rem" }}>
                <h1 className="h1" style={{ marginBottom: "0.5rem" }}>Settings</h1>
                <p className="text-muted">Manage your application preferences and configurations.</p>
            </header>

            <div className="grid grid-cols-2" style={{ gap: "2rem" }}>
                {/* Notifications Settings */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <div style={{ background: "var(--primary)", color: "white", padding: "0.5rem", borderRadius: "0.5rem" }}>
                            <Bell size={20} />
                        </div>
                        <h2 className="h3" style={{ margin: 0 }}>Notifications</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--accent)", borderRadius: "var(--radius)" }}>
                            <div>
                                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>Email Notifications</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Receive email updates for enquiries</div>
                            </div>
                            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                                <input
                                    type="checkbox"
                                    checked={settings.emailNotifications}
                                    onChange={() => handleToggle('emailNotifications')}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: "absolute",
                                    cursor: "pointer",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: settings.emailNotifications ? "var(--primary)" : "#ccc",
                                    transition: "0.3s",
                                    borderRadius: "24px"
                                }}>
                                    <span style={{
                                        position: "absolute",
                                        content: "",
                                        height: "18px",
                                        width: "18px",
                                        left: settings.emailNotifications ? "28px" : "3px",
                                        bottom: "3px",
                                        background: "white",
                                        transition: "0.3s",
                                        borderRadius: "50%"
                                    }} />
                                </span>
                            </label>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--accent)", borderRadius: "var(--radius)" }}>
                            <div>
                                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>WhatsApp Notifications</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Send WhatsApp updates to clients</div>
                            </div>
                            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                                <input
                                    type="checkbox"
                                    checked={settings.whatsappNotifications}
                                    onChange={() => handleToggle('whatsappNotifications')}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: "absolute",
                                    cursor: "pointer",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: settings.whatsappNotifications ? "var(--primary)" : "#ccc",
                                    transition: "0.3s",
                                    borderRadius: "24px"
                                }}>
                                    <span style={{
                                        position: "absolute",
                                        content: "",
                                        height: "18px",
                                        width: "18px",
                                        left: settings.whatsappNotifications ? "28px" : "3px",
                                        bottom: "3px",
                                        background: "white",
                                        transition: "0.3s",
                                        borderRadius: "50%"
                                    }} />
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* System Settings */}
                <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <div style={{ background: "#10b981", color: "white", padding: "0.5rem", borderRadius: "0.5rem" }}>
                            <SettingsIcon size={20} />
                        </div>
                        <h2 className="h3" style={{ margin: 0 }}>System</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--accent)", borderRadius: "var(--radius)" }}>
                            <div>
                                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>Auto Assignment</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Automatically assign enquiries to staff</div>
                            </div>
                            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                                <input
                                    type="checkbox"
                                    checked={settings.autoAssignment}
                                    onChange={() => handleToggle('autoAssignment')}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: "absolute",
                                    cursor: "pointer",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: settings.autoAssignment ? "var(--primary)" : "#ccc",
                                    transition: "0.3s",
                                    borderRadius: "24px"
                                }}>
                                    <span style={{
                                        position: "absolute",
                                        content: "",
                                        height: "18px",
                                        width: "18px",
                                        left: settings.autoAssignment ? "28px" : "3px",
                                        bottom: "3px",
                                        background: "white",
                                        transition: "0.3s",
                                        borderRadius: "50%"
                                    }} />
                                </span>
                            </label>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "var(--accent)", borderRadius: "var(--radius)" }}>
                            <div>
                                <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>Dark Mode</div>
                                <div style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>Switch to dark theme (Coming Soon)</div>
                            </div>
                            <label style={{ position: "relative", display: "inline-block", width: "50px", height: "24px" }}>
                                <input
                                    type="checkbox"
                                    checked={settings.darkMode}
                                    onChange={() => handleToggle('darkMode')}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                    disabled
                                />
                                <span style={{
                                    position: "absolute",
                                    cursor: "not-allowed",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: "#ccc",
                                    transition: "0.3s",
                                    borderRadius: "24px",
                                    opacity: 0.5
                                }}>
                                    <span style={{
                                        position: "absolute",
                                        content: "",
                                        height: "18px",
                                        width: "18px",
                                        left: "3px",
                                        bottom: "3px",
                                        background: "white",
                                        transition: "0.3s",
                                        borderRadius: "50%"
                                    }} />
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Email Configuration */}
                <div className="card" style={{ gridColumn: "1 / -1" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <div style={{ background: "#f59e0b", color: "white", padding: "0.5rem", borderRadius: "0.5rem" }}>
                            <Mail size={20} />
                        </div>
                        <h2 className="h3" style={{ margin: 0 }}>Email Configuration</h2>
                    </div>

                    <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", padding: "1rem", borderRadius: "var(--radius)", marginBottom: "1.5rem" }}>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#92400e" }}>
                            <strong>Note:</strong> To enable email notifications, configure your SMTP settings in the <code>.env.local</code> file:
                        </p>
                    </div>

                    <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "var(--radius)", fontFamily: "monospace", fontSize: "0.875rem", color: "#e2e8f0" }}>
                        <div>EMAIL_HOST=smtp.gmail.com</div>
                        <div>EMAIL_PORT=587</div>
                        <div>EMAIL_USER=comradeadmin@gmail.com</div>
                        <div>EMAIL_PASSWORD=your_app_password</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

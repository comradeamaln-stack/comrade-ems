"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    BarChart3,
    Inbox,
    Calendar,
    Users,
    Settings,
    LogOut,
    PlusCircle,
    TrendingUp,
    Handshake,
    Ticket
} from "lucide-react";
import { logout } from "@/lib/auth-actions";

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();
    const router = useRouter();

    const links = [
        { href: "/", label: "Dashboard", icon: BarChart3 },
        { href: "/enquiries", label: "Enquiries", icon: Inbox },
        { href: "/appointments", label: "Appointments", icon: Calendar },
        { href: "/service-requests", label: "Service Requests", icon: Ticket },
        { href: "/collections", label: "Collection Entry", icon: Handshake },
        { href: "/performance", label: "Staff Performance", icon: TrendingUp },
    ];

    if (user?.role === "admin") {
        links.push({ href: "/team", label: "Sales Team", icon: Users });
    }

    const handleLogout = async () => {
        await logout();
        router.refresh();
        router.push("/login");
    };

    return (
        <aside className="sidebar">
            <div className="logo" style={{ marginBottom: "1rem" }}>
                <Handshake size={32} />
                <span>Comrade CRM</span>
            </div>

            {/* User Profile Summary */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem",
                background: "var(--accent)",
                borderRadius: "var(--radius)",
                marginBottom: "2rem"
            }}>
                <div style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "0.8rem"
                }}>
                    {user?.name?.split(' ').map((n: any) => n[0]).join('')}
                </div>
                <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: "600", fontSize: "0.875rem", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{user?.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", textTransform: "capitalize" }}>{user?.role}</div>
                </div>
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Link href="/enquiries/new" style={{ width: "100%" }}>
                    <button className="btn btn-primary" style={{ width: "100%" }}>
                        <PlusCircle size={20} />
                        <span>New Enquiry</span>
                    </button>
                </Link>

                <div style={{ height: "1px", background: "var(--border)", margin: "0.5rem 0" }} />

                <Link href="/settings" className="nav-link">
                    <Settings size={20} />
                    Settings
                </Link>
                <button className="nav-link" style={{ border: "none", background: "none", width: "100%", textAlign: "left", cursor: "pointer" }} onClick={handleLogout}>
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

"use client";

import { motion } from "framer-motion";

interface FunnelStep {
    label: string;
    count: number;
    color: string;
}

interface SalesFunnelProps {
    data: FunnelStep[];
}

export default function SalesFunnel({ data }: SalesFunnelProps) {
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="card shadow-lg" style={{ backgroundColor: "white" }}>
            <h3 className="h3" style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ color: "var(--primary)" }}>✦</span> Sales Pipeline Funnel
            </h3>

            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "0 1rem"
            }}>
                {data.map((step, i) => {
                    const width = (step.count / maxCount) * 100;
                    // Calculate skew/inset for funnel shape
                    const inset = i * 1.5;

                    return (
                        <div key={step.label} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1.5rem",
                            position: "relative"
                        }}>
                            <div style={{
                                width: "130px",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                color: "var(--muted-foreground)",
                                textAlign: "right"
                            }}>
                                {step.label}
                            </div>

                            <div style={{
                                flex: 1,
                                height: "3.2rem",
                                background: "var(--secondary)",
                                borderRadius: "8px",
                                overflow: "hidden",
                                position: "relative",
                                marginLeft: `${inset}%`,
                                marginRight: `${inset}%`,
                                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
                                transition: "all 0.3s ease"
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${width}%` }}
                                    transition={{ duration: 1.2, delay: i * 0.15, ease: "circOut" }}
                                    style={{
                                        height: "100%",
                                        background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "0 1.25rem",
                                        color: "white",
                                        position: "relative",
                                        boxShadow: "0 4px 15px -5px " + step.color + "66"
                                    }}
                                >
                                    <div style={{
                                        fontSize: "0.9rem",
                                        fontWeight: "800",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.2)"
                                    }}>
                                        {step.count}
                                    </div>

                                    {/* Small arrow marker for funnel flow */}
                                    {i < data.length - 1 && (
                                        <div style={{
                                            position: "absolute",
                                            bottom: "-10px",
                                            left: "50%",
                                            transform: "translateX(-50%)",
                                            zIndex: 10,
                                            color: "var(--muted-foreground)",
                                            fontSize: "0.75rem",
                                            opacity: 0.5
                                        }}>
                                            ▼
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{
                marginTop: "2.5rem",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "1.5rem"
            }}>
                <div style={{
                    padding: "1.25rem",
                    background: "rgba(99, 102, 241, 0.03)",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: "1px solid rgba(99, 102, 241, 0.1)"
                }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", marginBottom: "0.5rem" }}>
                        Conversion Rate
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--primary)" }}>
                        {data.length > 0 ? ((data[data.length - 1].count / data[0].count) * 100 || 0).toFixed(1) : 0}%
                    </div>
                </div>

                <div style={{
                    padding: "1.25rem",
                    background: "rgba(16, 185, 129, 0.03)",
                    borderRadius: "12px",
                    textAlign: "center",
                    border: "1px solid rgba(16, 185, 129, 0.1)"
                }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", marginBottom: "0.5rem" }}>
                        Total Volume
                    </div>
                    <div style={{ fontSize: "2rem", fontWeight: "800", color: "#10b981" }}>
                        {data[0]?.count || 0}
                    </div>
                </div>
            </div>
        </div>
    );
}

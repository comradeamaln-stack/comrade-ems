"use client";

import { MessageSquare, Phone, Send } from "lucide-react";

interface CommunicationButtonsProps {
    phone: string;
    name: string;
    subject?: string;
    ticketNumber?: string;
}

export default function CommunicationButtons({ phone, name, subject, ticketNumber }: CommunicationButtonsProps) {
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const handleWhatsApp = () => {
        const message = encodeURIComponent(`Hello ${name}, this is regarding your ${ticketNumber ? `ticket ${ticketNumber}` : 'enquiry'}${subject ? `: ${subject}` : ''}.`);
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    const handleSMS = () => {
        const body = encodeURIComponent(`Hello ${name}, following up on your ${ticketNumber || 'enquiry'}.`);
        window.location.href = `sms:${cleanPhone}${window.navigator.userAgent.match(/iPhone/i) ? '&' : '?'}body=${body}`;
    };

    const handleCall = () => {
        window.location.href = `tel:${cleanPhone}`;
    };

    return (
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button
                onClick={handleWhatsApp}
                className="btn btn-outline"
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    borderColor: "#25D366",
                    color: "#25D366",
                    background: "rgba(37, 211, 102, 0.05)"
                }}
            >
                <MessageSquare size={18} />
                WhatsApp
            </button>
            <button
                onClick={handleSMS}
                className="btn btn-outline"
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    borderColor: "#3b82f6",
                    color: "#3b82f6",
                    background: "rgba(59, 130, 246, 0.05)"
                }}
            >
                <Send size={18} />
                SMS
            </button>
            <button
                onClick={handleCall}
                className="btn btn-outline"
                style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem"
                }}
            >
                <Phone size={18} />
                Call
            </button>
        </div>
    );
}

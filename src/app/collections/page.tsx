"use client";

import { useState } from "react";
import { Handshake, Plus, Search, Filter, Edit, Trash2, CheckCircle, XCircle, AlertCircle, User, Phone, MapPin, Calendar, DollarSign, TrendingUp, Users, PieChart, BarChart3, Award, UserPlus, Percent, Bell, Clock, AlertTriangle, RefreshCw } from "lucide-react";

interface Collection {
    id: string;
    customerName: string;
    amount: number;
    collectedAmount: number;
    dueDate: string;
    status: 'pending' | 'partial' | 'completed' | 'overdue';
    salesmenAllocations: {
        salesmanName: string;
        percentage: number;
        allocatedAmount: number;
    }[];
    phoneNumber: string;
    address: string;
    notes: string;
    createdAt: string;
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([
        {
            id: "1",
            customerName: "ABC Construction Ltd",
            amount: 15000,
            collectedAmount: 15000,
            dueDate: "2024-02-15",
            status: "completed",
            salesmenAllocations: [
                { salesmanName: "Alice Johnson", percentage: 80, allocatedAmount: 12000 },
                { salesmanName: "Bob Kimani", percentage: 15, allocatedAmount: 2250 },
                { salesmanName: "Charles Ochieng", percentage: 5, allocatedAmount: 750 }
            ],
            phoneNumber: "+254712345678",
            address: "123 Industrial Area, Nairobi",
            notes: "Team collection - major client payment",
            createdAt: "2024-02-01"
        },
        {
            id: "2",
            customerName: "Tech Solutions Kenya",
            amount: 8000,
            collectedAmount: 8000,
            dueDate: "2024-02-10",
            status: "completed",
            salesmenAllocations: [
                { salesmanName: "Alice Johnson", percentage: 60, allocatedAmount: 4800 },
                { salesmanName: "Diana Mboga", percentage: 40, allocatedAmount: 3200 }
            ],
            phoneNumber: "+254723456789",
            address: "456 Business Park, Kiambu",
            notes: "Alice and Diana collaboration",
            createdAt: "2024-01-28"
        },
        {
            id: "3",
            customerName: "Global Trading Co",
            amount: 5000,
            collectedAmount: 5000,
            dueDate: "2024-02-05",
            status: "completed",
            salesmenAllocations: [
                { salesmanName: "Bob Kimani", percentage: 100, allocatedAmount: 5000 }
            ],
            phoneNumber: "+254734567890",
            address: "789 Commerce Street, Mombasa",
            notes: "Solo collection by Bob",
            createdAt: "2024-01-25"
        }
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [formData, setFormData] = useState({
        customerName: "",
        amount: "",
        collectedAmount: "",
        dueDate: "",
        phoneNumber: "",
        address: "",
        notes: "",
        salesmenAllocations: [
            { salesmanName: "", percentage: 0, allocatedAmount: 0 }
        ]
    });

    // Calculate staff performance
    const getStaffPerformance = () => {
        const staffMap = new Map();

        collections.forEach(collection => {
            if (collection.status === 'completed') {
                collection.salesmenAllocations.forEach(allocation => {
                    const current = staffMap.get(allocation.salesmanName) || {
                        name: allocation.salesmanName,
                        totalCollected: 0,
                        collectionsCount: 0
                    };

                    current.totalCollected += allocation.allocatedAmount;
                    current.collectionsCount += 1;

                    staffMap.set(allocation.salesmanName, current);
                });
            }
        });

        const staffData = Array.from(staffMap.values());
        const totalCollected = staffData.reduce((sum, staff) => sum + staff.totalCollected, 0);

        staffData.forEach(staff => {
            staff.percentage = totalCollected > 0 ? Math.round((staff.totalCollected / totalCollected) * 100) : 0;
            staff.color = staff.name.includes('Alice') ? '#3b82f6' :
                staff.name.includes('Bob') ? '#10b981' :
                    staff.name.includes('Charles') ? '#f59e0b' :
                        staff.name.includes('Diana') ? '#8b5cf6' : '#6b7280';
        });

        return staffData.sort((a, b) => b.totalCollected - a.totalCollected);
    };

    const staffPerformance = getStaffPerformance();
    const totalAmount = collections.reduce((sum, c) => sum + c.amount, 0);
    const totalCollected = collections.reduce((sum, c) => sum + c.collectedAmount, 0);

    const addSalesman = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Prevent event bubbling

        // Only add new salesman if the current input field is not the main form
        if (e.currentTarget) {
            const newAllocations = [...formData.salesmenAllocations, { salesmanName: "", percentage: 0, allocatedAmount: 0 }];
            setFormData({ ...formData, salesmenAllocations: newAllocations });
        }
    };

    const removeSalesman = (index: number, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent form submission
        e.stopPropagation(); // Prevent event bubbling
        const newAllocations = formData.salesmenAllocations.filter((_, i) => i !== index);
        setFormData({ ...formData, salesmenAllocations: newAllocations });
        recalculatePercentages(newAllocations);
    };

    const updateSalesman = (index: number, field: string, value: string | number) => {
        const newAllocations = [...formData.salesmenAllocations];
        newAllocations[index] = { ...newAllocations[index], [field]: value };
        setFormData({ ...formData, salesmenAllocations: newAllocations });

        if (field === 'salesmanName' || field === 'percentage') {
            // Only recalculate if we have a collected amount
            if (formData.collectedAmount) {
                recalculatePercentages(newAllocations);
            }
        }
    };

    const recalculatePercentages = (allocations: any[]) => {
        const validAllocations = allocations.filter(a => a.salesmanName && a.percentage > 0);
        const collectedAmount = parseFloat(formData.collectedAmount) || 0;

        const updatedAllocations = validAllocations.map(allocation => ({
            ...allocation,
            allocatedAmount: (collectedAmount * allocation.percentage) / 100
        }));

        setFormData(prev => ({ ...prev, salesmenAllocations: updatedAllocations }));
    };

    const getTotalPercentage = () => {
        return formData.salesmenAllocations.reduce((sum, s) => sum + (s.percentage || 0), 0);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this collection record?')) {
            setCollections(collections.filter(c => c.id !== id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#d1fae5';
            case 'partial': return '#fef3c7';
            case 'pending': return '#dbeafe';
            case 'overdue': return '#fee2e2';
            default: return '#f3f4f6';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'completed': return '#065f46';
            case 'partial': return '#92400e';
            case 'pending': return '#1e3a8a';
            case 'overdue': return '#991b1b';
            default: return '#374151';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle size={16} color="#16a34a" />;
            case 'partial': return <AlertCircle size={16} color="#d97706" />;
            case 'overdue': return <XCircle size={16} color="#dc2626" />;
            default: return <AlertCircle size={16} color="#2563eb" />;
        }
    };

    const handleAddCollection = (e: React.FormEvent) => {
        e.preventDefault();

        const validAllocations = formData.salesmenAllocations.filter(a => a.salesmanName && a.percentage > 0);

        const newCollection: Collection = {
            id: Date.now().toString(),
            customerName: formData.customerName,
            amount: parseFloat(formData.amount),
            collectedAmount: parseFloat(formData.collectedAmount) || 0,
            dueDate: formData.dueDate,
            status: parseFloat(formData.collectedAmount) >= parseFloat(formData.amount) ? 'completed' :
                parseFloat(formData.collectedAmount) > 0 ? 'partial' : 'pending',
            salesmenAllocations: validAllocations,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
            notes: formData.notes,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setCollections([newCollection, ...collections]);
        setShowModal(false);
        setFormData({
            customerName: "",
            amount: "",
            collectedAmount: "",
            dueDate: "",
            phoneNumber: "",
            address: "",
            notes: "",
            salesmenAllocations: [
                { salesmanName: "", percentage: 0, allocatedAmount: 0 }
            ]
        });
    };

    const availableSalesmen = ["Alice Johnson", "Bob Kimani", "Charles Ochieng", "Diana Mboga", "Eric Kamau"];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            {/* Header */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Handshake style={{ color: '#764ba2', width: '2.5rem', height: '2.5rem' }} />
                                Collection Entry
                            </h1>
                            <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.1rem' }}>Multi-Salesman Allocation Tracking System</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                border: 'none',
                                fontSize: '1rem',
                                fontWeight: '600',
                                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
                            }}
                        >
                            <Plus size={20} />
                            Add Collection
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                {/* Staff Performance Section */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1f2937' }}>
                        <Award size={32} color="#f59e0b" />
                        Staff Performance & Commission Tracking
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Performance Cards */}
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Commission Leaders</h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {staffPerformance.map((staff, index) => (
                                    <div key={staff.name} style={{
                                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                                        padding: '1.5rem',
                                        borderRadius: '1rem',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                        border: '2px solid',
                                        borderColor: staff.color,
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{ position: 'absolute', top: 0, right: 0, backgroundColor: staff.color, color: 'white', padding: '0.25rem 0.75rem', borderBottomLeftRadius: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
                                            #{index + 1}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                            <div>
                                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '0.25rem' }}>{staff.name}</h4>
                                                <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Sales Representative</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: staff.color }}>{staff.percentage}%</div>
                                                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Share</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Commission Earned</div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#059669' }}>AED {staff.totalCollected.toLocaleString()}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Collections</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{staff.collectionsCount}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: '#374151' }}>Commission Distribution</h3>
                            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)', height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PieChart size={150} color="#764ba2" />
                                <div style={{ marginLeft: '2rem' }}>
                                    {staffPerformance.map(staff => (
                                        <div key={staff.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <div style={{ width: '16px', height: '16px', backgroundColor: staff.color, borderRadius: '50%' }} />
                                            <span style={{ fontSize: '0.9rem', color: '#374151' }}>{staff.name}: {staff.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule Alerts Section */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1f2937' }}>
                            <Bell size={32} color="#dc2626" />
                            Schedule Alerts & Reminders
                        </h2>
                        <button
                            onClick={() => setShowAlerts(!showAlerts)}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '1rem',
                                cursor: 'pointer',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.4)';
                            }}
                        >
                            {showAlerts ? 'Hide Alerts' : 'Show Alerts'}
                            <RefreshCw size={16} />
                        </button>
                    </div>

                    {showAlerts && (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {/* Alert Categories */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                {/* Overdue Collections */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                                    padding: '1.5rem',
                                    borderRadius: '1rem',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                    border: '2px solid #fecaca'
                                }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <AlertTriangle size={20} />
                                        Overdue Collections
                                    </h3>
                                    {collections.filter(c => c.status === 'overdue').length > 0 ? (
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {collections.filter(c => c.status === 'overdue').slice(0, 3).map((collection, index) => (
                                                <div key={collection.id} style={{
                                                    background: 'white',
                                                    padding: '1rem',
                                                    borderRadius: '0.75rem',
                                                    border: '1px solid #fca5a5'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#dc2626' }}>{collection.customerName}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(collection.dueDate).toLocaleDateString()}</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#dc2626' }}>AED {collection.amount.toLocaleString()}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>({Math.ceil((new Date().getTime() - new Date(collection.dueDate).getTime()) / (1000 * 60 * 60 * 24))} days overdue)</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                        {collection.salesmenAllocations.map((alloc, idx) => (
                                                            <span key={idx} style={{ marginRight: '0.5rem' }}>
                                                                {alloc.salesmanName}: {alloc.percentage}%
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                            <AlertCircle size={24} style={{ margin: '0 auto', marginBottom: '0.5rem' }} />
                                            <p style={{ fontSize: '0.9rem', margin: 0 }}>No overdue collections</p>
                                        </div>
                                    )}
                                </div>

                                {/* Upcoming Due Dates */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                                    padding: '1.5rem',
                                    borderRadius: '1rem',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                    border: '2px solid #bfdbfe'
                                }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Clock size={20} />
                                        Upcoming Due Dates
                                    </h3>
                                    {collections.filter(c => {
                                        const daysUntilDue = Math.ceil((new Date(c.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                        return daysUntilDue >= 0 && daysUntilDue <= 7 && c.status !== 'completed';
                                    }).length > 0 ? (
                                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                                            {collections.filter(c => {
                                                const daysUntilDue = Math.ceil((new Date(c.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                return daysUntilDue >= 0 && daysUntilDue <= 7 && c.status !== 'completed';
                                            }).slice(0, 5).map((collection, index) => (
                                                <div key={collection.id} style={{
                                                    background: 'white',
                                                    padding: '1rem',
                                                    borderRadius: '0.75rem',
                                                    border: '1px solid #60a5fa',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1d4ed8' }}>{collection.customerName}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Due in {Math.ceil((new Date(collection.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</div>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1d4ed8' }}>AED {collection.amount.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                        Status: <span style={{ color: '#f59e0b', fontWeight: '600' }}>{collection.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                            <Clock size={24} style={{ margin: '0 auto', marginBottom: '0.5rem' }} />
                                            <p style={{ fontSize: '0.9rem', margin: 0 }}>No upcoming due dates</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div style={{
                                background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '2px solid #bbf7d0'
                            }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <BarChart3 size={20} />
                                    Quick Stats
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>{collections.filter(c => c.status === 'overdue').length}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Overdue</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1d4ed8' }}>
                                            {collections.filter(c => {
                                                const daysUntilDue = Math.ceil((new Date(c.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                                                return daysUntilDue >= 0 && daysUntilDue <= 7 && c.status !== 'completed';
                                            }).length}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Due This Week</div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: 'white', borderRadius: '0.5rem' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{Math.round((totalCollected / totalAmount) * 100)}%</div>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Collected</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Total Collections</p>
                                <p style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e40af', margin: 0 }}>{collections.length}</p>
                            </div>
                            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#dbeafe', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Users size={24} color="#2563eb" />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Total Amount</p>
                                <p style={{ fontSize: '2.2rem', fontWeight: '800', color: '#15803d', margin: 0 }}>AED {totalAmount.toLocaleString()}</p>
                            </div>
                            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#d1fae5', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <DollarSign size={24} color="#16a34a" />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fefce8 100%)', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Collected</p>
                                <p style={{ fontSize: '2.2rem', fontWeight: '800', color: '#a16207', margin: 0 }}>AED {totalCollected.toLocaleString()}</p>
                            </div>
                            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#fed7aa', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={24} color="#f59e0b" />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)', padding: '2rem', borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b', marginBottom: '0.5rem' }}>Pending</p>
                                <p style={{ fontSize: '2.2rem', fontWeight: '800', color: '#b91c1c', margin: 0 }}>AED {(totalAmount - totalCollected).toLocaleString()}</p>
                            </div>
                            <div style={{ width: '4rem', height: '4rem', backgroundColor: '#fee2e2', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertCircle size={24} color="#dc2626" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collections Table */}
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#1f2937' }}>
                        <BarChart3 size={28} color="#3b82f6" />
                        Recent Collections with Salesman Allocation
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '0.75rem', overflow: 'hidden' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collected</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Salesman Allocation</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {collections.map((collection) => (
                                    <tr key={collection.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'all 0.2s ease' }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>{collection.customerName}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <Phone size={14} color="#64748b" />
                                                    {collection.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: '#1f2937' }}>AED {collection.amount.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: '600', color: '#059669' }}>AED {collection.collectedAmount.toLocaleString()}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                {collection.salesmenAllocations.map((allocation, idx) => (
                                                    <div key={idx} style={{
                                                        backgroundColor: '#f0fdf4',
                                                        color: '#166534',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '0.25rem',
                                                        marginBottom: '0.25rem',
                                                        display: 'inline-block',
                                                        marginRight: '0.25rem'
                                                    }}>
                                                        {allocation.salesmanName}: {allocation.percentage}% (AED {allocation.allocatedAmount.toLocaleString()})
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.5rem 1rem',
                                                borderRadius: '2rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                backgroundColor: getStatusColor(collection.status),
                                                color: getStatusTextColor(collection.status)
                                            }}>
                                                {getStatusIcon(collection.status)}
                                                {collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button
                                                    style={{
                                                        color: '#3b82f6',
                                                        cursor: 'pointer',
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '0.5rem',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                                        e.currentTarget.style.color = '#1d4ed8';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = '#3b82f6';
                                                    }}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(collection.id)}
                                                    style={{
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: '0.5rem',
                                                        borderRadius: '0.5rem',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#fee2e2';
                                                        e.currentTarget.style.color = '#b91c1c';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = '#dc2626';
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Collection Modal with Multi-Salesman Allocation */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '1.5rem',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                        width: '100%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            padding: '2rem',
                            borderRadius: '1.5rem 1.5rem 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <UserPlus size={24} color="white" />
                                Add Collection with Multi-Salesman Allocation
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{ color: 'rgba(255, 255, 255, 0.8)', cursor: 'pointer', background: 'none', border: 'none', transition: 'all 0.2s ease' }}
                                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'}
                            >
                                <XCircle size={28} color="rgba(255, 255, 255, 0.8)" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCollection} style={{ padding: '2rem' }}>
                            {/* Basic Collection Info */}
                            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Handshake size={20} color="#6b7280" />
                                    Collection Details
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={16} color="#6b7280" />
                                            Customer Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#3b82f6';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            value={formData.customerName}
                                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                            placeholder="Enter customer's full name"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Phone size={16} color="#6b7280" />
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#3b82f6';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="+2547XXXXXXXX"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <DollarSign size={16} color="#6b7280" />
                                            Total Amount *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#10b981';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <DollarSign size={16} color="#6b7280" />
                                            Collected Amount *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#10b981';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            value={formData.collectedAmount}
                                            onChange={(e) => setFormData({ ...formData, collectedAmount: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} color="#6b7280" />
                                            Due Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#3b82f6';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MapPin size={16} color="#6b7280" />
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            style={{
                                                width: '100%',
                                                padding: '0.875rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.borderColor = '#3b82f6';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            placeholder="Enter customer's address"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '1.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <AlertCircle size={16} color="#6b7280" />
                                        Notes
                                    </label>
                                    <textarea
                                        style={{
                                            width: '100%',
                                            padding: '0.875rem 1rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '0.75rem',
                                            outline: 'none',
                                            fontSize: '1rem',
                                            transition: 'all 0.2s ease',
                                            resize: 'none',
                                            minHeight: '80px'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any additional notes about this collection..."
                                    />
                                </div>
                            </div>

                            {/* Salesman Allocation Section */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Users size={20} color="#6b7280" />
                                        Salesman Allocation
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#6b7280' }}>Total Percentage:</span>
                                        <span style={{
                                            fontSize: '1.1rem',
                                            fontWeight: '700',
                                            color: getTotalPercentage() === 100 ? '#059669' : '#dc2626',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            backgroundColor: getTotalPercentage() === 100 ? '#d1fae5' : '#fee2e2'
                                        }}>
                                            {getTotalPercentage()}%
                                        </span>
                                        {getTotalPercentage() !== 100 && (
                                            <span style={{ fontSize: '0.85rem', color: '#dc2626', fontStyle: 'italic' }}>
                                                (Must equal 100%)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gap: '1rem', maxHeight: '300px', overflowY: 'auto', padding: '0.5rem' }}>
                                    {formData.salesmenAllocations.map((allocation, index) => (
                                        <div key={index} style={{
                                            display: 'grid',
                                            gridTemplateColumns: '2fr 1fr 1fr 0.5fr',
                                            gap: '1rem',
                                            padding: '1rem',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '0.75rem',
                                            backgroundColor: '#f9fafb',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <User size={16} color="#6b7280" />
                                                <select
                                                    value={allocation.salesmanName}
                                                    onChange={(e) => updateSalesman(index, 'salesmanName', e.target.value)}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.5rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '0.5rem',
                                                        outline: 'none',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    <option value="">Select Salesman</option>
                                                    {availableSalesmen.map(salesman => (
                                                        <option key={salesman} value={salesman}>{salesman}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Percent size={16} color="#6b7280" />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={allocation.percentage}
                                                    onChange={(e) => updateSalesman(index, 'percentage', parseFloat(e.target.value))}
                                                    style={{
                                                        width: '80px',
                                                        padding: '0.5rem',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '0.5rem',
                                                        outline: 'none',
                                                        fontSize: '0.9rem',
                                                        textAlign: 'center'
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>%</span>
                                            </div>

                                            <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: '600', color: '#059669' }}>
                                                AED {allocation.allocatedAmount.toLocaleString()}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => removeSalesman(index, e)}
                                                style={{
                                                    color: '#dc2626',
                                                    cursor: 'pointer',
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '0.5rem',
                                                    borderRadius: '0.5rem',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#fee2e2';
                                                    e.currentTarget.style.color = '#b91c1c';
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.color = '#dc2626';
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"

                                    onClick={addSalesman}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '2px dashed #3b82f6',
                                        backgroundColor: 'transparent',
                                        color: '#3b82f6',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#eff6ff';
                                        e.currentTarget.style.borderColor = '#1d4ed8';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                >
                                    <Plus size={16} />
                                    Add Another Salesman
                                </button>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: '0.875rem 2rem',
                                        border: '2px solid #e5e7eb',
                                        color: '#6b7280',
                                        borderRadius: '0.75rem',
                                        cursor: 'pointer',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        transition: 'all 0.2s ease',
                                        background: 'white'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f9fafb';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={getTotalPercentage() !== 100}
                                    style={{
                                        background: getTotalPercentage() === 100 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#9ca3af',
                                        color: 'white',
                                        padding: '0.875rem 2rem',
                                        borderRadius: '0.75rem',
                                        cursor: getTotalPercentage() === 100 ? 'pointer' : 'not-allowed',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        border: 'none',
                                        boxShadow: getTotalPercentage() === 100 ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none',
                                        transition: 'all 0.3s ease',
                                        opacity: getTotalPercentage() === 100 ? 1 : 0.6
                                    }}
                                    onMouseOver={(e) => {
                                        if (getTotalPercentage() === 100) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (getTotalPercentage() === 100) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                                        }
                                    }}
                                >
                                    Add Collection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
"use client";

import { useState, useEffect } from 'react';
import { getCollections, getCollectionById, createCollection, updateCollection } from '@/lib/collection-actions';
import { getStaffMembers } from '@/lib/collection-assignment-actions';

// Collection Detail Page - for managing individual collections
export default function CollectionDetailPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const [params, setParams] = useState<{ id: string } | null>(null);
    const [collection, setCollection] = useState<any>(null);
    const [details, setDetails] = useState<any[]>([]);
    const [staffMembers, setStaffMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddDetail, setShowAddDetail] = useState(false);
    const [showAssignment, setShowAssignment] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<string>('');
    const [assignedPercentage, setAssignedPercentage] = useState(50);

    useEffect(() => {
        paramsPromise.then(setParams);
    }, [paramsPromise]);

    // Load data
    useEffect(() => {
        async function loadData() {
            if (params?.id) {
                const [collectionData, staffData] = await Promise.all([
                    getCollectionById(params.id),
                    fetch('/api/staff').then(res => res.ok ? res.json() : { users: [] })
                ]);

                const collectionResponse = await fetch(`/api/collections/${params.id}`);
                const collectionResult = await collectionResponse.json();

                if (collectionResult.collection) {
                    setCollection(collectionResult.collection);

                    // Load details
                    const detailsResponse = await fetch(`/api/collection-details/${params.id}`);
                    if (detailsResponse.ok) {
                        const detailsData = await detailsResponse.json();
                        setDetails(detailsData.details || []);
                    }
                }

                // Load staff
                const staffResponse = await fetch('/api/users?role=staff');
                if (staffResponse.ok) {
                    const staffData = await staffResponse.json();
                    setStaffMembers(staffData.users || []);
                }
            }
            setLoading(false);
        }

        if (params) {
            loadData();
        }
    }, [params]);

    // Form handlers
    async function handleAddDetail(e: React.FormEvent) {
        e.preventDefault();

        const detailData = {
            chequeNumber: (e.currentTarget as any).chequeNumber?.value,
            bankName: (e.currentTarget as any).bankName?.value,
            branchName: (e.currentTarget as any).branchName?.value,
            amount: parseFloat((e.currentTarget as any).amount?.value) || 0,
            paymentDate: (e.currentTarget as any).paymentDate?.value || '',
            dueDate: (e.currentTarget as any).dueDate?.value || '',
            customerName: (e.currentTarget as any).customerName?.value || '',
            customerAccountNumber: (e.currentTarget as any).customerAccountNumber?.value || '',
            customerBankName: (e.currentTarget as any).customerBankName?.value || '',
            customerBranchName: (e.currentTarget as any).customerBranchName?.value || '',
            notes: (e.currentTarget as any).notes?.value || '',
        };

        try {
            const response = await fetch(`/api/collection-details/${params?.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailData),
            });

            if (response.ok) {
                const result = await response.json();
                setDetails(prev => [...prev, result.detail]);
                setShowAddDetail(false);

                // Reload collection to show new details
                const updatedCollectionResponse = await fetch(`/api/collections/${params?.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'in_progress',
                        ...collection
                    }),
                });

                if (updatedCollectionResponse.ok) {
                    const updatedCollection = await updatedCollectionResponse.json();
                    setCollection(updatedCollection);
                }
            }
        } catch (error: any) {
            alert('Failed to add collection detail: ' + error.message);
        }
    }

    async function handleAssignCollection(e: React.FormEvent) {
        e.preventDefault();

        const assignmentData = {
            staffId: selectedStaffId,
            assignedPercentage: assignedPercentage,
        };

        try {
            const response = await fetch(`/api/collection-assignments/${params?.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentData),
            });

            if (response.ok) {
                const result = await response.json();
                alert('Collection assigned successfully!');
                setShowAssignment(false);

                // Update collection status
                const updateResponse = await fetch(`/api/collections/${params?.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status: 'in_progress',
                        staffId: selectedStaffId,
                        assignedPercentage: assignedPercentage,
                        ...collection
                    }),
                });

                if (updateResponse.ok) {
                    const updatedCollection = await updateResponse.json();
                    setCollection(updatedCollection);
                }
            }
        } catch (error: any) {
            alert('Failed to assign collection: ' + error.message);
        }
    }

    async function handleDeleteDetail(detailId: string) {
        if (!confirm('Are you sure you want to delete this detail?')) return;

        try {
            const response = await fetch(`/api/collection-details/${params?.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: detailId })
            });

            if (response.ok) {
                setDetails(prev => prev.filter(d => d.id !== detailId));

                // Reload collection stats
                const collectionResponse = await fetch(`/api/collections/${params?.id}`);
                const collectionResult = await collectionResponse.json();
                if (collectionResult.collection) {
                    setCollection(collectionResult.collection);
                }
            }
        } catch (error: any) {
            alert('Failed to delete detail: ' + error.message);
        }
    }

    const printReceipt = (detail: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
                <head>
                    <title>Payment Receipt - ${detail.chequeNumber}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
                        .receipt-card { max-width: 800px; margin: auto; border: 2px solid #e2e8f0; padding: 40px; border-radius: 8px; }
                        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }
                        .logo { font-size: 24px; font-weight: 800; color: #6366f1; }
                        .receipt-title { font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                        .label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600; }
                        .value { font-size: 16px; font-weight: 500; margin-top: 4px; }
                        .amount-box { background: #f8fafc; padding: 20px; border-radius: 6px; text-align: center; margin: 30px 0; border: 1px solid #e2e8f0; }
                        .amount-value { font-size: 32px; font-weight: 800; color: #0f172a; }
                        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
                        @media print { .no-print { display: none; } }
                    </style>
                </head>
                <body>
                    <div class="receipt-card">
                        <div class="header">
                            <div class="logo">COMRADE CRM</div>
                            <div class="receipt-title">Official Receipt</div>
                        </div>
                        
                        <div class="details-grid">
                            <div>
                                <div class="label">Customer Name</div>
                                <div class="value">${detail.customerName}</div>
                            </div>
                            <div>
                                <div class="label">Receipt Number</div>
                                <div class="value">REC-${detail.id.substring(0, 6).toUpperCase()}</div>
                            </div>
                            <div>
                                <div class="label">Payment Date</div>
                                <div class="value">${new Date(detail.paymentDate).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div class="label">Cheque Number</div>
                                <div class="value">${detail.chequeNumber}</div>
                            </div>
                        </div>

                        <div class="details-grid">
                            <div>
                                <div class="label">Bank</div>
                                <div class="value">${detail.bankName}</div>
                            </div>
                            <div>
                                <div class="label">Branch</div>
                                <div class="value">${detail.branchName}</div>
                            </div>
                        </div>

                        <div class="amount-box">
                            <div class="label">Amount Paid</div>
                            <div class="amount-value">$${detail.amount.toLocaleString()}</div>
                        </div>

                        <div style="margin-top: 20px;">
                            <div class="label">Notes</div>
                            <div class="value">${detail.notes || 'No additional notes.'}</div>
                        </div>

                        <div class="footer">
                            <div>System Generated Receipt</div>
                            <div>Date Generated: ${new Date().toLocaleString()}</div>
                        </div>
                    </div>
                    <div class="no-print" style="text-align: center; margin-top: 20px;">
                        <button onclick="window.print()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer;">Print Receipt</button>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#f59e0b';
            case 'in_progress': return '#3b82f6';
            case 'completed': return '#10b981';
            case 'failed': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <div style={{
                    width: "60px",
                    height: "60px",
                    border: "4px solid var(--border)",
                    borderTop: "4px solid var(--primary)",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }}></div>
                <p style={{ marginTop: "1rem", color: "var(--muted-foreground)" }}>Loading collection details...</p>
            </div>
        );
    }

    if (!collection) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
                <div style={{ textAlign: "center" }}>
                    <p style={{ color: "var(--muted-foreground)" }}>Collection not found.</p>
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
                <div style={{ textAlign: "left", alignItems: "flex-start" }}>
                    <div>
                        <h1 className="h1" style={{ margin: 0, color: "var(--foreground)" }}>
                            Collection #{collection?.id || ''}
                        </h1>
                        <p className="text-muted" style={{ marginTop: "0.5rem" }}>
                            {collection?.collectionType?.charAt(0).toUpperCase() + ' Collection'}
                        </p>
                    </div>
                </div>
                <div>
                    <button
                        onClick={() => window.history.back()}
                        className="btn btn-outline"
                        style={{ alignSelf: "flex-end" }}
                    >
                        ← Back to Collections
                    </button>
                </div>
            </div>

            {/* Status and Assignment */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", marginBottom: "2rem" }}>
                {/* Collection Info */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>Collection Status</span>
                        <span style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "12px",
                            background: getStatusColor(collection?.status || 'pending'),
                            color: "white",
                            fontSize: "0.875rem",
                            fontWeight: "600"
                        }}>
                            {collection?.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                    </h3>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                        <div>
                            <strong>Collection Type:</strong><br />
                            {collection?.collectionType?.charAt(0).toUpperCase() + collection?.collectionType?.slice(1)}
                        </div>
                        <div>
                            <strong>Collected:</strong><br />
                            ${collection?.totalCollected?.toLocaleString()} (${collection?.targetAmount ? `/ ${collection?.targetAmount?.toLocaleString()}` : ''})
                        </div>
                        <div>
                            <strong>Progress:</strong><br />
                            <span style={{
                                padding: "0.25rem 0.5rem",
                                borderRadius: "12px",
                                background: getStatusColor(collection?.percentageCollected >= 100 ? 'completed' : 'in_progress'),
                                color: "white",
                                fontSize: "0.875rem"
                            }}>
                                {collection?.percentageCollected?.toFixed(1)}%
                            </span>
                        </div>
                    </div>

                    {collection?.status === 'completed' && (
                        <div style={{
                            padding: "1rem",
                            marginTop: "1rem",
                            borderRadius: "12px",
                            background: "#f0f9ff",
                            border: "1px solid var(--border)"
                        }}>
                            <p style={{ margin: 0, color: "#16a34a", fontWeight: "600" }}>✓ Collection Completed!</p>
                            <p style={{ margin: 0, color: "#666" }}>You can view the details below and close this collection.</p>
                        </div>
                    )}
                </div>

                {/* Staff Assignment */}
                <div className="card">
                    <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span>Staff Assignment</span>
                        {collection?.status !== 'completed' && collection?.status !== 'failed' && (
                            <button
                                onClick={() => setShowAssignment(true)}
                                className="btn btn-primary"
                                style={{ padding: "0.5rem 1rem" }}
                            >
                                Assign Staff Member
                            </button>
                        )}
                    </h3>

                    {showAssignment ? (
                        <form onSubmit={handleAssignCollection} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "end" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                                    Select Staff Member:
                                </label>
                                <select
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.5rem",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px"
                                    }}
                                >
                                    <option value="">Select staff member</option>
                                    {staffMembers.map((staff: any) => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                                    Assigned Percentage:
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={assignedPercentage}
                                    onChange={(e) => setAssignedPercentage(parseInt(e.target.value))}
                                    style={{
                                        width: "100%",
                                        padding: "0.5rem",
                                        border: "1px solid var(--border)",
                                        borderRadius: "6px"
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                <button type="submit" className="btn btn-primary">
                                    Assign Collection
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowAssignment(false)}
                                    className="btn btn-outline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={{
                            padding: "1rem",
                            textAlign: "center",
                            borderRadius: "12px",
                            background: "var(--accent)"
                        }}>
                            {collection?.staffId ? (
                                <div>
                                    <p><strong>Assigned to:</strong> {collection?.staffName}</p>
                                    <p><strong>Progress:</strong> {collection?.assignedPercentage}%</p>
                                </div>
                            ) : (
                                <p style={{ color: "var(--muted-foreground)" }}>No staff member assigned yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Collection Details */}
            <div className="card">
                <h3 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span>Collection Details</span>
                    <button
                        onClick={() => setShowAddDetail(true)}
                        className="btn btn-primary"
                        style={{ padding: "0.25rem 0.75rem", fontSize: "0.875rem" }}
                    >
                        + Add Cheque Detail
                    </button>
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", marginTop: "1rem" }}>
                    {details.map((detail: any, index: number) => (
                        <div key={detail.id} style={{
                            padding: "1rem",
                            borderRadius: "12px",
                            border: "1px solid var(--border)",
                            background: "var(--accent)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                <div style={{ flex: 1 }}>
                                    <strong>Cheque #{detail.chequeNumber}</strong>
                                    {detail.paymentDate && (
                                        <span style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                            Due: {new Date(detail.paymentDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div style={{ textAlign: "right", display: "flex", gap: "0.5rem" }}>
                                    <button
                                        onClick={() => printReceipt(detail)}
                                        className="btn btn-outline"
                                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", borderColor: "var(--primary)", color: "var(--primary)" }}
                                    >
                                        Print Receipt
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDetail(detail.id)}
                                        className="btn btn-outline"
                                        style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div style={{ flex: 1 }}>
                                <div><strong>Amount:</strong> ${detail.amount?.toLocaleString()}</div>
                                {detail.bankName && <div><strong>Bank:</strong> {detail.bankName}</div>}
                                {detail.branchName && <div><strong>Branch:</strong> {detail.branchName}</div>}
                            </div>

                            <div style={{ textAlign: "right", flex: 1, alignItems: "center" }}>
                                <span style={{
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "12px",
                                    background: getStatusColor(detail.status),
                                    color: "white",
                                    fontSize: "0.875rem",
                                    fontWeight: "600"
                                }}>
                                    {detail.status?.charAt(0).toUpperCase() + detail.status?.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {showAddDetail && (
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
                            backgroundColor: 'white',
                            padding: '2rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            width: '90%',
                            maxWidth: '600px',
                            position: 'relative'
                        }}>
                            <button
                                onClick={() => setShowAddDetail(false)}
                                style={{
                                    position: 'absolute',
                                    top: '0.5rem',
                                    right: '0.5rem',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    padding: '0.25rem 0.5rem',
                                    color: 'white'
                                }}
                            >
                                X
                            </button>

                            <h3 style={{ marginBottom: "1rem" }}>Add Collection Detail</h3>
                            <form onSubmit={handleAddDetail}>
                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Cheque Number:
                                    </label>
                                    <input
                                        type="text"
                                        name="chequeNumber"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                            Bank Name:
                                        </label>
                                        <input
                                            type="text"
                                            name="bankName"
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "0.5rem",
                                                border: "1px solid var(--border)",
                                                borderRadius: "6px"
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                            Branch Name:
                                        </label>
                                        <input
                                            type="text"
                                            name="branchName"
                                            required
                                            style={{
                                                width: "100%",
                                                padding: "0.5rem",
                                                border: "1px solid var(--border)",
                                                borderRadius: "6px"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Amount:
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        min="0"
                                        step="0.01"
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Payment Date:
                                    </label>
                                    <input
                                        type="date"
                                        name="paymentDate"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Due Date:
                                    </label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Customer Name:
                                    </label>
                                    <input
                                        type="text"
                                        name="customerName"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Account Number:
                                    </label>
                                    <input
                                        type="text"
                                        name="customerAccountNumber"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Customer Bank Name:
                                    </label>
                                    <input
                                        type="text"
                                        name="customerBankName"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Customer Branch Name:
                                    </label>
                                    <input
                                        type="text"
                                        name="customerBranchName"
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px"
                                        }}
                                    />
                                </div>

                                <div style={{ marginTop: "1rem" }}>
                                    <label style={{ display: "block", marginBottom: "0.25rem" }}>
                                        Notes:
                                    </label>
                                    <textarea
                                        name="notes"
                                        rows={4}
                                        style={{
                                            width: "100%",
                                            padding: "0.5rem",
                                            border: "1px solid var(--border)",
                                            borderRadius: "6px",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                    <button type="submit" className="btn btn-primary">
                                        Add Cheque
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddDetail(false)}
                                        className="btn btn-outline"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD COMPLAINTS
  // =====================================================

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading dashboard complaints...");

      const response = await fetch(
        "http://localhost:5000/api/complaints"
      );

      const data = await response.json();

      console.log("Dashboard data:", data);

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load complaints"
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadComplaints();
  }, []);

  // =====================================================
  // APPROVE
  // =====================================================

  const approveComplaint = async (caseId) => {
    if (!caseId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to approve this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(caseId);

      const response = await fetch(
        `http://localhost:5000/api/complaints/${caseId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to approve complaint"
        );
      }

      console.log(
        "Complaint approved:",
        data
      );

      // Update dashboard immediately
      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint.caseId === caseId
            ? {
                ...complaint,
                status: "Approved",
                humanApproval: true,
                adminDecision: "Approved",
              }
            : complaint
        )
      );

      alert("Complaint approved successfully.");
    } catch (err) {
      console.error(
        "Approve error:",
        err
      );

      alert(
        err.message ||
          "Failed to approve complaint."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // DECLINE
  // =====================================================

  const declineComplaint = async (caseId) => {
    if (!caseId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to decline this complaint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(caseId);

      const response = await fetch(
        `http://localhost:5000/api/complaints/${caseId}/decline`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to decline complaint"
        );
      }

      console.log(
        "Complaint declined:",
        data
      );

      // Update dashboard immediately
      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint.caseId === caseId
            ? {
                ...complaint,
                status: "Declined",
                humanApproval: false,
                adminDecision: "Declined",
              }
            : complaint
        )
      );

      alert("Complaint declined.");
    } catch (err) {
      console.error(
        "Decline error:",
        err
      );

      alert(
        err.message ||
          "Failed to decline complaint."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // UNDER REVIEW
  // =====================================================

  const reviewComplaint = async (caseId) => {
    if (!caseId) {
      return;
    }

    try {
      setActionLoading(caseId);

      const response = await fetch(
        `http://localhost:5000/api/complaints/${caseId}/review`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to update complaint"
        );
      }

      setComplaints((previous) =>
        previous.map((complaint) =>
          complaint.caseId === caseId
            ? {
                ...complaint,
                status: "Under Review",
                humanApproval: false,
                adminDecision: "Under Review",
              }
            : complaint
        )
      );
    } catch (err) {
      console.error(
        "Review error:",
        err
      );

      alert(
        err.message ||
          "Failed to update complaint."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // CALCULATE STATISTICS
  // =====================================================

  const totalCases = complaints.length;

  const pendingCases = complaints.filter(
    (item) =>
      item.status === "Pending Approval" ||
      item.status === "Pending"
  ).length;

  const reviewCases = complaints.filter(
    (item) =>
      item.status === "Under Review"
  ).length;

  const approvedCases = complaints.filter(
    (item) =>
      item.status === "Approved"
  ).length;

  const declinedCases = complaints.filter(
    (item) =>
      item.status === "Declined"
  ).length;

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Approved":
        return "status-approved";

      case "Declined":
        return "status-declined";

      case "Under Review":
        return "status-review";

      case "Pending Approval":
      case "Pending":
        return "status-pending";

      case "Verification Failed":
        return "status-failed";

      default:
        return "status-pending";
    }
  };

  // =====================================================
  // PRIORITY CLASS
  // =====================================================

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";

      case "Medium":
        return "priority-medium";

      case "Low":
        return "priority-low";

      default:
        return "priority-unknown";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Not available";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          Loading complaints...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-header">

        <div className="admin-brand">

          <div className="admin-logo">
            🛡️
          </div>

          <div>
            <h1>ResolveAI Admin</h1>

            <p>
              Complaint Management Dashboard
            </p>
          </div>

        </div>

        <div className="admin-actions">

          <button
            className="refresh-btn"
            onClick={loadComplaints}
          >
            ↻ Refresh
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/")}
          >
            ← Home
          </button>

        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-label">
            Total Cases
          </div>

          <div className="stat-number">
            {totalCases}
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-label">
            Pending
          </div>

          <div className="stat-number pending-number">
            {pendingCases}
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-label">
            Under Review
          </div>

          <div className="stat-number review-number">
            {reviewCases}
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-label">
            Approved
          </div>

          <div className="stat-number approved-number">
            {approvedCases}
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-label">
            Declined
          </div>

          <div className="stat-number declined-number">
            {declinedCases}
          </div>

        </div>

      </div>

      {/* =================================================
          COMPLAINT SECTION
      ================================================= */}

      <div className="complaints-section">

        <div className="section-header">

          <div>
            <h2>
              Customer Complaints
            </h2>

            <p>
              Review and manage customer cases
            </p>
          </div>

          <div className="case-count">
            {totalCases} Cases
          </div>

        </div>

        {/* =================================================
            NO COMPLAINTS
        ================================================= */}

        {complaints.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📭
            </div>

            <h3>
              No complaints found
            </h3>

            <p>
              New customer complaints will
              appear here.
            </p>

          </div>
        ) : (

          <div className="complaints-list">

            {complaints.map((complaint) => (

              <div
                className="complaint-card"
                key={complaint.caseId}
              >

                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div className="complaint-header">

                  <div>

                    <h3>
                      {complaint.name ||
                        "Customer"}
                    </h3>

                    <p className="case-id">
                      Case ID:{" "}
                      {complaint.caseId}
                    </p>

                  </div>

                  <div className="badges">

                    <span
                      className={`priority-badge ${getPriorityClass(
                        complaint.priority
                      )}`}
                    >
                      {complaint.priority ||
                        "Unknown"} Priority
                    </span>

                    <span
                      className={`status-badge ${getStatusClass(
                        complaint.status
                      )}`}
                    >
                      {complaint.status ||
                        "Pending"}
                    </span>

                  </div>

                </div>

                {/* =================================================
                    CUSTOMER / ORDER DETAILS
                ================================================= */}

                <div className="complaint-details">

                  <div className="detail-item">

                    <span className="detail-label">
                      Order ID
                    </span>

                    <strong>
                      {complaint.orderNumber ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Product
                    </span>

                    <strong>
                      {complaint.productName ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Product Price
                    </span>

                    <strong>
                      ₹
                      {Number(
                        complaint.productPrice || 0
                      ).toLocaleString("en-IN")}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Delivery Date
                    </span>

                    <strong>
                      {complaint.deliveryDate ||
                        "Not available"}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Payment Method
                    </span>

                    <strong>
                      {complaint.paymentMethod ||
                        "Not provided"}
                    </strong>

                  </div>

                  <div className="detail-item">

                    <span className="detail-label">
                      Return Deadline
                    </span>

                    <strong>
                      {complaint.returnDeadline ||
                        complaint.eligibleDate ||
                        "Not available"}
                    </strong>

                  </div>

                </div>

                {/* =================================================
                    COMPLAINT REASON
                ================================================= */}

                <div className="reason-section">

                  <span className="detail-label">
                    Complaint
                  </span>

                  <p>
                    {complaint.reason ||
                      "No description"}
                  </p>

                </div>

                {/* =================================================
                    VERIFICATION
                ================================================= */}

                <div className="verification-section">

                  <div>

                    <span className="detail-label">
                      Verification
                    </span>

                    <strong>
                      {complaint.verificationStatus ||
                        "Unknown"}
                    </strong>

                  </div>

                  <div>

                    <span className="detail-label">
                      AI Recommendation
                    </span>

                    <strong>
                      {complaint.aiRecommendation ||
                        "Human Review"}
                    </strong>

                  </div>

                  <div>

                    <span className="detail-label">
                      Created
                    </span>

                    <strong>
                      {formatDate(
                        complaint.createdAt
                      )}
                    </strong>

                  </div>

                </div>

                {/* =================================================
                    ADMIN ACTIONS
                ================================================= */}

                <div className="admin-decision">

                  <div className="decision-title">
                    Admin Decision
                  </div>

                  <div className="decision-buttons">

                    <button
                      className="review-btn"
                      disabled={
                        actionLoading ===
                        complaint.caseId ||
                        complaint.status ===
                          "Approved" ||
                        complaint.status ===
                          "Declined"
                      }
                      onClick={() =>
                        reviewComplaint(
                          complaint.caseId
                        )
                      }
                    >
                      🔍 Under Review
                    </button>

                    <button
                      className="approve-btn"
                      disabled={
                        actionLoading ===
                        complaint.caseId ||
                        complaint.status ===
                          "Approved"
                      }
                      onClick={() =>
                        approveComplaint(
                          complaint.caseId
                        )
                      }
                    >
                      ✓ Approve
                    </button>

                    <button
                      className="decline-btn"
                      disabled={
                        actionLoading ===
                        complaint.caseId ||
                        complaint.status ===
                          "Declined"
                      }
                      onClick={() =>
                        declineComplaint(
                          complaint.caseId
                        )
                      }
                    >
                      ✕ Decline
                    </button>

                  </div>

                  {actionLoading ===
                    complaint.caseId && (
                    <div className="action-loading">
                      Updating case...
                    </div>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default AdminDashboard;
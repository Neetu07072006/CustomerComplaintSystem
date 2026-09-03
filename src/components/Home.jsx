import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Home() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    message: "",
  });

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("User Feedback:", {
      ...formData,
      rating,
    });

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      city: "",
      message: "",
    });

    setRating(0);
    setHoverRating(0);

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="app-container">

      {/* ================= NAVBAR ================= */}
      <nav className="navbar">

        <div
          className="logo"
          onClick={() => scrollToSection("top")}
          style={{ cursor: "pointer" }}
        >
          <div className="shield-icon">🛡️</div>
          <span>ResolveAI</span>
        </div>

        <div className="nav-links">
        <a href="#instructions">How to Use ResolveAI</a>
        <a href="#workflow">Workflow</a>
        <a href="#impact">Impact</a>
        <a href="#demo">Feedback</a>
      </div>

      </nav>


      {/* ================= HERO ================= */}
      <section className="hero" id="top">

        <div className="badge">
          <span>⚡</span>
          A Prototype For Project
        </div>

        <h1 className="hero-title">
          Governed Autonomous AI for
          <br />

          <span className="text-gradient">
            End-to-End Complaint
            <br />
            Resolution
          </span>
        </h1>

        <p className="hero-subtitle">
          Shifting the paradigm from{" "}
          <strong>"AI that answers"</strong>{" "}
          to{" "}
          <strong>"AI that resolves."</strong>
        </p>

        {/* HERO BUTTONS */}
        <div className="hero-buttons">

          <button
            className="hero-btn"
            onClick={() => navigate("/chatbot")}
          >
            <span>Resolve AI</span>
            <span className="button-arrow">→</span>
          </button>

          <button
            className="hero-btn"
            onClick={() => navigate("/admin-login")}
          >
            <span>Admin Sign In</span>
            <span className="button-arrow">→</span>
          </button>

        </div>

      </section>

      {/* ================= HOW TO USE RESOLVEAI ================= */}
<section className="instructions-section" id="instructions">

  <div className="instructions-header">
    <div className="instructions-badge">
      💡 Quick Guide
    </div>

    <h2>
      How to Use <span>ResolveAI</span>
    </h2>

    <p>
      Follow these simple steps to raise and resolve your
      complaint efficiently.
    </p>
  </div>

  <div className="instructions-grid">

    <div className="instruction-card">
      <div className="instruction-number">01</div>
      <div className="instruction-icon">💬</div>

      <h3>Start a Complaint</h3>

      <p>
        Click on <strong>Resolve AI</strong> and describe
        your product or delivery issue clearly.
      </p>
    </div>

    <div className="instruction-card">
      <div className="instruction-number">02</div>
      <div className="instruction-icon">📋</div>

      <h3>Provide Order Details</h3>

      <p>
        Enter your order ID, product name, delivery date,
        payment method and reason for return when requested.
      </p>
    </div>

    <div className="instruction-card">
      <div className="instruction-number">03</div>
      <div className="instruction-icon">🔍</div>

      <h3>AI Verifies Your Order</h3>

      <p>
        ResolveAI verifies the information against the
        registered order data before processing the complaint.
      </p>
    </div>

    <div className="instruction-card">
      <div className="instruction-number">04</div>
      <div className="instruction-icon">🛡️</div>

      <h3>Human Approval</h3>

      <p>
        Eligible complaints can be reviewed by an authorized
        administrator before the final resolution.
      </p>
    </div>

  </div>

</section>


      {/* ================= PROBLEM ================= */}
      <section className="info-section" id="problem">

        <div className="section-label">
          🔍 THE PROBLEM
        </div>

        <h2 className="main-section-title">
          Traditional Complaint Handling
          <span> Takes Too Much Time</span>
        </h2>

        <p className="section-description">
          Customer support teams spend valuable time manually reading
          complaints, collecting information, checking eligibility,
          preparing responses and escalating complex cases.
        </p>

        <div className="problem-grid">

          <div className="problem-card">
            <div className="problem-icon">⏳</div>
            <h3>Manual Processing</h3>
            <p>
              Repetitive complaint handling consumes valuable employee time.
            </p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">📄</div>
            <h3>Incomplete Information</h3>
            <p>
              Missing order and product information creates unnecessary
              back-and-forth communication.
            </p>
          </div>

          <div className="problem-card">
            <div className="problem-icon">⚠️</div>
            <h3>Delayed Decisions</h3>
            <p>
              Complex cases often require additional review before action.
            </p>
          </div>

        </div>

      </section>


      {/* ================= WORKFLOW ================= */}
      <section className="workflow-section" id="workflow">

        <div className="section-label">
          🔄 RESOLVEAI WORKFLOW
        </div>

        <h2 className="main-section-title">
          From Complaint
          <span> to Resolution</span>
        </h2>

        <p className="section-description">
          ResolveAI combines AI reasoning, automated processing and human
          governance to create an end-to-end complaint resolution pipeline.
        </p>

        <div className="workflow-grid">

          <div className="workflow-card">
            <div className="workflow-number">01</div>
            <div className="workflow-icon">👤</div>
            <h3>Customer Complaint</h3>
            <p>
              Customer submits their complaint and provides the required
              order information.
            </p>
          </div>

          <div className="workflow-line">→</div>

          <div className="workflow-card">
            <div className="workflow-number">02</div>
            <div className="workflow-icon">🤖</div>
            <h3>AI Analysis</h3>
            <p>
              AI understands the complaint, extracts information and
              recommends the appropriate action.
            </p>
          </div>

          <div className="workflow-line">→</div>

          <div className="workflow-card">
            <div className="workflow-number">03</div>
            <div className="workflow-icon">🛡️</div>
            <h3>Human Approval</h3>
            <p>
              High-risk or sensitive decisions can be reviewed by an
              authorized human.
            </p>
          </div>

          <div className="workflow-line">→</div>

          <div className="workflow-card">
            <div className="workflow-number">04</div>
            <div className="workflow-icon">✅</div>
            <h3>Resolution</h3>
            <p>
              The approved action is processed and the complaint moves
              toward resolution.
            </p>
          </div>

        </div>

      </section>


      {/* ================= AI IMPACT ================= */}
      <section className="impact-section" id="impact">

        <div className="impact-heading">

          <div className="impact-badge">
            📊 AI-POWERED IMPACT
          </div>

          <h2>
            Less Time Handling Complaints.
            <br />
            <span>More Time Creating Value.</span>
          </h2>

          <p>
            ResolveAI automates repetitive complaint-handling activities,
            allowing support teams to focus on complex cases and customers
            that require human attention.
          </p>

        </div>


        {/* MAIN TIME SAVING */}
        <div className="time-saving-card">

          <div className="time-saving-content">

            <div className="time-icon">
              ⏱️
            </div>

            <div>
              <span className="metric-label">
                ESTIMATED TIME SAVED
              </span>

              <div className="big-metric">
                65%
              </div>

              <h3>
                Reduction in Manual Complaint Handling
              </h3>

              <p>
                By automating repetitive tasks such as complaint analysis,
                information collection and recommendation generation.
              </p>
            </div>

          </div>

          <div className="progress-container">

            <div className="progress-label">
              <span>Manual Workflow</span>
              <span>ResolveAI Workflow</span>
            </div>

            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>

            <p className="prototype-note">
              *Prototype estimate — not a measured production result.
            </p>

          </div>

        </div>


        {/* IMPACT CARDS */}
        <div className="impact-grid">

          <div className="impact-card">

            <div className="impact-icon">
              ⚡
            </div>

            <div className="impact-number">
              3×
            </div>

            <h3>
              Faster First Response
            </h3>

            <p>
              AI can immediately understand and respond to customer
              complaints instead of waiting for manual processing.
            </p>

          </div>


          <div className="impact-card">

            <div className="impact-icon">
              🤖
            </div>

            <div className="impact-number">
              24/7
            </div>

            <h3>
              Automated Support
            </h3>

            <p>
              Customers can raise complaints whenever they need
              assistance, without depending on support hours.
            </p>

          </div>


          <div className="impact-card">

            <div className="impact-icon">
              🛡️
            </div>

            <div className="impact-number">
              100%
            </div>

            <h3>
              Human Governance
            </h3>

            <p>
              High-risk decisions can be reviewed and approved by
              authorized human operators.
            </p>

          </div>

        </div>

      </section>


      {/* ================= FEEDBACK ================= */}
      <section
        className="section form-section"
        id="demo"
      >

        <div className="feedback-badge">
          💬 HELP US IMPROVE
        </div>

        <h2 className="section-title">
          Customer Feedback
        </h2>

        <p className="section-subtitle">
          Tell us what you think about the ResolveAI prototype.
        </p>


        {/* ================= RATE WEBSITE ================= */}
        <div className="rating-box">

          <h3>
            ⭐ Rate Our Website
          </h3>

          <p>
            How would you rate your experience with ResolveAI?
          </p>

          <div className="stars">

            {[1, 2, 3, 4, 5].map((star) => (

              <button
                key={star}
                type="button"
                className={`star ${
                  star <= (hoverRating || rating)
                    ? "star-active"
                    : ""
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`Rate ${star} out of 5`}
              >
                ★
              </button>

            ))}

          </div>

          <div className="rating-text">

            {rating === 0
              ? "Select a rating"
              : `${rating} out of 5 selected`}

          </div>

        </div>


        {/* ================= FEEDBACK FORM ================= */}
        <form
          onSubmit={handleSubmit}
          className="input-form"
        >

          <div className="form-row">

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

            </div>

          </div>


          <div className="form-group">

            <label>
              City
            </label>

            <input
              type="text"
              name="city"
              placeholder="Enter your city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />

          </div>


          <div className="form-group">

            <label>
              Your Feedback
            </label>

            <textarea
              name="message"
              placeholder="Tell us about your experience..."
              value={formData.message}
              onChange={handleInputChange}
              rows="5"
              required
            />

          </div>


          <button
            type="submit"
            className="feedback-submit"
          >
            Submit Feedback
            <span>→</span>
          </button>

        </form>


        {submitted && (

          <div className="success-message">
            ✅ Thank you! Your feedback has been received.
          </div>

        )}

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="footer">

        <div className="footer-logo">
          🛡️ ResolveAI
        </div>

        <p>
          Governed Autonomous AI for End-to-End Complaint Resolution
        </p>

        <span>
          © 2026 ResolveAI Prototype
        </span>

      </footer>

    </div>
  );
}

export default Home;
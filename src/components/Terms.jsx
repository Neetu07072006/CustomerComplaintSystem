import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function Terms() {

  const navigate = useNavigate();

  return (
    <div className="terms-page">

      {/* Navbar */}
      <nav className="navbar">

        <div className="logo">
          <div className="shield-icon">🛡️</div>
          <span>ResolveAI</span>
        </div>

        <button
          className="nav-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </button>

      </nav>


      {/* Terms Content */}
      <main className="terms-container">

        <div className="terms-badge">
          📄 Legal Information
        </div>

        <h1>
          Terms & <span>Conditions</span>
        </h1>

        <p className="terms-intro">
          Please read these terms carefully before using
          the ResolveAI complaint resolution system.
        </p>


        <section className="terms-card">

          <h2>1. Use of ResolveAI</h2>

          <p>
            ResolveAI is an AI-powered customer complaint
            resolution prototype designed to assist customers
            in submitting and managing product-related
            complaints.
          </p>

        </section>


        <section className="terms-card">

          <h2>2. Accurate Information</h2>

          <p>
            Customers are expected to provide accurate
            information including order ID, product name,
            delivery date, payment method and reason for return.
          </p>

          <p>
            Providing incorrect or misleading information may
            result in the complaint being rejected or escalated
            for further verification.
          </p>

        </section>


        <section className="terms-card">

          <h2>3. Order Verification</h2>

          <p>
            ResolveAI may verify submitted order information
            against registered order records before a complaint
            can proceed.
          </p>

          <p>
            An order mismatch does not automatically qualify
            the customer for a refund or replacement.
          </p>

        </section>


        <section className="terms-card">

          <h2>4. Refunds & Replacements</h2>

          <p>
            A refund or replacement is not guaranteed simply
            because a request has been submitted through
            ResolveAI.
          </p>

          <p>
            Eligible cases may require human review and
            approval before a final resolution is provided.
          </p>

        </section>


        <section className="terms-card">

          <h2>5. AI-Assisted Decisions</h2>

          <p>
            ResolveAI uses artificial intelligence to understand
            complaints, collect relevant information and assist
            with case processing.
          </p>

          <p>
            AI responses should not be considered a substitute
            for official customer-service policies or authorized
            human decisions.
          </p>

        </section>


        <section className="terms-card">

          <h2>6. Data & Privacy</h2>

          <p>
            Complaint information may be stored for the purpose
            of verification, case management, resolution and
            system improvement.
          </p>

          <p>
            Users should avoid submitting passwords, financial
            credentials or other highly sensitive information
            through the chatbot.
          </p>

        </section>


        <section className="terms-card">

          <h2>7. Prototype Disclaimer</h2>

          <p>
            ResolveAI is currently a prototype developed for
            demonstration and evaluation purposes. Features,
            verification mechanisms and resolution workflows
            may change as the system evolves.
          </p>

        </section>


        <button
          className="terms-back-btn"
          onClick={() => navigate("/")}
        >
          ← Return to ResolveAI
        </button>

      </main>

    </div>
  );
}

export default Terms;
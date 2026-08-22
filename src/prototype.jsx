import React, { useState, useEffect } from 'react';
import './Prototype.css';

function Prototype() {
  const [activeStep, setActiveStep] = useState(0);

  // Simulate the AI processing the complaint over a few seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2500); // Advances a step every 2.5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="prototype-container">
      {/* Prototype Header */}
      <header className="proto-header">
        <div className="logo">
          <span className="shield-icon">🛡️</span> ResolveAI Dashboard
        </div>
        <div className="status-badge">Live Simulation Active</div>
      </header>

      <div className="dashboard-grid">
        {/* Left Column: Customer Input Context */}
        <div className="panel customer-panel">
          <h2 className="panel-title">Incoming Ticket #1042</h2>
          
          <div className="ticket-details">
            <div className="detail-group">
              <label>Customer Name</label>
              <p>Alex Johnson</p>
            </div>
            <div className="detail-group">
              <label>Issue Category</label>
              <p className="tag error-tag">Damaged Product</p>
            </div>
            <div className="detail-group">
              <label>Customer Message</label>
              <p className="message-box">
                "I just received my order today and the screen is completely shattered. I attached a picture. I need a replacement or refund immediately!"
              </p>
            </div>
            <div className="detail-group">
              <label>Attached Evidence</label>
              <div className="image-placeholder">
                📷 shattered_screen.jpg
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Resolution Engine */}
        <div className="panel ai-panel">
          <h2 className="panel-title">AI Resolution Pipeline</h2>
          
          <div className="pipeline-steps">
            {/* Step 1 */}
            <div className={`step ${activeStep >= 1 ? 'completed' : activeStep === 0 ? 'active' : ''}`}>
              <div className="step-indicator">1</div>
              <div className="step-content">
                <h4>Intelligent Intake</h4>
                <p>Analyzing text sentiment and categorizing intent...</p>
                {activeStep >= 1 && <span className="ai-log success">✓ Intent: Refund/Replace | Sentiment: Frustrated</span>}
              </div>
            </div>

            {/* Step 2 */}
            <div className={`step ${activeStep >= 2 ? 'completed' : activeStep === 1 ? 'active' : ''}`}>
              <div className="step-indicator">2</div>
              <div className="step-content">
                <h4>Evidence & Policy Analysis</h4>
                <p>Scanning image attachment and fetching return policy...</p>
                {activeStep >= 2 && <span className="ai-log success">✓ Image Validated: 98% Damage Confidence. Policy allows 7-day return.</span>}
              </div>
            </div>

            {/* Step 3 */}
            <div className={`step ${activeStep >= 3 ? 'completed' : activeStep === 2 ? 'active' : ''}`}>
              <div className="step-indicator">3</div>
              <div className="step-content">
                <h4>Human-in-the-Loop Governance</h4>
                <p>Checking if manual approval is required...</p>
                {activeStep >= 3 && <span className="ai-log success">✓ Auto-approval granted based on $50 value threshold.</span>}
              </div>
            </div>

            {/* Step 4 */}
            <div className={`step ${activeStep >= 4 ? 'completed' : activeStep === 3 ? 'active' : ''}`}>
              <div className="step-indicator">4</div>
              <div className="step-content">
                <h4>Autonomous Execution</h4>
                <p>Triggering backend refund API and notifying customer...</p>
                {activeStep >= 4 && <span className="ai-log highlight">⚡ API Success: Full refund issued to original payment method.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Prototype;
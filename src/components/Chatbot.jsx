import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Chatbot.css";

function Chatbot() {
  const navigate = useNavigate();
  const chatBodyRef = useRef(null);

  // =====================================================
  // UNIQUE CHAT ID
  // =====================================================

  const [chatId] = useState(() => `chat_${Date.now()}`);

  // =====================================================
  // CHAT MESSAGES
  // =====================================================

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 I'm ResolveAI, your intelligent customer support assistant.",
    },
    {
      role: "assistant",
      content:
        "I'll collect a few details about your complaint and then analyze your case.",
    },
    {
      role: "assistant",
      content: "First, please provide your delivery date.",
    },
  ]);

  // =====================================================
  // INPUT / LOADING
  // =====================================================

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // COMPLAINT DATA
  // =====================================================

  const [complaintData, setComplaintData] = useState({
    deliveryDate: "",
    productName: "",
    returnReason: "",
    orderNumber: "",
    paymentMethod: "",
  });

  // =====================================================
  // CASE RESULT
  // =====================================================

  const [caseResult, setCaseResult] = useState(null);

  // =====================================================
  // CURRENT QUESTION
  // =====================================================

  const [currentStep, setCurrentStep] = useState(0);

  const questions = [
    {
      key: "deliveryDate",
      question: "Please provide your delivery date.",
    },
    {
      key: "productName",
      question: "What is the name of the product?",
    },
    {
      key: "returnReason",
      question:
        "Please tell me the reason for the return or complaint.",
    },
    {
      key: "orderNumber",
      question: "Please provide your order number.",
    },
    {
      key: "paymentMethod",
      question:
        "What payment method did you use? For example, UPI, Credit Card, Debit Card, Cash on Delivery, or Net Banking.",
    },
  ];

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop =
        chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // =====================================================
  // ADD MESSAGE
  // =====================================================

  const addMessage = (role, content) => {
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        role,
        content,
      },
    ]);
  };

  // =====================================================
  // FORMAT COMPLAINT SUMMARY
  // =====================================================

  const createComplaintSummary = (data) => {
    return `
Customer complaint information:

Delivery Date: ${data.deliveryDate}
Product Name: ${data.productName}
Reason for Return/Complaint: ${data.returnReason}
Order Number: ${data.orderNumber}
Payment Method: ${data.paymentMethod}

Please analyze this complaint and provide the appropriate next step for the customer.
`.trim();
  };

  // =====================================================
  // SEND FINAL COMPLAINT TO BACKEND
  // =====================================================

  const sendComplaintToAI = async (finalComplaintData) => {
    setLoading(true);

    try {
      console.log("================================");
      console.log("SENDING FINAL COMPLAINT");
      console.log("================================");

      console.log("Chat ID:", chatId);
      console.log("Complaint Data:", finalComplaintData);

      const complaintMessage =
        createComplaintSummary(finalComplaintData);

      console.log("Complaint message:");
      console.log(complaintMessage);

      // =================================================
      // IMPORTANT
      // Send ALL complaint fields to backend
      // =================================================

      const requestBody = {
        message: complaintMessage,

        // Previous conversation
        history: messages,

        // Unique complaint/chat ID
        chatId: chatId,

        // Order information
        orderId: finalComplaintData.orderNumber,
        productName: finalComplaintData.productName,
        deliveryDate: finalComplaintData.deliveryDate,
        paymentMethod: finalComplaintData.paymentMethod,

        // Complaint reason
        returnReason: finalComplaintData.returnReason,
      };

      console.log("Request body sent to backend:");
      console.log(requestBody);

      // =================================================
      // BACKEND REQUEST
      // =================================================

      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(requestBody),
        }
      );

      console.log("Backend status:", response.status);

      // =================================================
      // READ RESPONSE
      // =================================================

      let data;

      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error(
          "Backend returned an invalid response."
        );
      }

      console.log("Backend response:");
      console.log(data);

      // =================================================
      // BACKEND ERROR
      // =================================================

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Backend error: ${response.status}`
        );
      }

      // =================================================
      // AI REPLY CHECK
      // =================================================

      if (!data || !data.reply) {
        throw new Error(
          "Backend did not return an AI reply."
        );
      }

      // =================================================
      // SAVE CASE RESULT
      // =================================================

      if (data.case) {
        console.log("================================");
        console.log("CASE CREATED");
        console.log("================================");

        console.log("Case ID:", data.case.caseId);
        console.log("Order ID:", data.case.orderId);
        console.log(
          "Product:",
          data.case.productName
        );
        console.log(
          "Customer:",
          data.case.customerName
        );
        console.log(
          "Price:",
          data.case.productPrice
        );
        console.log(
          "Priority:",
          data.case.priority
        );
        console.log(
          "Verification:",
          data.case.verificationStatus
        );

        setCaseResult(data.case);
      }

      // =================================================
      // DISPLAY AI RESPONSE
      // =================================================

      addMessage("assistant", data.reply);

      // =================================================
      // DISPLAY CASE INFORMATION
      // =================================================

      if (data.case) {
        const caseMessage = `
Complaint submitted successfully. ✅

Case ID: ${data.case.caseId || "Generated"}
Order ID: ${data.case.orderId || finalComplaintData.orderNumber}
Product: ${
          data.case.productName ||
          finalComplaintData.productName
        }
Priority: ${data.case.priority || "Unknown"}
Verification: ${
          data.case.verificationStatus || "Pending"
        }
Status: ${data.case.status || "Pending"}

Your complaint has been recorded in the ResolveAI system.
        `.trim();

        addMessage("assistant", caseMessage);
      }

      // =================================================
      // MOVE TO NORMAL CHAT
      // =================================================

      setCurrentStep(questions.length);
    } catch (error) {
      console.error("================================");
      console.error("CHATBOT ERROR");
      console.error("================================");
      console.error(error);

      addMessage(
        "assistant",
        `Sorry, I couldn't process your complaint right now.

Error: ${error.message}

Please make sure the ResolveAI backend is running on port 5000.`
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE EACH COMPLAINT QUESTION
  // =====================================================

  const handleComplaintStep = async (messageText) => {
    const currentQuestion = questions[currentStep];

    if (!currentQuestion) {
      return;
    }

    // =================================================
    // SAVE ANSWER
    // =================================================

    const updatedComplaintData = {
      ...complaintData,
      [currentQuestion.key]: messageText,
    };

    setComplaintData(updatedComplaintData);

    console.log("================================");
    console.log("COMPLAINT DATA UPDATED");
    console.log("================================");

    console.log(updatedComplaintData);

    // =================================================
    // MORE QUESTIONS
    // =================================================

    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;

      setCurrentStep(nextStep);

      addMessage(
        "assistant",
        questions[nextStep].question
      );

      return;
    }

    // =================================================
    // ALL INFORMATION COLLECTED
    // =================================================

    addMessage(
      "assistant",
      "Thank you! ✅ I have collected all the required information."
    );

    // =================================================
    // SHOW STRUCTURED SUMMARY
    // =================================================

    const summaryMessage = `
📋 Complaint Summary

Delivery Date: ${updatedComplaintData.deliveryDate}

Product Name: ${updatedComplaintData.productName}

Complaint Reason: ${updatedComplaintData.returnReason}

Order Number: ${updatedComplaintData.orderNumber}

Payment Method: ${updatedComplaintData.paymentMethod}

I'm now verifying your order and analyzing your complaint...
    `.trim();

    addMessage("assistant", summaryMessage);

    // =================================================
    // SEND TO BACKEND
    // =================================================

    await sendComplaintToAI(updatedComplaintData);
  };

  // =====================================================
  // MAIN SEND MESSAGE
  // =====================================================

  const sendMessage = async (messageText = input) => {
    if (
      !messageText ||
      !messageText.trim() ||
      loading
    ) {
      return;
    }

    const cleanedMessage = messageText.trim();

    console.log("User message:", cleanedMessage);

    // =================================================
    // SHOW USER MESSAGE
    // =================================================

    addMessage("user", cleanedMessage);

    // =================================================
    // CLEAR INPUT
    // =================================================

    setInput("");

    // =================================================
    // COMPLAINT COLLECTION MODE
    // =================================================

    if (currentStep < questions.length) {
      await handleComplaintStep(cleanedMessage);
      return;
    }

    // =================================================
    // NORMAL CHAT MODE
    //
    // IMPORTANT:
    // Do NOT send order information again here.
    // Otherwise backend could create another case.
    // =================================================

    setLoading(true);

    try {
      console.log("================================");
      console.log("NORMAL CHAT REQUEST");
      console.log("================================");

      const response = await fetch(
        "http://localhost:5000/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: cleanedMessage,
            history: messages,
            chatId: chatId,
          }),
        }
      );

      console.log(
        "Normal chat backend status:",
        response.status
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Invalid response received from backend."
        );
      }

      console.log(
        "Normal chat backend response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Backend error: ${response.status}`
        );
      }

      if (!data?.reply) {
        throw new Error(
          "No reply received from AI."
        );
      }

      addMessage("assistant", data.reply);
    } catch (error) {
      console.error("Normal chat error:", error);

      addMessage(
        "assistant",
        `Sorry, I am unable to connect to the support system right now.

${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (!loading && input.trim()) {
        sendMessage();
      }
    }
  };

  // =====================================================
  // QUICK ACTIONS
  // =====================================================

  const handleQuickAction = (text) => {
    if (loading) {
      return;
    }

    sendMessage(text);
  };

  // =====================================================
  // RESET CHAT
  // =====================================================

  const resetChat = () => {
    window.location.reload();
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="chatbot-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <div className="chatbot-navbar">

        <div className="logo">

          <div className="logo-icon">
            🛡️
          </div>

          <h2>ResolveAI</h2>

        </div>

        <div className="nav-buttons">

          <button
            className="back-btn"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

          <button
            className="prototype-btn"
            onClick={() => navigate("/admin-login")}
          >
            Admin Dashboard
          </button>

        </div>

      </div>

      {/* =================================================
          MAIN LAYOUT
      ================================================= */}

      <div className="chatbot-layout">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <div className="sidebar">

          <div className="sidebar-title">

            <div className="feature-icon">
              ✨
            </div>

            <h3>ResolveAI</h3>

          </div>

          <p className="sidebar-sub">
            Your AI partner in complaint resolution
          </p>

          {/* Feature 1 */}

          <div className="feature">

            <div className="feature-icon">
              💬
            </div>

            <div>

              <h4>
                Instant Support
              </h4>

              <p>
                Get immediate answers to your queries
              </p>

            </div>

          </div>

          {/* Feature 2 */}

          <div className="feature">

            <div className="feature-icon">
              🛡️
            </div>

            <div>

              <h4>
                Smart Resolution
              </h4>

              <p>
                AI-powered complaint analysis
              </p>

            </div>

          </div>

          {/* Feature 3 */}

          <div className="feature">

            <div className="feature-icon">
              ⚡
            </div>

            <div>

              <h4>
                Fast Processing
              </h4>

              <p>
                Faster complaint resolution
              </p>

            </div>

          </div>

          {/* Feature 4 */}

          <div className="feature">

            <div className="feature-icon">
              🔒
            </div>

            <div>

              <h4>
                Secure & Private
              </h4>

              <p>
                Your complaint data is securely stored
              </p>

            </div>

          </div>

          {/* Progress */}

          <div className="hackathon-card">

            <h5>
              Complaint Progress
            </h5>

            <p>

              {currentStep < questions.length
                ? `${currentStep} of ${questions.length} details collected`
                : "Complaint submitted for AI analysis"}

            </p>

          </div>

        </div>

        {/* =================================================
            CHAT CONTAINER
        ================================================= */}

        <div className="chat-container">

          {/* Chat Header */}

          <div className="chat-header">

            <div className="logo">

              <div className="logo-icon">
                🛡️
              </div>

              <h2>
                Chat with ResolveAI
              </h2>

            </div>

            <div className="online">
              ● Online
            </div>

          </div>

          {/* AI Badge */}

          <div className="ai-badge">
            ⚡ AI that answers. AI that resolves.
          </div>

          {/* =================================================
              CHAT BODY
          ================================================= */}

          <div
            className="chat-body"
            ref={chatBodyRef}
          >

            {messages.map((message, index) => (

              <div
                key={index}
                className={`message ${
                  message.role === "user"
                    ? "user"
                    : "bot"
                }`}
              >

                <div className="message-content">
                  {message.content}
                </div>

                <div className="time">

                  {message.role === "user"
                    ? "You"
                    : "ResolveAI"}

                </div>

              </div>

            ))}

            {/* Loading */}

            {loading && (

              <div className="message bot">

                <div className="message-content">
                  ResolveAI is thinking...
                </div>

                <div className="time">
                  Please wait
                </div>

              </div>

            )}

          </div>

          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <div className="quick-actions">

            <button
              className="quick-btn"
              onClick={() =>
                handleQuickAction(
                  "My product was damaged."
                )
              }
              disabled={loading}
            >
              📦 Damaged product
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                handleQuickAction(
                  "I received the wrong product."
                )
              }
              disabled={loading}
            >
              ❌ Wrong product
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                handleQuickAction(
                  "I want to request a refund."
                )
              }
              disabled={loading}
            >
              🔄 Request a refund
            </button>

            <button
              className="quick-btn"
              onClick={() =>
                handleQuickAction(
                  "I want to talk to a human support representative."
                )
              }
              disabled={loading}
            >
              👤 Talk to human
            </button>

          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="chat-input-area">

            <input
              type="text"
              className="chat-input"

              value={input}

              placeholder={
                currentStep < questions.length
                  ? questions[currentStep].question
                  : "Ask ResolveAI anything..."
              }

              onChange={(event) =>
                setInput(event.target.value)
              }

              onKeyDown={handleKeyDown}

              disabled={loading}
            />

            <button
              className="send-btn"

              onClick={() => sendMessage()}

              disabled={
                loading || !input.trim()
              }

              title="Send message"
            >
              ➤
            </button>

          </div>

          {/* =================================================
              RESET CHAT
          ================================================= */}

          <div
            style={{
              textAlign: "center",
              marginTop: "8px",
            }}
          >

            <button
              onClick={resetChat}
              disabled={loading}

              style={{
                background: "transparent",
                border: "none",
                color: "#8b9cff",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Start New Complaint
            </button>

          </div>

          {/* Footer */}

          <div className="chat-footer">

            🔒 Your complaint information is securely
            processed by ResolveAI.

          </div>

        </div>

      </div>

    </div>
  );
}

export default Chatbot;
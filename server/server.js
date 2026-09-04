import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initializeApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use(cors({ origin: 'https://neetu07072006.github.io' }));
// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());

// =====================================================
// FIREBASE INITIALIZATION
// =====================================================

let db = null;

try {
  const serviceAccountPath = path.join(
    process.cwd(),
    "firebase-service-account.json"
  );

  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      "firebase-service-account.json not found in server folder"
    );
  }

  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, "utf8")
  );

  if (!process.env.FIREBASE_DATABASE_URL) {
    throw new Error(
      "FIREBASE_DATABASE_URL is missing from .env"
    );
  }

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });

  db = getDatabase();

  console.log("================================");
  console.log("Firebase connected successfully");
  console.log("================================");
} catch (error) {
  console.error("================================");
  console.error("Firebase initialization error");
  console.error("================================");
  console.error(error.message);
}

// =====================================================
// GEMINI API
// =====================================================

console.log(
  "Gemini API Key:",
  process.env.GEMINI_API_KEY
    ? "Loaded successfully"
    : "NOT FOUND"
);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// LOAD ORDERS FROM CSV
// =====================================================

const orders = [];

const csvPath = path.join(
  process.cwd(),
  "orders.csv"
);

function loadOrders() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      console.error("orders.csv not found!");
      resolve();
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        orders.push(row);
      })
      .on("end", () => {
        console.log(
          `Orders CSV loaded successfully: ${orders.length} orders`
        );

        resolve();
      })
      .on("error", (error) => {
        console.error("Error reading orders.csv:");
        console.error(error);

        reject(error);
      });
  });
}

// =====================================================
// NORMALIZE VALUE
// =====================================================

function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

// =====================================================
// ORDER VERIFICATION
// =====================================================

function verifyOrder({
  orderId,
  productName,
  deliveryDate,
  paymentMethod,
}) {
  const order = orders.find(
    (item) =>
      normalize(item.orderId) ===
      normalize(orderId)
  );

  if (!order) {
    return {
      verified: false,
      reason: "Order ID not found",
      orderExists: false,
    };
  }

  // ---------------------------------------------------
  // PRODUCT VERIFICATION
  // ---------------------------------------------------

  const productMatches =
    !productName ||
    normalize(order.productName) ===
      normalize(productName);

  // ---------------------------------------------------
  // DELIVERY DATE VERIFICATION
  // ---------------------------------------------------

  const deliveryDateMatches =
    !deliveryDate ||
    normalize(order.deliveryDate) ===
      normalize(deliveryDate);

  // ---------------------------------------------------
  // PAYMENT METHOD VERIFICATION
  // ---------------------------------------------------

  const paymentMethodMatches =
    !paymentMethod ||
    normalize(order.paymentMethod) ===
      normalize(paymentMethod);

  // ---------------------------------------------------
  // ORDER STATUS
  // ---------------------------------------------------

  const delivered =
    normalize(order.status) ===
    "delivered";

  // ---------------------------------------------------
  // OVERALL VERIFICATION
  // ---------------------------------------------------

  const verified =
    productMatches &&
    deliveryDateMatches &&
    paymentMethodMatches &&
    delivered;

  let reason =
    "Order verified successfully";

  if (!productMatches) {
    reason =
      "Product name does not match this order";
  } else if (!deliveryDateMatches) {
    reason =
      "Delivery date does not match this order";
  } else if (!paymentMethodMatches) {
    reason =
      "Payment method does not match this order";
  } else if (!delivered) {
    reason =
      "Order has not been marked as delivered";
  }

  return {
    verified,
    reason,
    orderExists: true,

    order: {
      orderId: order.orderId,
      productName: order.productName,
      customerName: order.customerName,
      orderDate: order.orderDate,
      deliveryDate: order.deliveryDate,
      price: Number(order.price) || 0,
      paymentMethod: order.paymentMethod,
      status: order.status,
    },

    checks: {
      productMatches,
      deliveryDateMatches,
      paymentMethodMatches,
      delivered,
    },
  };
}

// =====================================================
// PRIORITY CALCULATION
// =====================================================

function calculatePriority(price) {
  const amount = Number(price) || 0;

  if (amount < 1000) {
    return "Low";
  }

  if (amount <= 5000) {
    return "Medium";
  }

  return "High";
}

// =====================================================
// RETURN DEADLINE
// Delivery Date + 10 Days
// =====================================================

function calculateReturnDeadline(deliveryDate) {
  if (!deliveryDate) {
    return null;
  }

  const date = new Date(deliveryDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setDate(date.getDate() + 10);

  return date
    .toISOString()
    .split("T")[0];
}

// =====================================================
// SYSTEM INSTRUCTION
// =====================================================

const SYSTEM_INSTRUCTION = `
You are ResolveAI, an intelligent customer complaint resolution assistant.

Your responsibilities are:

1. Help customers with damaged products.
2. Help with defective products.
3. Help with refund requests.
4. Help with replacement requests.
5. Help with wrong or missing products.
6. Help with delivery complaints.
7. Collect relevant information needed to resolve a complaint.

For complaint processing, collect when relevant:

- Order ID
- Product name
- Delivery date
- Reason for return
- Payment method
- Order Price

Important rules:

- Be polite and empathetic.
- Clearly understand the customer's problem.
- Ask only for information that is actually needed.
- Never invent order information.
- Never claim that a refund has been processed unless the backend confirms it.
- Never promise a refund automatically.
- If verification fails, explain that the order information could not be verified.
- If human approval is required, explain that the case will be escalated.
- Give the customer a clear next step.
- Keep answers concise and professional.
- You are an AI support assistant, not a human employee.
`;

// =====================================================
// CHAT ENDPOINT
// =====================================================

app.post("/api/chat", async (req, res) => {
  console.log("");
  console.log("================================");
  console.log("NEW CHAT REQUEST");
  console.log("================================");

  try {
    const {
      message,
      history = [],
      chatId,
      orderId,
      productName,
      deliveryDate,
      paymentMethod,
      returnReason,
      name,
      email,
    } = req.body;

    console.log("Customer message:", message);
    console.log("Chat ID:", chatId);
    console.log("Order ID:", orderId);
    console.log("Product:", productName);

    // =================================================
    // VALIDATION
    // =================================================

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    if (!chatId) {
      return res.status(400).json({
        error: "Chat ID is required",
      });
    }

    if (!db) {
      return res.status(500).json({
        error: "Firebase database is not connected",
      });
    }

    // =================================================
    // ORDER VERIFICATION
    // =================================================

    let verification = null;

    if (orderId) {
      verification = verifyOrder({
        orderId,
        productName,
        deliveryDate,
        paymentMethod,
      });

      console.log(
        "Order verification:",
        verification
      );
    } else {
      console.log(
        "No Order ID supplied."
      );
    }

    // =================================================
    // SAVE CUSTOMER MESSAGE
    // =================================================

    await db
      .ref(`chats/${chatId}/messages`)
      .push({
        role: "user",
        content: message,
        timestamp: Date.now(),
      });

    // =================================================
    // PREPARE CONVERSATION
    // =================================================

    const contents = [];

    for (const item of history) {
      if (!item.content) {
        continue;
      }

      contents.push({
        role:
          item.role === "assistant"
            ? "model"
            : "user",

        parts: [
          {
            text: item.content,
          },
        ],
      });
    }

    // =================================================
    // CUSTOMER CONTEXT
    // =================================================

    let customerContext = message;

    if (verification) {
      customerContext += `

BACKEND ORDER VERIFICATION RESULT:

Verified: ${verification.verified}

Reason: ${verification.reason}
`;

      if (verification.order) {
        const price =
          Number(
            verification.order.price
          ) || 0;

        const priority =
          calculatePriority(price);

        const returnDeadline =
          calculateReturnDeadline(
            verification.order.deliveryDate
          );

        customerContext += `

VERIFIED ORDER INFORMATION:

Order ID: ${verification.order.orderId}
Product: ${verification.order.productName}
Customer: ${verification.order.customerName}
Order Date: ${verification.order.orderDate}
Delivery Date: ${verification.order.deliveryDate}
Price: ₹${price}
Payment Method: ${verification.order.paymentMethod}
Status: ${verification.order.status}

CASE PRIORITY: ${priority}

RETURN DEADLINE: ${returnDeadline}
`;
      }
    }

    if (returnReason) {
      customerContext += `

CUSTOMER RETURN REASON:

${returnReason}
`;
    }

    contents.push({
      role: "user",

      parts: [
        {
          text: customerContext,
        },
      ],
    });

    // =================================================
    // GEMINI REQUEST
    // =================================================

    console.log(
      "Sending request to Gemini..."
    );

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",

        contents,

        config: {
          systemInstruction:
            SYSTEM_INSTRUCTION,

          temperature: 0.4,

          maxOutputTokens: 500,
        },
      });

    console.log(
      "Gemini response received"
    );

    // =================================================
    // EXTRACT RESPONSE
    // =================================================

    const reply = response.text;

    if (!reply) {
      throw new Error(
        "Gemini returned an empty response"
      );
    }

    console.log("AI:", reply);

    // =================================================
    // SAVE AI RESPONSE
    // =================================================

    await db
      .ref(`chats/${chatId}/messages`)
      .push({
        role: "assistant",
        content: reply,
        timestamp: Date.now(),
      });

    // =================================================
    // CASE INFORMATION
    // =================================================

    let price = 0;
    let priority = "Unknown";

    let returnDeadline = null;

    let caseStatus =
      "Information Required";

    let verificationStatus =
      "Not Started";

    let verificationReason =
      "Order information has not been provided yet.";

    // =================================================
    // VERIFICATION RESULT
    // =================================================

    if (verification) {
      verificationStatus =
        verification.verified
          ? "Verified"
          : "Failed";

      verificationReason =
        verification.reason;

      if (verification.order) {
        price =
          Number(
            verification.order.price
          ) || 0;

        priority =
          calculatePriority(price);

        returnDeadline =
          calculateReturnDeadline(
            verification.order.deliveryDate
          );
      }

      caseStatus =
        verification.verified
          ? "Pending Approval"
          : "Verification Failed";
    }

    // =================================================
    // CASE DATA
    // =================================================

    const caseData = {
      chatId,

      name:
        name ||
        verification?.order?.customerName ||
        "",

      email:
        email || "",

      orderId:
        verification?.order?.orderId ||
        orderId ||
        "",

      productName:
        verification?.order?.productName ||
        productName ||
        "",

      customerName:
        verification?.order?.customerName ||
        name ||
        "",

      deliveryDate:
        verification?.order?.deliveryDate ||
        deliveryDate ||
        "",

      paymentMethod:
        verification?.order?.paymentMethod ||
        paymentMethod ||
        "",

      productPrice: price,

      returnReason:
        returnReason || "",

      complaint: message,

      verificationStatus,

      verificationReason,

      priority,

      returnDeadline,

      // ---------------------------------------------
      // APPROVAL INFORMATION
      // ---------------------------------------------

      status: caseStatus,

      aiRecommendation:
        verification?.verified
          ? "Human Review Required"
          : "Information Required",

      humanApproval: false,

      requiresApproval:
        verification?.verified || false,

      adminDecision: "",

      adminReason: "",

      approvedAt: null,

      declinedAt: null,

      // ---------------------------------------------
      // TIMESTAMPS
      // ---------------------------------------------

      createdAt: Date.now(),

      updatedAt: Date.now(),
    };

    // =================================================
    // SAVE UNIQUE CASE
    // =================================================

    const caseRef = await db
      .ref("cases")
      .push(caseData);

    const caseId = caseRef.key;

    console.log("");
    console.log("================================");
    console.log("CASE SAVED SUCCESSFULLY");
    console.log("================================");
    console.log("Case ID:", caseId);
    console.log("Chat ID:", chatId);
    console.log("Order ID:", caseData.orderId);
    console.log(
      "Verification:",
      verificationStatus
    );
    console.log(
      "Priority:",
      priority
    );
    console.log(
      "Status:",
      caseStatus
    );
    console.log("================================");

    // =================================================
    // SEND RESPONSE
    // =================================================

    res.json({
      reply,

      verification,

      case: {
        ...caseData,
        caseId,
      },
    });

  } catch (error) {
    console.error("");
    console.error("================================");
    console.error("SERVER ERROR");
    console.error("================================");
    console.error(error);

    res.status(500).json({
      error:
        error?.message ||
        "Gemini request failed",
    });
  }
});

// =====================================================
// ORDER VERIFICATION API
// =====================================================

app.post(
  "/api/verify-order",
  (req, res) => {
    try {
      const {
        orderId,
        productName,
        deliveryDate,
        paymentMethod,
      } = req.body;

      if (!orderId) {
        return res.status(400).json({
          error: "Order ID is required",
        });
      }

      const result = verifyOrder({
        orderId,
        productName,
        deliveryDate,
        paymentMethod,
      });

      res.json(result);

    } catch (error) {
      console.error(
        "Order verification error:",
        error
      );

      res.status(500).json({
        error:
          "Order verification failed",
      });
    }
  }
);

// =====================================================
// GET ALL ORDERS
// =====================================================

app.get("/api/orders", (req, res) => {
  res.json({
    count: orders.length,
    orders,
  });
});

// =====================================================
// GET ALL COMPLAINTS
// ADMIN DASHBOARD
// =====================================================

app.get(
  "/api/complaints",
  async (req, res) => {
    try {
      console.log("");
      console.log(
        "================================"
      );
      console.log(
        "ADMIN DASHBOARD REQUEST"
      );
      console.log(
        "Reading cases from Firebase..."
      );
      console.log(
        "================================"
      );

      if (!db) {
        return res.status(500).json({
          error:
            "Firebase database is not connected",
        });
      }

      const snapshot = await db
        .ref("cases")
        .once("value");

      if (!snapshot.exists()) {
        return res.json({
          complaints: [],
          total: 0,
          count: 0,
        });
      }

      const data = snapshot.val();

      const complaints =
        Object.entries(data).map(
          ([id, complaint]) => {

            const price =
              Number(
                complaint.productPrice ??
                  complaint.price ??
                  0
              ) || 0;

            return {
              id,

              caseId: id,

              // ---------------------------------------
              // CUSTOMER
              // ---------------------------------------

              name:
                complaint.name ||
                complaint.customerName ||
                "",

              customerName:
                complaint.customerName ||
                complaint.name ||
                "",

              email:
                complaint.email ||
                "",

              // ---------------------------------------
              // PRODUCT
              // ---------------------------------------

              productName:
                complaint.productName ||
                complaint.product ||
                "Not provided",

              productPrice: price,

              // ---------------------------------------
              // ORDER
              // ---------------------------------------

              orderNumber:
                complaint.orderId ||
                complaint.orderNumber ||
                "Not provided",

              orderId:
                complaint.orderId ||
                "",

              // ---------------------------------------
              // DELIVERY
              // ---------------------------------------

              deliveryDate:
                complaint.deliveryDate ||
                complaint.delivery_date ||
                "",

              // ---------------------------------------
              // PAYMENT
              // ---------------------------------------

              paymentMethod:
                complaint.paymentMethod ||
                "Not provided",

              // ---------------------------------------
              // COMPLAINT
              // ---------------------------------------

              reason:
                complaint.returnReason ||
                complaint.reason ||
                complaint.reasonForReturn ||
                complaint.complaint ||
                complaint.message ||
                "No description",

              complaint:
                complaint.complaint ||
                complaint.message ||
                "",

              returnReason:
                complaint.returnReason ||
                "",

              // ---------------------------------------
              // VERIFICATION
              // ---------------------------------------

              verificationStatus:
                complaint.verificationStatus ||
                "Unknown",

              verificationReason:
                complaint.verificationReason ||
                "",

              // ---------------------------------------
              // PRIORITY
              // ---------------------------------------

              priority:
                complaint.priority ||
                calculatePriority(price),

              // ---------------------------------------
              // RETURN DEADLINE
              // ---------------------------------------

              eligibleDate:
                complaint.returnDeadline ||
                calculateReturnDeadline(
                  complaint.deliveryDate
                ),

              returnDeadline:
                complaint.returnDeadline ||
                calculateReturnDeadline(
                  complaint.deliveryDate
                ),

              // ---------------------------------------
              // AI
              // ---------------------------------------

              aiRecommendation:
                complaint.aiRecommendation ||
                "Human Review",

              // ---------------------------------------
              // APPROVAL
              // ---------------------------------------

              humanApproval:
                complaint.humanApproval ??
                false,

              requiresApproval:
                complaint.requiresApproval ??
                false,

              adminDecision:
                complaint.adminDecision ||
                "",

              adminReason:
                complaint.adminReason ||
                "",

              approvedAt:
                complaint.approvedAt ||
                null,

              declinedAt:
                complaint.declinedAt ||
                null,

              // ---------------------------------------
              // STATUS
              // ---------------------------------------

              status:
                complaint.status ||
                "Pending",

              // ---------------------------------------
              // CHAT
              // ---------------------------------------

              chatId:
                complaint.chatId ||
                "",

              // ---------------------------------------
              // TIMESTAMP
              // ---------------------------------------

              createdAt:
                complaint.createdAt ||
                complaint.timestamp ||
                null,

              updatedAt:
                complaint.updatedAt ||
                null,
            };
          }
        );

      // =================================================
      // SORT
      // HIGH → MEDIUM → LOW → UNKNOWN
      // =================================================

      const priorityOrder = {
        High: 1,
        Medium: 2,
        Low: 3,
        Unknown: 4,
      };

      complaints.sort(
        (a, b) => {

          const priorityDifference =
            (priorityOrder[a.priority] || 4) -
            (priorityOrder[b.priority] || 4);

          if (priorityDifference !== 0) {
            return priorityDifference;
          }

          return (
            Number(b.productPrice || 0) -
            Number(a.productPrice || 0)
          );
        }
      );

      console.log(
        `Successfully loaded ${complaints.length} cases`
      );

      res.json({
        complaints,
        total: complaints.length,
        count: complaints.length,
      });

    } catch (error) {

      console.error("");
      console.error(
        "================================"
      );
      console.error(
        "ERROR LOADING COMPLAINTS"
      );
      console.error(
        "================================"
      );
      console.error(error);

      res.status(500).json({
        error:
          "Failed to load complaints",

        message:
          error?.message ||
          "Unknown Firebase error",

        complaints: [],

        total: 0,
      });
    }
  }
);

// =====================================================
// GET SINGLE CASE
// =====================================================

app.get(
  "/api/complaints/:caseId",
  async (req, res) => {
    try {

      if (!db) {
        return res.status(500).json({
          error:
            "Firebase database is not connected",
        });
      }

      const { caseId } = req.params;

      const snapshot = await db
        .ref(`cases/${caseId}`)
        .once("value");

      if (!snapshot.exists()) {
        return res.status(404).json({
          error: "Case not found",
        });
      }

      res.json({
        caseId,
        case: snapshot.val(),
      });

    } catch (error) {

      console.error(
        "Get case error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to load case",
      });
    }
  }
);

// =====================================================
// APPROVE COMPLAINT
// =====================================================

app.put(
  "/api/complaints/:caseId/approve",
  async (req, res) => {

    try {

      console.log("");
      console.log(
        "================================"
      );
      console.log("ADMIN APPROVAL REQUEST");
      console.log(
        "================================"
      );

      if (!db) {
        return res.status(500).json({
          error:
            "Firebase database is not connected",
        });
      }

      const { caseId } = req.params;

      const {
        adminReason = "Request approved by administrator",
      } = req.body;

      const caseRef = db.ref(
        `cases/${caseId}`
      );

      const snapshot =
        await caseRef.once("value");

      if (!snapshot.exists()) {
        return res.status(404).json({
          error: "Complaint case not found",
        });
      }

      const existingCase =
        snapshot.val();

      // ---------------------------------------------
      // PREVENT DUPLICATE APPROVAL
      // ---------------------------------------------

      if (
        existingCase.status ===
        "Approved"
      ) {
        return res.status(400).json({
          error:
            "This complaint has already been approved",
          case:
            existingCase,
        });
      }

      // ---------------------------------------------
      // ONLY VERIFIED CASES SHOULD BE APPROVED
      // ---------------------------------------------

      if (
        existingCase.verificationStatus !==
        "Verified"
      ) {
        return res.status(400).json({
          error:
            "Only verified complaints can be approved",
          verificationStatus:
            existingCase.verificationStatus,
        });
      }

      const now = Date.now();

      const updates = {

        status: "Approved",

        humanApproval: true,

        requiresApproval: false,

        adminDecision: "Approved",

        adminReason,

        approvedAt: now,

        updatedAt: now,

        aiRecommendation:
          "Approved by Human Administrator",
      };

      await caseRef.update(updates);

      const updatedSnapshot =
        await caseRef.once("value");

      console.log(
        "CASE APPROVED:",
        caseId
      );

      console.log(
        "================================"
      );

      res.json({
        success: true,

        message:
          "Complaint approved successfully",

        caseId,

        case:
          updatedSnapshot.val(),
      });

    } catch (error) {

      console.error(
        "Approve complaint error:",
        error
      );

      res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Failed to approve complaint",
      });
    }
  }
);

// =====================================================
// DECLINE COMPLAINT
// =====================================================

app.put(
  "/api/complaints/:caseId/decline",
  async (req, res) => {

    try {

      console.log("");
      console.log(
        "================================"
      );
      console.log("ADMIN DECLINE REQUEST");
      console.log(
        "================================"
      );

      if (!db) {
        return res.status(500).json({
          error:
            "Firebase database is not connected",
        });
      }

      const { caseId } = req.params;

      const {
        adminReason = "Request declined by administrator",
      } = req.body;

      const caseRef = db.ref(
        `cases/${caseId}`
      );

      const snapshot =
        await caseRef.once("value");

      if (!snapshot.exists()) {
        return res.status(404).json({
          error: "Complaint case not found",
        });
      }

      const existingCase =
        snapshot.val();

      // ---------------------------------------------
      // PREVENT DUPLICATE DECLINE
      // ---------------------------------------------

      if (
        existingCase.status ===
        "Declined"
      ) {
        return res.status(400).json({
          error:
            "This complaint has already been declined",
          case:
            existingCase,
        });
      }

      const now = Date.now();

      const updates = {

        status: "Declined",

        humanApproval: false,

        requiresApproval: false,

        adminDecision: "Declined",

        adminReason,

        declinedAt: now,

        updatedAt: now,

        aiRecommendation:
          "Declined by Human Administrator",
      };

      await caseRef.update(updates);

      const updatedSnapshot =
        await caseRef.once("value");

      console.log(
        "CASE DECLINED:",
        caseId
      );

      console.log(
        "================================"
      );

      res.json({
        success: true,

        message:
          "Complaint declined successfully",

        caseId,

        case:
          updatedSnapshot.val(),
      });

    } catch (error) {

      console.error(
        "Decline complaint error:",
        error
      );

      res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Failed to decline complaint",
      });
    }
  }
);

// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================

app.get(
  "/api/dashboard-stats",
  async (req, res) => {

    try {

      if (!db) {
        return res.status(500).json({
          error:
            "Firebase database is not connected",
        });
      }

      const snapshot = await db
        .ref("cases")
        .once("value");

      if (!snapshot.exists()) {
        return res.json({
          totalCases: 0,
          pending: 0,
          underReview: 0,
          approved: 0,
          declined: 0,
          verificationFailed: 0,
        });
      }

      const data = snapshot.val();

      const cases =
        Object.values(data);

      const stats = {
        totalCases: cases.length,

        pending:
          cases.filter(
            (item) =>
              item.status ===
              "Pending Approval"
          ).length,

        underReview:
          cases.filter(
            (item) =>
              item.status ===
              "Under Review"
          ).length,

        approved:
          cases.filter(
            (item) =>
              item.status ===
              "Approved"
          ).length,

        declined:
          cases.filter(
            (item) =>
              item.status ===
              "Declined"
          ).length,

        verificationFailed:
          cases.filter(
            (item) =>
              item.status ===
              "Verification Failed"
          ).length,
      };

      res.json(stats);

    } catch (error) {

      console.error(
        "Dashboard statistics error:",
        error
      );

      res.status(500).json({
        error:
          "Failed to load dashboard statistics",
      });
    }
  }
);

// =====================================================
// TEST COMPLAINT ENDPOINT
// =====================================================

app.post(
  "/api/test-complaint",
  async (req, res) => {

    try {

      if (!db) {
        return res.status(500).json({
          error:
            "Firebase database is not connected",
        });
      }

      const productPrice =
        Number(
          req.body.productPrice
        ) || 1000;

      const testCase = {

        chatId:
          req.body.chatId ||
          `test-${Date.now()}`,

        name:
          req.body.name ||
          "Test Customer",

        email:
          req.body.email ||
          "test@example.com",

        orderId:
          req.body.orderId ||
          "",

        productName:
          req.body.productName ||
          "Test Product",

        deliveryDate:
          req.body.deliveryDate ||
          "",

        paymentMethod:
          req.body.paymentMethod ||
          "Not provided",

        productPrice,

        returnReason:
          req.body.returnReason ||
          "Product damaged",

        verificationStatus:
          "Verified",

        verificationReason:
          "Test complaint verified",

        priority:
          calculatePriority(
            productPrice
          ),

        returnDeadline:
          calculateReturnDeadline(
            req.body.deliveryDate
          ),

        status:
          "Pending Approval",

        aiRecommendation:
          "Human Review Required",

        humanApproval:
          false,

        requiresApproval:
          true,

        adminDecision:
          "",

        adminReason:
          "",

        approvedAt:
          null,

        declinedAt:
          null,

        complaint:
          req.body.complaint ||
          "Test complaint",

        createdAt:
          Date.now(),

        updatedAt:
          Date.now(),
      };

      const caseRef =
        await db
          .ref("cases")
          .push(testCase);

      console.log(
        "TEST CASE CREATED:",
        caseRef.key
      );

      res.json({

        success: true,

        message:
          "Test complaint created successfully",

        caseId:
          caseRef.key,

        case:
          testCase,
      });

    } catch (error) {

      console.error(
        "Test complaint error:",
        error
      );

      res.status(500).json({

        success: false,

        error:
          error?.message ||
          "Failed to create test complaint",
      });
    }
  }
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({

      status: "OK",

      geminiKey:
        process.env.GEMINI_API_KEY
          ? "Loaded"
          : "Missing",

      firebase:
        db
          ? "Connected"
          : "Not Connected",

      ordersLoaded:
        orders.length,

      server:
        `http://localhost:${PORT}`,
    });
  }
);

// =====================================================
// START SERVER
// =====================================================

async function startServer() {

  try {

    await loadOrders();

    app.listen(
      PORT,
      () => {

        console.log("");

        console.log(
          "================================"
        );

        console.log(
          "ResolveAI Backend Started"
        );

        console.log(
          "================================"
        );

        console.log(
          `Server: http://localhost:${PORT}`
        );

        console.log(
          `Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          `Orders: http://localhost:${PORT}/api/orders`
        );

        console.log(
          `Complaints: http://localhost:${PORT}/api/complaints`
        );

        console.log(
          `Dashboard Stats: http://localhost:${PORT}/api/dashboard-stats`
        );

        console.log(
          "Approval: PUT /api/complaints/:caseId/approve"
        );

        console.log(
          "Decline: PUT /api/complaints/:caseId/decline"
        );

        console.log(
          `Test: http://localhost:${PORT}/api/test-complaint`
        );

        console.log(
          `Loaded Orders: ${orders.length}`
        );

        console.log(
          `Firebase: ${
            db
              ? "Connected"
              : "Not Connected"
          }`
        );

        console.log(
          "================================"
        );

        console.log("");
      }
    );

  } catch (error) {

    console.error(
      "Unable to start server:",
      error
    );
  }
}

startServer();
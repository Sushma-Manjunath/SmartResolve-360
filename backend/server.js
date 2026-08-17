const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// ==================================================
// MIDDLEWARE
// ==================================================

app.use(express.json({ limit: "10mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// ==================================================
// DATABASE
// ==================================================

const dataFolder = path.join(__dirname, "data");
const dataFile = path.join(dataFolder, "complaints.json");

if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder, { recursive: true });
}

// ==================================================
// INITIAL DEMO DATA
// ==================================================

const initialComplaints = [
  {
    id: 101,
    name: "Anu",
    room: "A-203",
    phone: "9876543210",
    category: "Plumbing",
    priority: "High",
    description:
      "Water leaking heavily from bathroom pipe.",
    date: "2026-08-15",
    status: "Pending",
    technician: "Arun",
    photo: ""
  },

  {
    id: 102,
    name: "Rahul",
    room: "B-101",
    phone: "9123456789",
    category: "Electrical",
    priority: "Urgent",
    description:
      "Sparking switch near main board.",
    date: "2026-08-16",
    status: "In Progress",
    technician: "Raj Kumar",
    photo: ""
  },

  {
    id: 103,
    name: "Kavya",
    room: "C-402",
    phone: "9988776655",
    category: "Internet",
    priority: "Medium",
    description:
      "Wi-Fi router not connecting to fiber box.",
    date: "2026-08-14",
    status: "Resolved",
    technician: "Priya",
    photo: ""
  }
];

// ==================================================
// CREATE DATABASE IF NEEDED
// ==================================================

if (!fs.existsSync(dataFile)) {
  fs.writeFileSync(
    dataFile,
    JSON.stringify(initialComplaints, null, 2),
    "utf8"
  );
}

// ==================================================
// DATABASE HELPERS
// ==================================================

function getComplaints() {
  try {
    if (!fs.existsSync(dataFile)) {
      saveComplaints(initialComplaints);
    }

    const data = fs.readFileSync(
      dataFile,
      "utf8"
    );

    const complaints = JSON.parse(data);

    if (!Array.isArray(complaints)) {
      return [];
    }

    return complaints;
  } catch (error) {
    console.error(
      "Error reading complaints:",
      error
    );

    return [];
  }
}

function saveComplaints(complaints) {
  try {
    fs.writeFileSync(
      dataFile,
      JSON.stringify(complaints, null, 2),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error(
      "Error saving complaints:",
      error
    );

    return false;
  }
}

// ==================================================
// VALIDATION HELPERS
// ==================================================

const validStatuses = [
  "Pending",
  "In Progress",
  "Resolved",
  "Reopened"
];

const validPriorities = [
  "Low",
  "Medium",
  "High",
  "Urgent"
];

const validCategories = [
  "Plumbing",
  "Electrical",
  "Water Supply",
  "Internet",
  "Housekeeping",
  "Maintenance",
  "Security",
  "Other"
];

function validateComplaint(body) {
  const {
    name,
    room,
    phone,
    category,
    priority,
    description,
    date
  } = body;

  if (
    !name ||
    !room ||
    !phone ||
    !category ||
    !priority ||
    !description ||
    !date
  ) {
    return "Please provide all required complaint details.";
  }

  if (!/^\d{10}$/.test(String(phone))) {
    return "Phone number must contain exactly 10 digits.";
  }

  if (!validCategories.includes(category)) {
    return "Invalid complaint category.";
  }

  if (!validPriorities.includes(priority)) {
    return "Invalid complaint priority.";
  }

  if (String(description).trim().length < 5) {
    return "Description must contain at least 5 characters.";
  }

  return null;
}

// ==================================================
// TEST ROUTE
// ==================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "SmartResolve 360 Backend is running!",
    database: dataFile
  });
});

// ==================================================
// GET ALL COMPLAINTS
// GET /api/complaints
// ==================================================

app.get("/api/complaints", (req, res) => {
  const complaints = getComplaints();

  res.json({
    success: true,
    count: complaints.length,
    complaints
  });
});

// ==================================================
// GET ONE COMPLAINT
// GET /api/complaints/:id
// ==================================================

app.get("/api/complaints/:id", (req, res) => {
  const complaints = getComplaints();

  const id = Number(req.params.id);

  const complaint = complaints.find(
    c => Number(c.id) === id
  );

  if (!complaint) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  res.json({
    success: true,
    complaint
  });
});

// ==================================================
// CREATE COMPLAINT
// POST /api/complaints
// ==================================================

app.post("/api/complaints", (req, res) => {
  const complaints = getComplaints();

  const validationError =
    validateComplaint(req.body);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError
    });
  }

  const {
    name,
    room,
    phone,
    category,
    priority,
    description,
    date,
    status,
    technician,
    photo,
    extra
  } = req.body;

  const maxId = complaints.reduce(
    (max, complaint) =>
      Math.max(max, Number(complaint.id)),
    100
  );

  const newComplaint = {
    id: maxId + 1,

    name: String(name).trim(),

    room: String(room)
      .trim()
      .toUpperCase(),

    phone: String(phone).trim(),

    category,

    priority,

    description: String(description).trim(),

    date,

    extra: extra || "",

    status:
      status && validStatuses.includes(status)
        ? status
        : "Pending",

    technician:
      technician || "Not Assigned",

    photo: photo || ""
  };

  complaints.push(newComplaint);

  if (!saveComplaints(complaints)) {
    return res.status(500).json({
      success: false,
      message:
        "Could not save complaint to database."
    });
  }

  res.status(201).json({
    success: true,
    message:
      "Complaint created successfully.",
    complaint: newComplaint
  });
});

// ==================================================
// UPDATE COMPLAINT
// PUT /api/complaints/:id
// ==================================================

app.put("/api/complaints/:id", (req, res) => {
  const complaints = getComplaints();

  const id = Number(req.params.id);

  const index = complaints.findIndex(
    c => Number(c.id) === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  const existing = complaints[index];

  const updates = {
    ...req.body
  };

  // ----------------------------------------------
  // Validate phone if supplied
  // ----------------------------------------------

  if (
    updates.phone !== undefined &&
    !/^\d{10}$/.test(
      String(updates.phone)
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Phone number must contain exactly 10 digits."
    });
  }

  // ----------------------------------------------
  // Validate category
  // ----------------------------------------------

  if (
    updates.category !== undefined &&
    !validCategories.includes(
      updates.category
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid category."
    });
  }

  // ----------------------------------------------
  // Validate priority
  // ----------------------------------------------

  if (
    updates.priority !== undefined &&
    !validPriorities.includes(
      updates.priority
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid priority."
    });
  }

  // ----------------------------------------------
  // Validate status
  // ----------------------------------------------

  if (
    updates.status !== undefined &&
    !validStatuses.includes(
      updates.status
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid status."
    });
  }

  // ----------------------------------------------
  // Normalize room
  // ----------------------------------------------

  if (updates.room !== undefined) {
    updates.room = String(
      updates.room
    )
      .trim()
      .toUpperCase();
  }

  // ----------------------------------------------
  // Normalize strings
  // ----------------------------------------------

  if (updates.name !== undefined) {
    updates.name =
      String(updates.name).trim();
  }

  if (updates.description !== undefined) {
    updates.description =
      String(updates.description).trim();
  }

  if (updates.phone !== undefined) {
    updates.phone =
      String(updates.phone).trim();
  }

  // ----------------------------------------------
  // NEVER allow ID to change
  // ----------------------------------------------

  delete updates.id;

  complaints[index] = {
    ...existing,
    ...updates,
    id
  };

  if (!saveComplaints(complaints)) {
    return res.status(500).json({
      success: false,
      message:
        "Could not save complaint update."
    });
  }

  res.json({
    success: true,
    message:
      "Complaint updated successfully.",
    complaint: complaints[index]
  });
});

// ==================================================
// DELETE COMPLAINT
// DELETE /api/complaints/:id
// ==================================================

app.delete("/api/complaints/:id", (req, res) => {
  const complaints = getComplaints();

  const id = Number(req.params.id);

  const index = complaints.findIndex(
    c => Number(c.id) === id
  );

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Complaint not found."
    });
  }

  const deletedComplaint =
    complaints[index];

  complaints.splice(index, 1);

  if (!saveComplaints(complaints)) {
    return res.status(500).json({
      success: false,
      message:
        "Could not delete complaint."
    });
  }

  res.json({
    success: true,
    message:
      "Complaint deleted successfully.",
    complaint: deletedComplaint
  });
});

// ==================================================
// RESET DEMO DATA
// POST /api/reset
// ==================================================

app.post("/api/reset", (req, res) => {
  const resetData =
    initialComplaints.map(c => ({
      ...c
    }));

  if (!saveComplaints(resetData)) {
    return res.status(500).json({
      success: false,
      message:
        "Could not reset complaint data."
    });
  }

  res.json({
    success: true,
    message:
      "Complaint data reset successfully.",
    count: resetData.length,
    complaints: resetData
  });
});

// ==================================================
// START SERVER
// ==================================================

app.listen(PORT, () => {
  console.log(
    "=========================================="
  );

  console.log(
    `SmartResolve 360 Backend`
  );

  console.log(
    `Running on http://localhost:${PORT}`
  );

  console.log(
    `Database: ${dataFile}`
  );

  console.log(
    "=========================================="
  );
});
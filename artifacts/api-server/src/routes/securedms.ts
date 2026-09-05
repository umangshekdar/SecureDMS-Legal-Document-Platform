import { Router, type IRouter, type Request, type Response } from "express";
import { createHash } from "node:crypto";
import {
  CreateCaseBody,
  LoginBody,
  UploadDocumentBody,
} from "@workspace/api-zod";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  active: boolean;
};

type CaseRecord = {
  id: string;
  title: string;
  category: string;
  station: string;
  officer: string;
  opened: string;
  status: string;
  documents: number;
  activity: string;
  description: string;
  assigned: string[];
  dates: { label: string; value: string }[];
};

type Version = {
  version: string;
  createdBy: string;
  timestamp: string;
  hash: string;
  change: string;
  integrity: string;
};

type DocumentRecord = {
  id: string;
  caseId: string;
  title: string;
  type: string;
  fileName: string;
  version: string;
  uploadedBy: string;
  date: string;
  integrity: string;
  signature: string;
  hash: string;
  classification: string;
  confidence: number;
  size: string;
  confidentiality: string;
  ocrText: string;
  originalHash: string;
  currentHash: string;
  signedBy: string;
  versions: Version[];
};

type AuditRecord = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  caseId: string;
  document: string;
  device: string;
  status: string;
};

const users: User[] = [
  { id: "u-1", name: "Rajiv Sharma", email: "officer@demo.gov", role: "Police Officer", initials: "RS", active: true },
  { id: "u-2", name: "Anita Verma", email: "forensic@demo.gov", role: "Forensic Officer", initials: "AV", active: true },
  { id: "u-3", name: "Vikram Nair", email: "legal@demo.gov", role: "Legal / Prosecution Officer", initials: "VN", active: true },
  { id: "u-4", name: "Meera Kapoor", email: "admin@demo.gov", role: "Administrator", initials: "MK", active: true },
];

const cases: CaseRecord[] = [
  ["CR-2026-01025", "Vehicle Theft Investigation", "Property Crime", "Central Police Station", "Inspector Rajiv Sharma", "12 Aug 2026", "Active", "12 min ago"],
  ["CR-2026-00987", "Financial Fraud Investigation", "Economic Offence", "North District Station", "Inspector Priya Menon", "08 Aug 2026", "Under Review", "38 min ago"],
  ["CR-2026-00842", "Cyber Crime Investigation", "Cyber Crime", "Digital Crime Cell", "Inspector Arjun Rao", "29 Jul 2026", "Active", "1 hr ago"],
  ["CR-2026-00731", "Missing Person Investigation", "Missing Person", "East Zone Station", "Inspector Neha Joshi", "16 Jul 2026", "Closed", "Yesterday"],
  ["CR-2026-00688", "Warehouse Burglary", "Property Crime", "South Station", "Inspector Karan Malhotra", "04 Jul 2026", "Active", "2 days ago"],
  ["CR-2026-00610", "Identity Theft Complaint", "Cyber Crime", "Central Police Station", "Inspector Rajiv Sharma", "26 Jun 2026", "Under Review", "3 days ago"],
  ["CR-2026-00572", "Road Safety Investigation", "Traffic Incident", "West Traffic Unit", "Inspector Leena Das", "18 Jun 2026", "Active", "4 days ago"],
  ["CR-2026-00494", "Counterfeit Documents", "Economic Offence", "North District Station", "Inspector Priya Menon", "11 Jun 2026", "Closed", "Last week"],
  ["CR-2026-00386", "Assault Investigation", "Violent Crime", "East Zone Station", "Inspector Neha Joshi", "03 Jun 2026", "Under Review", "Last week"],
  ["CR-2026-00244", "Online Harassment Report", "Cyber Crime", "Digital Crime Cell", "Inspector Arjun Rao", "22 May 2026", "Closed", "12 days ago"],
].map(([id, title, category, station, officer, opened, status, activity], index) => ({
  id, title, category, station, officer, opened, status, activity,
  documents: index === 0 ? 7 : 3 + (index % 5),
  description: `A fictional ${category.toLowerCase()} investigation coordinated through SecureDMS for demonstration purposes. Records are simulated and do not represent an official government case.`,
  assigned: [officer, index % 2 === 0 ? "Anita Verma" : "Vikram Nair"],
  dates: [
    { label: "Case opened", value: opened },
    { label: "Last activity", value: activity },
    { label: "Next review", value: index % 2 === 0 ? "22 Aug 2026" : "26 Aug 2026" },
  ],
}));

const primaryHash = "8c7f1a4de29b4baf6fd1c8e12f0b9a31";
const tamperedHash = "91ab4e0c6a2d97f13e85b7a44acb72fe";
const ocrText = "FIRST INFORMATION REPORT\nCase CR-2026-01025\nDate: 12 August 2026\nPolice Station: Central Police Station\nA vehicle theft was reported in the central district. Investigation initiated by Inspector Rajiv Sharma.";

const makeDocument = (index: number, caseId = cases[index % cases.length].id): DocumentRecord => {
  const isFir = index === 0;
  const hash = isFir ? primaryHash : createHash("sha256").update(`securedms-demo-${index}`).digest("hex");
  const type = isFir ? "FIR" : ["Investigation Report", "Witness Statement", "Forensic Report", "Vehicle Inspection Report", "Legal Notice"][index % 5];
  return {
    id: isFir ? "doc-fir-1025" : `doc-${String(index + 1).padStart(3, "0")}`,
    caseId,
    title: isFir ? "First Information Report" : type,
    type,
    fileName: isFir ? "FIR_CR202601025.pdf" : `${type.replaceAll(" ", "_")}_${index + 1}.pdf`,
    version: isFir ? "3.0" : index % 3 === 0 ? "2.0" : "1.0",
    uploadedBy: isFir ? "Rajiv Sharma" : index % 2 === 0 ? "Anita Verma" : "Vikram Nair",
    date: isFir ? "15 Aug 2026, 09:42" : `${12 + (index % 10)} Aug 2026, ${10 + (index % 8)}:${index % 2 ? "18" : "42"}`,
    integrity: index === 6 ? "ALERT" : "VERIFIED",
    signature: index % 3 === 1 ? "PENDING" : "VERIFIED",
    hash,
    classification: isFir ? "First Information Report" : type,
    confidence: isFir ? 96.4 : 88 + (index % 10) / 10,
    size: `${index + 1}.${index % 8} MB`,
    confidentiality: index % 3 === 0 ? "Restricted" : "Confidential",
    ocrText: isFir ? ocrText : `${type.toUpperCase()}\nCase ${caseId}\nSimulated searchable text for the SecureDMS prototype.`,
    originalHash: hash,
    currentHash: index === 6 ? tamperedHash : hash,
    signedBy: index % 3 === 1 ? "" : "Inspector Rajiv Sharma",
    versions: [
      { version: "1.0", createdBy: isFir ? "Rajiv Sharma" : "Anita Verma", timestamp: "12 Aug 2026, 09:12", hash, change: "Initial upload", integrity: "VERIFIED" },
      ...(isFir ? [
        { version: "2.0", createdBy: "Rajiv Sharma", timestamp: "13 Aug 2026, 14:26", hash, change: "Added vehicle identification notes", integrity: "VERIFIED" },
        { version: "3.0", createdBy: "Rajiv Sharma", timestamp: "15 Aug 2026, 09:42", hash, change: "Metadata and signature updated", integrity: "VERIFIED" },
      ] : []),
    ],
  };
};

const documents: DocumentRecord[] = Array.from({ length: 34 }, (_, index) => makeDocument(index));

const auditLogs: AuditRecord[] = [
  { id: "a-1", timestamp: "10:42:12", user: "Rajiv Sharma", role: "Police Officer", action: "Uploaded document", caseId: "CR-2026-01025", document: "FIR_CR202601025.pdf", device: "Web", status: "Success" },
  { id: "a-2", timestamp: "10:44:18", user: "Rajiv Sharma", role: "Police Officer", action: "Document signed", caseId: "CR-2026-01025", document: "FIR_CR202601025.pdf", device: "Web", status: "Success" },
  { id: "a-3", timestamp: "11:03:41", user: "Anita Verma", role: "Forensic Officer", action: "Viewed document", caseId: "CR-2026-01025", document: "FIR_CR202601025.pdf", device: "Web", status: "Success" },
  { id: "a-4", timestamp: "11:18:07", user: "System", role: "Security Engine", action: "Integrity verification", caseId: "CR-2026-01025", document: "FIR_CR202601025.pdf", device: "System", status: "Success" },
  { id: "a-5", timestamp: "11:21:55", user: "System", role: "Security Engine", action: "Tamper detected", caseId: "CR-2026-01025", document: "Vehicle_Inspection_Report_7.pdf", device: "System", status: "ALERT" },
  { id: "a-6", timestamp: "09:38:24", user: "Anita Verma", role: "Forensic Officer", action: "Forensic report verified", caseId: "CR-2026-00842", document: "Forensic_Report_3.pdf", device: "Web", status: "Success" },
  { id: "a-7", timestamp: "09:31:09", user: "System", role: "Security Engine", action: "Document version created", caseId: "CR-2026-01025", document: "FIR_CR202601025.pdf", device: "System", status: "Success" },
];

const now = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

const appendAudit = (action: string, document: DocumentRecord | undefined, status = "Success") => {
  auditLogs.unshift({
    id: `a-${Date.now()}`,
    timestamp: now(),
    user: "Rajiv Sharma",
    role: "Police Officer",
    action,
    caseId: document?.caseId ?? "—",
    document: document?.fileName ?? "—",
    device: "Web",
    status,
  });
};

const router: IRouter = Router();

router.post("/auth/login", (req: Request, res: Response) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Email and password are required." });
  const user = users.find((candidate) => candidate.email === parsed.data.email);
  const password = parsed.data.email === "admin@demo.gov" ? "admin123" : "demo123";
  if (!user || parsed.data.password !== password || !user.active) return res.status(401).json({ error: "Invalid prototype credentials." });
  return res.json({ user, prototype: true });
});

router.get("/dashboard", (_req, res) => res.json({
  metrics: { activeCases: 128, totalDocuments: 2846, pendingReviews: 17, verified: 2821, alerts: 2, addedToday: 34 },
  uploads: [{ day: "Mon", count: 26 }, { day: "Tue", count: 34 }, { day: "Wed", count: 29 }, { day: "Thu", count: 45 }, { day: "Fri", count: 38 }, { day: "Sat", count: 34 }, { day: "Sun", count: 42 }],
  activity: auditLogs.slice(0, 5),
  security: { score: 94, signed: 31, encrypted: 2846 },
}));

router.get("/cases", (req, res) => {
  const q = String(req.query.q ?? "").toLowerCase();
  const status = String(req.query.status ?? "");
  return res.json(cases.filter((item) => (!q || `${item.id} ${item.title} ${item.category} ${item.station}`.toLowerCase().includes(q)) && (!status || item.status === status)));
});

router.post("/cases", (req, res) => {
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Title, category, and station are required." });
  const created: CaseRecord = {
    id: `CR-2026-${String(1100 + cases.length).padStart(5, "0")}`,
    ...parsed.data,
    officer: "Inspector Rajiv Sharma",
    opened: "05 Sep 2026",
    status: "Active",
    documents: 0,
    activity: "Just now",
    description: "New fictional case created in the SecureDMS prototype.",
    assigned: ["Inspector Rajiv Sharma"],
    dates: [{ label: "Case opened", value: "05 Sep 2026" }, { label: "Last activity", value: "Just now" }, { label: "Next review", value: "12 Sep 2026" }],
  };
  cases.unshift(created);
  return res.status(201).json(created);
});

router.get("/cases/:id", (req, res) => {
  const found = cases.find((item) => item.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Case not found." });
  return res.json(found);
});

router.get("/documents", (req, res) => {
  const q = String(req.query.q ?? "").toLowerCase();
  const caseId = String(req.query.caseId ?? "");
  return res.json(documents.filter((doc) => (!caseId || doc.caseId === caseId) && (!q || `${doc.title} ${doc.type} ${doc.fileName} ${doc.caseId} ${doc.ocrText}`.toLowerCase().includes(q))));
});

router.post("/documents", (req, res) => {
  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Case, title, type, and file name are required." });
  const existing = documents.find((doc) => doc.caseId === parsed.data.caseId && doc.fileName === parsed.data.fileName);
  if (existing) return res.status(409).json({ error: "This document already exists in the selected case." });
  const source = `${parsed.data.caseId}:${parsed.data.fileName}:${Date.now()}`;
  const hash = createHash("sha256").update(source).digest("hex");
  const created: DocumentRecord = {
    id: `doc-${Date.now()}`,
    caseId: parsed.data.caseId,
    title: parsed.data.title,
    type: parsed.data.type,
    fileName: parsed.data.fileName,
    version: "1.0",
    uploadedBy: "Rajiv Sharma",
    date: "05 Sep 2026, 10:02",
    integrity: "VERIFIED",
    signature: "VERIFIED",
    hash,
    classification: parsed.data.type === "Other" ? "Investigation Document" : parsed.data.type,
    confidence: parsed.data.type === "FIR" ? 96.4 : 91.2,
    size: "1.2 MB",
    confidentiality: parsed.data.confidentiality ?? "Confidential",
    ocrText: `SIMULATED OCR TEXT\n${parsed.data.title}\nCase ${parsed.data.caseId}\nSecureDMS prototype processing completed.`,
    originalHash: hash,
    currentHash: hash,
    signedBy: "Inspector Rajiv Sharma",
    versions: [{ version: "1.0", createdBy: "Rajiv Sharma", timestamp: "05 Sep 2026, 10:02", hash, change: "Initial upload", integrity: "VERIFIED" }],
  };
  documents.unshift(created);
  const caseRecord = cases.find((item) => item.id === created.caseId);
  if (caseRecord) caseRecord.documents += 1;
  appendAudit("Uploaded document", created);
  return res.status(201).json(created);
});

router.get("/documents/:id", (req, res) => {
  const found = documents.find((doc) => doc.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Document not found." });
  return res.json(found);
});

router.post("/documents/:id/verify", (req, res) => {
  const found = documents.find((doc) => doc.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Document not found." });
  found.integrity = found.originalHash === found.currentHash ? "VERIFIED" : "ALERT";
  appendAudit("Integrity verification", found, found.integrity === "VERIFIED" ? "Success" : "ALERT");
  return res.json({ documentId: found.id, status: found.integrity, originalHash: found.originalHash, currentHash: found.currentHash, message: found.integrity === "VERIFIED" ? "Document integrity verified." : "Cryptographic hash mismatch detected." });
});

router.post("/documents/:id/tamper-test", (req, res) => {
  const found = documents.find((doc) => doc.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Document not found." });
  found.currentHash = found.originalHash === primaryHash ? tamperedHash : createHash("sha256").update(`${found.originalHash}:tampered`).digest("hex");
  found.integrity = "ALERT";
  appendAudit("Integrity violation detected", found, "ALERT");
  return res.json({ documentId: found.id, status: "ALERT", originalHash: found.originalHash, currentHash: found.currentHash, message: "Document content does not match the registered cryptographic hash." });
});

router.get("/documents/:id/versions", (req, res) => {
  const found = documents.find((doc) => doc.id === req.params.id);
  if (!found) return res.status(404).json({ error: "Document not found." });
  return res.json(found.versions);
});

router.get("/audit-logs", (_req, res) => res.json(auditLogs));

router.get("/search", (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  if (!q) return res.json([]);
  const terms = q.split(/\s+/).filter(Boolean);
  return res.json(documents
    .map((document) => {
      const haystack = `${document.title} ${document.type} ${document.caseId} ${document.ocrText}`.toLowerCase();
      const hits = terms.filter((term) => haystack.includes(term)).length;
      return { document, score: Math.min(99.9, 54 + hits * 12.4), match: hits ? `Matched ${hits} search term${hits === 1 ? "" : "s"} in document metadata and OCR text.` : "" };
    })
    .filter((result) => result.score > 54)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12));
});

router.get("/users", (_req, res) => res.json(users));

export default router;
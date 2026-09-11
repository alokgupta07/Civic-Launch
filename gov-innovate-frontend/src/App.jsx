
import React, { useState, useMemo, useEffect } from "react";
import * as api from "./api";

/* ============================================================
   GovInnovate — Government Innovation & Startup Platform
   Prototype | Smart India Hackathon 2026
   NOT an official Government of India website.
   ============================================================ */

/* ---------------- Dummy Data ---------------- */

const CHALLENGES = [
  { id: "GC-2026-014", title: "AI-Based Crop Disease Detection for Small Farmers", department: "Ministry of Agriculture & Farmers Welfare", applications: 62, stage: "EVALUATION", deadline: "15 Oct 2026", status: "EVALUATION" },
  { id: "GC-2026-021", title: "Smart Waste Segregation System for Urban Local Bodies", department: "Ministry of Housing & Urban Affairs", applications: 48, stage: "PUBLISHED", deadline: "30 Oct 2026", status: "PUBLISHED" },
  { id: "GC-2026-009", title: "Low-Cost Water Quality Monitoring for Rural Areas", department: "Dept. of Drinking Water & Sanitation", applications: 37, stage: "SHORTLISTED", deadline: "05 Sep 2026", status: "SHORTLISTED" },
  { id: "GC-2026-005", title: "Digital Literacy Platform for Anganwadi Workers", department: "Ministry of Women & Child Development", applications: 29, stage: "PILOT", deadline: "20 Aug 2026", status: "PILOT" },
  { id: "GC-2025-088", title: "Predictive Maintenance for Municipal Transformers", department: "Ministry of Power", applications: 41, stage: "PROCUREMENT", deadline: "12 Jun 2026", status: "PROCUREMENT" },
  { id: "GC-2025-071", title: "Blockchain-Based Land Record Verification", department: "Dept. of Land Resources", applications: 55, stage: "COMPLETED", deadline: "01 Mar 2026", status: "COMPLETED" },
  { id: "GC-2026-030", title: "Solar-Powered Cold Storage for Farm Produce", department: "Ministry of Food Processing Industries", applications: 0, stage: "DRAFT", deadline: "TBD", status: "DRAFT" },
];

const STARTUPS = [
  { rank: 1, name: "AgroSense Technologies Pvt. Ltd.", eligibility: "ELIGIBLE", technical: 88, innovation: 91, cost: 78, impact: 85, total: 85.5, evalStatus: "COMPLETED", decision: "SHORTLIST" },
  { rank: 2, name: "KrishiMitra Innovations", eligibility: "ELIGIBLE", technical: 82, innovation: 84, cost: 80, impact: 83, total: 82.3, evalStatus: "COMPLETED", decision: "SHORTLIST" },
  { rank: 3, name: "FarmVision AI Labs", eligibility: "ELIGIBLE", technical: 79, innovation: 76, cost: 74, impact: 80, total: 77.4, evalStatus: "COMPLETED", decision: "REVIEW" },
  { rank: 4, name: "GreenField Analytics", eligibility: "ELIGIBLE", technical: 70, innovation: 68, cost: 72, impact: 69, total: 69.7, evalStatus: "IN PROGRESS", decision: "PENDING" },
  { rank: 5, name: "RuralTech Solutions", eligibility: "NOT ELIGIBLE", technical: "-", innovation: "-", cost: "-", impact: "-", total: "-", evalStatus: "NOT STARTED", decision: "REJECT" },
];

const PROCUREMENT_ITEMS = [
  { startup: "CivicWaste Systems", solution: "Smart Waste Segregation System", pilotStatus: "Pilot Completed", performance: "92% target achieved", cost: "₹1.8 Cr (est.)", recommendation: "Procurement Recommended", status: "Under Review" },
  { startup: "PowerGuard Analytics", solution: "Predictive Maintenance Platform", pilotStatus: "Pilot Completed", performance: "88% target achieved", cost: "₹3.2 Cr (est.)", recommendation: "Procurement Recommended", status: "Approved" },
  { startup: "AquaCheck Devices", solution: "Water Quality Monitoring Kit", pilotStatus: "Pilot In Progress", performance: "Monitoring ongoing", cost: "₹95 Lakh (est.)", recommendation: "Pending Pilot Completion", status: "Under Review" },
  { startup: "LandChain Systems", solution: "Land Record Verification Platform", pilotStatus: "Pilot Completed", performance: "97% target achieved", cost: "₹2.1 Cr (est.)", recommendation: "Procurement Recommended", status: "Completed" },
];

const AUDIT_LOG = [
  { date: "28 Aug 2026, 11:42 AM", actor: "Dr. R. Sharma (Evaluator)", action: "Submitted technical evaluation for AgroSense Technologies Pvt. Ltd." },
  { date: "27 Aug 2026, 04:15 PM", actor: "Ms. A. Iyer (Evaluator)", action: "Submitted innovation evaluation for KrishiMitra Innovations." },
  { date: "25 Aug 2026, 02:03 PM", actor: "System", action: "Challenge GC-2026-014 moved to Evaluation stage." },
  { date: "20 Aug 2026, 09:30 AM", actor: "Dept. Nodal Officer", action: "Published Challenge GC-2026-014." },
];

/* ---------------- Small shared bits ---------------- */

const STATUS_STYLES = {
  DRAFT: { bg: "#EEF1F4", color: "#4B5563", border: "#D9E1E8" },
  PUBLISHED: { bg: "#E8F1FB", color: "#1B5E9E", border: "#BBD6EE" },
  EVALUATION: { bg: "#FDF1E4", color: "#B4620C", border: "#F3D5AE" },
  SHORTLISTED: { bg: "#EAF5EC", color: "#16803C", border: "#BFE3C6" },
  PILOT: { bg: "#EEF1FB", color: "#3949A8", border: "#CBD3F1" },
  PROCUREMENT: { bg: "#FBEFE8", color: "#C2521B", border: "#F1D3BE" },
  COMPLETED: { bg: "#E8F6EC", color: "#0E6B31", border: "#B9E3C6" },
  ELIGIBLE: { bg: "#EAF5EC", color: "#16803C", border: "#BFE3C6" },
  "NOT ELIGIBLE": { bg: "#FBEAEA", color: "#B42318", border: "#F1C6C4" },
  Approved: { bg: "#EAF5EC", color: "#16803C", border: "#BFE3C6" },
  Completed: { bg: "#E8F6EC", color: "#0E6B31", border: "#B9E3C6" },
  "Under Review": { bg: "#FDF1E4", color: "#B4620C", border: "#F3D5AE" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "#EEF1F4", color: "#374151", border: "#D9E1E8" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        padding: "3px 11px",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, tone }) {
  return (
    <div className="stat-card" style={tone ? { borderTop: `3px solid ${tone}` } : undefined}>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((it, i) => (
        <span key={i} className="breadcrumb__item">
          {i > 0 && <span className="breadcrumb__sep">›</span>}
          {i === items.length - 1 ? (
            <span className="breadcrumb__current">{it}</span>
          ) : (
            <span className="breadcrumb__link">{it}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

function SectionHeading({ eyebrow, title, desc }) {
  return (
    <div className="section-heading">
      {eyebrow && <div className="section-heading__eyebrow">{eyebrow}</div>}
      <h2 className="section-heading__title">{title}</h2>
      {desc && <p className="section-heading__desc">{desc}</p>}
    </div>
  );
}

function DataTable({ columns, children }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Modal({ title, children, onClose, onConfirm, confirmLabel = "Confirm" }) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-box">
        <div className="modal-box__header">
          <h3>{title}</h3>
          <button className="modal-box__close" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <div className="modal-box__body">{children}</div>
        <div className="modal-box__footer">
          <button className="btn btn--ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn--primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Notification({ notifications, onClose }) {
  return (
    <div className="notif-panel" role="dialog" aria-label="Notifications">
      <div className="notif-panel__header">
        <span>Notifications</span>
        <button className="modal-box__close" onClick={onClose} aria-label="Close notifications">×</button>
      </div>
      {notifications.map((n, i) => (
        <div className="notif-item" key={i}>
          <div className="notif-item__dot" style={{ background: n.color }} />
          <div>
            <div className="notif-item__text">{n.text}</div>
            <div className="notif-item__time">{n.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Layout: Utility bar / Header / Nav / Sidebar / Footer ---------------- */

function TopUtilityBar({ lang, setLang, fontScale, setFontScale, backendStatus }) {
  return (
    <div className="utility-bar">
      <div className="utility-bar__inner">
        <div className="utility-bar__left">
          <span>Government Initiative</span>
          <span className="utility-bar__sep">|</span>
          <a href="#main-content" className="utility-bar__skip">Skip to Main Content</a>
          {/* <span className="utility-bar__sep">|</span> 
         <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%", display: "inline-block",
                background: backendStatus === "live" ? "#3DDC84" : backendStatus === "offline" ? "#F0A64C" : "#9CA3AF",
              }}
            />
            {backendStatus === "live" && "Connected to backend API"}
            {backendStatus === "offline" && "Backend offline — showing demo data"}
            {backendStatus === "checking" && "Connecting…"}
          </span> */}
        </div>
        <div className="utility-bar__right">
          <span className="utility-bar__label">Accessibility:</span>
          <button
            className={`utility-bar__font ${fontScale === "A-" ? "is-active" : ""}`}
            onClick={() => setFontScale("A-")}
            aria-label="Decrease text size"
          >A-</button>
          <button
            className={`utility-bar__font ${fontScale === "A" ? "is-active" : ""}`}
            onClick={() => setFontScale("A")}
            aria-label="Default text size"
          >A</button>
          <button
            className={`utility-bar__font ${fontScale === "A+" ? "is-active" : ""}`}
            onClick={() => setFontScale("A+")}
            aria-label="Increase text size"
          >A+</button>
          <span className="utility-bar__sep">|</span>
          <button className="utility-bar__link">Screen Reader Access</button>
          <span className="utility-bar__sep">|</span>
          <button
            className="utility-bar__lang"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
          >
            {lang === "en" ? "हिंदी | English" : "हिंदी | English"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Shared login/register form used by both auth pages, styled per audience. */
function AuthForm({ audience, roleOptions, onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", organization: "", role: roleOptions?.[0]?.value || "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (mode === "register") {
        await api.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: roleOptions ? form.role : audience,
          organization: form.organization,
        });
      }
      await api.login(form.email, form.password);
      const me = await api.getMe();
      onAuthed(me);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit}>
      <div className="auth-form__tabs">
        <button type="button" className={`auth-form__tab ${mode === "login" ? "is-active" : ""}`} onClick={() => setMode("login")}>Log In</button>
        <button type="button" className={`auth-form__tab ${mode === "register" ? "is-active" : ""}`} onClick={() => setMode("register")}>Register</button>
      </div>

      {mode === "register" && (
        <>
          <FormField label="Full Name" placeholder="Your name" full value={form.name} onChange={update("name")} />
          <FormField
            label={audience === "government" ? "Department / Ministry" : "Organization / Startup Name"}
            placeholder={audience === "government" ? "e.g. Ministry of Power" : "e.g. AgroSense Technologies Pvt. Ltd."}
            full
            value={form.organization}
            onChange={update("organization")}
          />
          {roleOptions && (
            <FormField
              label="Account Type"
              isSelect
              full
              options={roleOptions.map((o) => o.label)}
              value={roleOptions.find((o) => o.value === form.role)?.label || ""}
              onChange={(e) => {
                const picked = roleOptions.find((o) => o.label === e.target.value);
                setForm((f) => ({ ...f, role: picked ? picked.value : f.role }));
              }}
            />
          )}
        </>
      )}
      <FormField label="Email" type="email" placeholder="you@example.com" full value={form.email} onChange={update("email")} />
      <FormField label="Password" type="password" placeholder="••••••••" full value={form.password} onChange={update("password")} />

      {error && <div className="info-callout info-callout--warn" style={{ marginTop: 4 }}>{error}</div>}

      <button className="btn btn--primary btn--lg" style={{ width: "100%", marginTop: 12 }} disabled={submitting}>
        {submitting ? "Please wait…" : mode === "login" ? "Log In" : "Create Account & Log In"}
      </button>
    </form>
  );
}

function GovAuthPage({ onAuthed }) {
  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__badge">🇮🇳 Government Portal</div>
        <h1 className="auth-page__title">Government &amp; Evaluator Login</h1>
        <p className="auth-page__desc">For nodal department officers and empanelled evaluators. New officers can register below with their official department email.</p>
        <AuthForm
          audience="government"
          roleOptions={[
            { value: "government", label: "Department Officer" },
            { value: "evaluator", label: "Evaluator" },
          ]}
          onAuthed={onAuthed}
        />
      </div>
    </div>
  );
}

function StartupAuthPage({ onAuthed }) {
  return (
    <div className="auth-page">
      <div className="auth-page__card">
        <div className="auth-page__badge">🚀 Startup Portal</div>
        <h1 className="auth-page__title">Startup Login</h1>
        <p className="auth-page__desc">Log in to apply to government challenges and track your applications. New here? Register with your startup's details below.</p>
        <AuthForm audience="startup" roleOptions={null} onAuthed={onAuthed} />
      </div>
    </div>
  );
}

function Header({ role, currentUser, onNavigate, onLogout, notifOpen, setNotifOpen, notifications }) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <button className="site-header__brand" onClick={() => onNavigate("home")}>
          <div className="site-header__emblem" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="42" height="42">
              <circle cx="24" cy="24" r="22" fill="none" stroke="#0C2A4D" strokeWidth="2.5" />
              <circle cx="24" cy="24" r="16.5" fill="none" stroke="#14559E" strokeWidth="1.4" />
              {[...Array(24)].map((_, i) => {
                const angle = (i * 360) / 24;
                const rad = (angle * Math.PI) / 180;
                const x1 = 24 + 16.5 * Math.cos(rad);
                const y1 = 24 + 16.5 * Math.sin(rad);
                const x2 = 24 + 19.5 * Math.cos(rad);
                const y2 = 24 + 19.5 * Math.sin(rad);
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#14559E" strokeWidth="1.1" />;
              })}
              <path d="M24 14 L27 22 L24 20 L21 22 Z" fill="#FF9933" />
              <circle cx="24" cy="24" r="4.5" fill="#0C2A4D" />
            </svg>
          </div>
          <div className="site-header__brandtext">
            <div className="site-header__name">Civic-Launch</div>
            <div className="site-header__tagline">Government Innovation &amp; Startup Platform</div>
            <div className="site-header__strap">From Government Challenges to Real-World Solutions</div>
          </div>
        </button>

        <div className="site-header__actions">
          <button className="header-icon-btn" title="Help">
            <span className="header-icon-btn__glyph">?</span>
            <span className="header-icon-btn__label">Help</span>
          </button>
          <div style={{ position: "relative" }}>
            <button className="header-icon-btn" title="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
              <span className="header-icon-btn__glyph">🔔</span>
              <span className="header-icon-btn__label">Notifications</span>
              <span className="header-icon-btn__badge">3</span>
            </button>
            {notifOpen && <Notification notifications={notifications} onClose={() => setNotifOpen(false)} />}
          </div>

          {role === "guest" ? (
            <div className="login-group">
              <button className="btn btn--outline btn--sm" onClick={() => onNavigate("govAuth")}>Government Login</button>
              <button className="btn btn--primary btn--sm" onClick={() => onNavigate("startupAuth")}>Startup Login</button>
            </div>
          ) : (
            <div className="profile-chip">
              <div className="profile-chip__avatar">
                {(currentUser?.name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div className="profile-chip__meta">
                <div className="profile-chip__name">{currentUser?.name || "…"}</div>
                <div className="profile-chip__role">
                  {currentUser?.organization || (role === "evaluator" ? "Evaluator" : role === "government" ? "Government" : "Startup")}
                </div>
              </div>
              <button className="btn btn--ghost btn--sm" onClick={onLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const PUBLIC_NAV = [
  { key: "home", label: "Home" },
  { key: "about", label: "About Platform" },
  { key: "startupPortal", label: "Challenges" },
  { key: "startupPortal2", label: "Startups" },
  { key: "pilotProject", label: "Pilot Projects" },
  { key: "procurement", label: "Procurement" },
  { key: "reports", label: "Reports" },
  { key: "contact", label: "Contact" },
];

function MainNav({ current, onNavigate }) {
  return (
    <nav className="main-nav">
      <div className="main-nav__inner">
        {PUBLIC_NAV.map((item) => (
          <button
            key={item.key}
            className={`main-nav__item ${current === item.key ? "is-active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

const GOV_SIDEBAR = [
  { key: "govDashboard", label: "Dashboard" },
  { key: "createChallenge", label: "Create Challenge" },
  { key: "shortlisting", label: "Shortlisting" },
  { key: "pilotProject", label: "Pilot Projects" },
  { key: "procurement", label: "Procurement" },
  { key: "transparency", label: "Transparency & Audit" },
];

const EVALUATOR_SIDEBAR = [
  { key: "evaluatorDashboard", label: "Evaluator Dashboard" },
  { key: "transparency", label: "Transparency & Audit" },
];

const STARTUP_SIDEBAR = [
  { key: "startupPortal", label: "Dashboard" },
  { key: "eligibility", label: "Check Eligibility" },
  { key: "myEvaluations", label: "My Evaluations" },
  { key: "pilotProject", label: "Pilot Status" },
  { key: "procurement", label: "Procurement Status" },
];

function Sidebar({ role, current, onNavigate }) {
  const items = role === "government" ? GOV_SIDEBAR : role === "evaluator" ? EVALUATOR_SIDEBAR : STARTUP_SIDEBAR;
  const sectionLabel = role === "government" ? "Department Menu" : role === "evaluator" ? "Evaluator Menu" : "Startup Menu";
  return (
    <aside className="sidebar">
      <div className="sidebar__section-title">{sectionLabel}</div>
      {items.map((item) => (
        <button
          key={item.key}
          className={`sidebar__item ${current === item.key ? "is-active" : ""}`}
          onClick={() => onNavigate(item.key)}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__col">
          <div className="site-footer__brand">Civic-Launch</div>
          <div className="site-footer__tag">Government Innovation &amp; Startup Platform</div>
          <p className="site-footer__note">Prototype developed for GovInnovate.</p>
          <p className="site-footer__disclaimer">Not an official Government of India website.</p>
        </div>
        <div className="site-footer__col">
          <div className="site-footer__heading">Department</div>
          <div className="site-footer__link">About the Platform</div>
          <div className="site-footer__link">Contact Information</div>
          <div className="site-footer__link">Helpdesk</div>
        </div>
        <div className="site-footer__col">
          <div className="site-footer__heading">Policies</div>
          <div className="site-footer__link">Privacy Policy</div>
          <div className="site-footer__link">Terms of Use</div>
          <div className="site-footer__link">Accessibility Statement</div>
        </div>
        <div className="site-footer__col">
          <div className="site-footer__heading">Portal Information</div>
          <div className="site-footer__link">Website last updated: 04 Sep 2026</div>
          <div className="site-footer__link">Visitors since launch: 1,24,382</div>
          <div className="site-footer__link">Best viewed in latest browsers</div>
        </div>
      </div>
      <div className="site-footer__bottom">
        © 2026 GovInnovate Prototype — Smart India Hackathon Submission. All content is illustrative dummy data.
      </div>
    </footer>
  );
}

/* ---------------- Pages ---------------- */

function HomePage({ onNavigate, challenges = CHALLENGES }) {
  return (
    <div>
      <section className="hero">
        <svg className="hero__chakra" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth="1.5" />
          {[...Array(24)].map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const x2 = 50 + 46 * Math.cos(rad);
            const y2 = 50 + 46 * Math.sin(rad);
            return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="#fff" strokeWidth="1" />;
          })}
          <circle cx="50" cy="50" r="6" fill="#fff" />
        </svg>
        <div className="hero__inner">
          <div className="hero__badge">🇮🇳 Prototype | GovInnovate</div>
          <h1 className="hero__title">Connecting Government Challenges with Innovative Startups</h1>
          <p className="hero__subtitle">
            A transparent digital platform for identifying, evaluating, piloting and procuring innovative
            startup solutions for government challenges.
          </p>
          <div className="hero__actions">
            <button className="btn btn--primary btn--lg" onClick={() => onNavigate("startupPortal")}>Explore Challenges</button>
            <button className="btn btn--outline btn--lg" onClick={() => onNavigate("govDashboard")}>For Government Departments</button>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="stats-strip__inner">
          <StatCard label="Active Government Challenges" value="46" />
          <StatCard label="Registered Startups" value="1,238" />
          <StatCard label="Solutions Evaluated" value="612" />
          <StatCard label="Pilot Projects" value="58" />
          <StatCard label="Procurement Recommendations" value="21" />
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="How it works"
          title="A structured, five-stage journey from problem to procurement"
          desc="Every challenge follows the same transparent process, from publication to final procurement recommendation."
        />
        <div className="process-grid">
          {[
            ["01", "Challenge Published", "Government departments publish real problem statements with clear eligibility and evaluation criteria."],
            ["02", "Startups Apply", "Registered startups review challenges, check eligibility and submit proposals."],
            ["03", "Structured Evaluation", "A weighted evaluation matrix is used by designated evaluators to assess every proposal."],
            ["04", "Pilot Deployment", "Shortlisted startups deploy a monitored pilot with the concerned department."],
            ["05", "Procurement Recommendation", "Pilot performance determines whether a procurement recommendation is issued."],
          ].map(([num, title, desc]) => (
            <div className="process-card" key={num}>
              <div className="process-card__num">{num}</div>
              <div className="process-card__title">{title}</div>
              <div className="process-card__desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section content-section--muted">
        <SectionHeading eyebrow="Open Opportunities" title="Recently Published Challenges" />
        <DataTable columns={["Challenge ID", "Title", "Department", "Applications", "Stage", "Deadline"]}>
          {challenges.filter((c) => c.status !== "DRAFT").slice(0, 5).map((c) => (
            <tr key={c.id}>
              <td className="mono">{c.id}</td>
              <td>{c.title}</td>
              <td>{c.department}</td>
              <td>{c.applications}</td>
              <td><StatusBadge status={c.status} /></td>
              <td>{c.deadline}</td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

function GovDashboardPage({ onNavigate, openPublishModal, challenges = CHALLENGES }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications()
      .then((apps) => {
        setApplications(apps);
      })
      .catch((err) => {
        console.error("Failed to load government applications:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const applicationsReceived = applications.length;

  const underEvaluationCount = applications.filter(
    (app) => app.status === "UNDER_REVIEW"
  ).length;

  const shortlistedCount = applications.filter(
    (app) => app.status === "SHORTLISTED"
  ).length;

  const activePilotsCount = applications.filter(
    (app) => app.status === "PILOT"
  ).length;

  const procurementReadyCount = applications.filter(
    (app) => app.status === "PROCUREMENT"
  ).length;
  return (
    <div className="page">
      <Breadcrumb items={["Home", "Government Dashboard"]} />
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Government Innovation Dashboard</h1>
          <div className="page-title__meta">
            <span><strong>Department:</strong> Ministry of Agriculture &amp; Farmers Welfare</span>
            <span><strong>Officer:</strong> Dr. R. Sharma</span>
            <span><strong>Department ID:</strong> DEP-AGRI-014</span>
            <span><strong>Last Login:</strong> 04 Sep 2026, 09:12 AM</span>
          </div>
        </div>
        <button className="btn btn--primary" onClick={() => onNavigate("createChallenge")}>+ Create New Challenge</button>
      </div>

      <div className="stat-grid">
        <StatCard label="Active Challenges" value="6" tone="#123B63" />
        <StatCard
          label="Applications Received"
          value={loading ? "..." : String(applicationsReceived)}
          tone="#1B5E9E"
        />
        <StatCard label="Eligible Startups" value="204" tone="#1B5E9E" />
        <StatCard
          label="Under Evaluation"
          value={loading ? "..." : String(underEvaluationCount)}
          tone="#E67E22"
        />
        <StatCard
          label="Shortlisted Startups"
          value={loading ? "..." : String(shortlistedCount)}
          tone="#16803C"
        />
        <StatCard
          label="Active Pilots"
          value={loading ? "..." : String(activePilotsCount)}
          tone="#16803C"
        />
        <StatCard
          label="Procurement Ready"
          value={loading ? "..." : String(procurementReadyCount)}
          tone="#123B63"
        />
      </div>

      <div className="panel">
        <div className="panel__header">
          <h2>Active Challenges</h2>
        </div>
        <DataTable columns={["Challenge ID", "Challenge Title", "Department", "Applications", "Current Stage", "Deadline", "Action"]}>
          {challenges.map((c) => (
            <tr key={c.id}>
              <td className="mono">{c.id}</td>
              <td>{c.title}</td>
              <td>{c.department}</td>
              <td>{c.applications}</td>
              <td><StatusBadge status={c.status} /></td>
              <td>{c.deadline}</td>
              <td>
                <button className="link-btn" onClick={() => onNavigate("shortlisting")}>View</button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </div>
  );
}

const STEPS = ["Challenge Details", "Eligibility", "Evaluation Criteria", "Timeline", "Review", "Publish"];

function CreateChallengePage({ onPublished }) {
  const [step, setStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [published, setPublished] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [publishError, setPublishError] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    expectedOutcome: "",
    technicalRequirements: "",
    eligibilityCriteria: "",
    minimumTeamSize: "",
    sectorFocus: "",
    evaluationCriteria: "",
    procurementValue: "",
    deadline: "",
    pilotRequirements: "",
  });
  const [challengeCode] = useState(
    () => `GC-2026-${String(Math.floor(100 + Math.random() * 900))}`
  );
  const [draftId, setDraftId] = useState(null);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setDraftMessage("");
    setPublishError("");

    const payload = {
      challenge_code: challengeCode,
      title: form.title || "Untitled Challenge",
      department:
        form.department ||
        "Ministry of Agriculture & Farmers Welfare",

      description: form.description || undefined,
      expected_outcome: form.expectedOutcome || undefined,
      technical_requirements:
        form.technicalRequirements || undefined,
      eligibility_criteria:
        form.eligibilityCriteria || undefined,

      minimum_team_size: form.minimumTeamSize
        ? Number(form.minimumTeamSize)
        : undefined,

      sector_focus: form.sectorFocus || undefined,
      evaluation_criteria:
        form.evaluationCriteria || undefined,
      procurement_value:
        form.procurementValue || undefined,
      deadline: form.deadline || undefined,
      pilot_requirements:
        form.pilotRequirements || undefined,

      status: "DRAFT",
    };

    try {
      let savedChallenge;

      if (draftId) {
        savedChallenge = await api.updateChallenge(
          draftId,
          payload
        );
      } else {
        savedChallenge = await api.createChallenge(payload);
        setDraftId(savedChallenge.id);
      }

      setDraftMessage(
        "Challenge draft saved successfully."
      );
    } catch (err) {
      setDraftMessage(
        `Could not save draft: ${err.message}`
      );
    } finally {
      setSavingDraft(false);
    }
  };
  const handlePublish = async () => {
    setShowConfirm(false);
    setPublishing(true);
    setPublishError("");

    const payload = {
      challenge_code: challengeCode,
      title: form.title || "Untitled Challenge",
      department:
        form.department ||
        "Ministry of Agriculture & Farmers Welfare",

      description: form.description || undefined,
      expected_outcome: form.expectedOutcome || undefined,
      technical_requirements:
        form.technicalRequirements || undefined,
      eligibility_criteria:
        form.eligibilityCriteria || undefined,

      minimum_team_size: form.minimumTeamSize
        ? Number(form.minimumTeamSize)
        : undefined,

      sector_focus: form.sectorFocus || undefined,
      evaluation_criteria:
        form.evaluationCriteria || undefined,
      procurement_value:
        form.procurementValue || undefined,
      deadline: form.deadline || undefined,
      pilot_requirements:
        form.pilotRequirements || undefined,

      status: "PUBLISHED",
    };

    try {
      if (draftId) {
        // Existing draft ko publish karo
        await api.updateChallenge(draftId, payload);
      } else {
        // Draft save nahi hua tha, directly new challenge create karo
        await api.createChallenge(payload);
      }

      setPublished(true);

      if (onPublished) {
        onPublished();
      }
    } catch (err) {
      setPublishError(
        err.message === "Not authenticated" ||
          err.message?.includes("permission")
          ? "You need to be logged in as Government to publish a challenge. Use 'Government Login' in the top right, then try again."
          : `Could not publish: ${err.message}`
      );
    } finally {
      setPublishing(false);
    }
  };
  return (
    <div className="page">
      <Breadcrumb items={["Home", "Government Dashboard", "Create Challenge"]} />
      <h1 className="page-title">Create Government Challenge</h1>

      <div className="stepper">
        {STEPS.map((label, i) => (
          <div key={label} className={`stepper__step ${i === step ? "is-active" : i < step ? "is-done" : ""}`}>
            <div className="stepper__num">{i < step ? "✓" : String(i + 1).padStart(2, "0")}</div>
            <div className="stepper__label">{label}</div>
          </div>
        ))}
      </div>

      <div className="panel">
        {draftMessage && (
          <div
            className="info-callout"
            style={{ marginBottom: 16 }}
          >
            {draftMessage}
          </div>
        )}
        {step === 0 && (
          <div className="form-grid">
            <FormField label="Challenge ID" value={challengeCode} readOnly />
            <FormField
              label="Ministry / Department"
              placeholder="Select department"
              isSelect
              options={["Ministry of Agriculture & Farmers Welfare", "Ministry of Power", "Ministry of Housing & Urban Affairs"]}
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
            <FormField
              label="Challenge Title"
              placeholder="e.g. AI-Based Crop Disease Detection for Small Farmers"
              full
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
            <FormField
              label="Problem Statement"
              textarea
              placeholder="Describe the government problem this challenge addresses"
              full
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <FormField
              label="Expected Outcome"
              textarea
              placeholder="Describe the expected outcome of a successful solution"
              full
              value={form.expectedOutcome}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  expectedOutcome: e.target.value,
                }))
              }
            />

            <FormField
              label="Technical Requirements"
              textarea
              placeholder="List any mandatory technical requirements"
              full
              value={form.technicalRequirements}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  technicalRequirements: e.target.value,
                }))
              }
            />
          </div>
        )}
        {step === 1 && (
          <div className="form-grid">
            <FormField
              label="Eligibility Criteria"
              textarea
              placeholder="e.g. DPIIT-recognised startup, incorporated in India, min. 1 year operational"
              full
              value={form.eligibilityCriteria}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  eligibilityCriteria: e.target.value,
                }))
              }
            />

            <FormField
              label="Minimum Team Size"
              placeholder="e.g. 3"
              value={form.minimumTeamSize}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  minimumTeamSize: e.target.value,
                }))
              }
            />

            <FormField
              label="Sector Focus"
              placeholder="e.g. AgriTech"
              value={form.sectorFocus}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  sectorFocus: e.target.value,
                }))
              }
            />
          </div>
        )}
        {step === 2 && (
          <div className="form-grid">
            <FormField
              label="Evaluation Criteria"
              textarea
              placeholder="Describe evaluation parameters and their relative importance"
              full
              value={form.evaluationCriteria}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  evaluationCriteria: e.target.value,
                }))
              }
            />

            <FormField
              label="Estimated Procurement Value"
              placeholder="e.g. ₹1.5 Cr - ₹3 Cr"
              value={form.procurementValue}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  procurementValue: e.target.value,
                }))
              }
            />
          </div>
        )}
        {step === 3 && (
          <div className="form-grid">
            <FormField
              label="Submission Deadline"
              type="date"
              value={form.deadline}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  deadline: e.target.value,
                }))
              }
            />

            <FormField
              label="Pilot Requirements"
              textarea
              placeholder="Describe pilot duration, location and monitoring requirements"
              full
              value={form.pilotRequirements}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  pilotRequirements: e.target.value,
                }))
              }
            />
          </div>
        )}
        {step === 4 && (
          <div className="review-block">
            <h3>Review Challenge Details</h3>

            <p>
              Please review all sections carefully. Once published, this
              challenge becomes visible to all registered startups on the platform.
            </p>

            <ul className="review-list">
              <li>
                <strong>Challenge ID:</strong> {challengeCode}
              </li>

              <li>
                <strong>Title:</strong>{" "}
                {form.title || "(not set)"}
              </li>

              <li>
                <strong>Department:</strong>{" "}
                {form.department ||
                  "Ministry of Agriculture & Farmers Welfare"}
              </li>

              <li>
                <strong>Problem Statement:</strong>{" "}
                {form.description || "(not set)"}
              </li>

              <li>
                <strong>Expected Outcome:</strong>{" "}
                {form.expectedOutcome || "(not set)"}
              </li>

              <li>
                <strong>Technical Requirements:</strong>{" "}
                {form.technicalRequirements || "(not set)"}
              </li>

              <li>
                <strong>Eligibility Criteria:</strong>{" "}
                {form.eligibilityCriteria || "(not set)"}
              </li>

              <li>
                <strong>Minimum Team Size:</strong>{" "}
                {form.minimumTeamSize || "(not set)"}
              </li>

              <li>
                <strong>Sector Focus:</strong>{" "}
                {form.sectorFocus || "(not set)"}
              </li>

              <li>
                <strong>Evaluation Criteria:</strong>{" "}
                {form.evaluationCriteria || "(not set)"}
              </li>

              <li>
                <strong>Estimated Procurement Value:</strong>{" "}
                {form.procurementValue || "(not set)"}
              </li>

              <li>
                <strong>Submission Deadline:</strong>{" "}
                {form.deadline || "(not set)"}
              </li>

              <li>
                <strong>Pilot Requirements:</strong>{" "}
                {form.pilotRequirements || "(not set)"}
              </li>

              <li>
                <strong>Status:</strong> Ready for publishing
              </li>
            </ul>
          </div>
        )}
        {step === 5 && (
          <div className="review-block">
            {published ? (
              <div className="success-box">
                <div className="success-box__icon">✓</div>
                <div>
                  <h3>Challenge Published Successfully</h3>
                  <p>{challengeCode} is now live in the database and visible to registered startups on the Startup Portal.</p>
                </div>
              </div>
            ) : (
              <>
                <h3>Ready to Publish</h3>
                <p>This challenge will be published via the backend API and made visible to all registered startups.</p>
                {publishError && (
                  <div className="info-callout info-callout--warn" style={{ marginTop: 14 }}>{publishError}</div>
                )}
              </>
            )}
          </div>
        )}

        <div className="form-actions">
          <div className="form-actions__left">
            <button className="btn btn--ghost" disabled={step === 0} onClick={prev}>Back</button>
          </div>
          <div className="form-actions__right">
            <button
              className="btn btn--outline"
              disabled={savingDraft}
              onClick={handleSaveDraft}
            >
              {savingDraft ? "Saving…" : "Save as Draft"}
            </button>
            <button
              className="btn btn--outline"
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
            {step < STEPS.length - 1 ? (
              <button className="btn btn--primary" onClick={next}>Continue</button>
            ) : (
              !published && (
                <button className="btn btn--primary" disabled={publishing} onClick={() => setShowConfirm(true)}>
                  {publishing ? "Publishing…" : "Publish Challenge"}
                </button>
              )
            )}
          </div>
        </div>
      </div>
      {showPreview && (
        <Modal
          title="Challenge Preview"
          onClose={() => setShowPreview(false)}
          onConfirm={() => setShowPreview(false)}
          confirmLabel="Close Preview"
        >
          <div className="review-block">
            <ul className="review-list">
              <li>
                <strong>Challenge ID:</strong> {challengeCode}
              </li>

              <li>
                <strong>Title:</strong> {form.title || "(not set)"}
              </li>

              <li>
                <strong>Department:</strong>{" "}
                {form.department ||
                  "Ministry of Agriculture & Farmers Welfare"}
              </li>

              <li>
                <strong>Problem Statement:</strong>{" "}
                {form.description || "(not set)"}
              </li>

              <li>
                <strong>Expected Outcome:</strong>{" "}
                {form.expectedOutcome || "(not set)"}
              </li>

              <li>
                <strong>Technical Requirements:</strong>{" "}
                {form.technicalRequirements || "(not set)"}
              </li>

              <li>
                <strong>Eligibility Criteria:</strong>{" "}
                {form.eligibilityCriteria || "(not set)"}
              </li>

              <li>
                <strong>Minimum Team Size:</strong>{" "}
                {form.minimumTeamSize || "(not set)"}
              </li>

              <li>
                <strong>Sector Focus:</strong>{" "}
                {form.sectorFocus || "(not set)"}
              </li>

              <li>
                <strong>Evaluation Criteria:</strong>{" "}
                {form.evaluationCriteria || "(not set)"}
              </li>

              <li>
                <strong>Estimated Procurement Value:</strong>{" "}
                {form.procurementValue || "(not set)"}
              </li>

              <li>
                <strong>Submission Deadline:</strong>{" "}
                {form.deadline || "(not set)"}
              </li>

              <li>
                <strong>Pilot Requirements:</strong>{" "}
                {form.pilotRequirements || "(not set)"}
              </li>
            </ul>
          </div>
        </Modal>
      )}
      {showConfirm && (
        <Modal
          title="Confirm Publication"
          onClose={() => setShowConfirm(false)}
          onConfirm={handlePublish}
          confirmLabel="Publish Challenge"
        >
          <p>Please verify all information before publishing this government challenge.</p>
        </Modal>
      )}
    </div>
  );
}

function FormField({ label, placeholder, textarea, isSelect, options, full, readOnly, type = "text", value, onChange }) {
  const controlled = value !== undefined;
  return (
    <div className={`field ${full ? "field--full" : ""}`}>
      <label className="field__label">{label}</label>
      {textarea ? (
        <textarea
          className="field__input field__textarea"
          placeholder={placeholder}
          readOnly={readOnly}
          {...(controlled ? { value, onChange } : {})}
        />
      ) : isSelect ? (
        <select className="field__input" {...(controlled ? { value, onChange } : {})}>
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          className="field__input"
          type={type}
          placeholder={placeholder}
          readOnly={readOnly}
          {...(controlled
            ? { value, onChange }
            : { defaultValue: readOnly ? placeholder : undefined })}
        />
      )}
    </div>
  );
}

function StartupPortalPage({ onNavigate, challenges = CHALLENGES, role }) {
  const [applyTarget, setApplyTarget] = useState(null); // challenge object or null
  const [proposal, setProposal] = useState("");
  const [technologyApproach, setTechnologyApproach] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");
  const [teamDetails, setTeamDetails] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [pilotPlan, setPilotPlan] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [applications, setApplications] = useState([]);
  useEffect(() => {
    api.getApplications()
      .then((apps) => {
        setApplications(apps);
        setAppliedIds(new Set(apps.map((app) => app.challenge_id)));
      })
      .catch((err) => {
        console.error("Failed to load applications:", err);
      });
  }, []);
  const underEvaluationCount = applications.filter(
    (app) => app.status === "UNDER_REVIEW"
  ).length;

  const shortlistedCount = applications.filter(
    (app) => app.status === "SHORTLISTED"
  ).length;

  const pilotCount = applications.filter(
    (app) => app.status === "PILOT"
  ).length;

  const procurementCount = applications.filter(
    (app) => app.status === "PROCUREMENT"
  ).length;
  const openApply = (challenge) => {
    if (role !== "startup") {
      onNavigate("startupAuth");
      return;
    }

    setApplyTarget(challenge);

    setProposal("");
    setTechnologyApproach("");
    setExpectedImpact("");
    setTeamDetails("");
    setEstimatedBudget("");
    setPilotPlan("");

    setApplyError("");
  };
  const submitApplication = async () => {
    setApplying(true);
    setApplyError("");

    try {
      await api.applyToChallenge(applyTarget.dbId, {
        proposal,
        technology_approach: technologyApproach,
        expected_impact: expectedImpact,
        team_details: teamDetails,
        estimated_budget: estimatedBudget,
        pilot_plan: pilotPlan,
      });

      setAppliedIds((prev) => new Set(prev).add(applyTarget.dbId));
      setApplyTarget(null);
    } catch (err) {
      setApplyError(err.message || "Could not submit application");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="page">
      <Breadcrumb items={["Home", "Startup Innovation Portal"]} />
      <h1 className="page-title">Startup Innovation Portal</h1>

      <div className="stat-grid">

        <StatCard label="Available Challenges" value={String(challenges.filter((c) => c.status !== "DRAFT").length)} tone="#123B63" />
        <StatCard label="Applications Submitted" value={String(appliedIds.size)} tone="#1B5E9E" />
        <StatCard label="Under Evaluation" value={String(underEvaluationCount)} tone="#E67E22" />
        <StatCard label="Shortlisted" value={String(shortlistedCount)} tone="#16803C" />
        <StatCard label="Pilot Stage" value={String(pilotCount)} tone="#16803C" />
        <StatCard label="Procurement Ready" value={String(procurementCount)} tone="#123B63" />
      </div>

      <div className="panel">
        <div className="panel__header"><h2>Opportunity Directory</h2></div>
        <div className="opportunity-list">
          {challenges.filter((c) => c.status !== "DRAFT").map((c) => {
            const already = appliedIds.has(c.dbId);
            return (
              <div className="opportunity-card" key={c.id}>
                <div className="opportunity-card__main">
                  <div className="opportunity-card__top">
                    <span className="mono">{c.id}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3>{c.title}</h3>
                  <div className="opportunity-card__meta">
                    <span>{c.department}</span>
                    <span>Deadline: {c.deadline}</span>
                    <span>Eligibility: DPIIT-recognised, &lt;5 yrs</span>
                  </div>
                </div>
                <div className="opportunity-card__actions">
                  <button className="btn btn--outline btn--sm" onClick={() => onNavigate("eligibility")}>Check Eligibility</button>
                  {already ? (
                    <button className="btn btn--ghost btn--sm" disabled>Applied ✓</button>
                  ) : role !== "startup" ? (
                    <button className="btn btn--primary btn--sm" onClick={() => openApply(c)}>Login to Apply</button>
                  ) : (
                    <button className="btn btn--primary btn--sm" onClick={() => openApply(c)}>Apply Now</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {applyTarget && (
        <Modal
          title={`Apply — ${applyTarget.title}`}
          onClose={() => setApplyTarget(null)}
          onConfirm={submitApplication}
          confirmLabel={applying ? "Submitting…" : "Submit Application"}
        >
          <p className="muted" style={{ marginBottom: 16 }}>
            Challenge {applyTarget.id} · {applyTarget.department}
          </p>

          <div className="field field--full">
            <label className="field__label">Solution Proposal</label>
            <textarea
              className="field__input field__textarea"
              placeholder="Describe your proposed solution and how it addresses this challenge..."
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field field--full">
            <label className="field__label">Technology & Approach</label>
            <textarea
              className="field__input field__textarea"
              placeholder="Mention your technology stack, architecture and implementation approach..."
              value={technologyApproach}
              onChange={(e) => setTechnologyApproach(e.target.value)}
            />
          </div>

          <div className="field field--full">
            <label className="field__label">Expected Impact</label>
            <textarea
              className="field__input field__textarea"
              placeholder="Explain the expected outcomes, benefits and measurable impact..."
              value={expectedImpact}
              onChange={(e) => setExpectedImpact(e.target.value)}
            />
          </div>

          <div className="field field--full">
            <label className="field__label">Team Details</label>
            <textarea
              className="field__input field__textarea"
              placeholder="Mention team size, roles and relevant expertise..."
              value={teamDetails}
              onChange={(e) => setTeamDetails(e.target.value)}
            />
          </div>

          <div className="field field--full">
            <label className="field__label">Estimated Budget</label>
            <input
              className="field__input"
              type="text"
              placeholder="Example: ₹5,00,000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
            />
          </div>

          <div className="field field--full">
            <label className="field__label">Pilot Implementation Plan</label>
            <textarea
              className="field__input field__textarea"
              placeholder="Explain how you would implement and test the solution during the pilot..."
              value={pilotPlan}
              onChange={(e) => setPilotPlan(e.target.value)}
            />
          </div>

          {applyError && (
            <div
              className="info-callout info-callout--warn"
              style={{ marginTop: 10 }}
            >
              {applyError}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function EligibilityPage() {
  const [checked, setChecked] = useState(false);
  const criteria = [
    "Startup Registration (DPIIT-recognised)",
    "Required Experience (Minimum 1 year operational)",
    "Technical Capability (In-house R&D team)",
    "Financial Criteria (Annual turnover under ₹25 Cr)",
    "Required Documents (Incorporation certificate, GST, PAN)",
  ];
  return (
    <div className="page">
      <Breadcrumb items={["Home", "Startup Portal", "Eligibility Check"]} />
      <h1 className="page-title">Eligibility Verification</h1>
      <p className="page-desc">Challenge: <strong>GC-2026-014 — AI-Based Crop Disease Detection for Small Farmers</strong></p>

      <div className="panel">
        <div className="panel__header"><h2>Eligibility Criteria</h2></div>
        <ul className="criteria-list">
          {criteria.map((c) => (
            <li key={c}><span className="criteria-list__check">✓</span>{c}</li>
          ))}
        </ul>
        {!checked ? (
          <button className="btn btn--primary" onClick={() => setChecked(true)}>Run Eligibility Check</button>
        ) : (
          <div className="eligibility-result eligibility-result--eligible">
            <div className="eligibility-result__label">Eligibility Result</div>
            <div className="eligibility-result__value">ELIGIBLE</div>
            <p>Your organisation meets all published eligibility criteria for this challenge. You may proceed to submit an application.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const EVAL_RUBRIC = [
  { key: "technical_feasibility", name: "Technical Feasibility", max: 25 },
  { key: "innovation", name: "Innovation", max: 20 },
  { key: "scalability", name: "Scalability", max: 15 },
  { key: "cost_effectiveness", name: "Cost Effectiveness", max: 15 },
  { key: "implementation_capability", name: "Implementation Capability", max: 15 },
  { key: "government_impact", name: "Government Impact", max: 10 },
];

/** Government/Evaluator side: pick an application, score it, submit. */
function EvaluatorDashboardPage({ initialApplicationId }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [scores, setScores] = useState(() => Object.fromEntries(EVAL_RUBRIC.map((p) => [p.key, ""])));
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
      api.getApplications()
  .then((data) => {
    setApplications(data);

    setLoading(false);
  })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }, []);

  const selected = applications.find((a) => String(a.id) === String(selectedId));
  const total = EVAL_RUBRIC.reduce((sum, p) => sum + (Number(scores[p.key]) || 0), 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const numericScores = Object.fromEntries(
        EVAL_RUBRIC.map((p) => [p.key, Number(scores[p.key]) || 0])
      );
      await api.submitEvaluation(Number(selectedId), numericScores, remarks);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err.message?.includes("permission") || err.message === "Not authenticated"
          ? "You need to be logged in as Government or Evaluator to submit a score."
          : `Could not submit: ${err.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Breadcrumb items={["Home", "Government Dashboard", "Evaluator Dashboard"]} />
      <h1 className="page-title">Evaluator Dashboard</h1>
      <p className="page-subtitle">Score submitted applications against the rubric below. Scores feed directly into the Shortlisting page.</p>

      <div className="panel">
        <div className="panel__header"><h2>Select Application</h2></div>
        {loading ? (
          <p className="muted">Loading applications…</p>
        ) : loadError ? (
          <div className="info-callout info-callout--warn">Could not load applications: {loadError}</div>
        ) : applications.length === 0 ? (
          <p className="muted">No applications have been submitted yet.</p>
        ) : (
          <select
            className="field__input"
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setSubmitted(false); setSubmitError(""); }}
          >
            <option value="">Select an application to evaluate…</option>
            {applications.map((a) => (
              <option key={a.id} value={a.id}>
                Application #{a.id} — Challenge #{a.challenge_id} — {a.status}
              </option>
            ))}
          </select>
        )}
      </div>

      {selected && (
        <div className="panel">
          <div className="panel__header"><h2>Applicant Information</h2></div>
          <div className="info-grid">
            <div><span className="info-grid__label">Application ID</span><span className="mono">#{selected.id}</span></div>
            <div><span className="info-grid__label">Challenge ID</span><span className="mono">#{selected.challenge_id}</span></div>
            <div><span className="info-grid__label">Current Status</span><span>{selected.status}</span></div>
            <div><span className="info-grid__label">Proposal</span><span>{selected.proposal || "—"}</span></div>
          </div>
        </div>
      )}

      {selected && (
        <div className="panel">
          <div className="panel__header"><h2>Evaluation Matrix</h2></div>
          <DataTable columns={["Parameter", "Max", "Score", "—"]}>
            {EVAL_RUBRIC.map((p) => (
              <tr key={p.key}>
                <td>{p.name}</td>
                <td>{p.max}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max={p.max}
                    className="field__input"
                    style={{ width: 90 }}
                    value={scores[p.key]}
                    onChange={(e) => setScores((s) => ({ ...s, [p.key]: e.target.value }))}
                  />
                </td>
                <td className="muted">out of {p.max}</td>
              </tr>
            ))}
          </DataTable>
          <div className="final-score">
            <span>Total Score</span>
            <strong>{total} / 100</strong>
          </div>
          <div className="field field--full" style={{ marginTop: 14 }}>
            <label className="field__label">Remarks</label>
            <textarea
              className="field__input field__textarea"
              placeholder="Notes on feasibility, field-readiness, concerns, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {submitted && (
            <div className="info-callout" style={{ marginTop: 14 }}>
              ✓ Evaluation submitted — this application's status is now Under Review.
            </div>
          )}
          {submitError && (
            <div className="info-callout info-callout--warn" style={{ marginTop: 14 }}>{submitError}</div>
          )}

          <div className="form-actions">
            <div />
            <div className="form-actions__right">
              <button className="btn btn--primary" disabled={submitting || submitted} onClick={handleSubmit}>
                {submitting ? "Submitting…" : submitted ? "Submitted" : "Submit Evaluation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Startup side: read-only view of their own applications and any scores received. */
function MyEvaluationsPage() {
  const [applications, setApplications] = useState([]);
  const [evaluationsByApp, setEvaluationsByApp] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    api.getApplications()
      .then(async (apps) => {
        setApplications(apps);
        const entries = await Promise.all(
          apps.map(async (a) => {
            try {
              const evals = await api.getEvaluationsForApplication(a.id);
              return [a.id, evals];
            } catch {
              return [a.id, []];
            }
          })
        );
        setEvaluationsByApp(Object.fromEntries(entries));
        setLoading(false);
      })
      .catch((err) => { setLoadError(err.message); setLoading(false); });
  }, []);

  return (
    <div className="page">
      <Breadcrumb items={["Home", "Startup Portal", "My Evaluations"]} />
      <h1 className="page-title">My Evaluations</h1>
      <p className="page-subtitle">Track how your submitted applications have been scored by evaluators.</p>

      {loading ? (
        <p className="muted">Loading your applications…</p>
      ) : loadError ? (
        <div className="info-callout info-callout--warn">
          Could not load your applications: {loadError}. Make sure you're logged in as a Startup.
        </div>
      ) : applications.length === 0 ? (
        <div className="panel"><p className="muted">You haven't applied to any challenges yet. Head to the Startup Portal to apply.</p></div>
      ) : (
        applications.map((a) => {
          const evals = evaluationsByApp[a.id] || [];
          return (
            <div className="panel" key={a.id}>
              <div className="panel__header"><h2>Application #{a.id} — Challenge #{a.challenge_id}</h2></div>
              <div className="info-grid">
                <div><span className="info-grid__label">Status</span><span><StatusBadge status={a.status} /></span></div>
                <div><span className="info-grid__label">Proposal</span><span>{a.proposal || "—"}</span></div>
              </div>
              {evals.length === 0 ? (
                <p className="muted" style={{ marginTop: 12 }}>Not yet evaluated.</p>
              ) : (
                evals.map((ev) => (
                  <div key={ev.id} style={{ marginTop: 14 }}>
                    <DataTable columns={["Parameter", "Score"]}>
                      {Object.entries(ev.scores).map(([k, v]) => (
                        <tr key={k}><td>{k.replace(/_/g, " ")}</td><td>{v}</td></tr>
                      ))}
                    </DataTable>
                    <div className="final-score">
                      <span>Total Score</span>
                      <strong>{ev.total_score} / 100</strong>
                    </div>
                    {ev.remarks && <p className="muted" style={{ marginTop: 8 }}>Evaluator remarks: {ev.remarks}</p>}
                  </div>
                ))
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

function ShortlistingPage(){
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
const [evaluationLoading, setEvaluationLoading] = useState({});
const [evaluationMap, setEvaluationMap] = useState({});
useEffect(() => {
  const loadApplications = async () => {
    try {
      const apps = await api.getApplications();

      setApplications(apps);

      const evaluationResults = await Promise.all(
        apps.map(async (app) => {
          try {
            const evaluations = await api.getEvaluationsForApplication(app.id);
            return [app.id, evaluations];
          } catch (err) {
            console.error(
              `Evaluation load failed for application ${app.id}`,
              err
            );
            return [app.id, []];
          }
        })
      );

      setEvaluationMap(Object.fromEntries(evaluationResults));
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  loadApplications();
}, []);
  return (
    
    <div className="page">
      <Breadcrumb items={["Home", "Government Dashboard", "Shortlisting"]} />
      <h1 className="page-title">Transparent Shortlisting</h1>
      <p className="page-desc">Challenge: <strong>GC-2026-014 — AI-Based Crop Disease Detection for Small Farmers</strong></p>

      <div className="filter-bar">
        <FormField label="Department" isSelect placeholder="All Departments" options={["Ministry of Agriculture"]} />
        <FormField label="Challenge" isSelect placeholder="GC-2026-014" options={["GC-2026-014"]} />
        <FormField label="Eligibility" isSelect placeholder="All" options={["Eligible", "Not Eligible"]} />
        <FormField label="Status" isSelect placeholder="All" options={["Completed", "In Progress"]} />
      </div>

      <div className="panel">
 <DataTable columns={[
  "Rank",
  "Startup",
  "Eligibility",
  "Technical",
  "Innovation",
  "Scalability",
  "Cost Effectiveness",
  "Implementation",
  "Total Score",
  "Evaluation Status",
  "Decision"
]}>

          {loading ? (
            <tr>
              <td colSpan="11" style={{ textAlign: "center", padding: "20px" }}>
                Loading applications...
              </td>
            </tr>
          ) : applications.length === 0 ? (
            <tr>
              <td colSpan="1" style={{ textAlign: "center", padding: "20px" }}>
                No applications found.
              </td>
            </tr>
          ) : (
            applications.map((app, index) => (
              <tr key={app.id}>
  <td>
    <strong>#{index + 1}</strong>
  </td>

  <td>
    <div style={{ fontWeight: 700 }}>
      Startup #{app.startup_id}
    </div>
    <div className="muted" style={{ fontSize: 12 }}>
      Application #{app.id}
    </div>
  </td><td>
  <StatusBadge
    status={
      app.status === "REJECTED"
        ? "Not Eligible"
        : "Eligible"
    }
  />
</td>
 {(() => {
  const evaluations = evaluationMap[app.id] || [];
  const evaluation = evaluations[0];

  return (
    <>
      <td>{evaluation?.scores?.technical_feasibility ?? "—"} / 20</td>
      <td>{evaluation?.scores?.innovation ?? "—"} / 20</td>
      <td>{evaluation?.scores?.scalability ?? "—"} / 15</td>
      <td>{evaluation?.scores?.cost_effectiveness ?? "—"} / 15</td>
      <td>{evaluation?.scores?.implementation_capability ?? "—"} / 15</td>
      <td>
        <strong>{evaluation?.total_score ?? "—"} / 100</strong>
      </td>
    </>
  );
})()}
                <td>
  <StatusBadge status={app.status} />
</td>
    <td>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 8,
      minWidth: 150,
    }}
  >
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 2,
      }}
    >
      Decision
    </div>

   {app.status === "SHORTLISTED" ? (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}
  >
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        background: "#e8f7ee",
        color: "#18794e",
        textAlign: "center",
      }}
    >
      ✓ Shortlisted
    </div>

    <button
      className="link-btn"
      onClick={async () => {
        try {
          const today = new Date().toISOString().slice(0, 10);

          await api.createPilot({
            application_id: app.id,
            milestones: [
              {
                label: "Pilot Approved",
                done: true,
                date: today,
              },
              {
                label: "Pilot Deployment",
                done: false,
                date: null,
              },
              {
                label: "Performance Monitoring",
                done: false,
                date: null,
              },
              {
                label: "Pilot Evaluation",
                done: false,
                date: null,
              },
              {
                label: "Procurement Recommendation",
                done: false,
                date: null,
              },
            ],
            status: "PILOT APPROVED",
            progress: 20,
          });

          await api.updateApplication(app.id, {
            status: "PILOT",
          });

          setApplications((prev) =>
            prev.map((item) =>
              item.id === app.id
                ? { ...item, status: "PILOT" }
                : item
            )
          );

          alert("Pilot started successfully.");
        } catch (err) {
          console.error("Failed to start pilot:", err);
          alert(err.message || "Failed to start pilot.");
        }
      }}
    >
      Start Pilot
    </button>
  </div>
    ) : app.status === "REJECTED" ? (
      <div
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          background: "#fdecec",
          color: "#b42318",
          textAlign: "center",
        }}
      >
        ✕ Rejected
      </div>
    ) : (
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        <button
          className="link-btn"
          onClick={() => setSelectedApplication(app)}
        >
          View
        </button>

        <button
          className="link-btn"
          onClick={async () => {
            try {
              await api.updateApplication(app.id, {
                status: "SHORTLISTED",
              });

              setApplications((prev) =>
                prev.map((item) =>
                  item.id === app.id
                    ? { ...item, status: "SHORTLISTED" }
                    : item
                )
              );

              alert("Application shortlisted successfully.");
            } catch (err) {
              console.error("Failed to shortlist:", err);
              alert("Failed to shortlist application.");
            }
          }}
        >
          Shortlist
        </button>

        <button
          className="link-btn"
          onClick={async () => {
            try {
              await api.updateApplication(app.id, {
                status: "REJECTED",
              });

              setApplications((prev) =>
                prev.map((item) =>
                  item.id === app.id
                    ? { ...item, status: "REJECTED" }
                    : item
                )
              );

              alert("Application rejected successfully.");
            } catch (err) {
              console.error("Failed to reject:", err);
              alert("Failed to reject application.");
            }
          }}
        >
          Reject
        </button>

        <button
          className="link-btn"
          onClick={async () => {
            setEvaluationLoading(true);

            try {
              const evaluations =
                await api.getEvaluationsForApplication(app.id);

              setSelectedEvaluation({
                application: app,
                evaluations: evaluations,
              });
            } catch (err) {
              console.error("Failed to load evaluation:", err);

              setSelectedEvaluation({
                application: app,
                evaluations: [],
                error: err.message,
              });
            } finally {
              setEvaluationLoading(false);
            }
          }}
        >
          Evaluation
        </button>
      </div>
    )}
  </div>
</td>
              </tr>
            ))
          )}

        </DataTable>
        <div className="info-callout">
          Shortlisting decisions are based on predefined evaluation criteria.
        </div>
      </div>
      {selectedApplication && (
        
        
  <Modal
    title={`Application #${selectedApplication.id}`}
    onClose={() => setSelectedApplication(null)}
    onConfirm={() => setSelectedApplication(null)}
    confirmLabel="Close"
  >
    <div style={{ display: "grid", gap: 12 }}>
      <div>
        <strong>Startup ID:</strong> #{selectedApplication.startup_id}
      </div>

      <div>
        <strong>Challenge ID:</strong> #{selectedApplication.challenge_id}
      </div>

      <div>
        <strong>Status:</strong> {selectedApplication.status}
      </div>

      <div>
        <strong>Team Details:</strong>
        <p>{selectedApplication.team_details || "Not provided"}</p>
      </div>

      <div>
        <strong>Proposal:</strong>
        <p>{selectedApplication.proposal || "Not provided"}</p>
      </div>

      <div>
        <strong>Technology Approach:</strong>
        <p>{selectedApplication.technology_approach || "Not provided"}</p>
      </div>

      <div>
        <strong>Expected Impact:</strong>
        <p>{selectedApplication.expected_impact || "Not provided"}</p>
      </div>

      <div>
        <strong>Estimated Budget:</strong>
        ₹{selectedApplication.estimated_budget || "Not provided"}
      </div>

      <div>
        <strong>Pilot Plan:</strong>
        <p>{selectedApplication.pilot_plan || "Not provided"}</p>
      </div>
    </div>
  </Modal>
)}
{selectedEvaluation && (
  <Modal
    title={`Evaluation — Application #${selectedEvaluation.application.id}`}
    onClose={() => setSelectedEvaluation(null)}
    onConfirm={() => setSelectedEvaluation(null)}
    confirmLabel="Close"
  >
    {selectedEvaluation.error ? (
      <div className="info-callout info-callout--warn">
        Could not load evaluation: {selectedEvaluation.error}
      </div>
    ) : !selectedEvaluation.evaluations ||
      selectedEvaluation.evaluations.length === 0 ? (
      <div className="info-callout">
        No evaluation has been submitted for this application yet.
      </div>
    ) : (
      <div style={{ display: "grid", gap: 14 }}>
        {selectedEvaluation.evaluations.map((evaluation) => (
          <div key={evaluation.id}>

            <div style={{ marginBottom: 14 }}>
              <strong>Evaluator ID:</strong> #{evaluation.evaluator_id}
            </div>

            <DataTable
              columns={["Parameter", "Score"]}
            >
              <tr>
                <td>Technical Feasibility</td>
                <td>{evaluation.scores?.technical_feasibility ?? "—"} / 20</td>
              </tr>

              <tr>
                <td>Innovation</td>
                <td>{evaluation.scores?.innovation ?? "—"} / 20</td>
              </tr>

              <tr>
                <td>Scalability</td>
                <td>{evaluation.scores?.scalability ?? "—"} / 15</td>
              </tr>

              <tr>
                <td>Cost Effectiveness</td>
                <td>{evaluation.scores?.cost_effectiveness ?? "—"} / 15</td>
              </tr>

              <tr>
                <td>Implementation Capability</td>
                <td>{evaluation.scores?.implementation_capability ?? "—"} / 15</td>
              </tr>
            </DataTable>

            <div className="final-score" style={{ marginTop: 14 }}>
              <span>Total Score</span>
              <strong>{evaluation.total_score} / 100</strong>
            </div>

            <div style={{ marginTop: 14 }}>
              <strong>Evaluator Remarks:</strong>
              <p>
                {evaluation.remarks || "No remarks provided."}
              </p>
            </div>

            <div style={{ marginTop: 10 }} className="muted">
              Evaluated on:{" "}
              {evaluation.created_at
                ? new Date(evaluation.created_at).toLocaleDateString()
                : "—"}
            </div>

          </div>
        ))}
      </div>
    )}
  </Modal>
)}

    </div>
  );
}

const PILOT_STAGES = ["SHORTLISTED", "PILOT APPROVED", "PILOT DEPLOYMENT", "PERFORMANCE MONITORING", "PILOT EVALUATION", "PROCUREMENT RECOMMENDATION"];

function PilotProjectPage() {
  const [pilots, setPilots] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
  const loadPilots = async () => {
    try {
      const [pilotData, applicationData] = await Promise.all([
        api.getPilots(),
        api.getApplications(),
      ]);

      setPilots(pilotData);
      setApplications(applicationData);
    } catch (err) {
      console.error("Failed to load pilot data:", err);
    } finally {
      setLoading(false);
    }
  };

  loadPilots();
}, []);

  const [selectedPilot, setSelectedPilot] = useState(null);

const pilot = selectedPilot || pilots[0];
const movePilotToNextStage = async () => {
  if (!pilot) return;

  const stages = [
    {
      status: "PILOT APPROVED",
      progress: 20,
      milestoneIndex: 0,
    },
    {
      status: "PILOT DEPLOYMENT",
      progress: 40,
      milestoneIndex: 1,
    },
    {
      status: "PERFORMANCE MONITORING",
      progress: 60,
      milestoneIndex: 2,
    },
    {
      status: "PILOT EVALUATION",
      progress: 80,
      milestoneIndex: 3,
    },
    {
      status: "PROCUREMENT RECOMMENDATION",
      progress: 100,
      milestoneIndex: 4,
    },
  ];

  const currentIndex = stages.findIndex(
    (stage) => stage.status === pilot.status
  );

  const nextStage = stages[currentIndex + 1];

  if (!nextStage) {
    alert("Pilot is already at the final stage.");
    return;
  }

  const updatedMilestones = pilot.milestones.map((milestone, index) => ({
    ...milestone,
    done: index <= nextStage.milestoneIndex,
  }));

  try {
    const updatedPilot = await api.updatePilot
    (pilot.id, {
      status: nextStage.status,
      progress: nextStage.progress,
      milestones: updatedMilestones,
    });
    if (nextStage.progress === 100 && pilotApplication) {
  await api.updateApplication(pilotApplication.id, {
    status: "PROCUREMENT",
  });
}

    setPilots((prev) =>
      prev.map((item) =>
        item.id === pilot.id ? updatedPilot : item
      )
    );

    setSelectedPilot(updatedPilot);

    alert(`Pilot moved to ${nextStage.status}`);
  } catch (err) {
    console.error("Failed to update pilot:", err);
    alert(err.message || "Failed to update pilot.");
  }
};
const pilotApplication = pilot
  ? applications.find((app) => app.id === pilot.application_id)
  : null;

const startupId = pilotApplication?.startup_id;

  return (
    <div className="page">
      <Breadcrumb items={["Home", "Pilot Projects"]} />
      <h1 className="page-title">Pilot Project Monitoring</h1>
   <div className="page-desc">
    {pilots.length > 0 && (
<div
  style={{
    margin: "16px 0 24px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  }}
>
  <label style={{ fontWeight: 700 }}>
    Select Pilot:
  </label>

  <select
    value={pilot?.id ?? ""}
    onChange={(e) => {
      const selected = pilots.find(
        (p) => p.id === Number(e.target.value)
      );
      setSelectedPilot(selected);
    }}
    style={{
      padding: "9px 14px",
      borderRadius: 6,
      border: "1px solid #ccc",
      minWidth: 280,
      background: "#0f03038e",
    }}
  >
    {pilots.map((p) => (
      <option key={p.id} value={p.id}>
        Startup #{applications.find(
          (app) => app.id === p.application_id
        )?.startup_id ?? "—"}{" "}
        — {p.progress}% — {p.status}
      </option>
    ))}
  </select>
</div>
)}
  {pilot
    ? <>
     Startup: <strong>Startup #{startupId ?? "—"}</strong>
        {" · "}
        Application: <span className="mono">#{pilot.application_id}</span>
      </>
    : "Monitor all active pilot projects and their progress"}
</div >
      <div className="timeline">
        {pilots.length > 1 && (
  <div className="panel" style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {pilots.map((p) => (
        <button
          key={p.id}
          className="btn btn--secondary"
          onClick={() => setSelectedPilot(p)}
        >
    Startup #{applications.find((app) => app.id === p.application_id)?.startup_id ?? "—"} — {p.progress}%
        </button>
      ))}
    </div>
  </div>
)}
       {(pilot?.milestones || []).map((milestone, i) => (
        
  <div
    key={milestone.label}
    className={`timeline__item ${
      milestone.done ? "is-done" : ""
    } ${
      !milestone.done &&
      i === (pilot?.milestones || []).findIndex((m) => !m.done)
        ? "is-current"
        : ""
    }`}
  >
    <div className="timeline__dot" />
    <div className="timeline__label">
      {milestone.label}
    </div>
  </div>
))}
      </div>

      <div className="panel">
        <div
  className="info-grid"
  style={{
    gap: 24,
    marginBottom: 24,
  }}
>
          <div><span className="info-grid__label">Pilot Start Date</span><span>01 Jul 2026</span></div>
          <div><span className="info-grid__label">Expected Completion</span><span>30 Sep 2026</span></div>
          <div><span className="info-grid__label">Deployment Status</span><span><StatusBadge status={pilot?.status ?? "PILOT"} /></span></div>
          <div><span className="info-grid__label">Performance Score</span><span><strong>{pilot?.progress ?? 0} / 100</strong></span></div>
 <div
  style={{
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid #eee",
    textAlign: "center",
  }}
>
  {pilot && pilot.progress < 100 && (
    <button
      className="btn btn--primary"
      onClick={movePilotToNextStage}
    >
      Move to Next Stage
    </button>
  )}

  {pilot && pilot.progress === 100 && (
    <div
      style={{
        padding: "12px",
        fontWeight: 700,
        color: "#198754",
      }}
    >
      ✓ Pilot completed — Procurement Recommendation ready
    </div>
  )}
</div>
        </div>
        <div className="feedback-grid">
          <div className="feedback-box">
            <h4>Government Feedback</h4>
            <p>Field deployment at 3 Anganwadi centres is progressing on schedule. Minor connectivity issues reported and being addressed.</p>
          </div>
          <div className="feedback-box">
            <h4>Startup Performance</h4>
            <p>Response time to reported issues has averaged under 24 hours. Documentation and training materials rated satisfactory by field staff.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcurementPage() {
  const [applications, setApplications] = useState([]);
const [loading, setLoading] = useState(true);
const [evaluationMap, setEvaluationMap] = useState({});

useEffect(() => {
  const loadApplications = async () => {
    try {
      const data = await api.getApplications();

      const procurementApps = data.filter(
        (app) =>
          app.status === "PROCUREMENT" ||
          app.status === "PILOT"
      );

      const evaluationResults = await Promise.all(
        procurementApps.map(async (app) => {
          try {
            const evaluations =
              await api.getEvaluationsForApplication(app.id);

            return [app.id, evaluations];
          } catch (err) {
            console.error(
              `Failed to load evaluation for application ${app.id}`,
              err
            );

            return [app.id, []];
          }
        })
      );

      setApplications(data);
      setEvaluationMap(Object.fromEntries(evaluationResults));
    } catch (err) {
      console.error("Failed to load procurement data:", err);
    } finally {
      setLoading(false);
    }
  };

  loadApplications();
}, []);
  return (
    <div className="page">
      <Breadcrumb items={["Home", "Procurement"]} />
      <h1 className="page-title">Procurement Readiness</h1>
      <div className="info-callout info-callout--warn">
        Procurement Recommendation status indicates that a pilot met performance expectations. It does not, by itself, constitute award of a government contract.
      </div>
      <div className="panel">
        <DataTable columns={["Startup", "Solution", "Pilot Status", "Pilot Performance", "Estimated Cost", "Recommendation", "Procurement Status"]}>
  
         {loading ? (
  <tr>
    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
      Loading procurement data...
    </td>
  </tr>
) : applications.filter(
    (app) => app.status === "PROCUREMENT" || app.status === "PILOT"
  ).length === 0 ? (
  <tr>
    <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
      No procurement-ready applications found.
    </td>
  </tr>
) : (
  applications
    .filter(
      (app) =>
        app.status === "PROCUREMENT" ||
        app.status === "PILOT"
    )
    .map((app) => (
      <tr key={app.id}>
        <td>Startup #{app.startup_id}</td>
        <td>{app.proposal}</td>
        <td>{app.status === "PILOT" ? "Pilot Active" : "Pilot Completed"}</td>
    <td>
  {evaluationMap[app.id]?.[0]?.total_score ?? "—"} / 100
</td>
        <td>—</td>
        <td>
          {app.status === "PROCUREMENT"
            ? "Recommended"
            : "Under Evaluation"}
        </td>
        <td>
          <StatusBadge status={app.status} />
        </td>
      </tr>
    ))
)}
        </DataTable>
      </div>
    </div>
  );
}

function TransparencyPage() {
  return (
    <div className="page">
      <Breadcrumb items={["Home", "Transparency & Accountability"]} />
      <h1 className="page-title">Transparency &amp; Accountability</h1>
      <p className="page-desc">Every decision on GovInnovate is traceable to a named evaluator, a scoring record, and a dated audit entry.</p>

      <div className="panel">
        <div className="info-grid">
          <div><span className="info-grid__label">Evaluation Criteria</span><span>Technical Feasibility, Innovation, Scalability, Cost Effectiveness, Implementation Capability, Government Impact</span></div>
          <div><span className="info-grid__label">Evaluator</span><span>Dr. R. Sharma</span></div>
          <div><span className="info-grid__label">Evaluation Date</span><span>28 Aug 2026</span></div>
          <div><span className="info-grid__label">Decision</span><span><StatusBadge status="SHORTLISTED" /></span></div>
          <div><span className="info-grid__label">Decision Reason</span><span>Highest weighted score among eligible applicants; strong field-deployment plan.</span></div>
        </div>
      </div>

      <div className="panel">
        <div className="panel__header"><h2>Audit Trail</h2></div>
        <div className="audit-list">
          {AUDIT_LOG.map((a, i) => (
            <div className="audit-item" key={i}>
              <div className="audit-item__date">{a.date}</div>
              <div>
                <div className="audit-item__actor">{a.actor}</div>
                <div className="audit-item__action">{a.action}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenericInfoPage({ title }) {
  return (
    <div className="page">
      <Breadcrumb items={["Home", title]} />
      <h1 className="page-title">{title}</h1>
      <div className="panel">
        <p className="page-desc">This section is illustrative content for the Smart India Hackathon 2026 prototype.</p>
      </div>
    </div>
  );
}

/* ---------------- App Shell ---------------- */

export default function App() {
  const [view, setView] = useState("home");
  const [role, setRole] = useState("guest");
  const [currentUser, setCurrentUser] = useState(null);
  const [lang, setLang] = useState("en");
  const [fontScale, setFontScale] = useState("A");
  const [notifOpen, setNotifOpen] = useState(false);
  const [challenges, setChallenges] = useState(CHALLENGES);
  const [backendStatus, setBackendStatus] = useState("checking"); // "checking" | "live" | "offline"

  const refreshChallenges = () => {
    api
      .getChallenges()
      .then((data) => {
        // Map the backend's Challenge shape onto the shape this UI already expects,
        // keeping the real numeric `dbId` around for API calls (Apply, Evaluate, etc).
        const mapped = data.map((c) => ({
          dbId: c.id,
          id: c.challenge_code,
          title: c.title,
          department: c.department,
          applications: c.applications ?? 0,
          stage: c.status,
          deadline: c.deadline || "TBD",
          status: c.status,
        }));
        setChallenges(mapped);
        setBackendStatus("live");
      })
      .catch(() => {
        // Backend not running / unreachable — keep showing the built-in demo data.
        setBackendStatus("offline");
      });
  };

  // Restore a logged-in session on page load/refresh, if a token is already stored.
  useEffect(() => {
    refreshChallenges();
    if (api.isLoggedIn()) {
      api.getMe()
        .then((me) => { setCurrentUser(me); setRole(me.role); })
        .catch(() => { api.logout(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAuthed = (me) => {
    setCurrentUser(me);
    setRole(me.role);
    handleNavigate(me.role === "startup" ? "startupPortal" : me.role === "evaluator" ? "evaluatorDashboard" : "govDashboard");
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setRole("guest");
    handleNavigate("home");
  };

  const notifications = [
    { text: "Challenge GC-2026-014 has moved to Evaluation stage.", time: "2 hours ago", color: "#1B5E9E" },
    { text: "Your evaluation for KrishiMitra Innovations is due tomorrow.", time: "5 hours ago", color: "#E67E22" },
    { text: "Pilot performance report submitted for GC-2026-005.", time: "1 day ago", color: "#16803C" },
  ];

  const fontSizeMap = { "A-": "14px", A: "15.5px", "A+": "17.5px" };

  const handleNavigate = (key) => {
    if (key === "startupPortal2") key = "startupPortal";
    setView(key);
    setNotifOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // Client-side route guard, mirrors what the backend already enforces server-side.
  // Government/Evaluator-only and Startup-only routes redirect with a friendly message
  // instead of silently rendering a page whose actions will just 403.
  const GOV_ONLY = new Set(["createChallenge", "shortlisting", "govDashboard"]);
  const EVALUATOR_ROUTE = "evaluatorDashboard";
  const STARTUP_ONLY = new Set(["myEvaluations"]); // browsing challenges/eligibility stays public; only private data is gated

  const routeAccessDenied =
    (GOV_ONLY.has(view) && role !== "government") ||
    (view === EVALUATOR_ROUTE && role !== "evaluator" && role !== "government") ||
    (STARTUP_ONLY.has(view) && role !== "startup");

  const pageContent = useMemo(() => {
    if (routeAccessDenied) {
      return (
        <div className="page">
          <div className="panel" style={{ textAlign: "center", padding: 40 }}>
            <h2 style={{ marginTop: 0 }}>Access Restricted</h2>
            <p className="muted">This page requires a different account type. Please log in with the right credentials.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
              <button className="btn btn--outline" onClick={() => handleNavigate("govAuth")}>Government Login</button>
              <button className="btn btn--primary" onClick={() => handleNavigate("startupAuth")}>Startup Login</button>
            </div>
          </div>
        </div>
      );
    }
    switch (view) {
      case "home": return <HomePage onNavigate={handleNavigate} challenges={challenges} />;
      case "govAuth": return <GovAuthPage onAuthed={handleAuthed} />;
      case "startupAuth": return <StartupAuthPage onAuthed={handleAuthed} />;
      case "govDashboard": return <GovDashboardPage onNavigate={handleNavigate} challenges={challenges} />;
      case "createChallenge": return <CreateChallengePage onPublished={refreshChallenges} />;
      case "startupPortal": return <StartupPortalPage onNavigate={handleNavigate} challenges={challenges} role={role} />;
      case "eligibility": return <EligibilityPage />;
      case "evaluatorDashboard": return <EvaluatorDashboardPage initialApplicationId />;
      case "myEvaluations": return <MyEvaluationsPage />;
    case "shortlisting":
 case "shortlisting": return <ShortlistingPage />;
      case "pilotProject": return <PilotProjectPage />;
      case "procurement": return <ProcurementPage />;
      case "transparency": return <TransparencyPage />;
      case "about": return <GenericInfoPage title="About Platform" />;
      case "reports": return <GenericInfoPage title="Reports" />;
      case "contact": return <GenericInfoPage title="Contact" />;
      default: return <HomePage onNavigate={handleNavigate} challenges={challenges} />;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, challenges, role, routeAccessDenied]);

  const showSidebar = role !== "guest" && view !== "govAuth" && view !== "startupAuth";

  return (
    <div className="app-root" style={{ fontSize: fontSizeMap[fontScale] }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
 
        :root {
          --gov-blue: #0C2A4D;
          --gov-blue-2: #14559E;
          --saffron: #FF9933;
          --saffron-deep: #E0730A;
          --green: #0F8A3F;
          --success: #0F8A3F;
          --bg: #F5F8FC;
          --white: #FFFFFF;
          --text: #1F2937;
          --border: #E1E7EE;
        }
        * { box-sizing: border-box; }
        .app-root {
          font-family: 'Noto Sans', 'Noto Sans Devanagari', -apple-system, sans-serif;
          color: var(--text);
          background: var(--bg);
          min-height: 100vh;
          line-height: 1.5;
        }
        button { font-family: inherit; cursor: pointer; }
        a { text-decoration: none; }
 
        /* Tricolor identity strip */
        .tricolor-strip { height: 4px; display: flex; }
        .tricolor-strip span { flex: 1; }
        .tricolor-strip span:nth-child(1) { background: var(--saffron); }
        .tricolor-strip span:nth-child(2) { background: #FFFFFF; }
        .tricolor-strip span:nth-child(3) { background: var(--green); }
 
        /* Utility bar */
        .utility-bar { background: var(--gov-blue); color: #E7EEF5; font-size: 12px; }
        .utility-bar__inner { max-width: 1280px; margin: 0 auto; padding: 6px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; }
        .utility-bar__left, .utility-bar__right { display: flex; align-items: center; gap: 10px; }
        .utility-bar__sep { opacity: 0.4; }
        .utility-bar__skip, .utility-bar__link, .utility-bar__lang { background: none; border: none; color: #E7EEF5; font-size: 12px; padding: 0; }
        .utility-bar__label { opacity: 0.85; }
        .utility-bar__font { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.3); color: #E7EEF5; border-radius: 3px; width: 22px; height: 20px; font-size: 11px; line-height: 1; }
        .utility-bar__font.is-active { background: var(--saffron); border-color: var(--saffron); color: #fff; }
 
        /* Header */
        .site-header { background: var(--white); border-bottom: 1px solid var(--border); }
        .site-header__inner { max-width: 1280px; margin: 0 auto; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }
        .site-header__brand { display: flex; align-items: center; gap: 12px; background: none; border: none; padding: 0; text-align: left; }
        .site-header__emblem { border-radius: 50%; box-shadow: 0 0 0 3px #FFF3E6, 0 0 0 4px var(--saffron); }
        .site-header__name { font-size: 21px; font-weight: 800; color: var(--gov-blue); letter-spacing: -0.2px; }
        .site-header__tagline { font-size: 12.5px; color: var(--gov-blue-2); font-weight: 600; }
        .site-header__strap { font-size: 11.5px; color: #6B7280; margin-top: 2px; }
        .site-header__actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .header-icon-btn { display: flex; align-items: center; gap: 6px; background: var(--bg); border: 1px solid var(--border); padding: 7px 14px; border-radius: 999px; font-size: 13px; color: var(--text); position: relative; }
        .header-icon-btn__badge { background: var(--saffron-deep); color: #fff; font-size: 10px; font-weight: 700; border-radius: 8px; padding: 1px 5px; }
        .login-group { display: flex; gap: 8px; }
        .profile-chip { display: flex; align-items: center; gap: 8px; background: var(--bg); border: 1px solid var(--border); padding: 5px 10px 5px 5px; border-radius: 999px; }
        .profile-chip__avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--gov-blue); color: #fff; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .profile-chip__name { font-size: 12.5px; font-weight: 600; }
        .profile-chip__role { font-size: 11px; color: #6B7280; }
 
        /* Nav */
        .main-nav { background: var(--gov-blue); border-bottom: 3px solid var(--green); }
        .main-nav__inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; overflow-x: auto; }
        .main-nav__item { background: none; border: none; color: #C9D6E6; padding: 12px 16px; font-size: 13.5px; font-weight: 600; border-bottom: 3px solid transparent; white-space: nowrap; margin-bottom: -3px; }
        .main-nav__item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .main-nav__item.is-active { color: #fff; border-bottom-color: var(--saffron); background: rgba(255,255,255,0.06); }
 
        /* Layout with sidebar */
        .layout-with-sidebar { max-width: 1280px; margin: 0 auto; display: flex; gap: 24px; padding: 24px; align-items: flex-start; }
        .sidebar { width: 230px; flex-shrink: 0; background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 14px; position: sticky; top: 16px; }
        .sidebar__section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; font-weight: 700; margin-bottom: 8px; padding: 0 6px; }
        .sidebar__item { display: block; width: 100%; text-align: left; background: none; border: none; padding: 9px 10px; border-radius: 6px; font-size: 13.5px; color: var(--text); margin-bottom: 2px; }
        .sidebar__item:hover { background: var(--bg); }
        .sidebar__item.is-active { background: #FFF3E6; color: var(--saffron-deep); font-weight: 700; border-left: 3px solid var(--saffron); }
        .layout-main { flex: 1; min-width: 0; }
        .no-sidebar-main { max-width: 1280px; margin: 0 auto; padding: 24px; }
 
        /* Hero / Home */
        .hero { background: linear-gradient(120deg, var(--gov-blue) 0%, var(--gov-blue-2) 100%); color: #fff; padding: 64px 24px 58px; position: relative; overflow: hidden; border-bottom: 4px solid var(--saffron); }
        .hero__chakra { position: absolute; right: -70px; top: 50%; transform: translateY(-50%); width: 380px; height: 380px; opacity: 0.14; pointer-events: none; }
        .hero__inner { max-width: 820px; margin: 0 auto; text-align: center; position: relative; z-index: 1; }
        .hero__badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,153,51,0.18); border: 1px solid rgba(255,153,51,0.5); padding: 5px 14px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 18px; }
        .hero__title { font-size: 34px; font-weight: 800; line-height: 1.24; margin: 0 0 14px; letter-spacing: -0.3px; }
        .hero__subtitle { font-size: 15.5px; opacity: 0.92; max-width: 620px; margin: 0 auto 26px; }
        .hero__actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
 
        .stats-strip { background: transparent; margin-top: -26px; position: relative; z-index: 2; }
        .stats-strip__inner { max-width: 1280px; margin: 0 auto; padding: 0 24px 22px; display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
 
        .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 16px; border-top: 3px solid var(--saffron); box-shadow: 0 6px 16px rgba(12,42,77,0.08); }
        .stat-card__value { font-size: 26px; font-weight: 800; color: var(--gov-blue); }
        .stat-card__label { font-size: 12.5px; color: #4B5563; margin-top: 4px; }
        .stat-card__sub { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin: 18px 0 24px; }
 
        .content-section { max-width: 1280px; margin: 0 auto; padding: 24px 24px 44px; }
        .content-section--muted { background: var(--white); border-top: 1px solid var(--border); }
        .section-heading { margin-bottom: 26px; max-width: 640px; }
        .section-heading__eyebrow { font-size: 12px; font-weight: 700; color: var(--green); margin-bottom: 6px; }
        .section-heading__title { font-size: 22px; font-weight: 800; color: var(--gov-blue); margin: 0 0 8px; }
        .section-heading__desc { font-size: 13.5px; color: #4B5563; margin: 0; }
        .process-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
        .process-card { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 16px; transition: box-shadow 0.15s, transform 0.15s; }
        .process-card:hover { box-shadow: 0 8px 20px rgba(12,42,77,0.1); transform: translateY(-2px); }
        .process-card__num { font-size: 12px; font-weight: 700; color: var(--saffron-deep); margin-bottom: 8px; }
        .process-card__title { font-size: 14px; font-weight: 700; color: var(--gov-blue); margin-bottom: 6px; }
        .process-card__desc { font-size: 12.5px; color: #4B5563; }
 
        /* Generic page */
        .page { max-width: 100%; }
        .page-title { font-size: 22px; font-weight: 700; color: var(--gov-blue); margin: 10px 0 4px; }
        .page-subtitle { font-size: 13.5px; color: #4B5563; margin: 0 0 18px; max-width: 640px; }

        /* Auth pages */
        .auth-page { max-width: 1280px; margin: 0 auto; padding: 48px 24px; display: flex; justify-content: center; }
        .auth-page__card { width: 100%; max-width: 440px; background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(12,42,77,0.08); }
        .auth-page__badge { display: inline-block; background: #FFF3E6; color: var(--saffron-deep); font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 14px; }
        .auth-page__title { font-size: 21px; font-weight: 800; color: var(--gov-blue); margin: 0 0 8px; }
        .auth-page__desc { font-size: 13px; color: #6B7280; margin: 0 0 22px; line-height: 1.5; }
        .auth-form__tabs { display: flex; border: 1px solid var(--border); border-radius: 999px; padding: 3px; margin-bottom: 18px; }
        .auth-form__tab { flex: 1; background: none; border: none; padding: 8px; border-radius: 999px; font-size: 13px; font-weight: 700; color: #6B7280; }
        .auth-form__tab.is-active { background: var(--gov-blue); color: #fff; }
        .page-title-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; }
        .page-title__meta { display: flex; gap: 18px; flex-wrap: wrap; font-size: 12.5px; color: #4B5563; margin-top: 6px; }
        .page-desc { font-size: 13.5px; color: #4B5563; margin: 4px 0 18px; }
 
        .breadcrumb { font-size: 12.5px; color: #6B7280; margin-bottom: 4px; }
        .breadcrumb__sep { margin: 0 6px; }
        .breadcrumb__current { color: var(--gov-blue); font-weight: 600; }
 
        .panel { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 18px; margin-bottom: 20px; }
        .panel__header { margin-bottom: 14px; }
        .panel__header h2 { font-size: 16px; font-weight: 700; color: var(--gov-blue); margin: 0; }
 
        .data-table-wrap { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .data-table th { background: var(--bg); color: #374151; text-align: left; font-weight: 700; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.3px; padding: 10px 12px; border-bottom: 2px solid var(--border); white-space: nowrap; }
        .data-table td { padding: 11px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
        .data-table tr:hover td { background: #FFF9F2; }
        .mono { font-family: ui-monospace, monospace; font-size: 12px; color: #4B5563; }
        .muted { color: #9CA3AF; font-size: 12.5px; }
 
        .btn { border-radius: 999px; font-size: 13.5px; font-weight: 700; padding: 9px 18px; border: 1px solid transparent; }
        .btn--sm { padding: 6px 14px; font-size: 12.5px; }
        .btn--lg { padding: 12px 26px; font-size: 14.5px; }
        .btn--primary { background: var(--saffron); color: #1F2937; }
        .btn--primary:hover { background: var(--saffron-deep); color: #fff; }
        .btn--outline { background: var(--white); color: var(--gov-blue); border-color: var(--gov-blue-2); }
        .btn--outline:hover { background: #F0F6FC; }
        .btn--ghost { background: none; color: #4B5563; border-color: var(--border); }
        .btn[disabled] { opacity: 0.45; cursor: not-allowed; }
        .link-btn { background: none; border: none; color: var(--gov-blue-2); font-size: 12.5px; font-weight: 600; padding: 0; }
        .link-btn:hover { text-decoration: underline; }
 
        .stepper { display: flex; justify-content: space-between; margin: 20px 0 24px; position: relative; }
        .stepper__step { flex: 1; text-align: center; position: relative; }
        .stepper__step:not(:last-child)::after { content: ""; position: absolute; top: 15px; left: 55%; width: 90%; height: 2px; background: var(--border); z-index: 0; }
        .stepper__step.is-done:not(:last-child)::after { background: var(--success); }
        .stepper__num { width: 30px; height: 30px; border-radius: 50%; background: var(--white); border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #6B7280; margin: 0 auto 8px; position: relative; z-index: 1; }
        .stepper__step.is-active .stepper__num { border-color: var(--gov-blue-2); color: var(--gov-blue-2); }
        .stepper__step.is-done .stepper__num { border-color: var(--success); background: var(--success); color: #fff; }
        .stepper__label { font-size: 11.5px; color: #4B5563; }
        .stepper__step.is-active .stepper__label { color: var(--gov-blue); font-weight: 700; }
 
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field--full { grid-column: 1 / -1; }
        .field__label { font-size: 12.5px; font-weight: 600; color: var(--text); }
        .field__input { border: 1px solid var(--border); border-radius: 4px; padding: 9px 11px; font-size: 13.5px; font-family: inherit; background: var(--white); color: var(--text); }
        .field__input:focus { outline: 2px solid var(--gov-blue-2); outline-offset: 1px; border-color: var(--gov-blue-2); }
        .field__textarea { min-height: 80px; resize: vertical; }
 
        .form-actions { display: flex; justify-content: space-between; margin-top: 20px; border-top: 1px solid var(--border); padding-top: 16px; }
        .form-actions__right { display: flex; gap: 10px; }
 
        .review-block h3 { color: var(--gov-blue); margin: 0 0 8px; }
        .review-list { font-size: 13.5px; line-height: 2; }
        .success-box { display: flex; gap: 14px; align-items: flex-start; background: #EAF5EC; border: 1px solid #BFE3C6; border-radius: 6px; padding: 16px; }
        .success-box__icon { width: 30px; height: 30px; border-radius: 50%; background: var(--success); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
 
        .opportunity-list { display: flex; flex-direction: column; gap: 12px; }
        .opportunity-card { border: 1px solid var(--border); border-radius: 6px; padding: 16px; display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .opportunity-card__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .opportunity-card__main h3 { font-size: 15px; margin: 0 0 8px; color: var(--gov-blue); }
        .opportunity-card__meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 12px; color: #6B7280; }
        .opportunity-card__actions { display: flex; gap: 8px; align-items: flex-start; flex-wrap: wrap; }
 
        .criteria-list { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-direction: column; gap: 10px; }
        .criteria-list li { display: flex; align-items: center; gap: 10px; font-size: 13.5px; }
        .criteria-list__check { width: 20px; height: 20px; border-radius: 50%; background: var(--success); color: #fff; font-size: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .eligibility-result { border-radius: 6px; padding: 18px; margin-top: 6px; }
        .eligibility-result--eligible { background: #EAF5EC; border: 1px solid #BFE3C6; }
        .eligibility-result__label { font-size: 12px; color: #4B5563; text-transform: uppercase; letter-spacing: 0.4px; }
        .eligibility-result__value { font-size: 22px; font-weight: 700; color: var(--success); margin: 4px 0 8px; }
 
        .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 4px; }
        .info-grid > div { display: flex; flex-direction: column; gap: 3px; font-size: 13.5px; }
        .info-grid__label { font-size: 11.5px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.3px; }
 
        .final-score { display: flex; justify-content: space-between; align-items: center; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 12px 16px; margin-top: 14px; font-size: 14px; }
        .final-score strong { color: var(--gov-blue); font-size: 18px; }
        .evaluator-tag { font-size: 12px; color: #6B7280; margin-top: 10px; }
 
        .filter-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; background: var(--white); border: 1px solid var(--border); border-radius: 6px; padding: 16px; margin-bottom: 16px; }
        .info-callout { background: #E8F1FB; border: 1px solid #BBD6EE; border-radius: 4px; padding: 10px 14px; font-size: 12.5px; color: var(--gov-blue); margin-top: 14px; }
        .info-callout--warn { background: #FDF1E4; border-color: #F3D5AE; color: #8A4C0B; margin-bottom: 16px; }
 
        .timeline { display: flex; justify-content: space-between; margin: 20px 0 28px; position: relative; }
        .timeline__item { flex: 1; text-align: center; position: relative; }
        .timeline__item:not(:last-child)::after { content: ""; position: absolute; top: 7px; left: 55%; width: 90%; height: 2px; background: var(--border); }
        .timeline__item.is-done:not(:last-child)::after { background: var(--gov-blue-2); }
        .timeline__dot { width: 16px; height: 16px; border-radius: 50%; background: var(--white); border: 2px solid var(--border); margin: 0 auto 8px; position: relative; z-index: 1; }
        .timeline__item.is-done .timeline__dot { background: var(--gov-blue-2); border-color: var(--gov-blue-2); }
        .timeline__item.is-current .timeline__dot { background: var(--saffron); border-color: var(--saffron); box-shadow: 0 0 0 4px #FBEFE8; }
        .timeline__label { font-size: 10.5px; color: #6B7280; font-weight: 600; }
        .timeline__item.is-current .timeline__label { color: #8A4C0B; }
 
        .feedback-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px; }
        .feedback-box { background: var(--bg); border: 1px solid var(--border); border-radius: 6px; padding: 14px; }
        .feedback-box h4 { margin: 0 0 6px; font-size: 13px; color: var(--gov-blue); }
        .feedback-box p { margin: 0; font-size: 12.5px; color: #4B5563; }
 
        .audit-list { display: flex; flex-direction: column; }
        .audit-item { display: flex; gap: 20px; padding: 12px 0; border-bottom: 1px solid var(--border); }
        .audit-item:last-child { border-bottom: none; }
        .audit-item__date { font-size: 11.5px; color: #9CA3AF; width: 150px; flex-shrink: 0; }
        .audit-item__actor { font-size: 13px; font-weight: 600; }
        .audit-item__action { font-size: 12.5px; color: #4B5563; }
 
        .modal-overlay { position: fixed; inset: 0; background: rgba(18,59,99,0.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px; }
        .modal-box {
  background: var(--white);
  border-radius: 6px;
  width: 440px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
        .modal-box__header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; border-bottom: 1px solid var(--border); }
        .modal-box__header h3 { margin: 0; font-size: 15px; color: var(--gov-blue); }
        .modal-box__close { background: none; border: none; font-size: 20px; color: #6B7280; line-height: 1; }
       .modal-box__body {
  padding: 18px;
  font-size: 13.5px;
  color: #4B5563;
  overflow-y: auto;
  flex: 1;
}
        .modal-box__footer { display: flex; justify-content: flex-end; gap: 10px; padding: 14px 18px; border-top: 1px solid var(--border); }
 
        .notif-panel { position: absolute; right: 0; top: calc(100% + 8px); width: 300px; background: var(--white); border: 1px solid var(--border); border-radius: 6px; box-shadow: 0 8px 24px rgba(18,59,99,0.15); z-index: 40; }
        .notif-panel__header { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px; border-bottom: 1px solid var(--border); font-weight: 700; font-size: 13px; color: var(--gov-blue); }
        .notif-item { display: flex; gap: 10px; padding: 12px 14px; border-bottom: 1px solid var(--border); }
        .notif-item:last-child { border-bottom: none; }
        .notif-item__dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .notif-item__text { font-size: 12.5px; color: var(--text); }
        .notif-item__time { font-size: 11px; color: #9CA3AF; margin-top: 2px; }
 
        .site-footer { background: var(--gov-blue); color: #C9D8E8; margin-top: 20px; border-top: 4px solid var(--saffron); }
        .site-footer__inner { max-width: 1280px; margin: 0 auto; padding: 36px 24px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 24px; }
        .site-footer__brand { font-size: 17px; font-weight: 800; color: #fff; }
        .site-footer__tag { font-size: 12.5px; color: #A9C2DA; margin-bottom: 10px; }
        .site-footer__note { font-size: 12px; margin: 0 0 4px; }
        .site-footer__disclaimer { font-size: 11.5px; color: var(--saffron); font-weight: 700; margin: 0; }
        .site-footer__heading { font-size: 12px; font-weight: 700; color: #fff; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 10px; }
        .site-footer__link { font-size: 12.5px; margin-bottom: 8px; opacity: 0.9; }
        .site-footer__bottom { border-top: 1px solid rgba(255,255,255,0.15); text-align: center; padding: 14px; font-size: 11.5px; color: #A9C2DA; background: rgba(0,0,0,0.12); }
 
        @media (max-width: 1024px) {
          .stats-strip__inner, .process-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .form-grid, .info-grid, .feedback-grid, .filter-bar { grid-template-columns: 1fr; }
          .layout-with-sidebar { flex-direction: column; }
          .sidebar { width: 100%; position: static; display: flex; overflow-x: auto; gap: 6px; }
          .sidebar__item { width: auto; white-space: nowrap; }
          .site-footer__inner { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .stats-strip__inner, .stat-grid, .site-footer__inner { grid-template-columns: 1fr; }
          .hero__title { font-size: 24px; }
          .stepper__label { display: none; }

          /* =========================================================
   GovInnovate — Global UI & Responsive Improvements
   ========================================================= */

/* Wider desktop layout */
.layout-with-sidebar {
  max-width: 1440px;
  padding: 20px 24px;
  gap: 20px;
}

.no-sidebar-main {
  max-width: 1440px;
  padding: 20px 24px;
}

.content-section {
  max-width: 1440px;
  padding: 24px 24px 40px;
}

.utility-bar__inner,
.site-header__inner,
.main-nav__inner,
.site-footer__inner {
  max-width: 1440px;
}

/* Main content should use available width */
.layout-main {
  flex: 1 1 auto;
  min-width: 0;
}

/* Better cards/panels */
.panel {
  width: 100%;
  overflow: hidden;
}

/* Tables stay usable on smaller screens */
.data-table-wrap {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  min-width: 720px;
}

/* Forms don't become unnecessarily narrow */
.form-grid {
  width: 100%;
}

/* Buttons can wrap instead of overflowing */
.form-actions,
.hero__actions {
  flex-wrap: wrap;
}

/* =========================================================
   Laptop / Tablet
   ========================================================= */

@media (max-width: 1100px) {
  .layout-with-sidebar {
    gap: 16px;
    padding: 18px;
  }

  .sidebar {
    width: 210px;
  }

  .page-title {
    font-size: 21px;
  }

  .panel {
    padding: 16px;
  }

  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* =========================================================
   Tablet
   ========================================================= */

@media (max-width: 900px) {
  .layout-with-sidebar {
    flex-direction: column;
    padding: 16px;
  }

  .sidebar {
    width: 100%;
    position: static;
    display: flex;
    gap: 6px;
    overflow-x: auto;
    padding: 8px;
    scrollbar-width: thin;
  }

  .sidebar__item {
    width: auto;
    min-width: max-content;
    white-space: nowrap;
  }

  .layout-main {
    width: 100%;
  }

  .site-header__inner {
    padding: 12px 18px;
  }

  .main-nav__inner {
    padding: 0 16px;
  }

  .utility-bar__inner {
    padding: 6px 18px;
  }

  .content-section,
  .no-sidebar-main {
    padding-left: 18px;
    padding-right: 18px;
  }

  .form-grid {
    grid-template-columns: 1fr 1fr;
  }

  .info-grid,
  .feedback-grid {
    grid-template-columns: 1fr 1fr;
  }

  .filter-bar {
    grid-template-columns: 1fr 1fr;
  }
}

/* =========================================================
   Mobile
   ========================================================= */

@media (max-width: 640px) {
  .layout-with-sidebar {
    padding: 10px;
    gap: 12px;
  }

  .layout-main {
    width: 100%;
  }

  .sidebar {
    padding: 6px;
    border-radius: 8px;
  }

  .sidebar__item {
    font-size: 12.5px;
    padding: 8px 10px;
  }

  .page-title {
    font-size: 20px;
    line-height: 1.3;
    margin-top: 6px;
  }

  .page-subtitle {
    font-size: 13px;
  }

  .panel {
    padding: 13px;
    margin-bottom: 14px;
    border-radius: 8px;
  }

  .form-grid,
  .info-grid,
  .feedback-grid,
  .filter-bar {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .content-section,
  .no-sidebar-main {
    padding: 16px 10px 28px;
  }

  .site-header__inner {
    padding: 10px;
    gap: 10px;
  }

  .site-header__name {
    font-size: 18px;
  }

  .site-header__tagline {
    font-size: 11px;
  }

  .site-header__strap {
    font-size: 10px;
  }

  .site-header__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .header-icon-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .profile-chip {
    max-width: 100%;
  }

  .main-nav__inner {
    padding: 0 8px;
  }

  .main-nav__item {
    padding: 10px 12px;
    font-size: 12.5px;
  }

  .utility-bar__inner {
    padding: 6px 10px;
  }

  .utility-bar__left,
  .utility-bar__right {
    gap: 6px;
  }

  .hero {
    padding: 42px 16px 38px;
  }

  .hero__title {
    font-size: 24px;
  }

  .hero__subtitle {
    font-size: 14px;
  }

  .hero__chakra {
    width: 240px;
    height: 240px;
    right: -100px;
  }

  .btn {
    max-width: 100%;
  }

  .form-actions {
    width: 100%;
  }

  .form-actions .btn {
    flex: 1 1 auto;
  }

  .modal-overlay {
    padding: 10px;
  }

  .modal-box {
    width: 100%;
    max-width: 100%;
    max-height: 94vh;
  }

  .modal-box__header {
    padding: 13px 14px;
  }

  .modal-box__body {
    padding: 14px;
  }

  .modal-box__footer {
    padding: 12px 14px;
    flex-wrap: wrap;
  }

  .modal-box__footer .btn {
    flex: 1 1 auto;
  }

  .notif-panel {
    width: min(300px, calc(100vw - 20px));
    right: -5px;
  }
}

/* =========================================================
   Very Small Phones
   ========================================================= */

@media (max-width: 420px) {
  .layout-with-sidebar {
    padding: 8px;
  }

  .page-title {
    font-size: 18px;
  }

  .panel {
    padding: 11px;
  }

  .btn {
    font-size: 12.5px;
    padding: 8px 13px;
  }

  .hero {
    padding: 34px 12px;
  }

  .hero__title {
    font-size: 21px;
  }

  .hero__actions {
    flex-direction: column;
  }

  .hero__actions .btn {
    width: 100%;
  }
}
        }
      `}</style>

      <div className="tricolor-strip"><span /><span /><span /></div>
      <TopUtilityBar lang={lang} setLang={setLang} fontScale={fontScale} setFontScale={setFontScale} backendStatus={backendStatus} />
      <Header role={role} currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} notifOpen={notifOpen} setNotifOpen={setNotifOpen} notifications={notifications} />
      <MainNav current={view} onNavigate={handleNavigate} />

      <main id="main-content">
        {showSidebar ? (
          <div className="layout-with-sidebar">
            <Sidebar role={role} current={view} onNavigate={handleNavigate} />
            <div className="layout-main">{pageContent}</div>
          </div>
        ) : (
          <div className="no-sidebar-main">{pageContent}</div>
        )}
      </main>

      <Footer />
    </div>
  );
}



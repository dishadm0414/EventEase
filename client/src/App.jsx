import React, { useEffect, useState } from "react";
import api from "./api";
import "./index.css";

const emptyEvent = {
  title: "", description: "", date: "", venue: "", capacity: 30
};

export default function App() {
  const [workshops, setWorkshops] = useState([]);
  const [selected, setSelected] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState(emptyEvent);
  const [participant, setParticipant] = useState({ name: "", usn: "", email: "" });

  async function loadWorkshops() {
    try {
      const { data } = await api.get("/workshops");
      setWorkshops(data);
    } catch {
      setError("Could not load workshops. Check that the backend and database are running.");
    }
  }

  useEffect(() => { loadWorkshops(); }, []);

  async function createWorkshop(e) {
    e.preventDefault();
    setMessage(""); setError("");
    try {
      await api.post("/workshops", { ...event, capacity: Number(event.capacity) });
      setMessage("Workshop created successfully!");
      setEvent(emptyEvent);
      await loadWorkshops();
    } catch (err) {
      setError(err.response?.data?.message || "Workshop creation failed.");
    }
  }

  async function register(e) {
    e.preventDefault();
    setMessage(""); setError(""); setLoading(true);
    try {
      const { data } = await api.post("/registrations", {
        workshopId: selected,
        name: participant.name,
        usn: participant.usn.trim().toUpperCase(),
        email: participant.email.trim().toLowerCase()
      });
      setMessage(data.message);
      setParticipant({ name: "", usn: "", email: "" });
      await loadWorkshops();
      await showAttendees(selected);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function showAttendees(id) {
    setSelected(id);
    setError("");
    if (!id) { setAttendees([]); return; }
    try {
      const { data } = await api.get(`/workshops/${id}/attendees`);
      setAttendees(data.attendees);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load attendees.");
    }
  }

  const selectedWorkshop = workshops.find(w => w._id === selected);

  // Real-time duplicate checking against the current workshop's attendees
  const isDuplicateUsn = Boolean(
    participant.usn.trim() &&
    attendees.some(a => a.usn && a.usn.toUpperCase() === participant.usn.trim().toUpperCase())
  );

  const isDuplicateEmail = Boolean(
    participant.email.trim() &&
    attendees.some(a => a.email && a.email.toLowerCase() === participant.email.trim().toLowerCase())
  );

  return (
    <main className="container">
      <header className="hero">
        <p className="eyebrow">TECH COMMUNITY · LEARN · BUILD</p>
        <h1>Event<span>Ease</span><span style={{ color: "var(--muted)", fontSize: "0.6em", fontWeight: 500 }}>.bmsce</span></h1>
        <p>Discover workshops. Reserve your seat. Build your skills.</p>
      </header>

      {(message || error) && (
        <div className={`notice ${error ? "error" : ""}`} role="status">
          {error || message}
        </div>
      )}

      <section className="panel">
        <div className="section-kicker">FOR ORGANIZERS</div>
        <h2>Create a workshop</h2>
        <form onSubmit={createWorkshop} className="form-grid">
          <input placeholder="Workshop title" aria-label="Workshop title" required
            value={event.title} onChange={e => setEvent({ ...event, title: e.target.value })} />
          <input placeholder="Venue" aria-label="Venue" required
            value={event.venue} onChange={e => setEvent({ ...event, venue: e.target.value })} />
          <textarea placeholder="Workshop description" aria-label="Workshop description" required
            value={event.description} onChange={e => setEvent({ ...event, description: e.target.value })} />
          <label>Workshop date and time
            <input type="datetime-local" required value={event.date}
              onChange={e => setEvent({ ...event, date: e.target.value })} />
          </label>
          <label>Maximum seats
            <input type="number" min="1" step="1" required value={event.capacity}
              onChange={e => setEvent({ ...event, capacity: e.target.value })} />
          </label>
          <button type="submit">＋ Create workshop</button>
        </form>
      </section>

      <section>
        <div className="section-heading">
          <div><p className="eyebrow">WHAT'S HAPPENING</p><h2>Upcoming workshops</h2></div>
          <span className="count-pill">{workshops.length} events</span>
        </div>
        {workshops.length === 0 ? (
          <div className="empty-state"><span className="empty-icon">✦</span>
            <h3>Your next idea starts here</h3><p>Create a workshop above to get started.</p>
          </div>
        ) : (
          <div className="workshop-grid">
            {workshops.map(workshop => {
              const remaining = Math.max(0, workshop.capacity - workshop.registeredCount);
              const full = remaining === 0;
              const percentage = Math.min(100, workshop.registeredCount / workshop.capacity * 100);
              return (
                <article className="workshop-card" key={workshop._id}>
                  <div className="card-top">
                    <span className="tag">TECH WORKSHOP</span>
                    <span className={`seats ${full ? "full" : ""}`}>{full ? "Fully booked" : `${remaining} seats left`}</span>
                  </div>
                  <h3>{workshop.title}</h3>
                  <p className="description">{workshop.description}</p>
                  <p className="meta"><span>◷</span> {new Date(workshop.date).toLocaleString()}</p>
                  <p className="meta"><span>⌖</span> {workshop.venue}</p>
                  <div className="progress"><div style={{ width: `${percentage}%` }} /></div>
                  <p className="capacity">{workshop.registeredCount} of {workshop.capacity} seats reserved</p>
                  <button
                    disabled={full}
                    onClick={() => {
                      setSelected(workshop._id);
                      setMessage("");
                      setError("");
                      showAttendees(workshop._id);
                      setTimeout(() => {
                        document.getElementById("registration")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                  >
                    {full ? "Workshop full" : "Register now"} <span>→</span>
                  </button>
                  <button className="secondary" onClick={() => showAttendees(workshop._id)}>View attendees</button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {selected && (
        <section className="panel" id="registration">
          <div className="section-kicker">SAVE YOUR SPOT</div>
          <h2>Participant registration</h2>
          <p className="muted">
            Registering for: <strong>{selectedWorkshop ? selectedWorkshop.title : "Selected workshop"}</strong>
          </p>

          <form onSubmit={register} className="form-grid">
            <div className="field-group">
              <input
                placeholder="Full student name"
                aria-label="Full name"
                autoComplete="name"
                required
                value={participant.name}
                onChange={e => setParticipant({ ...participant, name: e.target.value })}
              />
            </div>

            <div className="field-group">
              <input
                placeholder="BMSCE USN (e.g., 1BM22CS001)"
                aria-label="BMSCE USN"
                required
                value={participant.usn}
                onChange={e => setParticipant({ ...participant, usn: e.target.value.toUpperCase() })}
              />
              {isDuplicateUsn && (
                <span className="field-warning">
                  ⚠️ USN {participant.usn.trim().toUpperCase()} is already registered for this workshop!
                </span>
              )}
            </div>

            <div className="field-group" style={{ gridColumn: "span 2" }}>
              <input
                type="email"
                placeholder="Email address (e.g., alex.cs22@bmsce.ac.in)"
                aria-label="Email address"
                autoComplete="email"
                required
                value={participant.email}
                onChange={e => setParticipant({ ...participant, email: e.target.value })}
              />
              {isDuplicateEmail && (
                <span className="field-warning">
                  ⚠️ Email {participant.email.trim().toLowerCase()} is already registered for this workshop!
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || isDuplicateUsn || isDuplicateEmail}
              style={{ gridColumn: "span 2" }}
            >
              {loading
                ? "Registering…"
                : isDuplicateUsn
                ? "Cannot Register: Duplicate USN"
                : isDuplicateEmail
                ? "Cannot Register: Duplicate Email"
                : "Confirm registration →"}
            </button>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="section-heading" style={{ margin: "0 0 10px 0" }}>
          <div>
            <div className="section-kicker">WORKSHOP ROSTER</div>
            <h2>Attendee list</h2>
          </div>
          {selected && (
            <span className="count-pill">{attendees.length} registered</span>
          )}
        </div>
        <p className="muted">View registered BMSCE students for a selected workshop.</p>
        <select aria-label="Select workshop" value={selected} onChange={e => showAttendees(e.target.value)}>
          <option value="">Select a workshop</option>
          {workshops.map(w => <option key={w._id} value={w._id}>{w.title}</option>)}
        </select>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Participant</th>
                <th>BMSCE USN</th>
                <th>Email</th>
                <th>Registered on</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map(a => (
                <tr key={a._id}>
                  <td className="attendee-name">{a.name}</td>
                  <td><span className="usn-badge">{a.usn || "N/A"}</span></td>
                  <td>{a.email}</td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {selected && attendees.length === 0 && (
                <tr><td colSpan="4" className="table-empty">No attendees registered yet.</td></tr>
              )}
              {!selected && (
                <tr><td colSpan="4" className="table-empty">Select a workshop to view attendees.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <footer><span className="footer-mark">E</span><span>EventEase.bmsce</span><span className="footer-dot">·</span><span>Made for the tech community</span></footer>
    </main>
  );
}

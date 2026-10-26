import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
type Service = { id: string; name: string; category: string; durationMinutes: number; price: number; description: string };
type BookingResult = { serviceName: string; date: string; time: string; customerName: string };
const now = new Date();
const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

export default function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<Service | null>(null);
  const [date, setDate] = useState(today); const [slots, setSlots] = useState<string[]>([]); const [time, setTime] = useState('');
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState<BookingResult | null>(null); const [loading, setLoading] = useState(true);

  useEffect(() => { fetch('/api/services').then(r => { if (!r.ok) throw new Error('Could not load services. Is the API running?'); return r.json() as Promise<Service[]>; }).then(setServices).catch((e: Error) => setMessage(e.message)).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!selected || !date) return; setTime(''); fetch(`/api/availability?serviceId=${encodeURIComponent(selected.id)}&date=${date}`).then(r => r.json()).then(data => setSlots(data.slots ?? [])).catch(() => setSlots([])); }, [selected, date]);

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return; setMessage('');
    const response = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceId: selected.id, customerName: name, email, date, time }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message ?? 'We could not complete your booking. Please try again.'); return; }
    setConfirmed({ serviceName: data.serviceName, date: data.date, time: data.time, customerName: data.customerName }); setSelected(null); setName(''); setEmail(''); setTime('');
  }

  return <div className="site-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark">g.</span>goodwell <span className="brand-light">studio</span></a><nav><a href="#services">Services</a><a href="#how">How it works</a><a className="nav-cta" href="#services">Book a session ↗</a></nav></header>
    <main id="top">
      <section className="hero"><div className="hero-copy"><div className="eyebrow"><i/> A LITTLE TIME, WELL SPENT</div><h1>Make space for<br/><em>your next good idea.</em></h1><p>Thoughtful one-to-one sessions for people building something meaningful. Choose a service, find a time, and we’ll take it from there.</p><a className="button dark" href="#services">Find your session ↓</a><div className="trust">Independent studio · Friendly by design</div></div><div className="art" aria-label="Abstract botanical artwork"><div className="sun"/><div className="stem"/><i className="leaf l1"/><i className="leaf l2"/><i className="leaf l3"/><span>GOOD THINGS<br/>TAKE SHAPE HERE</span></div></section>
      <section className="steps" id="how"><span>01 — Pick a service</span><span>02 — Choose your time</span><span>03 — We’ll meet you there</span></section>
      <section className="services" id="services"><div className="section-head"><div><div className="eyebrow muted">THE STUDIO MENU</div><h2>Good work starts<br/>with a <em>conversation.</em></h2></div><p>Choose the support you need today. Every session is personal, practical, and shaped around you.</p></div>
        {loading ? <p>Loading studio services…</p> : message && !services.length ? <p className="error">{message}</p> : <div className="grid">{services.map((s, i) => <article className="card" key={s.id}><div className="card-top"><span>0{i + 1}</span><small>{s.category}</small></div><h3>{s.name}</h3><p>{s.description}</p><div className="meta"><span>{s.durationMinutes} min</span><b>{s.price === 0 ? 'Complimentary' : `$${s.price}`}</b></div><button onClick={() => { setMessage(''); setConfirmed(null); setSelected(s); }}>Book this session <span>↗</span></button></article>)}</div>}
      </section>
      <section className="closing"><div className="eyebrow">A NOTE FROM THE STUDIO</div><h2>Clear minds.<br/><em>Good momentum.</em></h2><p>Bring the question you’ve been turning over. We’ll bring fresh eyes and a plan you can actually use.</p><a className="button light" href="#services">Choose a session ↗</a></section>
    </main>
    <footer><a className="brand" href="#top"><span className="brand-mark">g.</span>goodwell studio</a><span>Independent by nature. Thoughtful by design.</span><span>© 2026 Goodwell Studio</span></footer>
    {selected && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title"><button className="close" onClick={() => setSelected(null)} aria-label="Close">×</button><div className="eyebrow muted">YOUR NEXT STEP</div><h2 id="booking-title">Book a <em>session.</em></h2><p>{selected.name} · {selected.durationMinutes} minutes</p><form onSubmit={submitBooking}><label>Your name<input required value={name} onChange={e => setName(e.target.value)} autoComplete="name"/></label><label>Email address<input required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/></label><label>Choose a date<input required type="date" min={today} value={date} onChange={e => setDate(e.target.value)}/></label><label>Available time<select required value={time} onChange={e => setTime(e.target.value)}><option value="">Choose a time</option>{slots.map(slot => <option key={slot}>{slot}</option>)}</select></label>{message && <p className="error" role="alert">{message}</p>}<button className="button dark submit" disabled={!slots.length}>Confirm booking ↗</button></form><small className="notice">Portfolio demo: bookings are temporary and no email or payment is sent.</small></section></div>}
    {confirmed && <div className="overlay"><section className="modal confirmation" role="dialog" aria-modal="true"><div className="success">✓</div><div className="eyebrow muted">YOU’RE ON THE CALENDAR</div><h2>Thanks, {confirmed.customerName.split(' ')[0]}.</h2><p>Your <b>{confirmed.serviceName}</b> is booked for <b>{confirmed.date}</b> at <b>{confirmed.time}</b>.</p><button className="button dark" onClick={() => setConfirmed(null)}>Done ✓</button><small className="notice">Demo only; no confirmation email is sent.</small></section></div>}
  </div>;
}




/* SCICS data layer: complaints, categories, staff, history, notifications.
   Data lives in the browser (localStorage). */
(function (root) {
  'use strict';
  const KEY = 'scics_data_v1';
  const mem = {};
  const storage = typeof localStorage !== 'undefined' ? localStorage : {
    getItem: k => (k in mem ? mem[k] : null),
    setItem: (k, v) => { mem[k] = String(v); },
    removeItem: k => { delete mem[k]; }
  };
   const STATUSES = ['Submitted', 'Assigned', 'In Progress', 'Resolved']; 
  
  let notify = () => {};
  

  const fresh = () => ({
    seq: 0, complaints: [], notifications: [],
    categories: ['Furniture', 'Water Leakage', 'Electrical', 'Cleanliness', 'Network / Wi-Fi', 'Other'],
    staff: ['Ramesh (Electrical)', 'Sunita (Plumbing)', 'Mahesh (Carpentry)', 'Pooja (General)']
  });
  const load = () => { try { const r = storage.getItem(KEY); return r ? JSON.parse(r) : fresh(); } catch (e) { return fresh(); } };
  const save = db => storage.setItem(KEY, JSON.stringify(db));
  const clean = s => String(s == null ? '' : s).trim();
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const stamp = (c, text, now) => c.history.push({ at: (now || new Date()).toISOString(), text });

  function update(id, fn) {
    const db = load();
    const c = db.complaints.find(x => x.id === clean(id).toUpperCase());
    if (!c) throw new Error('Complaint not found');
    fn(c, db); save(db); return c;
  }

  function addComplaint(f, now) {
    for (const k of ['name', 'email', 'category', 'location', 'description']) {
      if (!clean(f[k])) throw new Error('Missing field: ' + k);
    }
    if (!/^\S+@\S+\.\S+$/.test(clean(f.email))) throw new Error('Invalid email address');
    const db = load();
    if (!db.categories.includes(f.category)) throw new Error('Unknown category');
    const d = now || new Date();
    db.seq += 1;
    const c = {
      id: 'SCICS-' + d.getFullYear() + '-' + String(db.seq).padStart(4, '0'),
      name: clean(f.name), email: clean(f.email), category: f.category,
      location: clean(f.location), description: clean(f.description),
      status: 'Submitted', priority: 'Medium', assignedTo: null, escalated: false,
      createdAt: d.toISOString(), history: []
    };
    stamp(c, 'Complaint submitted', d);
    notify(db, c.id, 'Your complaint ' + c.id + ' was received.');
    db.complaints.push(c); save(db); return c;
  }
  const getComplaint = id => load().complaints.find(c => c.id === clean(id).toUpperCase()) || null;
  const listComplaints = () => load().complaints.slice().reverse();
  const getCategories = () => load().categories.slice();
  function addCategory(name) {
    name = clean(name); if (!name) throw new Error('Category name is required');
    const db = load();
    if (db.categories.some(c => c.toLowerCase() === name.toLowerCase())) throw new Error('Category already exists');
    db.categories.push(name); save(db);
  }
  function removeCategory(name) {
    const db = load();
    if (db.complaints.some(c => c.category === name)) throw new Error('Category is used by existing complaints');
    db.categories = db.categories.filter(c => c !== name); save(db);
  }

  
  const getStaff = () => load().staff.slice();
  function assign(id, staff, now) {
    return update(id, (c, db) => {
      if (!db.staff.includes(staff)) throw new Error('Unknown staff member');
      c.assignedTo = staff; if (c.status === 'Submitted') c.status = 'Assigned';
      stamp(c, 'Assigned to ' + staff, now);
      notify(db, c.id, 'Your complaint ' + c.id + ' was assigned to ' + staff + '.');
    });
  }
  function setStatus(id, status, note, now) {
    return update(id, (c, db) => {
      if (!STATUSES.includes(status)) throw new Error('Invalid status');
      c.status = status;
      stamp(c, 'Status changed to ' + status + (clean(note) ? ' - ' + clean(note) : ''), now);
      notify(db, c.id, 'Status of ' + c.id + ' is now ' + status + '.');
    });
  }
  

  

  

  function loadSample() {
    const day = 86400000, now = Date.now();
    const rows = [
      ['Aarav Singh', 'Furniture', 'Block A, Room 204', 'Broken bench in the classroom', 5],
      ['Diya Mehta', 'Water Leakage', 'Hostel B, 2nd floor', 'Tap leaking in the washroom', 4],
      ['Kabir Rao', 'Electrical', 'Library, Reading Hall', 'Two tube lights not working', 3],
      ['Isha Verma', 'Network / Wi-Fi', 'Lab Block, Lab 3', 'Wi-Fi drops every few minutes', 2],
      ['Neel Shah', 'Cleanliness', 'Cafeteria', 'Garbage bin overflowing', 1],
      ['Tara Nair', 'Electrical', 'Block C, Corridor', 'Socket sparks when used', 0]
    ];
    rows.forEach(r => addComplaint({ name: r[0], email: r[0].split(' ')[0].toLowerCase() + '@example.com',
      category: r[1], location: r[2], description: '[SAMPLE] ' + r[3] }, new Date(now - r[4] * day)));
    
    const l = listComplaints().reverse();
    assign(l[1].id, 'Sunita (Plumbing)'); setStatus(l[1].id, 'In Progress', 'Plumber on site');
    assign(l[2].id, 'Ramesh (Electrical)'); setStatus(l[2].id, 'Resolved', 'Tubes replaced');
    
    
  }
  const resetAll = () => storage.removeItem(KEY);

  root.SCICS = Object.assign({ esc, addComplaint, getComplaint, listComplaints, getCategories, addCategory, removeCategory, loadSample, resetAll },
     { getStaff, assign, setStatus, STATUSES }, 
    
     {});
  if (typeof module !== 'undefined') module.exports = root.SCICS;
})(typeof window !== 'undefined' ? window : globalThis);

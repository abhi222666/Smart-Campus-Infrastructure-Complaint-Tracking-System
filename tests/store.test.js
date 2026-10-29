const assert = require('assert');
const S = require('../store.js');
let n = 0; const test = (name, fn) => { S.resetAll(); fn(); n++; console.log('ok -', name); };
const F = { name: 'Asha', email: 'asha@example.com', category: 'Electrical', location: 'Block A', description: 'Light broken' };

test('submit complaint returns a reference ID', () => { const c = S.addComplaint(F); assert.match(c.id, /^SCICS-\d{4}-0001$/); assert.strictEqual(c.status, 'Submitted'); });
test('missing fields and bad email are rejected', () => { assert.throws(() => S.addComplaint({ ...F, name: '' }), /Missing field/); assert.throws(() => S.addComplaint({ ...F, email: 'x' }), /email/); });
test('track complaint by ID, case-insensitive', () => { const c = S.addComplaint(F); assert.strictEqual(S.getComplaint(c.id.toLowerCase()).id, c.id); assert.strictEqual(S.getComplaint('SCICS-0'), null); });
test('manage categories', () => { S.addCategory('Parking'); assert.ok(S.getCategories().includes('Parking')); assert.throws(() => S.addCategory('parking'), /exists/); S.removeCategory('Parking'); assert.ok(!S.getCategories().includes('Parking'));
  S.addComplaint(F); assert.throws(() => S.removeCategory('Electrical'), /used/); });
test('assign complaint and update progress with history', () => { const c = S.addComplaint(F); S.assign(c.id, 'Ramesh (Electrical)'); let g = S.getComplaint(c.id);
  assert.strictEqual(g.status, 'Assigned'); S.setStatus(c.id, 'In Progress', 'started'); g = S.getComplaint(c.id); assert.strictEqual(g.status, 'In Progress'); assert.strictEqual(g.history.length, 3);
  assert.throws(() => S.setStatus(c.id, 'Bogus'), /Invalid/); assert.throws(() => S.assign(c.id, 'Nobody'), /Unknown/); });
console.log(n + ' tests passed');

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');

global.window = global;
const store = {};
global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};

const fakeEl = {
  addEventListener: () => {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  style: { setProperty: () => {} },
  setAttribute: () => {},
  getAttribute: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  appendChild: () => {}
};

global.document = {
  readyState: 'loading',
  addEventListener: () => {},
  documentElement: fakeEl,
  body: fakeEl,
  getElementById: () => fakeEl,
  querySelector: () => fakeEl,
  querySelectorAll: () => []
};

// Execute bundle
const code = fs.readFileSync(path.join(projectRoot, 'src/app.min.js'), 'utf8');
eval(code);

assert.ok(global.RioMenu, 'global.RioMenu must be defined');
const { Domain, Data, Application, Presentation } = global.RioMenu;
assert.ok(Domain.MenuItem, 'MenuItem defined');
assert.ok(Domain.CartService, 'CartService defined');
assert.ok(Domain.WhatsAppOrderService, 'WhatsAppOrderService defined');
assert.ok(Data.MenuRepository, 'MenuRepository defined');
assert.ok(Presentation.ProductCard, 'ProductCard defined');

const repo = new Data.MenuRepository(Data.MENU_ITEMS, Data.MENU_CATEGORIES, Domain.MenuItem);
assert.strictEqual(repo.getAllItems().length, 51, 'Must have 51 items');

// Test ProductCard eager vs lazy rendering
const item = repo.getItemById('item-01');
const cardHtmlEager = Presentation.ProductCard.render(item, Domain.CurrencyFormatter, { lang: 'ar', index: 0 });
assert.ok(cardHtmlEager.includes('loading="eager"'), 'First card should have eager loading');
assert.ok(cardHtmlEager.includes('width="240" height="240"'), 'Should have explicit dimensions');
assert.ok(cardHtmlEager.includes('.webp'), 'Should reference webp image');

const cardHtmlLazy = Presentation.ProductCard.render(item, Domain.CurrencyFormatter, { lang: 'ar', index: 5 });
assert.ok(cardHtmlLazy.includes('loading="lazy"'), 'Card with index 5 should have lazy loading');

console.log('✅ Production bundle (src/app.min.js) verified successfully.');


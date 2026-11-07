const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..');

// Load all scripts in order into global scope
global.window = global;
const store = {};
global.localStorage = {
  getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; }
};

const scripts = [
  'src/domain/entities/MenuItem.js',
  'src/domain/services/CurrencyFormatter.js',
  'src/domain/services/I18nService.js',
  'src/domain/services/CartService.js',
  'src/domain/services/WhatsAppOrderService.js',
  'src/data/datasource/menuData.js',
  'src/data/repositories/MenuRepository.js',
  'src/application/usecases/FilterMenuItemsUseCase.js',
  'src/presentation/components/ProductCard.js',
  'src/presentation/controllers/MenuController.js',
  'src/presentation/controllers/ModalController.js',
  'src/presentation/controllers/OrderController.js'
];

for (const rel of scripts) {
  const code = fs.readFileSync(path.join(projectRoot, rel), 'utf8');
  eval(code);
}

const { Domain, Data, Application, Presentation } = global.RioMenu;

// 1. Verify all 39 products and their images
const repo = new Data.MenuRepository(Data.MENU_ITEMS, Data.MENU_CATEGORIES, Domain.MenuItem);
const allItems = repo.getAllItems();
assert.strictEqual(allItems.length, 39, 'Must have exactly 39 products');

for (const item of allItems) {
  assert.ok(item.name && item.nameAr, `Item ${item.id} must have both English and Arabic names`);
  const imgPath = path.join(projectRoot, item.image);
  assert.ok(fs.existsSync(imgPath), `Image missing on disk for ${item.id}: ${item.image}`);
}
console.log('✅ All 39 products and image files verified.');

// 2. Verify bilingual search & category filtering
const filterUseCase = new Application.FilterMenuItemsUseCase(repo);
const chickenItems = filterUseCase.execute({ category: 'Chicken', query: '' });
assert.strictEqual(chickenItems.length, 16, 'Chicken category should have 16 items');

const arabicSearch = filterUseCase.execute({ category: 'All', query: 'زنجر' });
assert.ok(arabicSearch.length >= 4, 'Arabic query "زنجر" should match Zinger items');

const englishSearch = filterUseCase.execute({ category: 'All', query: 'shrimp' });
assert.strictEqual(englishSearch.length, 2, 'English query "shrimp" should match 2 items');
console.log('✅ Category filtering and bilingual search verified.');

// 3. Verify CartService (adding multiple items, French Fries options, updating qty, removing, totals in SAR)
const cart = new Domain.CartService(repo);
const broast = repo.getItemById('item-01'); // 18 SAR
const fries = repo.getItemById('item-25'); // 05 / 07 / 12 SAR options
const garlic = repo.getItemById('item-35'); // 1 SAR

cart.addItem(broast, 2); // 2 * 18 = 36 SAR
cart.addItem(fries, 1, fries.options[2]); // Large Fries: 1 * 12 = 12 SAR
cart.addItem(garlic, 3); // 3 * 1 = 3 SAR

assert.strictEqual(cart.getTotalCount(), 6, 'Total item count should be 6');
assert.strictEqual(cart.getSubtotal(), 51, 'Subtotal should be 51 SAR');
assert.strictEqual(cart.getTotal(), 51, 'Total should be 51 SAR');

// Update quantity & remove item
cart.changeQuantity('item-01', 1); // now 3 * 18 = 54 SAR -> total 69 SAR
assert.strictEqual(cart.getTotal(), 69, 'Updated total should be 69 SAR');

cart.removeItem('item-35'); // remove 3 garlic sauces -> total 66 SAR
assert.strictEqual(cart.getTotal(), 66, 'Total after removing garlic sauce should be 66 SAR');

// Verify localStorage persistence by creating a fresh CartService instance
const cartReloaded = new Domain.CartService(repo);
assert.strictEqual(cartReloaded.getTotalCount(), 4, 'Reloaded cart should have 4 items');
assert.strictEqual(cartReloaded.getTotal(), 66, 'Reloaded cart total should be 66 SAR');
console.log('✅ CartService operations, SAR calculations, and localStorage persistence verified.');

// 4. Verify I18nService & WhatsAppOrderService in English and Arabic
const i18n = new Domain.I18nService(Data.UI_TRANSLATIONS, Data.MENU_CATEGORIES);
const waService = new Domain.WhatsAppOrderService(i18n);

// Validation checks
const invalidMissingAddress = waService.validateOrder({
  items: cart.getItems(),
  customer: { name: 'Ahmed Ali', phone: '0501234567', orderType: 'delivery', address: '' }
});
assert.strictEqual(invalidMissingAddress.valid, false, 'Delivery without address must fail validation');
assert.strictEqual(invalidMissingAddress.field, 'address');

const validPickup = waService.validateOrder({
  items: cart.getItems(),
  customer: { name: 'Ahmed Ali', phone: '0501234567', orderType: 'pickup', address: '' }
});
assert.strictEqual(validPickup.valid, true, 'Pickup without address must pass validation');

// Generate English WhatsApp message for Delivery
i18n.setLanguage('en');
const enMsg = waService.buildOrderMessage({
  items: cart.getItems(),
  subtotal: cart.getSubtotal(),
  total: cart.getTotal(),
  customer: {
    name: 'Ahmed Ali',
    phone: '+966 55 111 2222',
    orderType: 'delivery',
    address: 'Al Olaya Dist, King Fahd Rd, Riyadh'
  }
});
const enUrl = waService.buildWhatsAppUrl(enMsg);
assert.ok(enUrl.startsWith('https://wa.me/966503839301?text='), 'WhatsApp URL must target +966 50 383 9301');
assert.ok(enMsg.includes('Broast Chicken Normal'), 'English message must include English item name');
assert.ok(enMsg.includes('French Fries - Large (12 SAR)'), 'English message must include selected size option');
assert.ok(enMsg.includes('66 SAR'), 'English message must include total in SAR');
assert.ok(enMsg.includes('Al Olaya Dist, King Fahd Rd, Riyadh'), 'English message must include delivery address');

// Generate Arabic WhatsApp message for Delivery
i18n.setLanguage('ar');
const arMsg = waService.buildOrderMessage({
  items: cart.getItems(),
  subtotal: cart.getSubtotal(),
  total: cart.getTotal(),
  customer: {
    name: 'أحمد علي',
    phone: '0551112222',
    orderType: 'delivery',
    address: 'حي العليا، طريق الملك فهد، الرياض'
  }
});
assert.ok(arMsg.includes('دجاج بروست عادي'), 'Arabic message must include Arabic item name');
assert.ok(arMsg.includes('بطاطس مقلية - كبير (12 SAR)'), 'Arabic message must include Arabic size option');
assert.ok(arMsg.includes('66 SAR'), 'Arabic message must include total in SAR');
assert.ok(arMsg.includes('حي العليا، طريق الملك فهد، الرياض'), 'Arabic message must include Arabic delivery address');

console.log('✅ English & Arabic WhatsApp order messages and validation verified.');

/**
 * Production Asset Bundler and Minifier
 * Combines modular CSS and JS into high-performance single bundles for production.
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Bundle CSS
const cssFiles = [
  'assets/css/variables.css',
  'assets/css/base.css',
  'assets/css/layout.css',
  'assets/css/components.css'
];

console.log('📦 Bundling CSS...');
let rawCss = cssFiles.map(f => fs.readFileSync(path.join(rootDir, f), 'utf8')).join('\n');
let minCss = rawCss
  .replace(/\/\*[\s\S]*?\*\//g, '')       // Strip comments
  .replace(/\s+/g, ' ')                   // Normalize whitespace
  .replace(/\s*([\{\}:;,>~+])\s*/g, '$1') // Collapse around delimiters
  .replace(/;}/g, '}')                    // Remove trailing semicolons
  .trim();

const targetCss = path.join(rootDir, 'assets/css/app.min.css');
fs.writeFileSync(targetCss, minCss, 'utf8');
console.log(`✅ Generated ${targetCss} (${(minCss.length / 1024).toFixed(1)} KB)`);

// 2. Bundle JS in Dependency Order
const jsFiles = [
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
  'src/presentation/controllers/OrderController.js',
  'src/main.js'
];

console.log('📦 Bundling JS in dependency order...');
let rawJs = jsFiles.map(f => {
  return `/* --- ${f} --- */\n` + fs.readFileSync(path.join(rootDir, f), 'utf8');
}).join('\n;\n');

const targetJs = path.join(rootDir, 'src/app.min.js');
fs.writeFileSync(targetJs, rawJs, 'utf8');
console.log(`✅ Generated ${targetJs} (${(rawJs.length / 1024).toFixed(1)} KB)`);


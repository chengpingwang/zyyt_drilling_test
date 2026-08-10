'use strict';
/*
 * 青海凿研岩土工程有限公司 (ZYYT) — Corporate website + admin backend
 * Zero-dependency Node.js server.
 *  - Serves the static bilingual frontend from /public
 *  - Provides a JSON content API for Company News & Industry Insights
 *  - Session-cookie authentication for the admin area
 *  - Dynamic sitemap.xml, robots.txt and SEO/Geo meta endpoints
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const POSTS_FILE = path.join(DATA, 'posts.json');
const ADMIN_FILE = path.join(DATA, 'admin.json');
const SECRET_FILE = path.join(DATA, '.secret');
const UPLOAD_DIR = path.join(ROOT, 'images', 'uploads');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// ---------- Site configuration (single source of truth) ----------
const SITE = {
  nameZh: '青海凿研岩土工程有限公司',
  nameEn: 'Qinghai Zaoyan Rock & Soil Engineering Co., Ltd.',
  shortEn: 'ZYYT',
  sloganZh: '西部高原复杂工况矿产勘查钻探专业施工服务商',
  sloganEn: 'A specialised mineral exploration drilling contractor for complex site conditions across the Western Plateau',
  founding: '2020-09',
  legalRep: '王小俊（总经理）',
  registeredCapital: '100万元',
  regions: ['青海', '甘肃', '新疆'],
  // Headquarters geo (Qinghai / Xining). Edit to the real registered address.
  geo: { lat: 36.6171, lng: 101.7782, placename: 'Xining, Qinghai, China' },
  // Public contact — fill in real values before going live.
  contact: {
    email: 'info@zyyt-drilling.com',
    tel: '（待补充）',
    address: '青海省（具体地址待补充）',
  },
  stats: [
    { zh: '团队规模', en: 'Team', value: '138', unit: '人' },
    { zh: '技术人员', en: 'Engineers', value: '132', unit: '名' },
    { zh: '施工井队', en: 'Crews', value: '21', unit: '支' },
    { zh: '项目验收通过', en: 'Projects passed', value: '19/19', unit: '' },
    { zh: '累计合同额', en: 'Contracts', value: '4500', unit: '万元' },
  ],
};

// ---------- Crypto / sessions ----------
function getSecret() {
  if (!fs.existsSync(SECRET_FILE)) {
    fs.writeFileSync(SECRET_FILE, crypto.randomBytes(32).toString('hex'), { mode: 0o600 });
  }
  return fs.readFileSync(SECRET_FILE, 'utf8').trim();
}
const SECRET = getSecret();

function sign(obj) {
  const payload = Buffer.from(JSON.stringify(obj)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return payload + '.' + sig;
}
function unsign(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  let sigBuf, expBuf;
  try { sigBuf = Buffer.from(sig); expBuf = Buffer.from(expected); } catch { return null; }
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()); } catch { return null; }
}

function hashPassword(password, salt) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, derived };
}
function verifyPassword(password, salt, derived) {
  const { derived: check } = hashPassword(password, salt);
  const a = Buffer.from(check, 'hex');
  const b = Buffer.from(derived, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------- Admin bootstrap ----------
function ensureAdmin() {
  if (!fs.existsSync(ADMIN_FILE)) {
    const { salt, derived } = hashPassword(process.env.ADMIN_PASS || 'Zyyt@2026');
    fs.writeFileSync(ADMIN_FILE, JSON.stringify({ user: 'admin', salt, derived }, null, 2), { mode: 0o600 });
    console.log('\n========================================================');
    console.log('  Admin account initialised.');
    console.log('  Username : admin');
    console.log('  Password : ' + (process.env.ADMIN_PASS || 'Zyyt@2026'));
    console.log('  >> CHANGE THIS PASSWORD via the profile screen after login.');
    console.log('========================================================\n');
  }
  return JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf8'));
}

// ---------- Posts store ----------
function ensurePosts() {
  if (!fs.existsSync(POSTS_FILE)) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(seedPosts(), null, 2));
  }
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8'));
}
function savePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

function readPosts() { return ensurePosts(); }

// ---------- Uploads store ----------
function ensureUploads() {
  try { fs.mkdirSync(UPLOAD_DIR, { recursive: true }); } catch (e) { /* ignore */ }
}
function writePosts(posts) { savePosts(posts); }

function seedPosts() {
  const now = new Date().toISOString();
  return [
    {
      id: 'n1',
      type: 'news',
      status: 'published',
      publishedAt: '2025-07-15',
      createdAt: now,
      updatedAt: now,
      cover: 'images/e287662dbe8aedb1abf26ac48a701fe4.jpg',
      tags: ['锂矿', '竣工', '高原'],
      title: { zh: '黄草湖苦水湖锂矿详查-勘探项目钻探技术服务顺利竣工', en: 'Drilling works for the Huangcaohu-Kushuihu Lithium exploration project completed' },
      summary: {
        zh: '公司承担的合同额 1013 万元锂矿钻探技术服务项目通过甲方验收，再次印证高原锂矿复杂工况下的施工能力。',
        en: 'Our RMB 10.13M lithium drilling services contract passed client acceptance, reaffirming capability in complex plateau-lithium conditions.',
      },
      body: {
        zh: '近日，由青海凿研岩土工程有限公司承担的黄草湖苦水湖锂矿详查-勘探项目钻探技术服务顺利通过甲方验收。\n\n该项目合同金额 1013 万元，是公司在高原锂矿领域承接的代表性工程之一。施工期间，项目团队依托 21 支井队的组织体系与自有全液压钻机设备，克服了高海拔、低温及高原反应等不利因素，保障了岩心采取率与施工进度。\n\n该项目的顺利交付，进一步验证了公司"非单一矿种、非单一阶段、非单一工况"的施工覆盖能力，也为后续在盐湖、锂矿等新能源矿产领域的深度合作奠定了基础。',
        en: 'Recently, the drilling services for the Huangcaohu-Kushuihu lithium detailed survey and exploration project, undertaken by Qinghai Zaoyan Rock & Soil Engineering Co., Ltd., passed client acceptance.\n\nWith a contract value of RMB 10.13M, this is one of our representative projects in the plateau-lithium domain. Relying on our organisation of 21 drilling crews and owned fully-hydraulic rigs, the team overcame high altitude, low temperatures and altitude sickness while safeguarding core recovery and schedule.\n\nThe successful delivery further validates our "non-single-commodity, non-single-stage, non-single-condition" coverage and lays the groundwork for deeper cooperation in salt-lake and lithium (new-energy minerals) projects.',
      },
    },
    {
      id: 'n2',
      type: 'news',
      status: 'published',
      publishedAt: '2025-05-20',
      createdAt: now,
      updatedAt: now,
      cover: 'images/0ec08c47ac9f593b23795f8b48233d0d.jpg',
      tags: ['供应商准入', '资质'],
      title: { zh: '公司进入青海煤炭地质勘查院钻探施工入围框架供应商名录', en: 'ZYYT admitted to Qinghai Coal Geological Exploration Bureau suppliers framework' },
      summary: {
        zh: '通过客户供应商准入与竞争筛选，公司进入青海煤炭地质勘查院钻探施工入围框架供应商名录。',
        en: 'After supplier qualification and competitive screening, ZYYT was admitted to the drilling framework suppliers list of the Qinghai Coal Geological Exploration Bureau.',
      },
      body: {
        zh: '经青海煤炭地质勘查院组织的供应商准入评审与竞争筛选，青海凿研岩土工程有限公司正式进入其钻探施工入围框架供应商名录。\n\n这标志着公司在资质合规、履约能力与安全管理体系方面获得国有地勘单位的认可。公司持有青海省应急管理厅核发的安全生产许可证，为增值税一般纳税人，企业征信干净，未纳入三类失信名单，满足供应商准入的基本合规要求。\n\n未来，公司将继续以技术密集型团队与标准化保障体系，为更多国有地勘单位与大型矿企提供稳定、可控的施工服务。',
        en: 'Following the supplier qualification review and competitive screening organised by the Qinghai Coal Geological Exploration Bureau, Qinghai Zaoyan Rock & Soil Engineering Co., Ltd. has been formally admitted to its drilling framework suppliers list.\n\nThis recognises our compliance, delivery capability and safety-management system by a state geological-survey unit. We hold a work-safety licence issued by the Qinghai Emergency Management Department, are a general VAT taxpayer, and maintain a clean credit record free of the three categories of dishonesty lists.\n\nGoing forward, we will continue to deliver stable, controllable services to more state geological-survey units and large mining enterprises through our engineering-intensive teams and standardised assurance system.',
      },
    },
    {
      id: 'n3',
      type: 'news',
      status: 'published',
      publishedAt: '2025-03-08',
      createdAt: now,
      updatedAt: now,
      cover: 'images/c44767c951aa1b6c16ec9e9dc19a320b.jpg',
      tags: ['安全生产', '高原保障'],
      title: { zh: '高原项目标准化保障体系再次通过甲方安全审查', en: 'Plateau standardised safety system passes another client audit' },
      summary: {
        zh: '出队前车辆检查、人员健康查体、应急演练等八环节标准化流程，将安全管理落实到可验证的进场动作。',
        en: 'An eight-step standard process — pre-deployment vehicle checks, health screening, emergency drills and more — turns safety management into verifiable on-site actions.',
      },
      body: {
        zh: '近日，公司高原项目标准化保障体系再次通过甲方安全审查。该体系将安全管理由制度文本落实为高原复杂环境下可验证的进场与施工组织风险控制动作。\n\n八环节流程包括：出队前车辆检查 → 入场人员健康查体 → 全员安全培训 → 应急演练 → 劳保及高原药品配置 → 应急设备配备 → 属地备案配合 → 现场安全环保制度落地。\n\n这一体系显著降低了项目进场与履约风险，是公司"更稳定项目交付"合作价值的重要支撑。',
        en: 'Our plateau standardised safety system has again passed a client audit. The system turns safety management from paper policy into verifiable on-site risk-control actions under complex plateau conditions.\n\nThe eight steps are: pre-deployment vehicle checks → entrant health screening → full-staff safety training → emergency drills → PPE and altitude-medicine provisioning → emergency-equipment readiness → local-filing coordination → on-site HSE system implementation.\n\nThis system markedly reduces deployment and performance risk and underpins our "more stable delivery" value proposition.',
      },
    },
    {
      id: 'i1',
      type: 'insight',
      status: 'published',
      publishedAt: '2025-06-10',
      createdAt: now,
      updatedAt: now,
      cover: 'images/a2313b8219c45f4ec144351aedc85097.jpg',
      tags: ['技术', '盐湖', '岩心钻探'],
      title: { zh: '高原盐湖复杂工况下的岩心钻探技术要点', en: 'Key techniques for core drilling in complex plateau salt-lake conditions' },
      summary: {
        zh: '盐湖卤水腐蚀、地层易塌孔、高矿化度冲洗液处理，是高原盐湖钻探的三大技术难点。',
        en: 'Brine corrosion, hole instability and high-salinity fluid management are the three core challenges of plateau salt-lake drilling.',
      },
      body: {
        zh: '西部高原盐湖地区蕴藏丰富的钾、锂、硼资源，但其钻探作业面临独特挑战。\n\n第一，盐湖卤水具有强腐蚀性，对钻杆、泥浆泵及地面管汇的材质与防腐提出更高要求；第二，湖相沉积地层胶结差、易塌孔，需要合理选择冲洗液密度与护壁工艺；第三，高矿化度冲洗液的处理与回用，直接影响环保合规与施工成本。\n\n公司通过自有设备体系与标准化保障流程，在察尔汗、大浪滩、东台吉乃尔等盐湖项目积累了系统的工况适配经验，可为同类项目提供可复制的工艺方案。',
        en: 'Western plateau salt lakes host abundant potassium, lithium and boron resources, yet drilling there faces unique challenges.\n\nFirst, corrosive brine demands higher material and anti-corrosion standards for drill pipe, mud pumps and surface manifolds. Second, poorly-cemented lacustrine strata are prone to hole collapse, requiring careful fluid density and wall-protection methods. Third, managing and reusing high-salinity drilling fluid directly affects environmental compliance and cost.\n\nThrough our owned equipment and standardised process, we have accumulated systematic, transferable experience across the Qarhan, Dalangtan and East Taijinar salt-lake projects.',
      },
    },
    {
      id: 'i2',
      type: 'insight',
      status: 'published',
      publishedAt: '2025-04-18',
      createdAt: now,
      updatedAt: now,
      cover: 'images/88f2343159a8f541902eb5a9bfe06b80.jpg',
      tags: ['趋势', '深孔', '矿产勘查'],
      title: { zh: '深孔钻探在西部矿产勘查中的趋势与挑战', en: 'Trends and challenges of deep-hole drilling in Western mineral exploration' },
      summary: {
        zh: '随浅部资源减少，深孔钻探成为获取深部盲矿体的关键手段，对设备能力与管理提出更高要求。',
        en: 'As shallow resources dwindle, deep-hole drilling becomes key to accessing deep blind orebodies, raising the bar for equipment and management.',
      },
      body: {
        zh: '随着地表及浅部矿体陆续探明，西部矿产勘查正逐步向深部推进，深孔钻探（>1000m）成为获取深部盲矿体的重要手段。\n\n深孔施工对钻机能力、孔斜控制、取心质量与事故预防提出更高要求。公司自有徐工 XSL520B 等深孔钻进设备，配合短组织链条与现场独立作业能力，可在高原深孔工况下保持稳定产出。\n\n面向未来，深孔、盐湖与高原三类工况的复合能力，将成为专业钻探施工服务商的核心竞争力。',
        en: 'As surface and shallow orebodies are progressively delineated, Western mineral exploration is moving deeper; deep-hole drilling (>1000m) is now essential to reach deep blind orebodies.\n\nDeep holes demand more of rig capability, deviation control, core quality and incident prevention. Our owned XCMG XSL520B deep-hole rigs, combined with a short management chain and strong on-site autonomy, sustain stable output under plateau deep-hole conditions.\n\nLooking ahead, the combined competence across deep-hole, salt-lake and plateau conditions will define the core competitiveness of specialised drilling contractors.',
      },
    },
    {
      id: 'i3',
      type: 'insight',
      status: 'draft',
      publishedAt: '2025-08-01',
      createdAt: now,
      updatedAt: now,
      cover: 'images/1f81ee51d807b30cdaeb24f2d3e8596e.jpg',
      tags: ['管理', '一体化'],
      title: { zh: '从普查到储量核实：一体化钻探施工组织优势', en: 'From reconnaissance to reserve verification: the edge of integrated drilling organisation' },
      summary: {
        zh: '覆盖普查、详查、勘探、储量核实全阶段的一体化组织，使复杂项目无需拆分外包。',
        en: 'An organisation covering all stages — reconnaissance, detailed survey, exploration and reserve verification — removes the need to split complex projects across subcontractors.',
      },
      body: {
        zh: '矿产勘查项目往往跨越普查、详查、勘探到储量核实多个阶段，传统模式下常因阶段与矿种差异而拆分外包，带来接口协调与质量波动风险。\n\n公司具备"非单一矿种、非单一阶段、非单一工况"的施工覆盖能力，复杂项目无需拆分外包，便于在不同矿种与勘查阶段间直接调度技术与设备资源。\n\n21 支井队的多项目施工组织基础，叠加技术密集型团队与短组织链条，使公司能够支撑多项目并行推进，并形成更可控的综合项目成本。（本文为草稿示例，可在后台编辑或删除。）',
        en: 'Mineral-exploration projects often span reconnaissance, detailed survey, exploration and reserve verification. Traditionally, stage and commodity differences lead to split subcontracting, creating interface and quality-risk.\n\nOur "non-single-commodity, non-single-stage, non-single-condition" coverage means complex projects need not be split, enabling direct scheduling of technical and equipment resources across commodities and stages.\n\nThe 21-crew multi-project organisation, plus an engineering-intensive team and short management chain, lets us run parallel projects with more controllable overall cost. (This is a draft sample — edit or delete it in the admin panel.)',
      },
    },
  ];
}

// ---------- Helpers ----------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function send(res, status, body, headers) {
  res.writeHead(status, Object.assign({ 'X-Content-Type-Options': 'nosniff' }, headers || {}));
  res.end(body);
}
function sendJSON(res, status, obj) {
  send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8' });
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 12 * 1024 * 1024) { reject(new Error('payload too large')); req.destroy(); return; }
      data += c;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); } catch (e) { reject(new Error('invalid json')); }
    });
    req.on('error', reject);
  });
}
/* ---------- HTML sanitizer (allowlist) for rich post bodies ---------- */
const ALLOWED_TAGS = new Set(['p', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'div', 'hr',
  'table', 'thead', 'tbody', 'tr', 'td', 'th', 'figure', 'figcaption', 'pre', 'code', 'font']);
const ALLOWED_ATTRS = new Set(['href', 'src', 'alt', 'title', 'style', 'class', 'target', 'rel',
  'width', 'height', 'face', 'size', 'color']);
function stripBlockTags(html) {
  return String(html || '')
    .replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/(script|style|iframe|object|embed|link|meta)>/gi, '')
    .replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*>/gi, '');
}
function sanitizeHtml(html) {
  let s = stripBlockTags(html);
  s = s.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (m, slash, tag, attrs) => {
    tag = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return ''; // drop disallowed tag, keep inner text
    if (slash) return '</' + tag + '>';
    const clean = (attrs || '').replace(/([a-zA-Z][a-zA-Z-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>"']+))/g,
      (mm, name, _g, dq, sq, uq) => {
        const an = name.toLowerCase();
        let val = (dq != null) ? dq : (sq != null) ? sq : (uq != null ? uq : '');
        if (!ALLOWED_ATTRS.has(an)) return '';
        if (/(javascript|vbscript|data:text\/html)/i.test(val)) return '';
        if (an === 'style') val = val.replace(/(expression|javascript|url\s*\()/gi, '').replace(/@import/gi, '');
        const q = (dq != null || uq != null) ? '"' : "'";
        return ' ' + an + '=' + q + val + q;
      });
    return '<' + tag + clean + '>';
  });
  return s;
}

function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  const m = raw.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie',
    `sid=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${60 * 60 * 8}`);
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'sid=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0');
}
function currentUser(req) {
  const token = getCookie(req, 'sid');
  if (!token) return null;
  const payload = unsign(token);
  if (!payload || !payload.user || payload.exp < Date.now()) return null;
  return payload.user;
}
function requireAuth(req, res) {
  const user = currentUser(req);
  if (!user) { sendJSON(res, 401, { error: 'unauthorized' }); return null; }
  return user;
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel === '/' || rel === '') rel = '/index.html';
  // Resolve and confine to the repo root (no path traversal outside ROOT).
  let filePath = path.normalize(path.join(ROOT, rel));
  if (!filePath.startsWith(ROOT)) { send(res, 403, 'Forbidden'); return; }
  // Never serve VCS metadata, the session secret, or the admin credential file.
  const forbid = ['.git', '.secret', 'data/admin.json'];
  if (forbid.some((f) => filePath === path.join(ROOT, f) || filePath.includes('/' + f))) {
    send(res, 404, 'Not Found', { 'Content-Type': 'text/html; charset=utf-8' });
    return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err) {
      send(res, 404, 'Not Found', { 'Content-Type': 'text/html; charset=utf-8' });
      return;
    }
    // Directory request (e.g. /admin/ or /admin) → serve its index.html so it
    // behaves like GitHub Pages and other static hosts.
    if (stat.isDirectory()) {
      const idx = path.join(filePath, 'index.html');
      let ok = false;
      try { ok = fs.statSync(idx).isFile(); } catch (e) { /* ignore */ }
      if (!ok) { send(res, 404, 'Not Found', { 'Content-Type': 'text/html; charset=utf-8' }); return; }
      filePath = idx;
    }
    const ext = path.extname(filePath).toLowerCase();
    const rs = fs.createReadStream(filePath);
    // Tiered caching: HTML/JSON stay fresh; JS/CSS short cache (updatable);
    // images/fonts immutable long cache (content-addressed names) → faster revisits.
    const MAX_CACHE = 'public, max-age=31536000, immutable';
    const cc = ext === '.html' || ext === '.json' || ext === '.xml'
      ? 'no-cache'
      : (ext === '.js' || ext === '.css' || ext === '.webmanifest')
        ? 'public, max-age=600'
        : MAX_CACHE;
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': cc });
    rs.pipe(res);
  });
}

// ---------- SEO / Geo ----------
function buildSitemap() {
  const posts = readPosts().filter((p) => p.status === 'published');
  const pages = [
    { loc: '/', pri: '1.0', chf: 'daily' },
    { loc: '/about.html', pri: '0.9', chf: 'monthly' },
    { loc: '/contact.html', pri: '0.8', chf: 'monthly' },
    { loc: '/news.html', pri: '0.8', chf: 'weekly' },
    { loc: '/insights.html', pri: '0.8', chf: 'weekly' },
  ];
  const items = pages.map((p) =>
    `  <url><loc>${SITE_URL}${p.loc}</loc><changefreq>${p.chf}</changefreq><priority>${p.pri}</priority></url>`
  ).join('\n');
  const postItems = posts.map((p) =>
    `  <url><loc>${SITE_URL}/${p.type === 'news' ? 'news' : 'insights'}-detail.html?id=${p.id}</loc><lastmod>${p.updatedAt.slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n${postItems}\n</urlset>\n`;
}
const SITE_URL = process.env.SITE_URL || `http://localhost:${PORT}`;

// ---------- Router ----------
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const method = req.method.toUpperCase();

    // ---- robots.txt ----
    if (pathname === '/robots.txt') {
      const body = `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
      return send(res, 200, body, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    // ---- sitemap.xml ----
    if (pathname === '/sitemap.xml') {
      return send(res, 200, buildSitemap(), { 'Content-Type': 'application/xml; charset=utf-8' });
    }
    // ---- web manifest ----
    if (pathname === '/manifest.webmanifest') {
      const manifest = {
        name: SITE.nameZh + ' / ' + SITE.nameEn,
        short_name: SITE.shortEn,
        description: SITE.sloganEn,
        start_url: '/',
        display: 'standalone',
        background_color: '#2D2D2D',
        theme_color: '#2D2D2D',
        lang: 'zh-CN',
      };
      return sendJSON(res, 200, manifest);
    }
    // ---- public config (for SEO/JSON-LD hydration) ----
    if (pathname === '/api/config' && method === 'GET') {
      return sendJSON(res, 200, SITE);
    }

    // ---- auth ----
    if (pathname === '/api/login' && method === 'POST') {
      const body = await readBody(req);
      const admin = ensureAdmin();
      if (body.user !== admin.user || !verifyPassword(String(body.pass || ''), admin.salt, admin.derived)) {
        return sendJSON(res, 401, { error: 'invalid_credentials' });
      }
      const token = sign({ user: admin.user, exp: Date.now() + 1000 * 60 * 60 * 8 });
      setSessionCookie(res, token);
      return sendJSON(res, 200, { ok: true, user: admin.user });
    }
    if (pathname === '/api/logout' && method === 'POST') {
      clearSessionCookie(res);
      return sendJSON(res, 200, { ok: true });
    }
    if (pathname === '/api/me' && method === 'GET') {
      const user = currentUser(req);
      return sendJSON(res, 200, { authenticated: !!user, user: user || null });
    }
    // change own password (auth required)
    if (pathname === '/api/profile' && method === 'POST') {
      const user = requireAuth(req, res); if (!user) return;
      const body = await readBody(req);
      const admin = ensureAdmin();
      if (!verifyPassword(String(body.cur || ''), admin.salt, admin.derived)) {
        return sendJSON(res, 401, { error: 'invalid_current' });
      }
      const np = String(body.pass || '');
      if (np.length < 6) return sendJSON(res, 400, { error: 'weak_password' });
      const nh = hashPassword(np);
      admin.salt = nh.salt; admin.derived = nh.derived;
      fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2), { mode: 0o600 });
      return sendJSON(res, 200, { ok: true });
    }

    // upload an image (auth required) — base64 JSON, saved under /images/uploads/
    if (pathname === '/api/upload' && method === 'POST') {
      const user = requireAuth(req, res); if (!user) return;
      let body;
      try { body = await readBody(req); } catch (e) { return sendJSON(res, 400, { error: 'bad_request' }); }
      const m = String(body.data || '').match(/^data:(image\/(png|jpeg|jpg|gif|webp|bmp));base64,(.+)$/i);
      if (!m) return sendJSON(res, 400, { error: 'invalid_image' });
      let buf;
      try { buf = Buffer.from(m[3], 'base64'); } catch (e) { return sendJSON(res, 400, { error: 'bad_base64' }); }
      if (buf.length > 8 * 1024 * 1024) return sendJSON(res, 413, { error: 'too_large' });
      const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/bmp': 'bmp' };
      const ext = extMap[m[1].toLowerCase()] || 'png';
      const fname = Date.now().toString(36) + crypto.randomBytes(4).toString('hex') + '.' + ext;
      fs.writeFileSync(path.join(UPLOAD_DIR, fname), buf);
      return sendJSON(res, 200, { ok: true, url: '/images/uploads/' + fname });
    }

    // ---- posts API ----
    const postsMatch = pathname.match(/^\/api\/posts(?:\/([\w-]+))?$/);
    if (postsMatch) {
      const id = postsMatch[1];
      if (!id) {
        if (method === 'GET') {
          const authed = !!currentUser(req);
          const type = url.searchParams.get('type');
          const all = url.searchParams.get('all') === '1' && authed;
          let posts = readPosts();
          if (type) posts = posts.filter((p) => p.type === type);
          if (!all) posts = posts.filter((p) => p.status === 'published');
          posts = posts
            .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))
            .map((p) => ({
              id: p.id, type: p.type, status: p.status, publishedAt: p.publishedAt,
              cover: p.cover, tags: p.tags,
              title: p.title, summary: p.summary,
            }));
          return sendJSON(res, 200, { posts });
        }
        if (method === 'POST') {
          const user = requireAuth(req, res); if (!user) return;
          const body = await readBody(req);
          const posts = readPosts();
          const idNew = 'p' + crypto.randomBytes(5).toString('hex');
          const now = new Date().toISOString();
          const post = {
            id: idNew,
            type: ['news', 'insight'].includes(body.type) ? body.type : 'news',
            status: body.status === 'draft' ? 'draft' : 'published',
            publishedAt: body.publishedAt || now.slice(0, 10),
            createdAt: now,
            updatedAt: now,
            cover: typeof body.cover === 'string' ? body.cover : '',
            tags: Array.isArray(body.tags) ? body.tags : (typeof body.tags === 'string' ? body.tags.split(',').map((s) => s.trim()).filter(Boolean) : []),
            title: { zh: String(body.titleZh || ''), en: String(body.titleEn || '') },
            summary: { zh: String(body.summaryZh || ''), en: String(body.summaryEn || '') },
            body: { zh: sanitizeHtml(body.bodyZh || ''), en: sanitizeHtml(body.bodyEn || '') },
          };
          posts.push(post);
          writePosts(posts);
          return sendJSON(res, 201, { ok: true, post });
        }
        return send(res, 405, 'Method Not Allowed');
      }
      // with id
      if (method === 'GET') {
        const authed = !!currentUser(req);
        const posts = readPosts();
        const post = posts.find((p) => p.id === id);
        if (!post) return sendJSON(res, 404, { error: 'not_found' });
        if (post.status !== 'published' && !authed) return sendJSON(res, 404, { error: 'not_found' });
        return sendJSON(res, 200, { post });
      }
      if (method === 'PUT' || method === 'DELETE') {
        const user = requireAuth(req, res); if (!user) return;
        const posts = readPosts();
        const idx = posts.findIndex((p) => p.id === id);
        if (idx < 0) return sendJSON(res, 404, { error: 'not_found' });
        if (method === 'DELETE') {
          posts.splice(idx, 1);
          writePosts(posts);
          return sendJSON(res, 200, { ok: true });
        }
        // PUT
        const body = await readBody(req);
        const p = posts[idx];
        p.type = ['news', 'insight'].includes(body.type) ? body.type : p.type;
        p.status = body.status === 'draft' || body.status === 'published' ? body.status : p.status;
        if (body.publishedAt) p.publishedAt = body.publishedAt;
        if (typeof body.cover === 'string') p.cover = body.cover;
        if (Array.isArray(body.tags)) p.tags = body.tags;
        else if (typeof body.tags === 'string') p.tags = body.tags.split(',').map((s) => s.trim()).filter(Boolean);
        if (body.titleZh !== undefined) p.title.zh = String(body.titleZh);
        if (body.titleEn !== undefined) p.title.en = String(body.titleEn);
        if (body.summaryZh !== undefined) p.summary.zh = String(body.summaryZh);
        if (body.summaryEn !== undefined) p.summary.en = String(body.summaryEn);
        if (body.bodyZh !== undefined) p.body.zh = sanitizeHtml(body.bodyZh);
        if (body.bodyEn !== undefined) p.body.en = sanitizeHtml(body.bodyEn);
        p.updatedAt = new Date().toISOString();
        posts[idx] = p;
        writePosts(posts);
        return sendJSON(res, 200, { ok: true, post: p });
      }
      return send(res, 405, 'Method Not Allowed');
    }

    // ---- static ----
    if (method === 'GET' || method === 'HEAD') {
      return serveStatic(req, res, pathname);
    }
    send(res, 405, 'Method Not Allowed');
  } catch (e) {
    console.error(e);
    send(res, 500, 'Internal Server Error');
  }
});

ensureAdmin();
ensurePosts();
ensureUploads();
server.listen(PORT, HOST, () => {
  console.log(`\n  ZYYT website running:  http://localhost:${PORT}`);
  console.log(`  Admin panel:          http://localhost:${PORT}/admin.html`);
  console.log(`  Sitemap:              http://localhost:${PORT}/sitemap.xml\n`);
});

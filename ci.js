import fs from 'fs';
import path from 'path';

const TOKEN = process.env.INPUT_TOKEN;
const PROVIDER = process.env.INPUT_PROVIDER;
const MODEL = process.env.INPUT_MODEL;
const SDIR = process.env.INPUT_SCHEMAS_DIR || './schemas';
const PDIR = process.env.INPUT_PROMPTS_DIR || './prompts';
const SEEDS = parseInt(process.env.INPUT_SEEDS || '1', 10);
const MODE = process.env.INPUT_MODE || 'validate';
const API_URL = (process.env.INPUT_API_URL || 'https://schemashield.ai').replace(/\/$/, '');

function listFiles(dir) {
  try { return fs.readdirSync(dir).filter(f => !f.startsWith('.') ).map(f => path.join(dir, f)); } catch { return []; }
}

function basenameNoExt(p){ return path.basename(p).replace(/\.[^.]+$/, ''); }

const schemas = new Map();
for (const f of listFiles(SDIR)) {
  if (!f.toLowerCase().endsWith('.json')) continue;
  const base = basenameNoExt(f);
  const text = fs.readFileSync(f, 'utf8');
  try { schemas.set(base, JSON.parse(text)); } catch {}
}

const prompts = new Map();
for (const f of listFiles(PDIR)) {
  if (fs.existsSync(f) && fs.statSync(f).isFile()) {
    const base = basenameNoExt(f);
    const text = fs.readFileSync(f, 'utf8');
    prompts.set(base, text);
  }
}

const names = [...new Set([...schemas.keys()].filter(k => prompts.has(k)))];
if (names.length === 0) {
  console.error('No matching prompt/schema base names');
  process.exit(1);
}

const cases = names.map(name => ({ name, prompt: prompts.get(name), schema: schemas.get(name) }));
const provider_matrix = [{ provider: PROVIDER, model: MODEL }];
const seeds = Array.from({length: Math.max(SEEDS,1)}, (_,i)=> i);

const payload = { provider_matrix, seeds, cases, mode: MODE };

const res = await fetch(`${API_URL}/v1/ci/run`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
  body: JSON.stringify(payload)
});

const text = await res.text();
let obj;
try { obj = JSON.parse(text); } catch { obj = { message: text }; }
if (!res.ok || obj.ok === false) {
  console.error('SchemaShield CI failed:', obj);
  process.exit(1);
} else {
  console.log('SchemaShield CI passed:', obj.summary || obj);
}

/**
 * validate-glb.mjs
 * Valida a estrutura binária de um GLB e verifica todos os bufferViews.
 */
import { readFileSync } from 'fs';

const path = process.argv[2];
if (!path) { console.error('Uso: node validate-glb.mjs <arquivo.glb>'); process.exit(1); }

const buf = readFileSync(path);
console.log(`Arquivo: ${path}`);
console.log(`Tamanho total: ${(buf.length/1024/1024).toFixed(2)} MB (${buf.length} bytes)`);

// Header
const magic   = buf.readUInt32LE(0);
const version = buf.readUInt32LE(4);
const total   = buf.readUInt32LE(8);
console.log(`\nHeader: magic=0x${magic.toString(16)} version=${version} total=${total}`);
if (magic !== 0x46546C67) { console.error('❌ Magic inválido!'); process.exit(1); }
if (total !== buf.length) { console.error(`❌ Total declarado ${total} ≠ tamanho real ${buf.length}`); }
else console.log('✅ Tamanho total OK');

// Chunk 0 (JSON)
const c0Len  = buf.readUInt32LE(12);
const c0Type = buf.readUInt32LE(16);
console.log(`\nChunk 0 (JSON): length=${c0Len} type=0x${c0Type.toString(16)}`);
const jsonStr = buf.slice(20, 20 + c0Len).toString('utf8').replace(/\0+$/, '').trim();
let gltf;
try { gltf = JSON.parse(jsonStr); console.log('✅ JSON válido'); }
catch(e) { console.error('❌ JSON inválido:', e.message); process.exit(1); }

// Chunk 1 (BIN)
const c1Base = 20 + c0Len;
const c1Len  = buf.readUInt32LE(c1Base);
const c1Type = buf.readUInt32LE(c1Base + 4);
console.log(`\nChunk 1 (BIN): length=${c1Len} type=0x${c1Type.toString(16)}`);
const binStart = c1Base + 8;
const binEnd   = binStart + c1Len;
if (binEnd > buf.length) {
  console.error(`❌ BIN chunk ultrapassa fim do arquivo! binEnd=${binEnd} > bufLen=${buf.length}`);
} else {
  console.log('✅ BIN chunk dentro dos limites');
}
const bin = buf.slice(binStart, binEnd);

// Valida bufferViews
const bvs    = gltf.bufferViews || [];
const images = gltf.images || [];
const imgBvSet = new Set(images.filter(i=>i.bufferView!==undefined).map(i=>i.bufferView));

console.log(`\nBufferViews: ${bvs.length} total, ${imgBvSet.size} de imagens`);
let errors = 0;
for (let i = 0; i < bvs.length; i++) {
  const bv  = bvs[i];
  const off = bv.byteOffset ?? 0;
  const len = bv.byteLength;
  const end = off + len;
  if (end > bin.length) {
    console.error(`  ❌ bv[${i}]: offset=${off} len=${len} => end=${end} > binLen=${bin.length}`);
    errors++;
  } else {
    const tag = imgBvSet.has(i) ? ' [IMG]' : '';
    console.log(`  ✅ bv[${i}]${tag}: offset=${off} len=${len}`);
  }
}

console.log(`\n${errors === 0 ? '✅ ARQUIVO VÁLIDO' : `❌ ${errors} erro(s) encontrado(s)`}`);

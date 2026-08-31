/**
 * compress-glb.mjs v2
 * Comprime texturas JPEG embutidas nos arquivos GLB usando sharp.
 * Reduz texturas acima de MAX_DIM e recomprime com qualidade JPEG_QUALITY.
 * Usa: node compress-glb.mjs <entrada.glb> <saida.glb>
 *
 * CORREÇÃO v2: offsets do BIN agora são acumulados corretamente sem
 * duplo-padding, evitando RangeError no GLTFLoader.
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { basename } from 'path';

const inputPath  = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Uso: node compress-glb.mjs <entrada.glb> <saida.glb>');
  process.exit(1);
}

const MAX_DIM      = 1024;
const JPEG_QUALITY = 78;

// Alinha um offset para múltiplo de 4 (exigência do spec glTF)
function align4(n) { return Math.ceil(n / 4) * 4; }

const glbBuffer  = readFileSync(inputPath);
const origSize   = glbBuffer.length;

const magic = glbBuffer.readUInt32LE(0);
if (magic !== 0x46546C67) { console.error('Não é um GLB válido.'); process.exit(1); }

// ── Parse chunk 0 (JSON) ──────────────────────────────────────────────────────
const c0Len  = glbBuffer.readUInt32LE(12);
const c0Type = glbBuffer.readUInt32LE(16);
if (c0Type !== 0x4E4F534A) { console.error('Chunk 0 não é JSON.'); process.exit(1); }
const jsonStr = glbBuffer.slice(20, 20 + c0Len).toString('utf8').replace(/\0+$/, '');
const gltf    = JSON.parse(jsonStr);

// ── Parse chunk 1 (BIN) ──────────────────────────────────────────────────────
const c1Base = 20 + c0Len;
if (c1Base + 8 > glbBuffer.length) { console.error('Sem chunk BIN.'); process.exit(1); }
const c1Len  = glbBuffer.readUInt32LE(c1Base);
const c1Type = glbBuffer.readUInt32LE(c1Base + 4);
if (c1Type !== 0x004E4942) { console.error('Chunk 1 não é BIN.'); process.exit(1); }
const binBuffer = glbBuffer.slice(c1Base + 8, c1Base + 8 + c1Len);

const bufferViews = gltf.bufferViews || [];
const images      = gltf.images      || [];

// Índices de bufferViews que pertencem a imagens
const imgBvSet = new Set(
  images.filter(i => i.bufferView !== undefined).map(i => i.bufferView)
);

async function run() {
  // ── 1. Comprime cada chunk de imagem ─────────────────────────────────────
  const newChunks   = [];   // Buffer[]  — dados novos
  let   binOffset   = 0;   // cursor acumulador

  for (let i = 0; i < bufferViews.length; i++) {
    const bv    = bufferViews[i];
    const start = bv.byteOffset ?? 0;
    const len   = bv.byteLength;
    const src   = binBuffer.slice(start, start + len);

    let chunk;

    if (imgBvSet.has(i)) {
      try {
        const img  = sharp(src);
        const meta = await img.metadata();
        let   pipe = img;
        let   resized = false;

        if ((meta.width ?? 0) > MAX_DIM || (meta.height ?? 0) > MAX_DIM) {
          pipe    = pipe.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true });
          resized = true;
        }

        chunk = await pipe.jpeg({ quality: JPEG_QUALITY }).toBuffer();
        const pct = ((src.length - chunk.length) / src.length * 100).toFixed(1);
        const tag = resized ? ` [${meta.width}x${meta.height}→${MAX_DIM}]` : '';
        console.log(`  bv[${i}]: ${(src.length/1024).toFixed(0)}KB → ${(chunk.length/1024).toFixed(0)}KB (-${pct}%)${tag}`);
      } catch {
        console.warn(`  bv[${i}]: falhou compressão — mantido original`);
        chunk = src;
      }
    } else {
      chunk = src;
    }

    // Atualiza o bufferView com novo offset e tamanho REAL do chunk
    bv.byteOffset = binOffset;
    bv.byteLength = chunk.length;
    if (imgBvSet.has(i)) delete bv.byteStride; // não se aplica a imagens

    newChunks.push(chunk);
    binOffset += chunk.length;

    // Padding de alinhamento (4 bytes) — NÃO incluso no byteLength do bv
    const pad = align4(chunk.length) - chunk.length;
    if (pad > 0) newChunks.push(Buffer.alloc(pad, 0));
    binOffset += pad;   // avança o cursor incluindo o padding
  }

  // ── 2. Monta o novo BIN ───────────────────────────────────────────────────
  const newBin = Buffer.concat(newChunks);

  // Atualiza tamanho do buffer no JSON
  if (gltf.buffers?.[0]) gltf.buffers[0].byteLength = newBin.length;

  // ── 3. Serializa o JSON com padding de espaços ────────────────────────────
  let   newJsonStr = JSON.stringify(gltf);
  const jsonPad    = align4(newJsonStr.length) - newJsonStr.length;
  newJsonStr      += ' '.repeat(jsonPad);
  const newJsonBuf = Buffer.from(newJsonStr, 'utf8');

  // ── 4. Monta o GLB final ──────────────────────────────────────────────────
  //  Header(12) + Chunk0Header(8) + JSON + Chunk1Header(8) + BIN
  const totalLen = 12 + 8 + newJsonBuf.length + 8 + newBin.length;
  const out      = Buffer.alloc(totalLen);
  let   pos      = 0;

  out.writeUInt32LE(0x46546C67,       pos); pos += 4; // magic "glTF"
  out.writeUInt32LE(2,                pos); pos += 4; // version
  out.writeUInt32LE(totalLen,         pos); pos += 4; // total length

  out.writeUInt32LE(newJsonBuf.length, pos); pos += 4; // chunk0 length
  out.writeUInt32LE(0x4E4F534A,        pos); pos += 4; // chunk0 type "JSON"
  newJsonBuf.copy(out, pos);                  pos += newJsonBuf.length;

  out.writeUInt32LE(newBin.length,     pos); pos += 4; // chunk1 length
  out.writeUInt32LE(0x004E4942,        pos); pos += 4; // chunk1 type "BIN\0"
  newBin.copy(out, pos);

  writeFileSync(outputPath, out);

  const pct = ((origSize - out.length) / origSize * 100).toFixed(1);
  console.log(`\n✅ ${basename(inputPath)}: ${(origSize/1024/1024).toFixed(2)} MB → ${(out.length/1024/1024).toFixed(2)} MB (-${pct}%)`);
}

run().catch(e => { console.error('Erro fatal:', e); process.exit(1); });

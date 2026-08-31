/**
 * compress-glb.mjs
 * Comprime texturas embutidas nos arquivos GLB usando sharp.
 * Reduz texturas 2048x2048 para 1024x1024 e re-comprime JPEGs com qualidade 75.
 * Uso: node compress-glb.mjs <arquivo.glb> <saida.glb>
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

const MAX_DIM = 1024;  // reduz texturas maiores que isso
const JPEG_QUALITY = 78;

const glbBuffer = readFileSync(inputPath);
const originalSize = glbBuffer.length;

// GLB header: magic(4) + version(4) + length(4) = 12 bytes
// Chunk 0: chunkLength(4) + chunkType(4=0x4E4F534A JSON) + data
// Chunk 1: chunkLength(4) + chunkType(4=0x004E4942 BIN)  + data

const magic   = glbBuffer.readUInt32LE(0);
const version = glbBuffer.readUInt32LE(4);

if (magic !== 0x46546C67) {
  console.error('Arquivo não é um GLB válido.');
  process.exit(1);
}

// Parse chunk 0 (JSON)
const chunk0Length = glbBuffer.readUInt32LE(12);
const chunk0Type   = glbBuffer.readUInt32LE(16);
const jsonBytes    = glbBuffer.slice(20, 20 + chunk0Length);
const gltf         = JSON.parse(jsonBytes.toString('utf8').replace(/\0+$/, ''));

// Parse chunk 1 (BIN) se existir
const chunk1Start  = 20 + chunk0Length;
let binBuffer = null;
let hasBin = false;
if (chunk1Start + 8 <= glbBuffer.length) {
  const chunk1Length = glbBuffer.readUInt32LE(chunk1Start);
  const chunk1Type   = glbBuffer.readUInt32LE(chunk1Start + 4);
  if (chunk1Type === 0x004E4942) {
    binBuffer = Buffer.from(glbBuffer.buffer, glbBuffer.byteOffset + chunk1Start + 8, chunk1Length);
    hasBin = true;
  }
}

if (!hasBin || !binBuffer) {
  console.log('Nenhum chunk BIN encontrado — copiando arquivo sem modificações.');
  writeFileSync(outputPath, glbBuffer);
  process.exit(0);
}

// Processa cada imagem embutida via bufferView
const images = gltf.images || [];
const bufferViews = gltf.bufferViews || [];

let compressedCount = 0;
const newBinParts = [];   // partes do novo buffer binário
const bvRemap = {};       // mapa bufferView index -> novo offset/length

// Primeiro, copia todas as bufferViews não-imagem intactas
// Depois, processa imagens

// Coletamos todos os bufferViews que são de imagem
const imageBvIndices = new Set(
  images
    .filter(img => img.bufferView !== undefined)
    .map(img => img.bufferView)
);

let offset = 0;
const newBvData = bufferViews.map((bv, idx) => ({
  ...bv,
  _originalIdx: idx,
  _newOffset: null,
  _newLength: null
}));

// Construir o novo buffer em ordem
// Para manter compatibilidade, mantemos a ordem original de bufferViews
// mas re-escrevemos os dados das imagens comprimidas

const chunks = [];

async function processAll() {
  for (let bvIdx = 0; bvIdx < bufferViews.length; bvIdx++) {
    const bv = bufferViews[bvIdx];
    const start = bv.byteOffset || 0;
    const length = bv.byteLength;
    const srcData = binBuffer.slice(start, start + length);

    if (imageBvIndices.has(bvIdx)) {
      // Tenta comprimir como imagem
      try {
        const img = sharp(srcData);
        const meta = await img.metadata();
        
        let pipeline = img;
        let wasResized = false;
        
        // Reduz resolução se necessário
        if (meta.width > MAX_DIM || meta.height > MAX_DIM) {
          pipeline = pipeline.resize(MAX_DIM, MAX_DIM, { fit: 'inside', withoutEnlargement: true });
          wasResized = true;
        }
        
        // Re-comprime como JPEG
        const compressed = await pipeline
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: false })
          .toBuffer();
        
        const reduction = ((srcData.length - compressed.length) / srcData.length * 100).toFixed(1);
        console.log(`  Textura #${bvIdx}: ${(srcData.length/1024).toFixed(0)}KB → ${(compressed.length/1024).toFixed(0)}KB (${reduction}% menor)${wasResized ? ` [${meta.width}x${meta.height}→${MAX_DIM}]` : ''}`);
        
        newBvData[bvIdx]._newOffset = offset;
        newBvData[bvIdx]._newLength = compressed.length;
        chunks.push(compressed);
        offset += compressed.length;
        // Alinha em 4 bytes
        const pad = (4 - (compressed.length % 4)) % 4;
        if (pad > 0) {
          chunks.push(Buffer.alloc(pad, 0));
          offset += pad;
        }
        compressedCount++;
      } catch (e) {
        // Não conseguiu comprimir — mantém original
        console.warn(`  Textura #${bvIdx}: mantida sem compressão (${e.message})`);
        newBvData[bvIdx]._newOffset = offset;
        newBvData[bvIdx]._newLength = srcData.length;
        chunks.push(srcData);
        offset += srcData.length;
        const pad = (4 - (srcData.length % 4)) % 4;
        if (pad > 0) { chunks.push(Buffer.alloc(pad, 0)); offset += pad; }
      }
    } else {
      // Não é imagem — copia intacto
      newBvData[bvIdx]._newOffset = offset;
      newBvData[bvIdx]._newLength = srcData.length;
      chunks.push(srcData);
      offset += srcData.length;
      const pad = (4 - (srcData.length % 4)) % 4;
      if (pad > 0) { chunks.push(Buffer.alloc(pad, 0)); offset += pad; }
    }
  }

  // Atualiza o JSON com os novos offsets e tamanhos
  for (let i = 0; i < bufferViews.length; i++) {
    gltf.bufferViews[i].byteOffset = newBvData[i]._newOffset;
    gltf.bufferViews[i].byteLength = newBvData[i]._newLength;
    // Remove byteStride para bufferViews de imagem (não aplicável)
    if (imageBvIndices.has(i)) {
      delete gltf.bufferViews[i].byteStride;
    }
  }

  // Atualiza o buffer total
  const newBinTotal = offset;
  if (gltf.buffers && gltf.buffers[0]) {
    gltf.buffers[0].byteLength = newBinTotal;
  }

  // Serializa JSON (padding com espaços para alinhar em 4 bytes)
  let jsonStr = JSON.stringify(gltf);
  while (jsonStr.length % 4 !== 0) jsonStr += ' ';
  const newJsonBuffer = Buffer.from(jsonStr, 'utf8');

  // Monta o novo BIN chunk
  const newBinBuffer = Buffer.concat(chunks);

  // Monta o GLB final
  const totalLength = 12 + 8 + newJsonBuffer.length + 8 + newBinBuffer.length;
  const outBuf = Buffer.alloc(totalLength);
  let pos = 0;

  // GLB header
  outBuf.writeUInt32LE(0x46546C67, pos); pos += 4; // magic
  outBuf.writeUInt32LE(2, pos); pos += 4;           // version
  outBuf.writeUInt32LE(totalLength, pos); pos += 4; // total length

  // Chunk 0 (JSON)
  outBuf.writeUInt32LE(newJsonBuffer.length, pos); pos += 4;
  outBuf.writeUInt32LE(0x4E4F534A, pos); pos += 4; // "JSON"
  newJsonBuffer.copy(outBuf, pos); pos += newJsonBuffer.length;

  // Chunk 1 (BIN)
  outBuf.writeUInt32LE(newBinBuffer.length, pos); pos += 4;
  outBuf.writeUInt32LE(0x004E4942, pos); pos += 4; // "BIN\0"
  newBinBuffer.copy(outBuf, pos);

  writeFileSync(outputPath, outBuf);

  const newSize = outBuf.length;
  const saved = ((originalSize - newSize) / originalSize * 100).toFixed(1);
  console.log(`\n✅ ${basename(inputPath)}: ${(originalSize/1024/1024).toFixed(2)} MB → ${(newSize/1024/1024).toFixed(2)} MB (-${saved}%)`);
  console.log(`   ${compressedCount} textura(s) comprimida(s)`);
}

processAll().catch(err => {
  console.error('Erro:', err);
  process.exit(1);
});

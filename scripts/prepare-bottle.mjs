// One-off model preparation for the NOIRÉ bottle.
//
// Input : public/models/bottle-src/scene.gltf  (original CC-BY model, untouched)
// Output: public/models/noire-bottle.glb
//
// What it does (geometry is never re-modelled; vertices are kept bit-exact):
//   1. Splits the fused collar (flared disc + pin) from the body at the empty
//      gap in the vertex profile (world y = 0.302) -> nodes Body / Collar / Stopper
//   2. Drops the original teal/green base-colour + metal/rough maps (set in code)
//      and the duplicate UV sets (TEXCOORD_1/2 are identical to TEXCOORD_0)
//   3. Resizes the remaining textures to 2048² WebP
//   4. Prints the measured label-band geometry used by the brand mark shader
//
// Run: node scripts/prepare-bottle.mjs

import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, textureCompress, compactPrimitive } from '@gltf-transform/functions';
import sharp from 'sharp';

const SRC = 'public/models/bottle-src/scene.gltf';
const OUT = 'public/models/noire-bottle.glb';
const COLLAR_SPLIT_Y = 0.302;

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(SRC);
const root = doc.getRoot();

const findNode = (prefix) => root.listNodes().find((n) => n.getMesh() && n.getName().startsWith(prefix));
const bodyNode = findNode('Cylinder');
const stopperNode = findNode('Sphere');

const applyMat = (m, [x, y, z]) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
];

// ---- 1. split collar from body -------------------------------------------
const world = bodyNode.getWorldMatrix();
const bodyPrim = bodyNode.getMesh().listPrimitives()[0];
const pos = bodyPrim.getAttribute('POSITION');
const idx = bodyPrim.getIndices().getArray();
const bodyIdx = [];
const collarIdx = [];
const v = [0, 0, 0];
for (let t = 0; t < idx.length; t += 3) {
  let y = 0;
  for (let k = 0; k < 3; k++) y += applyMat(world, pos.getElement(idx[t + k], v))[1] / 3;
  (y > COLLAR_SPLIT_Y ? collarIdx : bodyIdx).push(idx[t], idx[t + 1], idx[t + 2]);
}

const collarPrim = bodyPrim.clone();
const IndexArray = idx.constructor;
collarPrim.setIndices(doc.createAccessor('collar_indices').setType('SCALAR').setArray(new IndexArray(collarIdx)).setBuffer(root.listBuffers()[0]));
bodyPrim.setIndices(doc.createAccessor('body_indices').setType('SCALAR').setArray(new IndexArray(bodyIdx)).setBuffer(root.listBuffers()[0]));

const collarMaterial = bodyPrim.getMaterial().clone().setName('Collar');
collarPrim.setMaterial(collarMaterial);
bodyPrim.getMaterial().setName('Body');
stopperNode.getMesh().listPrimitives()[0].getMaterial().setName('Stopper');

const collarNode = doc.createNode('Collar').setMesh(doc.createMesh('Collar').addPrimitive(collarPrim)).setMatrix(bodyNode.getMatrix());
bodyNode.getParentNode().addChild(collarNode);
bodyNode.setName('Body');
bodyNode.getMesh().setName('Body');
stopperNode.setName('Stopper');
stopperNode.getMesh().setName('Stopper');

console.log(`split: body ${bodyIdx.length / 3} tris, collar ${collarIdx.length / 3} tris`);

// ---- 2. strip identity textures + duplicate UV sets -----------------------
for (const mat of root.listMaterials()) {
  mat.setBaseColorTexture(null);
  mat.setBaseColorFactor([1, 1, 1, 1]);
  mat.setMetallicRoughnessTexture(null); // NOIRÉ materials set metalness/roughness in code
}
for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    prim.setAttribute('TEXCOORD_1', null);
    prim.setAttribute('TEXCOORD_2', null);
    compactPrimitive(prim);
  }
}

// ---- 3. textures -> 2048 WebP ---------------------------------------------
await doc.transform(
  dedup(),
  prune(),
  textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [2048, 2048], quality: 92 }),
);

// ---- 4. measure label band (smooth ring between body studs and shoulder) ---
const rings = new Map();
const bp = bodyPrim.getAttribute('POSITION');
for (let i = 0; i < bp.getCount(); i++) {
  const [x, y, z] = applyMat(world, bp.getElement(i, v));
  if (y < 0.15 || y > 0.25) continue;
  const key = y.toFixed(4);
  const r = Math.hypot(x, z);
  const e = rings.get(key) || { min: Infinity, max: 0, n: 0 };
  e.min = Math.min(e.min, r); e.max = Math.max(e.max, r); e.n++;
  rings.set(key, e);
}
console.log('vertex rings y: [rMin, rMax, count]');
[...rings.entries()].sort((a, b) => a[0] - b[0]).forEach(([y, e]) => console.log(' ', y, e.min.toFixed(4), e.max.toFixed(4), e.n));

await io.write(OUT, doc);
console.log('wrote', OUT);

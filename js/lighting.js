/**
 * lighting.js
 * Gerenciamento de iluminação e sombras para a cena AR.
 * Suporta perfil "realista" (luz natural e sombras suaves) e "estilizado" (neon/cyberpunk).
 */

import * as THREE from 'three';

let ambientLight = null;
let mainLight = null;
let secondaryLight = null;
let currentProfile = 'realista';
let stableLightTarget = null;

/**
 * Cria as luzes iniciais na cena.
 * @param {THREE.Scene} scene 
 */
export function initLighting(scene) {
  // 1. Luz Ambiente / Hemisférica (Ideal para AR para simular céu e terra)
  ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(ambientLight);

  // 2. Luz Direcional Principal (Gera as sombras projetadas sobre a grama)
  mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
  mainLight.position.set(1.5, 3, 2);
  mainLight.castShadow = true;

  // Ajustes de sombra refinados para mobile
  mainLight.shadow.mapSize.width = 1024;
  mainLight.shadow.mapSize.height = 1024;
  mainLight.shadow.camera.near = 0.1;
  mainLight.shadow.camera.far = 10;
  
  // Limites da câmera de sombra focados no target (1.0 x 1.0)
  const d = 1.2;
  mainLight.shadow.camera.left = -d;
  mainLight.shadow.camera.right = d;
  mainLight.shadow.camera.top = d;
  mainLight.shadow.camera.bottom = -d;
  mainLight.shadow.bias = -0.0005;
  mainLight.shadow.normalBias = 0.002;
  mainLight.shadow.radius = 4; // PCFSoftShadowMap blur

  // O alvo da luz precisa permanecer estável no mundo. Vinculá-lo ao
  // anchor faria a direção das sombras acompanhar cada pequena variação
  // do solver de pose do MindAR.
  stableLightTarget = new THREE.Object3D();
  stableLightTarget.position.set(0, 0, 0);
  stableLightTarget.name = 'stableLightTarget';
  scene.add(stableLightTarget);
  mainLight.target = stableLightTarget;
  scene.add(mainLight);

  // 3. Luz Secundária / Preenchimento
  secondaryLight = new THREE.DirectionalLight(0x90b0ff, 0.3);
  secondaryLight.position.set(-1.5, -2, 1);
  scene.add(secondaryLight);

  // Aplica o perfil inicial
  applyProfile(currentProfile);
}

/**
 * Altera o perfil de iluminação ativo.
 * @param {string} profileName 'realista' | 'estilizado'
 */
export function applyProfile(profileName) {
  if (!ambientLight || !mainLight || !secondaryLight) return;

  currentProfile = profileName;

  if (profileName === 'realista') {
    // Perfil Realista: Luzes neutras e naturais (simula ambiente real)
    ambientLight.color.setHex(0xffffff); // Luz do céu branca/neutra
    ambientLight.groundColor.setHex(0x333333);
    ambientLight.intensity = 0.7;

    mainLight.color.setHex(0xfffaed); // Luz solar quente suave
    mainLight.intensity = 1.0;
    mainLight.position.set(1.5, 3, 2);
    
    secondaryLight.color.setHex(0x90b0ff); // Reflexão azulada suave do céu
    secondaryLight.intensity = 0.4;
    secondaryLight.position.set(-1.5, -2, 1);
  } 
  else if (profileName === 'estilizado') {
    // Perfil Estilizado: Cores neon intensas (Cyberpunk / Futurista)
    ambientLight.color.setHex(0x3b0066); // Roxo escuro
    ambientLight.groundColor.setHex(0x050510);
    ambientLight.intensity = 0.6;

    mainLight.color.setHex(0xff007f); // Neon Magenta / Rosa
    mainLight.intensity = 1.4;
    mainLight.position.set(2, 2, 3);

    secondaryLight.color.setHex(0x00f3ff); // Neon Cyan / Azul
    secondaryLight.intensity = 1.0;
    secondaryLight.position.set(-2, -1, 2);
  }
}

/**
 * Atualiza posições ou direções dinâmicas das luzes se necessário.
 * @param {THREE.Group} targetGroup Grupo do âncora ativo
 */
export function updateLighting() {
  // Intencionalmente não acompanha o anchor. A pose do target é atualizada
  // em todos os frames e pequenas variações não devem alterar a iluminação.
  if (mainLight && stableLightTarget && mainLight.target !== stableLightTarget) {
    mainLight.target = stableLightTarget;
  }
}
/**
 * Retorna as luzes ativas para controle externo (ex: Editor).
 */
export function getLights() {
  return { ambientLight, mainLight, secondaryLight };
}

export default { initLighting, applyProfile, updateLighting, getLights };

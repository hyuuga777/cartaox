/**
 * interactions.js
 * Gerenciamento de interatividade tridimensional.
 * Utiliza Raycasting para detectar cliques/toques nos elementos da composedScene.
 */

import * as THREE from 'three';
import state from './state.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/**
 * Configura os ouvintes de toque e clique no elemento do canvas.
 * @param {HTMLCanvasElement} canvasElement 
 * @param {THREE.Camera} camera 
 * @param {THREE.Group} composedGroup 
 */
export function initInteractions(canvasElement, camera, composedGroup) {
  
  // Função unificada para processar a seleção por toque/clique
  function handlePick(clientX, clientY) {
    if (!composedGroup || !composedGroup.visible) return;

    // Calcula coordenadas normalizadas da tela (-1 a +1)
    const rect = canvasElement.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    // Atualiza o raycaster com a câmera e posição do mouse
    raycaster.setFromCamera(mouse, camera);

    // Faz a intersecção recursiva com todos os filhos do grupo
    const intersects = raycaster.intersectObjects(composedGroup.children, true);

    if (intersects.length > 0) {
      // Encontra qual é o modelo raiz clicado (filho direto de composedGroup)
      let pickedObject = intersects[0].object;
      while (pickedObject.parent && pickedObject.parent !== composedGroup) {
        pickedObject = pickedObject.parent;
      }

      const modelId = pickedObject.name;
      console.log(`Modelo clicado: ${modelId}`);
      
      triggerInteractionAction(modelId);
    }
  }

  // Ouvinte de clique (Desktop / Teste)
  canvasElement.addEventListener('click', (event) => {
    handlePick(event.clientX, event.clientY);
  });

  // Ouvinte de toque (Mobile)
  canvasElement.addEventListener('touchstart', (event) => {
    if (event.touches.length === 1) {
      // Previne ações adicionais de scroll indesejadas ao interagir com o AR
      event.preventDefault();
      const touch = event.touches[0];
      handlePick(touch.clientX, touch.clientY);
    }
  }, { passive: false });
}

/**
 * Dispara ações no estado com base no modelo que foi selecionado.
 * @param {string} modelId 
 */
function triggerInteractionAction(modelId) {
  const modelState = state.models[modelId];
  if (!modelState) return;

  if (modelId === 'mamo-letras' || modelId === 'givemy-letras') {
    // Alterna o play/pause da animação do texto
    const isPlaying = !modelState.playing;
    state.updateModel(modelId, { playing: isPlaying });
    
    // Feedback visual rápido: leve alteração de escala ao clicar
    const originalScale = modelId === 'mamo-letras' ? 0.7 : 0.7;
    state.updateModel(modelId, { scale: { x: originalScale * 1.1, y: originalScale * 1.1, z: originalScale * 1.1 } });
    setTimeout(() => {
      state.updateModel(modelId, { scale: { x: originalScale, y: originalScale, z: originalScale } });
    }, 150);

    console.log(`Animação do ${modelId} alternada para: ${isPlaying ? 'reproduzindo' : 'pausada'}`);
  } 
  else if (modelId === 'flores') {
    // Ao clicar nas flores, elas mudam de tamanho ou rotação
    const isBig = modelState.scale.x > 0.9;
    const newScale = isBig ? 0.8 : 1.0;
    state.updateModel('flores', { 
      scale: { x: newScale, y: newScale, z: newScale },
      rotation: { z: modelState.rotation.z + Math.PI / 4 } // rotaciona um pouco
    });
  }
}
export default { initInteractions };

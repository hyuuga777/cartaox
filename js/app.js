/**
 * app.js
 * Ponto de entrada principal da aplicação WebAR.
 * Inicializa a cena composta (composedScene) e gerencia o loop de renderização.
 */

import state from './state.js';
import targetsConfig from './targets.js';
import models from './models.js';
import lighting from './lighting.js';
import interactions from './interactions.js';

let mindarThree = null;
let composedScene = null;
const clock = new THREE.Clock();

// Função para iniciar a aplicação AR
async function initAR() {
  const container = document.querySelector('#ar-container');
  const splash = document.querySelector('#splash');
  const hud = document.querySelector('#scanning-hud');

  try {
    // 1. Inicializa o MindARThree puro (sem A-Frame)
    mindarThree = new MINDAR.IMAGE.MindARThree({
      container: container,
      imageTargetSrc: targetsConfig.mindSrc,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
      facingMode: 'environment' // Força uso da câmera traseira no mobile
    });

    const { renderer, scene, camera } = mindarThree;

    // Configurações recomendadas do renderer para PBR e mobile
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Adiciona o Âncora (Target Index 0)
    const anchor = mindarThree.addAnchor(0);

    // 3. Inicializa as Luzes da Cena
    lighting.initLighting(scene);

    // 4. Inicia o MindAR Engine IMEDIATAMENTE para respeitar o User Gesture (Câmera) no iOS Safari
    await mindarThree.start();
    console.log('MindARThree iniciado com sucesso!');

    // Oculta splash screen e exibe o HUD do scanner assim que a câmera abre
    if (splash) splash.classList.add('hidden');
    if (hud) hud.classList.remove('hidden');

    // 5. Carrega a Cena Composta (composedScene contendo os 4 GLBs)
    console.log('Iniciando o carregamento dos modelos 3D...');
    composedScene = await models.loadComposedScene();
    
    // Adiciona o grupo da cena composta ao âncora do alvo
    anchor.group.add(composedScene);
    console.log('Cena composta adicionada com sucesso ao âncora!');

    // 6. Inicializa Interações de Toque (Raycaster)
    interactions.initInteractions(renderer.domElement, camera, composedScene);

    // 7. Escuta os eventos do Target
    anchor.onTargetFound = () => {
      console.log('Target QR Code detectado!');
      state.updateAR({ isTracking: true, activeTargetIndex: 0 });
      state.updateAR({ composedScene: { visible: true } });
    };

    anchor.onTargetLost = () => {
      console.log('Target QR Code perdido!');
      state.updateAR({ isTracking: false });
      state.updateAR({ composedScene: { visible: false } });
    };
    renderer.setAnimationLoop(() => {
      const deltaTime = clock.getDelta();

      // Atualiza animações 3D (se houverem)
      models.updateAnimations(deltaTime);

      // Sincroniza posições/rotação/escala do estado declarativo para o Three.js
      models.updateSceneFromState(composedScene);

      // Direciona as sombras dinâmicas de acordo com o âncora ativo
      lighting.updateLighting(anchor.group);
      
      renderer.render(scene, camera);
    });

  } catch (error) {
    console.error('Falha ao inicializar o AR:', error);
    
    // Restaura a UI do botão em caso de falha (ex: permissão negada)
    const startBtn = document.querySelector('#start-btn');
    const loadingIndicator = document.querySelector('#loading-indicator');
    if (startBtn) startBtn.classList.remove('hidden');
    if (loadingIndicator) loadingIndicator.classList.add('hidden');

    if (error.name === 'NotAllowedError') {
      showErrorMessage('Permissão negada. Libere o acesso à câmera nas configurações do navegador.');
    } else {
      showErrorMessage('Não foi possível iniciar a câmera. Verifique as permissões de vídeo.');
    }
  }
}

// Assina o estado para reagir à visibilidade da UI e HUD
state.subscribe((currentState) => {
  const hud = document.querySelector('#scanning-hud');
  const closeBtn = document.querySelector('#closeBtn');
  
  if (hud) {
    if (currentState.ar.composedScene.visible) {
      hud.classList.add('hidden');
    } else if (currentState.ar.isTracking === false) {
      hud.classList.remove('hidden');
    }
  }

  if (closeBtn) {
    if (currentState.ar.composedScene.visible) {
      closeBtn.classList.add('visible');
    } else {
      closeBtn.classList.remove('visible');
    }
  }
});

// Exibe mensagens de erro amigáveis na UI
function showErrorMessage(msg) {
  const errorDiv = document.querySelector('#error-msg');
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.classList.add('visible');
  }
}

// Inicia a aplicação após clique do usuário (necessário para permissões de câmera/vídeo em iOS e browsers modernos)
window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.querySelector('#start-btn');
  const loadingIndicator = document.querySelector('#loading-indicator');

  if (startBtn) {
    startBtn.addEventListener('click', async () => {
      // 1. Verificação crítica de contexto seguro (HTTPS/Localhost)
      const isSecureContext = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if (!isSecureContext) {
        console.warn('⚠️ Contexto Inseguro detectado! A câmera será bloqueada pelo navegador. Use HTTPS.');
        showErrorMessage('Erro de Segurança: O AR precisa de HTTPS para abrir a câmera no celular.');
        return; // Interrompe a execução antes mesmo de tentar abrir a câmera
      }

      // 2. Esconde o botão e mostra o loader temporariamente
      startBtn.classList.add('hidden');
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      
      // 3. User Gesture: Aciona diretamente a engine do MindAR.
      // Retirado o `getUserMedia` manual prévio, pois no iOS o track.stop() gera NotReadableError
      // ao conflitar com a requisição do próprio MindAR na sequência.
      initAR();
    });
  } else {
    // Fallback caso o botão não exista
    initAR();
  }
});

/**
 * app.js
 * Ponto de entrada principal da aplicação WebAR.
 * Inicializa a cena composta (composedScene) e gerencia o loop de renderização.
 */

import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import state from './state.js';
import targetsConfig from './targets-config.js';
import models from './models.js';
import lighting from './lighting.js';
import interactions from './interactions.js';
import editor from './editor.js';

let mindarThree = null;
let composedScene = null;
const clock = new THREE.Clock();

// Função para iniciar a aplicação AR
async function initAR() {
  const container = document.querySelector('#ar-container');
  const splash = document.querySelector('#splash');
  const hud = document.querySelector('#scanning-hud');

  try {
    // 1. Inicializa o MindARThree ESM. Não usar MINDAR.IMAGE aqui:
    // essa é a API global da build antiga e não existe no módulo ESM.
    mindarThree = new MindARThree({
      container: container,
      imageTargetSrc: targetsConfig.mindSrc,
      uiLoading: 'no',
      uiScanning: 'no',
      uiError: 'no',
      facingMode: 'environment', // Força uso da câmera traseira no mobile
      // ----------------------------------------------------
      // CONFIGURAÇÕES DE TRACKING (Filtro OneEuro)
      // Ajuste para reduzir tremedeira (jitter)
      // ----------------------------------------------------
      filterMinCF: 0.0001, // Padrão: 0.001. Diminuir ajuda a REDUZIR TREMEDEIRA (mais estável, mas pode ficar ligeiramente mais lento para acompanhar movimento rápido).
      filterBeta: 0.001,   // Padrão: 1000. Diminuir suaviza os movimentos bruscos.
      missTolerance: 10,   // Padrão: 5. Aumenta os frames de tolerância antes de "perder" a imagem se a iluminação falhar rápido.
      warmupTolerance: 5   // Padrão: 5. Quantidade de frames para considerar o tracking sólido antes de mostrar a cena.
    });

    const { renderer, scene, camera } = mindarThree;

    // Configurações recomendadas do renderer para PBR e mobile (Three.js r137)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Aumentado levemente para brilho
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = 'srgb';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Adiciona o Âncora (Target Index 0)
    const anchor = mindarThree.addAnchor(0);

    // Registra os callbacks antes de iniciar a câmera e antes de baixar os GLBs.
    // Os modelos atuais são grandes; sem esta ordem, o alvo poderia ser
    // encontrado enquanto os modelos carregavam e o evento seria perdido.
    anchor.onTargetFound = () => {
      console.log('Target QR Code detectado!');
      state.updateAR({
        isTracking: true,
        activeTargetIndex: 0,
        trackingStartTime: performance.now() / 1000
      });
      state.updateAR({ composedScene: { visible: true } });
    };

    anchor.onTargetLost = () => {
      console.log('Target QR Code perdido!');
      state.updateAR({ isTracking: false });
      state.updateAR({ composedScene: { visible: false } });
    };

    // 3. Inicializa as Luzes da Cena
    lighting.initLighting(scene);

    // 4. Inicia o MindAR Engine IMEDIATAMENTE para respeitar o User Gesture (Câmera) no iOS Safari
    await mindarThree.start();
    console.log('MindARThree iniciado com sucesso!');

    // Exibe o HUD do scanner assim que a câmera abre, mas mantém o splash parcial
    // para mostrar o progresso do download dos modelos pesados (80MB+).
    if (hud) hud.classList.remove('hidden');
    const startBtn = document.querySelector('#start-btn');
    const loadingIndicator = document.querySelector('#loading-indicator');
    if (startBtn) startBtn.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');

    // 5. Carrega a Cena Composta (composedScene contendo os 4 GLBs)
    console.log('Iniciando o carregamento dos modelos 3D...');
    composedScene = await models.loadComposedScene();
    
    // Agora que os modelos carregaram, podemos esconder o splash totalmente
    if (splash) splash.classList.add('hidden');
    
    // Ajuste global: a experiência fica plana sobre o QR Code
    composedScene.rotation.set(0, 0, 0);
    composedScene.position.set(0, 0, 0);

    // Adiciona o grupo da cena composta ao âncora do alvo
    anchor.group.add(composedScene);
    
    // DEBUG: Cubo de teste para confirmar que o renderizador está funcionando
    // mesmo se os modelos GLB falharem ou estiverem fora de posição.
    const debugBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x003300 })
    );
    debugBox.position.set(0, 0, 0);
    anchor.group.add(debugBox);
    
    console.log('Cena composta adicionada com sucesso ao âncora!');

    // 6. Inicializa Interações de Toque (Raycaster)
    interactions.initInteractions(renderer.domElement, camera, composedScene);

    // 7. Inicia o loop de renderização.
    renderer.setAnimationLoop(() => {
      const deltaTime = clock.getDelta();

      // Atualiza animações 3D (se houverem)
      models.updateAnimations(deltaTime);

      if (state.ar.isTracking && state.ar.trackingStartTime !== null) {
        if (window.EDITOR_SETTINGS && !window.EDITOR_SETTINGS.play) {
          models.updateTweens(window.EDITOR_SETTINGS.time);
        } else {
          const elapsedTime = (performance.now() / 1000) - state.ar.trackingStartTime;
          if (window.EDITOR_SETTINGS) window.EDITOR_SETTINGS.time = elapsedTime;
          models.updateTweens(elapsedTime);
        }
      }

      // Sincroniza posições/rotação/escala do estado declarativo para o Three.js
      models.updateSceneFromState(composedScene);

      // Direciona as sombras dinâmicas de acordo com o âncora ativo
      lighting.updateLighting(anchor.group);
      
      renderer.render(scene, camera);
    });

  } catch (error) {
    console.error('[AR ERROR] Falha ao inicializar o AR:', error);
    console.error('[AR ERROR] name:', error?.name, 'message:', error?.message, 'stack:', error?.stack);
    
    // Restaura a UI do botão em caso de falha (ex: permissão negada)
    const startBtn = document.querySelector('#start-btn');
    const loadingIndicator = document.querySelector('#loading-indicator');
    if (startBtn) startBtn.classList.remove('hidden');
    if (loadingIndicator) loadingIndicator.classList.add('hidden');

    // Algumas versões móveis do MindAR repassam um erro vazio quando o
    // navegador recusa a câmera. Nesses casos, diagnostica o ambiente em vez
    // de mostrar apenas "falha desconhecida".
    let cameraCount = null;
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        cameraCount = devices.filter(device => device.kind === 'videoinput').length;
      }
    } catch (diagnosticError) {
      console.warn('[AR] Não foi possível enumerar as câmeras:', diagnosticError);
    }

    let message = `Erro: ${error?.message || error?.name || 'MindAR não conseguiu iniciar a câmera'}`;
    if (!window.isSecureContext || location.protocol !== 'https:') {
      message = 'A câmera exige HTTPS. Abra esta experiência usando https://.';
    } else if (!navigator.mediaDevices?.getUserMedia) {
      message = 'Este navegador não disponibilizou a API de câmera. Teste no Safari ou Chrome atualizado.';
    } else if (cameraCount === 0) {
      message = 'Nenhuma câmera foi encontrada neste dispositivo ou no navegador de teste.';
    } else if (error?.name === 'NotAllowedError') {
      message = 'Permissão de câmera negada. Autorize a câmera nas configurações do navegador.';
    } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
      message = 'Nenhuma câmera compatível foi encontrada neste dispositivo.';
    } else if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') {
      message = 'A câmera está em uso por outro aplicativo. Feche-o e tente novamente.';
    } else if (error?.name === 'SecurityError') {
      message = 'O navegador bloqueou o acesso à câmera por segurança. Verifique as permissões do site.';
    } else if (error?.message?.includes('target') || error?.message?.includes('.mind')) {
      message = `Não foi possível carregar o arquivo de rastreamento: ${targetsConfig.mindSrc}`;
    } else if (error?.message?.includes('MindAR') || error?.message?.includes('module')) {
      message = 'O motor AR não carregou. Atualize a página e verifique a conexão com a CDN.';
    } else if (cameraCount > 0) {
      message = 'A câmera existe, mas o navegador recusou a inicialização do MindAR. Recarregue e autorize a câmera para este site.';
    }
    console.error('[AR DIAGNÓSTICO]', { secureContext: window.isSecureContext, protocol: location.protocol, cameraCount, error });
    showErrorMessage(message);
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

// Função para iniciar Modo Desktop (sem câmera/AR)
async function initDesktopMode() {
  const container = document.querySelector('#ar-container');
  const splash = document.querySelector('#splash');

  try {
    // Esconde o splash
    if (splash) splash.classList.add('hidden');

    // Configuração básica do Three.js
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    if (renderer.outputEncoding !== undefined) renderer.outputEncoding = THREE.sRGBEncoding;
    if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = 'srgb';
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e); // Fundo escuro para destacar o modelo

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 1.5, 3); // Câmera olhando de cima e de frente

    // Adiciona controles de mouse
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // Inicializa Iluminação
    lighting.initLighting(scene);

    // Carrega modelos
    console.log('Iniciando o carregamento dos modelos 3D no Modo PC...');
    composedScene = await models.loadComposedScene();
    scene.add(composedScene);

    // Adiciona o QR Code como referência visual no Modo PC
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('assets/images/qrcode.png', (texture) => {
      // O MindAR cria o alvo com largura de 1 unidade (escala 1x1 se for quadrado)
      const aspect = texture.image.width / texture.image.height;
      const qrPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2 / aspect), // Dobrado conforme solicitado
        new THREE.MeshBasicMaterial({ 
          map: texture, 
          transparent: true, 
          opacity: 0.5, // 50% transparente para não atrapalhar tanto
          side: THREE.DoubleSide,
          depthWrite: false // Evita problemas de z-fighting com os modelos no chão
        })
      );
      // O MindAR por padrão coloca o target no plano X-Y (Z=0).
      qrPlane.position.set(0, 0, -0.01); // Levemente para trás para não cobrir a grama
      scene.add(qrPlane);
    });

    // Força o estado como se tivesse encontrado o target
    state.updateAR({ 
      isTracking: true, 
      activeTargetIndex: 0,
      trackingStartTime: performance.now() / 1000
    });
    state.updateAR({ composedScene: { visible: true } });

    // Inicia o Editor
    editor.initEditor();

    // Evento global para recarregar cena (útil para Duplicar objetos e ver ao vivo)
    window.addEventListener('reload-scene', async () => {
      console.log('Recarregando cena (Duplicação/Atualização)...');
      if (composedScene) {
        if (typeof transformControl !== 'undefined') transformControl.detach();
        scene.remove(composedScene);
        models.disposeScene(composedScene);
      }
      
      composedScene = await models.loadComposedScene();
      scene.add(composedScene);
      
      if (window.EDITOR_GUI) {
        window.EDITOR_GUI.destroy();
      }
      editor.initEditor();
    });

    // Adiciona TransformControls para mover objetos
    const transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.addEventListener('dragging-changed', (event) => {
      controls.enabled = !event.value;
      if (window.EDITOR_SETTINGS) {
        window.EDITOR_SETTINGS.isDragging = event.value;
      }
    });
    scene.add(transformControl);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectionHelper = null;

    window.addEventListener('dblclick', (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(composedScene.children, true);
      
      if (intersects.length > 0) {
        let pickedObject = intersects[0].object;
        while (pickedObject.parent && pickedObject.parent !== composedScene) {
          pickedObject = pickedObject.parent;
        }
        console.log("Selecionado para arrastar:", pickedObject.name);
        transformControl.attach(pickedObject);

        if (selectionHelper) {
          scene.remove(selectionHelper);
          selectionHelper.dispose();
        }
        // Cria uma caixa (BoxHelper) neon cyan em volta do objeto selecionado
        selectionHelper = new THREE.BoxHelper(pickedObject, 0x00ffff);
        scene.add(selectionHelper);

        if (window.highlightEditorFolder) {
          window.highlightEditorFolder(pickedObject.name, true);
        }
      } else {
        transformControl.detach();

        if (selectionHelper) {
          scene.remove(selectionHelper);
          selectionHelper.dispose();
          selectionHelper = null;
        }
        if (window.highlightEditorFolder) {
          window.highlightEditorFolder(null);
        }
      }
    });

    window.selectObjectFromMenu = (modelId) => {
      const obj = composedScene.getObjectByName(modelId);
      if (obj) {
        transformControl.attach(obj);
        if (selectionHelper) {
          scene.remove(selectionHelper);
          selectionHelper.dispose();
        }
        selectionHelper = new THREE.BoxHelper(obj, 0x00ffff);
        scene.add(selectionHelper);
        
        if (window.highlightEditorFolder) {
          window.highlightEditorFolder(modelId);
        }
      }
    };

    transformControl.addEventListener('change', () => {
      if (transformControl.object && window.EDITOR_SETTINGS && window.EDITOR_SETTINGS.isDragging) {
        const modelId = transformControl.object.name;
        const obj = transformControl.object;
        const mode = transformControl.getMode();
        const anim = targetsConfig.targets[0].composition[modelId].animation;

        let updatePayload = {};
        
        if (mode === 'translate') {
          updatePayload.position = { x: obj.position.x, y: obj.position.y, z: obj.position.z };
          if (anim) {
            anim.endTransform.position.x = obj.position.x;
            anim.endTransform.position.y = obj.position.y;
            anim.endTransform.position.z = obj.position.z;
          }
        } 
        else if (mode === 'rotate') {
          updatePayload.rotation = { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z };
        } 
        else if (mode === 'scale') {
          updatePayload.scale = { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z };
          if (anim) {
            anim.endTransform.scale.x = obj.scale.x;
            anim.endTransform.scale.y = obj.scale.y;
            anim.endTransform.scale.z = obj.scale.z;
          }
        }
        
        // Impede que o updateSceneFromState desfaça o arraste
        state.updateModel(modelId, updatePayload);
      }
    });

    // Escala pelo Scroll do Mouse
    window.addEventListener('wheel', (event) => {
      if (transformControl.object) {
        event.preventDefault();
        event.stopImmediatePropagation();
        
        const delta = event.deltaY < 0 ? 0.05 : -0.05;
        const obj = transformControl.object;
        
        obj.scale.x = Math.max(0.001, obj.scale.x + delta);
        obj.scale.y = Math.max(0.001, obj.scale.y + delta);
        obj.scale.z = Math.max(0.001, obj.scale.z + delta);
        
        const modelId = obj.name;
        const anim = targetsConfig.targets[0].composition[modelId].animation;
        if (anim) {
          anim.endTransform.scale.x = obj.scale.x;
          anim.endTransform.scale.y = obj.scale.y;
          anim.endTransform.scale.z = obj.scale.z;
        }
        
        state.updateModel(modelId, {
          scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
        });
      }
    }, { capture: true, passive: false });

    // Resize handler
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Loop de renderização
    renderer.setAnimationLoop(() => {
      const deltaTime = clock.getDelta();

      controls.update(); // Necessário para damping
      models.updateAnimations(deltaTime);

      if (window.EDITOR_SETTINGS && window.EDITOR_SETTINGS.gizmoMode) {
        if (transformControl.getMode() !== window.EDITOR_SETTINGS.gizmoMode) {
          transformControl.setMode(window.EDITOR_SETTINGS.gizmoMode);
        }
      }

      if (state.ar.isTracking && state.ar.trackingStartTime !== null) {
        if (window.EDITOR_SETTINGS && !window.EDITOR_SETTINGS.play) {
          models.updateTweens(window.EDITOR_SETTINGS.time);
        } else {
          const elapsedTime = (performance.now() / 1000) - state.ar.trackingStartTime;
          if (window.EDITOR_SETTINGS) window.EDITOR_SETTINGS.time = elapsedTime;
          models.updateTweens(elapsedTime);
        }
      }

      models.updateSceneFromState(composedScene);

      if (typeof selectionHelper !== 'undefined' && selectionHelper) {
        selectionHelper.update();
      }
      
      // No modo desktop, a luz olha pro centro (composedScene)
      lighting.updateLighting(composedScene);
      
      renderer.render(scene, camera);
    });

  } catch (error) {
    console.error('Falha ao inicializar o Modo Desktop:', error);
    showErrorMessage('Erro ao carregar o Modo PC.');
  }
}

// Inicia a aplicação após clique do usuário (necessário para permissões de câmera/vídeo em iOS e browsers modernos)
window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.querySelector('#start-btn');
  const startPcBtn = document.querySelector('#start-pc-btn');
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
      if (startPcBtn) startPcBtn.classList.add('hidden');
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      
      // 3. User Gesture: Aciona diretamente a engine do MindAR.
      // A chamada ocorre dentro do clique; não usar setTimeout aqui.
      await initAR();
    });
  }

  if (startPcBtn) {
    startPcBtn.addEventListener('click', () => {
      if (startBtn) startBtn.classList.add('hidden');
      startPcBtn.classList.add('hidden');
      if (loadingIndicator) loadingIndicator.classList.remove('hidden');
      
      initDesktopMode();
    });
  }
});

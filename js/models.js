/**
 * models.js
 * Pipeline de carregamento assíncrono e gerenciamento dos modelos GLB.
 * Combina flores.glb, givemy-letras.glb, grama.glb e mamo-letras.glb em um único grupo.
 */

import state from './state.js';
import targetsConfig from './targets.js';

// Cache local de objetos carregados
const loadedModels = {
  grama: null,
  flores: null,
  'givemy-letras': null,
  'mamo-letras': null
};

// Guardará mixers de animações para cada modelo que possuir animação
const animationMixers = [];

/**
 * Carrega todos os modelos da composedScene em paralelo.
 * @param {THREE.LoadingManager} manager 
 * @returns {Promise<THREE.Group>} Grupo com todos os modelos ancorados
 */
export function loadComposedScene() {
  return new Promise((resolve, reject) => {
    const loadingManager = new THREE.LoadingManager();
    const loader = new THREE.GLTFLoader(loadingManager);
    const composedGroup = new THREE.Group();
    composedGroup.name = 'composedScene';

    const splashHint = document.querySelector('.splash-hint');
    const progressBar = document.querySelector('#bar'); // caso tenhamos adicionado na UI ou barra de progresso

    // Configuração de feedback visual do Loading Manager
    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const percentage = Math.round((itemsLoaded / itemsTotal) * 100);
      if (splashHint) {
        splashHint.innerHTML = `Carregando modelos 3D...<br>${percentage}% (${itemsLoaded}/${itemsTotal})`;
      }
    };

    loadingManager.onLoad = () => {
      console.log('Todos os modelos GLB foram carregados com sucesso!');
      resolve(composedGroup);
    };

    loadingManager.onError = (url) => {
      console.error(`Erro ao carregar o asset: ${url}`);
      reject(new Error(`Falha ao carregar o modelo 3D em: ${url}`));
    };

    // Definição da cena para o alvo qrcode (índice 0)
    const targetDef = targetsConfig.targets.find(t => t.index === 0);
    const modelConfigs = targetDef.composition;

    // Carrega cada modelo listado no estado do targets.js
    Object.keys(modelConfigs).forEach((modelId) => {
      const config = modelConfigs[modelId];
      const modelState = state.models[modelId];

      loader.load(
        modelState.path,
        (gltf) => {
          const modelScene = gltf.scene;
          modelScene.name = modelId;

          // Habilita sombras de forma otimizada para mobile
          modelScene.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              
              // Otimizações de material para mobile
              if (node.material) {
                // Ativa transparência se configurada no material
                if (node.material.transparent) {
                  node.material.depthWrite = true; // evita bugs de ordenação de profundidade comuns
                }
              }
            }
          });

          // Aplica transformações iniciais de targets.js
          const t = config.initialTransform;
          modelScene.position.set(t.position.x, t.position.y, t.position.z);
          modelScene.rotation.set(t.rotation.x, t.rotation.y, t.rotation.z);
          modelScene.scale.set(t.scale.x, t.scale.y, t.scale.z);

          // Salva no cache local
          loadedModels[modelId] = modelScene;

          // Se o modelo possuir animações, inicializa o mixer
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(modelScene);
            // Configura para reproduzir a primeira animação por padrão
            const action = mixer.clipAction(gltf.animations[0]);
            
            // Salva referência do mixer e do estado da animação
            animationMixers.push({
              modelId: modelId,
              mixer: mixer,
              action: action,
              clips: gltf.animations
            });

            // Se o estado indicar para rodar inicialmente, reproduz
            if (modelState.playing) {
              action.play();
            }
          }

          // Adiciona ao grupo principal da cena composta
          composedGroup.add(modelScene);
        },
        undefined,
        (err) => {
          console.error(`Erro ao carregar o modelo ${modelId}:`, err);
        }
      );
    });
  });
}

/**
 * Atualiza as animações de todos os modelos ativos.
 * @param {number} deltaTime Tempo decorrido desde o último frame (em segundos)
 */
export function updateAnimations(deltaTime) {
  animationMixers.forEach((item) => {
    const modelState = state.models[item.modelId];
    if (modelState && modelState.playing) {
      item.mixer.update(deltaTime);
    }
  });
}

/**
 * Atualiza dinamicamente as transformações e visibilidade com base no estado.
 * @param {THREE.Group} composedGroup Grupo da composedScene no Three.js
 */
export function updateSceneFromState(composedGroup) {
  if (!composedGroup) return;

  // Atualiza visibilidade geral da cena composta
  composedGroup.visible = state.ar.composedScene.visible;

  // Atualiza transformações individuais dos modelos filhos
  composedGroup.children.forEach((child) => {
    const modelState = state.models[child.name];
    if (modelState) {
      child.visible = modelState.visible;
      child.position.set(modelState.position.x, modelState.position.y, modelState.position.z);
      child.rotation.set(modelState.rotation.x, modelState.rotation.y, modelState.rotation.z);
      child.scale.set(modelState.scale.x, modelState.scale.y, modelState.scale.z);

      // Ajusta opacidade do material recursivamente
      child.traverse((node) => {
        if (node.isMesh && node.material) {
          node.material.transparent = modelState.opacity < 1.0;
          node.material.opacity = modelState.opacity;
        }
      });
    }
  });
}

/**
 * Limpa todos os recursos de memória da cena composta ao descarregar.
 * @param {THREE.Group} composedGroup
 */
export function disposeScene(composedGroup) {
  if (!composedGroup) return;

  composedGroup.traverse((node) => {
    if (node.isMesh) {
      if (node.geometry) node.geometry.dispose();
      
      if (node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach(mat => mat.dispose());
        } else {
          node.material.dispose();
        }
      }
    }
  });

  // Limpa mixers de animação
  animationMixers.length = 0;
  
  // Limpa cache
  Object.keys(loadedModels).forEach(key => loadedModels[key] = null);
}
export default { loadComposedScene, updateAnimations, updateSceneFromState, disposeScene };

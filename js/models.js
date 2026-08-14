/**
 * models.js
 * Pipeline de carregamento assíncrono e gerenciamento dos modelos GLB.
 * Combina flores.glb, givemy-letras.glb, grama.glb e mamo-letras.glb em um único grupo.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import state from './state.js';
import targetsConfig from './targets-config.js';

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
 * Atualiza a orientação visual do carregamento sem depender de alertas do navegador.
 * O percentual usa bytes reais quando o servidor envia Content-Length e cai para
 * a contagem de modelos concluídos quando a resposta não informa o tamanho.
 */
function updateLoadingUI(percent, label, detail = '') {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const progressBar = document.querySelector('#bar');
  const progressPercent = document.querySelector('#loading-percent');
  const progressDetail = document.querySelector('#loading-detail');
  const splashHint = document.querySelector('.splash-hint');

  if (progressBar) {
    progressBar.style.width = `${safePercent}%`;
    progressBar.setAttribute('aria-valuenow', String(safePercent));
  }
  if (progressPercent) progressPercent.textContent = `${safePercent}%`;
  if (progressDetail) progressDetail.textContent = detail;
  if (splashHint) splashHint.textContent = label;
}

/**
 * Carrega todos os modelos da composedScene em paralelo.
 * @returns {Promise<THREE.Group>} Grupo com todos os modelos ancorados
 */
function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'tamanho desconhecido';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function loadComposedScene() {
  return new Promise((resolve, reject) => {
    const loadingManager = new THREE.LoadingManager();
    const loader = new GLTFLoader(loadingManager);

    // Os GLBs otimizados usam KHR_draco_mesh_compression.
    // O decoder é baixado somente quando necessário e não aumenta o bundle do app.
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);
    const composedGroup = new THREE.Group();
    composedGroup.name = 'composedScene';

    // Definição da cena para o alvo qrcode (índice 0)
    const targetDef = targetsConfig.targets.find(t => t.index === 0);
    const modelConfigs = targetDef.composition;
    const modelIds = Object.keys(modelConfigs);
    const modelProgress = new Map(modelIds.map((modelId) => [modelId, { loaded: 0, total: 0, complete: false }]));
    updateLoadingUI(0, 'Preparando a experiência 3D...', 'Baixando os elementos da cena');

    const refreshProgress = () => {
      const entries = [...modelProgress.values()];
      const allHaveByteTotals = entries.every((entry) => entry.total > 0);
      const allComplete = entries.every((entry) => entry.complete);
      let percentage;
      let detail;

      if (allHaveByteTotals) {
        const loadedBytes = entries.reduce((sum, entry) => sum + Math.min(entry.loaded, entry.total), 0);
        const totalBytes = entries.reduce((sum, entry) => sum + entry.total, 0);
        percentage = allComplete ? 100 : (totalBytes ? (loadedBytes / totalBytes) * 100 : 0);
        detail = `${formatBytes(loadedBytes)} de ${formatBytes(totalBytes)}`;
      } else {
        const completed = entries.filter((entry) => entry.complete).length;
        percentage = allComplete ? 100 : (completed / entries.length) * 100;
        detail = `${completed} de ${entries.length} elementos concluídos`;
      }

      updateLoadingUI(percentage, allComplete ? 'Modelos 3D prontos!' : 'Carregando modelos 3D...', detail);
    };

    loadingManager.onLoad = () => {
      modelProgress.forEach((entry) => { entry.complete = true; });
      refreshProgress();
      console.log('Todos os modelos GLB foram carregados com sucesso!');
      resolve(composedGroup);
    };

    loadingManager.onError = (url) => {
      console.error(`Erro ao carregar o asset: ${url}`);
      reject(new Error(`Falha ao carregar o modelo 3D em: ${url}`));
    };

    // Carrega cada modelo listado no estado do targets-config.js
    modelIds.forEach((modelId) => {
      const config = modelConfigs[modelId];
      const modelState = state.models[modelId];

      loader.load(
        modelState.path,
        (gltf) => {
          const progress = modelProgress.get(modelId);
          if (progress) {
            progress.complete = true;
            if (progress.total > 0) progress.loaded = progress.total;
            refreshProgress();
          }

          const modelScene = gltf.scene;
          modelScene.name = modelId;

          // Habilita sombras de forma otimizada para mobile e aplica material
          modelScene.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;
              if (!node.material) {
                node.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
              } else if (Array.isArray(node.material)) {
                node.material = node.material.map(m => m.clone());
              } else {
                node.material = node.material.clone();
              }

              const mats = Array.isArray(node.material) ? node.material : [node.material];
              
              mats.forEach(mat => {
                if (mat.map) {
                  // No Three.js r137, somente a textura de cor/albedo é sRGB.
                  // Não alteramos o material base nem as texturas técnicas.
                  mat.map.encoding = THREE.sRGBEncoding;
                  mat.map.needsUpdate = true;
                }
                if (mat.emissiveMap) {
                  mat.emissiveMap.encoding = THREE.sRGBEncoding;
                  mat.emissiveMap.needsUpdate = true;
                }
                if (mat.transparent) {
                  mat.depthWrite = true;
                }
                
                if (config.material) {
                  if (config.material.isOccluder) {
                    mat.colorWrite = false;
                    mat.depthWrite = true;
                    node.renderOrder = -1; // Ensure occluders render early
                  }
                  if (config.material.color && mat.color && !config.material.isOccluder) {
                    mat.color.set(config.material.color);
                  }
                  if (config.material.metalness !== undefined && mat.metalness !== undefined) {
                    mat.metalness = config.material.metalness;
                  }
                  if (config.material.roughness !== undefined && mat.roughness !== undefined) {
                    mat.roughness = config.material.roughness;
                  }
                }
              });
            }
          });

          // Aplica transformações iniciais de targets-config.js
          let t = config.animation ? config.animation.startTransform : config.initialTransform;
          if (!t) t = { position: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0}, scale: {x:1,y:1,z:1} };
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
        (xhr) => {
          const progress = modelProgress.get(modelId);
          if (!progress || !xhr) return;
          progress.loaded = xhr.loaded || 0;
          progress.total = xhr.total || progress.total || 0;
          refreshProgress();
        },
        (err) => {
          console.error(`Erro ao carregar o modelo ${modelId}:`, err);
          reject(new Error(`Falha ao carregar o modelo 3D ${modelId}.`));
        }
      );
    });
    activeComposedGroup = composedGroup;
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
 * Interpola (Tween) posições e escalas baseado no tempo de tracking.
 * @param {number} elapsedTime Tempo em segundos desde que o tracking iniciou
 */
export function updateTweens(elapsedTime) {
  const targetDef = targetsConfig.targets.find(t => t.index === 0);
  if (!targetDef || !targetDef.composition) return;

  const modelConfigs = targetDef.composition;

  Object.keys(modelConfigs).forEach((modelId) => {
    const config = modelConfigs[modelId];
    if (!config.animation) return;

    const anim = config.animation;
    const modelState = state.models[modelId];
    if (!modelState) return;

    // Esconde o objeto apenas ANTES do início da animação
    if (elapsedTime < anim.time.start) {
      if (modelState.visible) {
        state.updateModel(modelId, { visible: false });
      }
      return; // Se não está visível, não precisa calcular interpolação
    } else {
      if (!modelState.visible) {
        state.updateModel(modelId, { visible: true });
      }
    }

    // Calcular o progresso [0 a 1] da animação
    const duration = anim.time.end - anim.time.start;
    const progress = Math.min(Math.max((elapsedTime - anim.time.start) / duration, 0), 1);

    // Função de interpolação linear (lerp)
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    const currentPos = {
      x: lerp(anim.startTransform.position.x, anim.endTransform.position.x, progress),
      y: lerp(anim.startTransform.position.y, anim.endTransform.position.y, progress),
      z: lerp(anim.startTransform.position.z, anim.endTransform.position.z, progress),
    };

    const currentScale = {
      x: lerp(anim.startTransform.scale.x, anim.endTransform.scale.x, progress),
      y: lerp(anim.startTransform.scale.y, anim.endTransform.scale.y, progress),
      z: lerp(anim.startTransform.scale.z, anim.endTransform.scale.z, progress),
    };

    // Atualiza estado (o updateSceneFromState fará a alteração no Three.js depois)
    state.updateModel(modelId, {
      position: currentPos,
      scale: currentScale
    });
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

let activeComposedGroup = null;

/**
 * Retorna a cena composta carregada para uso pelo editor
 */
export function getComposedGroup() {
  return activeComposedGroup;
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
  activeComposedGroup = null;
}

export default { loadComposedScene, updateAnimations, updateTweens, updateSceneFromState, disposeScene, getComposedGroup };

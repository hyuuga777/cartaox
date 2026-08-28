/**
 * state.js
 * Gerenciamento de estado declarativo para a experiência WebAR.
 * Centraliza o estado dos modelos, iluminação, interações e UI.
 */

const state = {
  // Estado geral do AR
  ar: {
    isTracking: false,
    trackingStartTime: null,
    activeTargetIndex: -1,
    lightingProfile: 'realista', // 'realista' ou 'estilizado'
    postprocessingEnabled: false,
    composedScene: {
      visible: false,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 }
    }
  },

  // Estado individual para cada modelo da composedScene
  models: {

    flores: {
      id: 'flores',
      path: 'assets/3d/flores.glb?v=3',
      visible: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      opacity: 1.0,
      playing: false
    },

    'mamo-letras': {
      id: 'mamo-letras',
      path: 'assets/3d/mamo-letras.glb?v=4',
      visible: true,
      position: { x: 0, y: 0.1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      opacity: 1.0,
      playing: true
    },

    gramanova: {
      id: 'gramanova',
      path: 'assets/3d/grama.glb?v=5',
      visible: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      opacity: 1.0,
      playing: true
    },
    givermy: {
      id: 'givermy',
      path: 'assets/3d/givermy.glb?v=2',
      visible: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      opacity: 1.0,
      playing: true
    },
    novacolecao: {
      id: 'novacolecao',
      path: 'assets/3d/novonovacolecao.glb?v=5',
      visible: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      opacity: 1.0,
      playing: false
    }
  },

  // Listeners de mudança de estado
  _listeners: [],

  /**
   * Registra uma função callback para ser notificada quando o estado mudar.
   * @param {Function} callback 
   */
  subscribe(callback) {
    this._listeners.push(callback);
    // Dispara o callback imediatamente com o estado atual
    callback(this);
    return () => {
      this._listeners = this._listeners.filter(l => l !== callback);
    };
  },

  /**
   * Notifica todos os inscritos sobre as alterações.
   */
  notify() {
    this._listeners.forEach(callback => callback(this));
  },

  /**
   * Atualiza o estado de um modelo específico.
   * @param {string} modelId 
   * @param {Object} properties 
   */
  updateModel(modelId, properties) {
    if (this.models[modelId]) {
      this.models[modelId] = {
        ...this.models[modelId],
        ...properties,
        // Garante que posições/escala/rotação aninhadas se fundam corretamente
        position: properties.position ? { ...this.models[modelId].position, ...properties.position } : this.models[modelId].position,
        rotation: properties.rotation ? { ...this.models[modelId].rotation, ...properties.rotation } : this.models[modelId].rotation,
        scale: properties.scale ? { ...this.models[modelId].scale, ...properties.scale } : this.models[modelId].scale
      };
      this.notify();
    }
  },

  /**
   * Atualiza o estado geral do AR.
   * @param {Object} properties 
   */
  updateAR(properties) {
    this.ar = {
      ...this.ar,
      ...properties,
      composedScene: properties.composedScene ? { ...this.ar.composedScene, ...properties.composedScene } : this.ar.composedScene
    };
    this.notify();
  }
};

window.APP_STATE = state;
export default state;

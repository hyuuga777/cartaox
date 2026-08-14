import state from './state.js';
import targetsConfig from './targets-config.js';
import lighting from './lighting.js';
import models from './models.js';

export function initEditor() {
  // Inicializa o lil-gui via CDN (injetado via import)
  import('https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm').then(({ GUI }) => {
    const gui = new GUI({ title: 'Editor AR Timeline' });
    window.EDITOR_GUI = gui;

    const targetDef = targetsConfig.targets[0];
    const composition = targetDef.composition;

    window.EDITOR_SETTINGS = {
      play: true,
      time: 0,
      gizmoMode: 'translate'
    };

    // Função helper para baixar JSON
    function downloadObjectAsJson(exportObj, exportName) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }

    // Configuração para exportar
    const obj = {
      CopiarJSON: () => {
        downloadObjectAsJson(composition, "config_completa");
      },
      SalvarInicio: () => {
        Object.keys(composition).forEach(modelId => {
          if (state.models[modelId]) {
            composition[modelId].animation.startTransform.position = { ...state.models[modelId].position };
            composition[modelId].animation.startTransform.rotation = { ...state.models[modelId].rotation };
            composition[modelId].animation.startTransform.scale = { ...state.models[modelId].scale };
          }
        });
        downloadObjectAsJson(composition, "config_INICIO");
      },
      SalvarFim: () => {
        Object.keys(composition).forEach(modelId => {
          if (state.models[modelId]) {
            composition[modelId].animation.endTransform.position = { ...state.models[modelId].position };
            composition[modelId].animation.endTransform.rotation = { ...state.models[modelId].rotation };
            composition[modelId].animation.endTransform.scale = { ...state.models[modelId].scale };
          }
        });
        downloadObjectAsJson(composition, "config_FIM");
      },
      ReiniciarAnimacao: () => {
        window.EDITOR_SETTINGS.time = 0;
        state.updateAR({ trackingStartTime: performance.now() / 1000 });
      }
    };

    const globalFolder = gui.addFolder('Controle de Animação');
    globalFolder.add(window.EDITOR_SETTINGS, 'play').name('▶️ Reproduzir (Play/Pause)').onChange((isPlaying) => {
        if (isPlaying) {
             state.updateAR({ trackingStartTime: (performance.now() / 1000) - window.EDITOR_SETTINGS.time });
        }
    });
    globalFolder.add(window.EDITOR_SETTINGS, 'time', 0, 15, 0.01).name('⏱️ Tempo (Scrubber)').listen();
    globalFolder.add(window.EDITOR_SETTINGS, 'gizmoMode', ['translate', 'rotate', 'scale']).name('🎯 Modo da Seta (Gizmo)');
    globalFolder.add(obj, 'ReiniciarAnimacao').name('🔁 Reiniciar Cena');
    globalFolder.add(obj, 'SalvarInicio').name('💾 Salvar Cena como INÍCIO');
    globalFolder.add(obj, 'SalvarFim').name('💾 Salvar Cena como FIM');
    globalFolder.add(obj, 'CopiarJSON').name('📋 Baixar Config Atual');

    // -- CONTROLE DE ILUMINAÇÃO GLOBAL --
    const lights = lighting.getLights();
    if (lights.ambientLight && lights.mainLight) {
      const luzFolder = gui.addFolder('💡 Iluminação Global');
      
      const luzConfig = {
        ambienteCor: '#' + lights.ambientLight.color.getHexString(),
        principalCor: '#' + lights.mainLight.color.getHexString()
      };

      luzFolder.addColor(luzConfig, 'ambienteCor').name('Cor Ambiente').onChange(val => {
        lights.ambientLight.color.set(val);
      });
      luzFolder.add(lights.ambientLight, 'intensity', 0, 3, 0.1).name('Força Ambiente');
      
      luzFolder.addColor(luzConfig, 'principalCor').name('Cor Sol (Sombra)').onChange(val => {
        lights.mainLight.color.set(val);
      });
      luzFolder.add(lights.mainLight, 'intensity', 0, 3, 0.1).name('Força Sol');
      luzFolder.close();
    }

    // -- ADICIONAR NOVO OBJETO --
    const addFolder = gui.addFolder('➕ Adicionar Novo Objeto');
    const addState = {
      modelOptions: 'flores.glb',
    };
    const availableModels = [
      'flores.glb',
      'givermy.glb',
      'gramanova.glb',
      'mamo-letras.glb',
      'novaCaixa.glb',
      'novacolecaofrase.glb'
    ];
    
    addFolder.add(addState, 'modelOptions', availableModels).name('Escolher Modelo');
    
    addFolder.add({
      Adicionar: () => {
        const newId = addState.modelOptions.replace('.glb', '') + '_' + Math.floor(Math.random() * 10000);
        const name = addState.modelOptions.replace('.glb', '');
        
        targetsConfig.targets[0].composition[newId] = {
          id: newId,
          name: name.charAt(0).toUpperCase() + name.slice(1) + ' (Novo)',
          material: { color: '#ffffff', metalness: 0, roughness: 1 },
          animation: {
            time: { start: 0, end: 10 },
            startTransform: { position: { x: 0, y: 0, z: -0.5 }, rotation: { x: Math.PI / 2, y: 0, z: 0 }, scale: { x: 0.1, y: 0.1, z: 0.1 } },
            endTransform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: Math.PI / 2, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } }
          }
        };
        
        state.models[newId] = {
          id: newId,
          path: 'assets/3d/' + addState.modelOptions,
          visible: true,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          opacity: 1.0,
          playing: true
        };
        
        window.dispatchEvent(new CustomEvent('reload-scene'));
      }
    }, 'Adicionar').name('✅ Inserir na Cena');
    addFolder.close();

    Object.keys(composition).forEach(modelId => {
      const config = composition[modelId];
      if (!config.animation) return;

      const folder = gui.addFolder(config.name);
      folder.domElement.dataset.modelId = modelId; // Store modelId in DOM for selection
      folder.domElement.addEventListener('click', (e) => {
        // Prevent triggering on inputs inside the folder, only trigger on the title
        if (e.target.classList.contains('title') && window.selectObjectFromMenu) {
           window.selectObjectFromMenu(modelId);
        }
      });
      folder.close(); // Começa fechado para não ocupar muito espaço
      
      const objControls = {
        Duplicar: () => {
          const newId = modelId + '_copy_' + Math.floor(Math.random() * 10000);
          
          targetsConfig.targets[0].composition[newId] = JSON.parse(JSON.stringify(config));
          targetsConfig.targets[0].composition[newId].id = newId;
          targetsConfig.targets[0].composition[newId].name = config.name + ' (Cópia)';
          
          if (targetsConfig.targets[0].composition[newId].animation) {
             targetsConfig.targets[0].composition[newId].animation.startTransform.position.x += 0.2;
             targetsConfig.targets[0].composition[newId].animation.endTransform.position.x += 0.2;
          }
          
          state.models[newId] = JSON.parse(JSON.stringify(state.models[modelId]));
          state.models[newId].position.x += 0.2;

          window.dispatchEvent(new CustomEvent('reload-scene'));
        },
        Excluir: () => {
          if (confirm(`Tem certeza que deseja excluir '${config.name}'?`)) {
            delete targetsConfig.targets[0].composition[modelId];
            delete state.models[modelId];
            window.dispatchEvent(new CustomEvent('reload-scene'));
          }
        }
      };
      
      folder.add(objControls, 'Duplicar').name('📑 Duplicar Objeto');
      folder.add(objControls, 'Excluir').name('🗑️ Excluir Objeto');

      const anim = config.animation;

      const timeFolder = folder.addFolder('⏳ Timeline (Segundos)');
      timeFolder.add(anim.time, 'start', 0, 30, 0.1).name('Start Show');
      timeFolder.add(anim.time, 'end', 0, 30, 0.1).name('End Show');

      const startFolder = folder.addFolder('▶️ Início (Start Transform)');
      startFolder.add(anim.startTransform.position, 'x', -5, 5, 0.01).name('Pos X').listen();
      startFolder.add(anim.startTransform.position, 'y', -5, 5, 0.01).name('Pos Y').listen();
      startFolder.add(anim.startTransform.position, 'z', -5, 5, 0.01).name('Pos Z').listen();
      if (!anim.startTransform.rotation) anim.startTransform.rotation = { x: 0, y: 0, z: 0 };
      startFolder.add(anim.startTransform.rotation, 'x', -Math.PI*2, Math.PI*2, 0.01).name('Rot X').listen();
      startFolder.add(anim.startTransform.rotation, 'y', -Math.PI*2, Math.PI*2, 0.01).name('Rot Y').listen();
      startFolder.add(anim.startTransform.rotation, 'z', -Math.PI*2, Math.PI*2, 0.01).name('Rot Z').listen();
      startFolder.add(anim.startTransform.scale, 'x', 0.001, 5, 0.01).name('Scale X').listen();
      startFolder.add(anim.startTransform.scale, 'y', 0.001, 5, 0.01).name('Scale Y').listen();
      startFolder.add(anim.startTransform.scale, 'z', 0.001, 5, 0.01).name('Scale Z').listen();

      const endFolder = folder.addFolder('⏹️ Fim (End Transform)');
      endFolder.add(anim.endTransform.position, 'x', -5, 5, 0.01).name('Pos X').listen();
      endFolder.add(anim.endTransform.position, 'y', -5, 5, 0.01).name('Pos Y').listen();
      endFolder.add(anim.endTransform.position, 'z', -5, 5, 0.01).name('Pos Z').listen();
      if (!anim.endTransform.rotation) anim.endTransform.rotation = { x: 0, y: 0, z: 0 };
      endFolder.add(anim.endTransform.rotation, 'x', -Math.PI*2, Math.PI*2, 0.01).name('Rot X').listen();
      endFolder.add(anim.endTransform.rotation, 'y', -Math.PI*2, Math.PI*2, 0.01).name('Rot Y').listen();
      endFolder.add(anim.endTransform.rotation, 'z', -Math.PI*2, Math.PI*2, 0.01).name('Rot Z').listen();
      endFolder.add(anim.endTransform.scale, 'x', 0.001, 5, 0.01).name('Scale X').listen();
      endFolder.add(anim.endTransform.scale, 'y', 0.001, 5, 0.01).name('Scale Y').listen();
      endFolder.add(anim.endTransform.scale, 'z', 0.001, 5, 0.01).name('Scale Z').listen();

      if (config.material) {
        const matFolder = folder.addFolder('🎨 Material / Cor');
        
        // Add Occluder Checkbox
        if (config.material.isOccluder === undefined) config.material.isOccluder = false;
        matFolder.add(config.material, 'isOccluder').name('👻 Modo Máscara (Occluder)').onChange(val => {
           const compGroup = models.getComposedGroup();
           if (compGroup) {
             const objMesh = compGroup.getObjectByName(modelId);
             if (objMesh) {
               objMesh.traverse((child) => {
                 if (child.isMesh && child.material) {
                   const mats = Array.isArray(child.material) ? child.material : [child.material];
                   mats.forEach(m => {
                     if (val) {
                       m.colorWrite = false;
                       m.depthWrite = true;
                       child.renderOrder = -1;
                     } else {
                       m.colorWrite = true;
                       child.renderOrder = 0;
                     }
                   });
                 }
               });
             }
           }
        });

        const colorPresets = {
           'Personalizado': null,
           'Branco': '#ffffff',
           'Preto': '#222222',
           'Vermelho': '#ff0000',
           'Verde': '#00ff00',
           'Azul': '#0000ff',
           'Amarelo': '#ffff00',
           'Magenta': '#ff00ff',
           'Ciano': '#00ffff'
        };
        const matControls = { Preset: 'Personalizado' };

        matFolder.add(matControls, 'Preset', Object.keys(colorPresets)).onChange(presetName => {
           const hex = colorPresets[presetName];
           if (hex) {
               config.material.color = hex;
               const compGroup = models.getComposedGroup();
               if (compGroup) {
                 const objMesh = compGroup.getObjectByName(modelId);
                  if (objMesh) {
                    objMesh.traverse((child) => {
                      if (child.isMesh && child.material) {
                        const mats = Array.isArray(child.material) ? child.material : [child.material];
                        mats.forEach(m => { if (m.color) m.color.set(hex); });
                      }
                    });
                  }
                }
            }
        });

        matFolder.addColor(config.material, 'color').name('Cor Sólida').listen().onChange(val => {
           matControls.Preset = 'Personalizado';
           const compGroup = models.getComposedGroup();
           if (compGroup) {
             const objMesh = compGroup.getObjectByName(modelId);
             if (objMesh) {
               objMesh.traverse((child) => {
                 if (child.isMesh && child.material) {
                   const mats = Array.isArray(child.material) ? child.material : [child.material];
                   mats.forEach(m => { if (m.color) m.color.set(val); });
                 }
               });
             }
           }
        });
        
        matFolder.add(config.material, 'metalness', 0, 1, 0.01).name('Metal (Reflexo)').onChange(val => {
           const compGroup = models.getComposedGroup();
           if (compGroup) {
             const objMesh = compGroup.getObjectByName(modelId);
             if (objMesh) {
               objMesh.traverse((child) => {
                 if (child.isMesh && child.material) {
                   const mats = Array.isArray(child.material) ? child.material : [child.material];
                   mats.forEach(m => { if (m.metalness !== undefined) m.metalness = val; });
                 }
               });
             }
           }
        });

        matFolder.add(config.material, 'roughness', 0, 1, 0.01).name('Rugosidade').onChange(val => {
           const compGroup = models.getComposedGroup();
           if (compGroup) {
             const objMesh = compGroup.getObjectByName(modelId);
             if (objMesh) {
               objMesh.traverse((child) => {
                 if (child.isMesh && child.material) {
                   const mats = Array.isArray(child.material) ? child.material : [child.material];
                   mats.forEach(m => { if (m.roughness !== undefined) m.roughness = val; });
                 }
               });
             }
           }
        });
      }
    });

    window.highlightEditorFolder = (modelId, forceOpen = false) => {
      const folders = document.querySelectorAll('.lil-gui .folder');
      folders.forEach(f => {
        if (f.dataset.modelId === modelId) {
          f.classList.add('neon-highlight');
          if (forceOpen) {
            const guiFolder = gui.folders.find(gf => gf.title === targetsConfig.targets[0].composition[modelId]?.name);
            if (guiFolder) guiFolder.open();
          }
        } else {
          f.classList.remove('neon-highlight');
        }
      });
    };
  });
}

export default { initEditor };

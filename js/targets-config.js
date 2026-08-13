/**
 * targets.js
 * Configuração dos alvos e metadados de inicialização dos modelos 3D.
 */

const targetsConfig = {
  // Arquivo .mind compilado contendo o target
  mindSrc: 'targets.mind',
  
  // Lista de alvos suportados (no nosso caso, apenas 1 alvo no índice 0)
  targets: [
    {
      index: 0,
      name: 'Mamo QR Code',
      // Definições iniciais específicas para compor a cena sobre este alvo.
      // O MindAR cria o grupo do âncora com largura 1.0 (X de -0.5 a 0.5).
      composition: {
        novaCaixa: {
          id: "novaCaixa",
          name: "Caixa / Base",
          material: {
            color: "#ffffff",
            metalness: 0,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 0,
              end: 10
            },
            startTransform: {
              position: { x: 0, y: -0.0697, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.95, y: 0.95, z: 0.95 }
            },
            endTransform: {
              position: { x: 0, y: -0.0697, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.95, y: 0.95, z: 0.95 }
            }
          }
        },
        flores: {
          id: "flores",
          name: "Flores Decorativas",
          material: {
            color: "#ffffff",
            metalness: 0,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 1,
              end: 10
            },
            startTransform: {
              position: { x: -0.0671, y: -0.14503356547890012, z: 0.07453539513636595 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1.08, y: 0.001, z: 1.139999 }
            },
            endTransform: {
              position: { x: -0.0671, y: -0.14503356547890012, z: 0.07453539513636595 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1.08, y: 1.41, z: 1.139999 }
            }
          }
        },
        'mamo-letras': {
          id: "mamo-letras",
          name: "Letras Mamo",
          material: {
            color: "#ffffff",
            metalness: 0,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 2.5,
              end: 10
            },
            startTransform: {
              position: { x: 0.485474, y: -0.02914, z: -0.10465 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.051, y: 0.051, z: 0.051 }
            },
            endTransform: {
              position: { x: 0.434506037639665, y: 1.808443242078389, z: 0.08452585988138796 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.52, y: 0.52, z: 0.49 }
            }
          }
        },
        gramanova: {
          id: "gramanova",
          name: "Grama Nova",
          material: {
            color: "#ffffff",
            metalness: 0,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 0,
              end: 10
            },
            startTransform: {
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 }
            },
            endTransform: {
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 }
            }
          }
        },
        novacolecaofrase: {
          id: "novacolecaofrase",
          name: "Nova Frase (24/08)",
          material: {
            color: "#ffffff",
            metalness: 0,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 3.5,
              end: 10
            },
            startTransform: {
              position: { x: -0.07925, y: -0.06426, z: 0.1 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.099999, y: 0.099999, z: 0.099999 }
            },
            endTransform: {
              position: { x: -0.10854677273863106, y: 1.1000185047652504, z: 0.1 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.3, y: 0.3, z: 0.5 }
            }
          }
        },
        givermy: {
          id: "givermy",
          name: "Letras Givermy (Novo)",
          material: {
            color: "#ffffff",
            metalness: 0,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 4,
              end: 10
            },
            startTransform: {
              position: { x: -0.05397, y: 0.068617, z: 0.1 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.049998, y: 0.049998, z: 0.049998 }
            },
            endTransform: {
              position: { x: -1.0446976467483295, y: 1.5438819548787095, z: 0.1 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: { x: 0.59, y: 0.59, z: 0.66 }
            }
          }
        }
      }
    }
  ]
};

// Exporta a configuração para uso nos outros módulos
export default targetsConfig;
export { targetsConfig };

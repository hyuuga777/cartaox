/**
 * targets.js
 * Configuração dos alvos e metadados de inicialização dos modelos 3D.
 */

const targetsConfig = {
  // Arquivo .mind compilado contendo o target
  mindSrc: 'targets.mind?v=11',
  
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
            color: "#4CAF50",
            metalness: 0.25,
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
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 0.95, y: 0.95, z: 0.95 }
            },
            endTransform: {
              position: { x: 0, y: -0.0697, z: 0 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
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
            roughness: 0,
            isOccluder: false
          },
          animation: {
            time: {
              start: 1,
              end: 10
            },
            startTransform: {
              position: { x: -0.0671, y: -0.14503356547890012, z: 0.07453539513636595 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 1.08, y: 0.001, z: 1.139999 }
            },
            endTransform: {
              position: { x: -0.0671, y: -0.14503356547890012, z: 0.07453539513636595 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 1.08, y: 1.41, z: 1.139999 }
            }
          }
        },
        'mamo-letras': {
          id: "mamo-letras",
          name: "Letras Mamo",
          material: {
            color: "#ffffff",
            metalness: 0.29,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 2.5,
              end: 10
            },
            startTransform: {
              position: { x: 0.434506037639665, y: 1.764089081342429, z: 0.08452585988138796 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 0.001, y: 0.001, z: 0.001 }
            },
            endTransform: {
              position: { x: 0.434506037639665, y: 1.764089081342429, z: 0.08452585988138796 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 0.52, y: 0.52, z: 0.49 }
            }
          }
        },
        gramanova: {
          id: "gramanova",
          name: "Grama Nova",
          material: {
            color: "#ffffff",
            metalness: 1,
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
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 1 }
            },
            endTransform: {
              position: { x: 0, y: 0, z: 0 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 1, y: 1, z: 0.9299999999999999 }
            }
          }
        },
        novacolecaofrase: {
          id: "novacolecaofrase",
          name: "Nova Frase (24/08)",
          material: {
            color: "#ffffff",
            metalness: 0.23,
            roughness: 1,
            isOccluder: false
          },
          animation: {
            time: {
              start: 1.5,
              end: 10
            },
            startTransform: {
              position: { x: -0.10854677273863106, y: 1.1000185047652504, z: 0.1 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 0.001, y: 0.001, z: 0.001 }
            },
            endTransform: {
              position: { x: -0.10854677273863106, y: 1.1000185047652504, z: 0.1 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 0.34999999999999964, y: 0.34999999999999964, z: 0.34999999999999964 }
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
              position: { x: -1.0446976467483295, y: 1.5438819548787095, z: 0.1 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
              scale: { x: 0.001, y: 0.001, z: 0.001 }
            },
            endTransform: {
              position: { x: -1.0446976467483295, y: 1.5438819548787095, z: 0.1 },
              rotation: { x: -1.5707963267948966, y: 0, z: 0 },
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

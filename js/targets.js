/**
 * targets.js
 * Configuração dos alvos e metadados de inicialização dos modelos 3D.
 */

const targetsConfig = {
  // Arquivo .mind compilado contendo o target
  mindSrc: 'assets/targets/qrcode.mind',
  
  // Lista de alvos suportados (no nosso caso, apenas 1 alvo no índice 0)
  targets: [
    {
      index: 0,
      name: 'Mamo QR Code',
      // Definições iniciais específicas para compor a cena sobre este alvo.
      // O MindAR cria o grupo do âncora com largura 1.0 (X de -0.5 a 0.5).
      composition: {
        grama: {
          id: 'grama',
          name: 'Base de Grama',
          // O chão/base da nossa cena
          initialTransform: {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 }, // Deita a grama paralela ao alvo
            scale: { x: 0.8, y: 0.8, z: 0.8 }
          }
        },
        flores: {
          id: 'flores',
          name: 'Flores Decorativas',
          // Elemento decorativo ao redor
          initialTransform: {
            position: { x: 0, y: 0, z: 0.02 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            scale: { x: 0.8, y: 0.8, z: 0.8 }
          }
        },
        'givemy-letras': {
          id: 'givemy-letras',
          name: 'Letras Givemy',
          // Texto Givemy posicionado perto do centro, em pé sobre o chão
          initialTransform: {
            position: { x: 0, y: 0, z: 0.05 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            scale: { x: 0.7, y: 0.7, z: 0.7 }
          }
        },
        'mamo-letras': {
          id: 'mamo-letras',
          name: 'Letras Mamo',
          // Texto Mamo posicionado centralizado, em pé
          initialTransform: {
            position: { x: 0, y: 0.1, z: 0.05 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            scale: { x: 0.7, y: 0.7, z: 0.7 }
          }
        }
      }
    }
  ]
};

// Exporta a configuração para uso nos outros módulos
export default targetsConfig;
export { targetsConfig };

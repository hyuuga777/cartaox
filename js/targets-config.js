/**
 * targets.js
 * Configuração dos alvos e metadados de inicialização dos modelos 3D.
 */

const targetsConfig = {
  // Arquivo .mind compilado contendo o target
  mindSrc: 'targets_v5.mind',
  
  // Lista de alvos suportados (no nosso caso, apenas 1 alvo no índice 0)
  targets: [
    {
      index: 0,
      name: 'Mamo QR Code',
      // Definições iniciais específicas para compor a cena sobre este alvo.
      // O MindAR cria o grupo do âncora com largura 1.0 (X de -0.5 a 0.5).
      composition: {

  "flores": {
    "id": "flores",
    "name": "Flores Decorativas",
    "material": {
      "color": "#ffffff",
      "metalness": 0,
      "roughness": 0,
      "isOccluder": false
    },
    "animation": {
      "time": {
        "start": 0,
        "end": 10.9
      },
      "startTransform": {
        "position": {
          "x": -0.0671,
          "y": -1.24,
          "z": 0.07453539513636595
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.5,
          "y": 0.5,
          "z": 0.5
        }
      },
      "endTransform": {
        "position": {
          "x": -0.0671,
          "y": -0.14503356547890012,
          "z": 0.07453539513636595
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1.08,
          "y": 1.41,
          "z": 1.139999
        }
      }
    }
  },
  "mamo-letras": {
    "id": "mamo-letras",
    "name": "Letras Mamo",
    "material": {
      "color": "#ffffff",
      "metalness": 0.29,
      "roughness": 1,
      "isOccluder": false
    },
    "animation": {
      "time": {
        "start": 0,
        "end": 10
      },
      "startTransform": {
        "position": {
          "x": 0.02198137289333474,
          "y": -1.38,
          "z": 0.084525
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.45,
          "y": 0.45,
          "z": 0.45
        }
      },
      "endTransform": {
        "position": {
          "x": 0.02198137289333474,
          "y": 2.004741,
          "z": 0.084525
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.45,
          "y": 0.45,
          "z": 0.45
        }
      }
    }
  },
  "gramanova": {
    "id": "gramanova",
    "name": "Grama Nova",
    "material": {
      "color": "#ffffff",
      "metalness": 0.7,
      "roughness": 0.51,
      "isOccluder": false
    },
    "animation": {
      "time": {
        "start": 0,
        "end": 10
      },
      "startTransform": {
        "position": {
          "x": 0,
          "y": -0.29,
          "z": 0
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 0.9299999999999999
        }
      },
      "endTransform": {
        "position": {
          "x": 0,
          "y": -0.28617,
          "z": 0
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 1,
          "y": 1,
          "z": 0.9299999999999999
        }
      }
    }
  },
  "givermy": {
    "id": "givermy",
    "name": "Letras Givermy (Novo)",
    "material": {
      "color": "#ffffff",
      "metalness": 0,
      "roughness": 1,
      "isOccluder": false
    },
    "animation": {
      "time": {
        "start": 0,
        "end": 10
      },
      "startTransform": {
        "position": {
          "x": -0.8143333860887723,
          "y": -1.24,
          "z": 0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.42,
          "y": 0.42,
          "z": 0.42
        }
      },
      "endTransform": {
        "position": {
          "x": -0.8143333860887723,
          "y": 1.762407,
          "z": 0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.42,
          "y": 0.42,
          "z": 0.42
        }
      }
    }
  },
  "novacolecao": {
    "id": "novacolecao",
    "name": "Letras Nova Coleção",
    "material": {
      "color": "#ffffff",
      "metalness": 0,
      "roughness": 1,
      "isOccluder": false
    },
    "animation": {
      "time": {
        "start": 0,
        "end": 10
      },
      "startTransform": {
        "position": {
          "x": -0.3,
          "y": -1.11,
          "z": 0
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.19,
          "y": 0.19,
          "z": 0.19
        }
      },
      "endTransform": {
        "position": {
          "x": -0.67227,
          "y": 0.562450,
          "z": -0.30262
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.39,
          "y": 0.39,
          "z": 0.39
        }
      }
    }
  },

  "grama_occluder": {
      "id": "grama_occluder",
      "name": "Grama Occluder",
      "material": {
        "color": "#222222",
        "metalness": 1,
        "roughness": 1,
        "isOccluder": true
      },
      "animation": {
        "time": {
          "start": 0,
          "end": 10
        },
        "startTransform": {
          "position": {
            "x": 0.03,
            "y": -0.16,
            "z": -0.12
          },
          "rotation": {
            "x": 1.570796,
            "y": 2,
            "z": 0
          },
          "scale": {
            "x": 2.2,
            "y": 0.1,
            "z": 2.34
          }
        },
        "endTransform": {
          "position": {
            "x": 0.028045,
            "y": -0.16,
            "z": -0.12314
          },
          "rotation": {
            "x": 2,
            "y": 0,
            "z": 0
          },
          "scale": {
            "x": 2.2,
            "y": 0.001,
            "z": 2.34
          }
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

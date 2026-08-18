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
  "novaCaixa": {
    "id": "novaCaixa",
    "name": "Caixa / Base",
    "material": {
      "color": "#208e24",
      "metalness": 1,
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
          "x": 0,
          "y": -0.0697,
          "z": 0
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.95,
          "y": 0.95,
          "z": 0.95
        }
      },
      "endTransform": {
        "position": {
          "x": 0,
          "y": -0.0697,
          "z": 0
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.95,
          "y": 0.95,
          "z": 0.95
        }
      }
    }
  },
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
        "start": 1,
        "end": 10
      },
      "startTransform": {
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
        "start": 2.5,
        "end": 10
      },
      "startTransform": {
        "position": {
          "x": 0.16,
          "y": 1.55,
          "z": 0.08
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
          "x": 0.160534,
          "y": 1.552931,
          "z": 0.084525
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
      }
    }
  },
  "gramanova": {
    "id": "gramanova",
    "name": "Grama Nova",
    "material": {
      "color": "#ffffff",
      "metalness": 1,
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
          "x": 0,
          "y": 0,
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
          "y": 0,
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
        "start": 4,
        "end": 10
      },
      "startTransform": {
        "position": {
          "x": -0.84,
          "y": 1.3,
          "z": 0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.47,
          "y": 0.47,
          "z": 0.47
        }
      },
      "endTransform": {
        "position": {
          "x": -0.84291,
          "y": 1.295377,
          "z": 0.1
        },
        "rotation": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "scale": {
          "x": 0.47,
          "y": 0.47,
          "z": 0.47
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
        "start": 4,
        "end": 10
      },
      "startTransform": {
        "position": { "x": 0, "y": 1, "z": 0.1 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 0.5, "y": 0.5, "z": 0.5 }
      },
      "endTransform": {
        "position": { "x": 0, "y": 1, "z": 0.1 },
        "rotation": { "x": 0, "y": 0, "z": 0 },
        "scale": { "x": 0.5, "y": 0.5, "z": 0.5 }
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

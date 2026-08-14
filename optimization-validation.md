# Validação da otimização dos modelos GLB

Data: 2026-08-14

## Resultado

Os três modelos foram lidos com sucesso pelo GLTF Transform e pelo decoder Draco. O Modo PC local carregou todos os modelos e registrou `Todos os modelos GLB foram carregados com sucesso!` no console.

| Modelo | Original | Otimizado | Redução | Draco |
|---|---:|---:|---:|---|
| `flores.glb` | 37,372,216 bytes | 12,693,456 bytes | 66.0% | Sim |
| `gramanova.glb` | 48,226,600 bytes | 4,026,692 bytes | 91.7% | Sim |
| `novacolecaofrase.glb` | 4,262,888 bytes | 334,224 bytes | 92.2% | Sim |

O código usa `DRACOLoader` com o decoder oficial do Google, e `state.js` usa `?v=3` nos três caminhos para invalidar os arquivos antigos. A página foi versionada para `app.js?v=9` e `sw-v16.js`.

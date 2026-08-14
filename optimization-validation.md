# Validação da otimização dos modelos GLB

Data: 2026-08-14

## Resultado atual

Os três modelos foram gerados novamente com compressão Draco aplicada somente à geometria. Assim, as texturas originais JPEG foram mantidas, evitando a alteração de cor provocada pela conversão WebP com perdas.

| Modelo | Original | Draco-only atual | Redução | Texturas |
|---|---:|---:|---:|---|
| `flores.glb` | 37,372,216 bytes | 35,373,372 bytes | 5.3% | JPEG original preservada |
| `gramanova.glb` | 48,226,600 bytes | 4,324,228 bytes | 91.0% | JPEG original preservada |
| `novacolecaofrase.glb` | 4,262,888 bytes | 303,436 bytes | 92.9% | JPEG original preservada |
| **Total** | **89,861,704 bytes** | **40,001,036 bytes** | **55.5%** | **Sem conversão cromática** |

O `flores.glb` continua sendo o arquivo dominante porque suas texturas originais são grandes. A troca foi intencional: prioriza preservar a aparência original em vez de obter a redução máxima usando WebP com perdas.

## Correções aplicadas

O `GLTFLoader` usa `DRACOLoader` com o decoder oficial do Google. O gerenciamento de cor foi corrigido para aplicar `THREE.sRGBEncoding` somente à textura de cor (`mat.map`), e não ao material (`mat.encoding`). As texturas técnicas não são alteradas.

A aplicação agora mostra uma orientação durante o download, uma barra com percentual de 0% a 100% e o volume transferido. Quando o servidor fornece `Content-Length`, o percentual é calculado por bytes reais; caso contrário, a interface usa a quantidade de modelos concluídos.

A página foi versionada para `app.js?v=10`, `css/app.css?v=1.3` e `sw-v17.js`. O Dockerfile passou a publicar o Service Worker v17. O Nginx foi configurado para comprimir HTML, CSS, JavaScript e JSON, sem tentar comprimir GLB.

## Validação local

O Modo PC local carregou todos os modelos e exibiu `40.2 MB de 40.2 MB` e `100%`. O console registrou somente o cadastro do Service Worker, o início do carregamento e `Todos os modelos GLB foram carregados com sucesso!`, sem erros de GLB, Draco ou JavaScript.

A interface também exibiu a orientação `Aponte o celular para uma boa iluminação. A câmera abrirá antes dos modelos terminarem de baixar.` enquanto os modelos eram baixados.


## Assets e Basic

A documentação oficial usa o conteúdo diretamente como filho do elemento/anchor do target. O exemplo Basic mantém `a-camera` em `position="0 0 0"`, desativa `look-controls`, adiciona o `a-gltf-model` dentro do target e aplica apenas transformações locais do modelo. A página de Assets informa que o modelo de exemplo foi normalizado para aproximadamente -1 a 1 e por isso recebe uma escala específica; a animação demonstrada altera apenas a posição local do modelo.

A documentação também reforça que o engine atualiza visibilidade e pose do entity/anchor; o conteúdo anexado a ele acompanha essa pose. Portanto, a implementação não deve tentar reposicionar o anchor, a câmera ou a cena rastreada em cada frame. O alvo é centralizado na origem local, e os offsets de modelos devem ser aplicados somente nos filhos.

Referências:
- https://hiukim.github.io/mind-ar-js-doc/quick-start/assets
- https://hiukim.github.io/mind-ar-js-doc/examples/basic

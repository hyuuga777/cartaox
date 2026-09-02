# Constatações da documentação MindAR

Data da análise: 2026-09-02.

1. A página `installation-v1-1-x` é explicitamente antiga para MindAR v1.1.x. A partir da v1.2.0 o MindAR migrou para ES Modules, alinhado ao Three.js r137+.
2. O quick start oficial mostra a cena 3D adicionada a um alvo (`mindar-image-target` no A-Frame) e o objeto com transformações locais simples sobre o alvo. O fluxo esperado é iniciar câmera, detectar target e renderizar a cena vinculada ao anchor.
3. A página de exemplos recomenda consultar os exemplos em ordem: Minimal, Basic, Multiple Targets/Tracks, Custom UI, Events Handling e Interactive. Os exemplos de eventos e configuração de tracking são os mais relevantes para estabilidade e lifecycle.
4. O projeto usa `MindARThree` via ES Module, portanto a referência correta é a documentação atual, não o guia v1.1.x.

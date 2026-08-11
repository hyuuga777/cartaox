# Sobre a Experiência: Mamo AR

Bem-vindo(a) à documentação da **Mamo AR Experience**, um projeto interativo de Realidade Aumentada para a web (WebAR). Este documento detalha como a experiência funciona, as tecnologias envolvidas e o que o usuário vivencia ao utilizá-la.

## 🎯 O Objetivo
Criar uma experiência mágica e instantânea no navegador do usuário, sem a necessidade de baixar aplicativos na App Store ou Google Play. Ao escanear um QR Code impresso (ou exibido em tela), o mundo físico ganha vida com uma composição 3D animada e interativa da marca Mamo.

---

## 🛠️ Stack Tecnológico
O projeto foi construído pensando em performance, compatibilidade mobile e código limpo, abandonando frameworks pesados em favor de bibliotecas nativas:

- **MindAR (Image Tracking)**: Motor de rastreamento de imagem extremamente leve que processa a câmera do dispositivo em tempo real para ancorar objetos no mundo físico.
- **Three.js (R128)**: A principal biblioteca 3D da web, responsável pela renderização dos modelos GLB, sombras, luzes e o loop de animação.
- **Vanilla JavaScript (ES6)**: Lógica de estado modular e reativa, dividida em módulos focados (`app.js`, `models.js`, `interactions.js`, etc).
- **PWA (Progressive Web App)**: Possui um *Service Worker* (`sw.js`) embutido. Isso significa que, uma vez carregado, o navegador faz cache dos modelos 3D pesados, permitindo que a experiência abra instantaneamente (ou até offline) nas próximas vezes.

---

## 🎭 A Composição da Cena 3D
A experiência não exibe apenas um modelo estático, mas sim uma **Cena Composta** montada dinamicamente a partir de 4 arquivos `.glb` separados que se integram de forma harmoniosa:

1. **A Base (`grama.glb`)**: Serve como o "chão" ou o alicerce do ecossistema onde tudo é ancorado.
2. **Os Textos (`mamo-letras.glb` e `givemy-letras.glb`)**: As letras da marca que flutuam ou se acomodam no centro do arranjo.
3. **O Entorno (`flores.glb`)**: Elementos de natureza espalhados ao redor da base para trazer cor e vida à marca.

Toda a iluminação usa um mapeamento de tons (*ACESFilmicToneMapping*) com sombras dinâmicas projetadas em tempo real pelo motor do Three.js.

---

## 👆 Interatividade Touch
Diferente de ARs estáticos, o Mamo AR reage ao toque do usuário através de um sistema de "Raycasting" (uma linha virtual desenhada do dedo do usuário até o mundo 3D):

- **Toque nas Letras**: Tocar nos modelos de texto (Mamo ou Givemy) faz com que as suas animações internas parem ou voltem a rodar.
- **Toque nas Flores**: Tocar nos modelos florais engatilha uma reação divertida, fazendo com que elas girem ou mudem de escala dinamicamente.

---

## 📱 Fluxo de Navegação do Usuário

1. **Tela de Splash e Permissão**: O usuário acessa o link e se depara com uma tela de carregamento elegante e um botão "Iniciar Experiência AR". Clicar neste botão é essencial para liberar o pop-up de permissão de câmera no iOS/Android.
2. **Scanner HUD**: Com a câmera aberta, surge um alvo na tela pedindo para o usuário "Apontar para o QR Code".
3. **Tracking (Rastreamento)**: Assim que a câmera reconhece o padrão único do QR Code, o motor de AR crava a âncora 3D nele.
4. **O Show**: A cena composta (grama, letras e flores) surge exatamente em cima da imagem física, e o usuário pode rotacionar o celular, se aproximar ou se afastar para explorar cada detalhe em 360 graus.

---

## 🔒 Requisito Crítico: HTTPS
Por utilizar a API `getUserMedia` para ler o vídeo ao vivo, o projeto **exige** estar hospedado sob um protocolo seguro (`https://`). Durante o desenvolvimento, são usados túneis como o *Localtunnel* ou *Cloudflare* para simular esse ambiente seguro de forma local.

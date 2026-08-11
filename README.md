# Mamo AR Experience

Experiência de Realidade Aumentada Web (WebAR) robusta e modular baseada no **MindAR** (API pura do Three.js) e **Three.js** (R128). 

Toda a lógica tridimensional é orientada a estado de forma declarativa, sem o uso de A-Frame.

## 📂 Estrutura do Projeto

```text
ar-mamo/
├── index.html          ← Ponto de entrada (carrega CDN e inicia PWA)
├── manifest.json       ← Configurações PWA (Instalável na Home Screen)
├── sw.js               ← Service Worker (Cache local offline para modelos GLB grandes)
├── css/
│   └── app.css         ← Interface escura touch-first
├── js/
│   ├── app.js          ← Setup do Renderer, Scene, Camera e Loop de Animação
│   ├── state.js        ← Gerenciador de Estado Reativo (Posições, escalas, rotações dos modelos)
│   ├── targets.js      ← Definições iniciais e coordenadas dos modelos sobre o alvo
│   ├── models.js       ← Carregamento assíncrono dos modelos e mixers de animação
│   ├── lighting.js     ← Rigs de iluminação (Perfis Realista e Estilizado)
│   └── interactions.js ← Raycasting para detectar toques nos modelos
├── assets/
│   ├── 3d/             ← Seus modelos GLB originais
│   │   ├── flores.glb
│   │   ├── givemy-letras.glb
│   │   ├── grama.glb
│   │   └── mamo-letras.glb
│   ├── targets/
│   │   └── qrcode.mind ← Arquivo compilado do seu QR Code (Target 0)
│   └── images/
│       └── qrcode.png  ← Imagem original do QR Code
└── README.md
```

## 🚀 Como Fazer o Deploy (Hospedagem Compartilhada)

Como este projeto utiliza apenas arquivos estáticos (HTML, CSS, JS e GLB), você pode hospedá-lo em qualquer servidor web com HTTPS.

1. Conecte-se ao gerenciador de arquivos da sua hospedagem compartilhada (cPanel, FTP, SFTP ou similar).
2. Copie **todos** os arquivos da pasta do projeto (`ar-mamo`) para a sua pasta pública (geralmente `public_html` ou `www`).
3. Certifique-se de que a estrutura de pastas foi mantida idêntica (por exemplo, as pastas `js`, `css`, `assets` devem estar no mesmo nível que `index.html`).
4. Acesse o seu domínio seguro via HTTPS (exemplo: `https://seusite.com.br/ar-mamo/` ou similar).

---

## 📱 Como Testar no Smartphone

1. Abra o link **HTTPS** seguro do seu domínio no navegador do celular (Chrome no Android, Safari no iOS).
2. **Importante**: Conceda a permissão de acesso à câmera quando o prompt aparecer.
3. Aponte a câmera traseira do celular para a imagem `assets/images/qrcode.png` (impressa ou exibida em uma tela).
4. **Composição da Cena**:
   * O aplicativo carregará os 4 modelos GLB em paralelo com uma tela de progresso.
   * Assim que o QR Code for detectado, o HUD de scan sumirá e a **cena composta** será exibida em bloco:
     * A base de grama (`grama.glb`) como chão.
     * Os textos `mamo-letras.glb` e `givemy-letras.glb` centralizados sobre a grama.
     * As flores (`flores.glb`) ao redor.
5. **Interatividade (Toques)**:
   * Toque em **Mamo** ou **Givemy** para pausar/retomar as animações das letras.
   * Toque nas **Flores** para rotacioná-las ou alterar a escala delas.

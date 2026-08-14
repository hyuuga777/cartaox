FROM nginx:1.27-alpine

# Estrutura do site estático
RUN mkdir -p /usr/share/nginx/html/assets/3d /usr/share/nginx/html/assets/images

# Arquivos principais da experiência
COPY index.html manifest.json targets.mind sw.js sw-v17.js /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY assets/images /usr/share/nginx/html/assets/images

# Apenas os modelos usados pela cena atual
COPY assets/3d/novaCaixa.glb /usr/share/nginx/html/assets/3d/novaCaixa.glb
COPY assets/3d/flores.glb /usr/share/nginx/html/assets/3d/flores.glb
COPY assets/3d/mamo-letras.glb /usr/share/nginx/html/assets/3d/mamo-letras.glb
COPY assets/3d/gramanova.glb /usr/share/nginx/html/assets/3d/gramanova.glb
COPY assets/3d/novacolecaofrase.glb /usr/share/nginx/html/assets/3d/novacolecaofrase.glb
COPY assets/3d/givermy.glb /usr/share/nginx/html/assets/3d/givermy.glb

EXPOSE 80

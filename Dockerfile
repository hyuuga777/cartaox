FROM nginx:1.27-alpine

# Estrutura do site estático
RUN mkdir -p /usr/share/nginx/html/assets/3d /usr/share/nginx/html/assets/images

# Arquivos principais da experiência
COPY index.html manifest.json targets.mind sw.js sw-v15.js /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY assets/images /usr/share/nginx/html/assets/images

# Copia todos os modelos permitidos pelo .dockerignore
COPY assets/3d /usr/share/nginx/html/assets/3d
EXPOSE 80

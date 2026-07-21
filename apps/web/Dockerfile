# Simple static site served by Nginx
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY ./index.html ./styles.css ./default.conf.template ./
RUN apk add --no-cache gettext
EXPOSE 8080
CMD ["/bin/sh","-c","envsubst '${PORT:-8080}' < /usr/share/nginx/html/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'" ]

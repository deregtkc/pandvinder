# Statische site via nginx als niet-root gebruiker op poort 8080
FROM nginxinc/nginx-unprivileged:1.29-alpine
COPY . /usr/share/nginx/html
EXPOSE 8080

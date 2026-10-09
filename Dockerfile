# Statische site via nginx als niet-root gebruiker op poort 8080
FROM nginxinc/nginx-unprivileged:1.29-alpine
ARG DEV_RELOAD=0
COPY . /usr/share/nginx/html
USER root
RUN if [ "$DEV_RELOAD" = "1" ]; then \
      cd /usr/share/nginx/html && \
      STAMP=$(date +%s) && \
      echo "$STAMP" > dev-stamp.txt && \
      sed "s#</body>#<script>window.DEV_STAMP=\"$STAMP\"</script><script src=\"dev-reload.js\"></script></body>#" index.html > index.new && \
      mv index.new index.html; \
    else \
      rm -f /usr/share/nginx/html/dev-reload.js; \
    fi
USER nginx
EXPOSE 8080

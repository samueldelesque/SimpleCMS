SimpleCMS
=========

a simple folder based CMS built in Node.JS


## NGinx Template ##

server {
        listen 80;
        server_name samueldelesque.com;
        access_log /var/log/nginx/samueldelesque.com.log;

        location / {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header Host $http_host;
                proxy_set_header X-NginX-Proxy true;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_pass http://0.0.0.0:1801/;
                proxy_redirect off;
                proxy_http_version 1.1;
        }
}

server {
        listen 80;
        server_name cdn.samueldelesque.com;
        access_log /var/log/nginx/samueldelesque.com.log;

        location / {
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header X-Forwarded-Proto $scheme;
                proxy_set_header Host $http_host;
                proxy_set_header X-NginX-Proxy true;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection "upgrade";
                proxy_pass http://samueldelesque.com:1802/;
                proxy_redirect off;
                proxy_http_version 1.1;
        }
}
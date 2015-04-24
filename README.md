Mạng xã hội hỏi đáp
Demo: https://azquestion.com

Lưu ý khi đưa file lên server:
- Sửa cấu hình auth qua mạng xã hội config/auth.js
- Sửa file gửi đường dẫn kích hoạt tài khoản app/routes/login.js


Cấu hình:
```

bower install --allow-root
```
* Setup Nginx
```
server {
    listen 80;
    server_name azquestion.com;
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_post;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://128.199.130.111:3000;
        proxy_redirect off;

        # Socket.IO Support
        #proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
server {
        listen 80;
        server_name www.azquestion.com;
        # $scheme will get the http protocol
        # and 301 is best practice for tablet, phone, desktop and seo
        return 301 $scheme://azquestion.com$request_uri;
}
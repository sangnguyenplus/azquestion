Demo ứng dụng : <http://azquestion.com>

Admin: minhsang2603@gmail.com - 159357

User: sangit7b@gmail.com - 123456789

Ứng dụng sẽ có các chức năng cơ bản của 1 website hỏi đáp như đăng ký/đăng nhập (hỗ trợ đăng nhập qua facebook, google), đăng câu hỏi, trả lời, vote, follow câu hỏi. Ngoài ra còn hỗ trợ gửi thông báo thời gian thực (realtime) và chat giữa các thành viên thông qua việc sử dụng SocketIO. Một số tính năng khác bạn có thể tìm hiểu qua demo azquestion.com. Mình cài đặt trên VPS của DigitalOcean và chắc do cấu hình sai nên SocketIO không hoạt động, dẫn đến 1 số chức năng không hoạt động.

Nếu bạn là người đam mê hoặc muốn tìm hiểu về MEAN Stack, hãy cài đặt mã nguồn này để tham khảo. Lúc đầu nghiên cứu về nó, mình đã mất khá nhiều thời gian để định hình cách hoạt động và cách phân chia thư mục. Đã phải học từ rất nhiều tuts của nước ngoài. Vì vậy mình share mã nguồn này, hi vọng sẽ giúp các bạn nào mới nghiên cứu có thể tiếp cận 1 cách nhanh hơn.


Để chạy ứng dụng máy tính bạn cần cài đặt NodeJs. Sau khi cài đặt xong NodeJs, bạn cd vào thư mục chứa source code và chạy lệnh để cài đặt bower, chúng ta sẽ dùng bower để tải các thư viện cần thiết về.

```

npm install -g bower

```
Tiếp theo chúng ta sẽ tiến hành tải các gói thư viện của NodeJs thông qua Npm bằng lệnh:

```

npm install

```
*Lưu ý: Lệnh cài đặt này sẽ bao gồm bower install, tuy nhiên một số trường hợp có thể lỗi, bạn kiểm tra thư mục public/libs xem đã có các thư viện js, css chưa sau khi chạy lệnh này, nếu chưa có hãy chạy tiếp lệnh "bower install" nhé.*

Tiếp theo, hãy cài đặt MongoDB nếu bạn chưa cài. Nếu chưa biết cách cài đặt, hãy xem Manual của Mongo nhé.

Sau khi cài đặt xong MongoDB, hãy cd vào thư mục db trong ứng dụng và chạy lệnh:

```

mongorestore

```
để import database cho ứng dụng.

Chạy `node server` để chạy ứng dụng và truy cập vào `http://localhost:3000` xem kết quả nhé.

Mặc định website sẽ chạy trên cổng 3000, nếu bạn sửa cổng này thì hãy lưu ý tới file `config/auth.js`, bạn cần sửa lại port ở config này cho phù hợp.

Nếu bạn muốn cài đặt source lên VPS hay server nào đó hỗ trợ NodeJs thì các bước làm tương tự. Cần cài đặt thêm foreverjs để ứng dụng chạy liên tục. Cài đặt thêm Nginx để loại bỏ cổng 3000 khỏi đường dẫn chính. Bạn có thể sử dụng đoạn config này cho Nginx:

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
```

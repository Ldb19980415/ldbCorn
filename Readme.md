
Run a migration to create your database tables with Prisma Migrate:

    npx prisma migrate dev --name init


linux启动时候，如果用ts-node 命令，窗口会卡住，换成后台执行命令
   nohup npm start >> output.txt 2>&1 &

    解释：   > 将标准输出重定向到 output.txt。
            2>&1 将标准错误输出重定向到标准输出，因此所有的日志（包括错误日志）都会被写入到 output.txt。 

如何查到进程并kill
    查找进行pid：  ps -aux | grep npm                目前是在172.16.10.102服务器上启动的  4084083
    kill进程： kill pid    或者 kill -9 pid  强制kill进程



大问题，退出终端，进程也停掉了。改用docker启动

docker build -t ldb-corn-app .

docker run -d --name ldb-corn-app-container -v /root/ldbCorn/prisma/dev.db:/app/prisma/dev.db -v /root/ldbCorn/output.txt:/app/output.txt  ldb-corn-app


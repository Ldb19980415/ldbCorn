# 使用指定版本的 Node.js
FROM node:21.7.3

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
# COPY package*.json ./

RUN npm config set registry https://registry.npmmirror.com/


# 复制所有项目文件到容器中
COPY . .


# 安装依赖
RUN npm install

# 曝露应用程序运行的端口（根据需要设置端口号）
# EXPOSE 3000  # 如果你的应用使用某个特定端口，请取消注释

# 启动应用
CMD ["/bin/sh", "-c", "npm start >> output.txt 2>&1"]

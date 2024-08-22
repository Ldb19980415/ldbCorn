import { PrismaClient } from "@prisma/client";
import { getPage1Posts, senWeChatInfo } from "./util";
import { schedule } from "node-cron";
import fs from "fs";
import dayjs from "dayjs";
const prisma = new PrismaClient();

export interface PostItf {
  id?: number;
  title: String;
  time: number;
  target: String;
}
interface StartCount {
  id?: number;
  count: number;
  firstTime: number;
  lastTime: number;
}
async function main() {
  // 新增推送内容列表
  const newPosts: PostItf[] = [];
  // 获取第一页的推送内容
  const page1Posts = await getPage1Posts();
  // 获取数据库中保存的历史推送内容
  const posts = await prisma.post.findMany();
  // 对比历史推送内容与第一页推送内容，把新内容push到newPosts中
  page1Posts.forEach((item) => {
    const tmpIdx = posts.findIndex(
      (p: any) => p.title === item.title && p.time == item.time
    );
    if (tmpIdx === -1) {
      newPosts.push(item);
    }
  });

  let startTime: number;
  // 判断是不是第一次启动，第一次启动会导致新消息内容过多，server酱会报错
  // TODO 考虑后续试试用post请求能不能解决这个数据过多问题
  const firstData: StartCount | null = await prisma.startCount.findFirst();
  if (firstData) {
    firstData.lastTime = dayjs().unix();
    firstData.count += 1;
    startTime = firstData.count;
    console.log(`第${firstData.count}次启动`);
    await prisma.startCount.update({
      where: {
        id: firstData.id,
      },
      data: firstData,
    });
  } else {
    startTime = 1;
    const tmpV: StartCount = {
      firstTime: dayjs().unix(),
      lastTime: dayjs().unix(),
      count: 1,
    };
    await prisma.startCount.create({
      data: tmpV,
    });
    console.log("第一次启动");
  }
  // 如果有新内容，则发送微信推送！以及把新内容插入到数据库中，变成历史信息
  if (newPosts.length) {
    console.log(`发现${newPosts.length}条新数据`);
    newPosts.forEach((item) => {
      console.log("新数据标题：", item.title);
      console.log("新数据目标地址：", item.target);
    });
    await prisma.post.createMany({
      data: newPosts.sort((a, b) => a.time - b.time) as any[],
    });
    if (startTime !== 1) {
      await senWeChatInfo(newPosts);
    }
  } else {
    console.log("本次任务尚未发现新任务");
  }
}

const task = async () => {
  const currentTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  console.log("启动任务时间：", currentTime);
  try {
    await main();
  } catch (error) {
    // console.error("An error occurred:", error);
  } finally {
    console.log("任务执行结束");
    await prisma.$disconnect(); // 无论成功或失败，都会断开数据库连接
  }
};

schedule("0 */1 * * *", task);

// 捕获程序退出信号
process.on("exit", (code) => {
  fs.appendFileSync("output.txt", `Process exited with code: ${code}\n`);
});

process.on("SIGINT", () => {
  fs.appendFileSync("output.txt", "Process terminated (SIGINT)\n");
  process.exit();
});

process.on("SIGTERM", () => {
  fs.appendFileSync("output.txt", "Process terminated (SIGTERM)\n");
  process.exit();
});

process.on("uncaughtException", (err) => {
  fs.appendFileSync("output.txt", `Uncaught exception: ${err.message}\n`);
  process.exit(1);
});

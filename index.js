"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const util_1 = require("./util");
const node_cron_1 = require("node-cron");
const fs_1 = __importDefault(require("fs"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 新增推送内容列表
        const newPosts = [];
        // 获取第一页的推送内容
        const page1Posts = yield (0, util_1.getPage1Posts)();
        // 获取数据库中保存的历史推送内容
        const posts = yield prisma.post.findMany();
        // 对比历史推送内容与第一页推送内容，把新内容push到newPosts中
        page1Posts.forEach((item) => {
            const tmpIdx = posts.findIndex((p) => p.title === item.title && p.time == item.time);
            if (tmpIdx === -1) {
                newPosts.push(item);
            }
        });
        // 如果有新内容，则发送微信推送！以及把新内容插入到数据库中，变成历史信息
        if (newPosts.length) {
            console.log(`发现${newPosts.length}条新数据`);
            newPosts.forEach((item) => {
                console.log("新数据标题：", item.title);
                console.log("新数据目标地址：", item.target);
            });
            yield prisma.post.createMany({
                data: newPosts.sort((a, b) => a.time - b.time),
            });
            yield (0, util_1.senWeChatInfo)(newPosts);
        }
        else {
            console.log("本次任务尚未发现新任务");
        }
    });
}
const task = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = (0, dayjs_1.default)().format("YYYY-MM-DD HH:mm:ss");
    console.log("启动任务时间：", currentTime);
    try {
        yield main();
    }
    catch (error) {
        // console.error("An error occurred:", error);
    }
    finally {
        console.log("任务执行结束");
        yield prisma.$disconnect(); // 无论成功或失败，都会断开数据库连接
    }
});
(0, node_cron_1.schedule)("0 */1 * * *", task);
// 捕获程序退出信号
process.on("exit", (code) => {
    fs_1.default.appendFileSync("output.txt", `Process exited with code: ${code}\n`);
});
process.on("SIGINT", () => {
    fs_1.default.appendFileSync("output.txt", "Process terminated (SIGINT)\n");
    process.exit();
});
process.on("SIGTERM", () => {
    fs_1.default.appendFileSync("output.txt", "Process terminated (SIGTERM)\n");
    process.exit();
});
process.on("uncaughtException", (err) => {
    fs_1.default.appendFileSync("output.txt", `Uncaught exception: ${err.message}\n`);
    process.exit(1);
});

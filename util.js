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
exports.senWeChatInfo = exports.getPage1Posts = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const dayjs_1 = __importDefault(require("dayjs"));
const const_1 = require("./const");
const getPage1Posts = () => __awaiter(void 0, void 0, void 0, function* () {
    // 发送请求
    const res = yield axios_1.default.get(const_1.searchUrl);
    const page1Posts = [];
    let $ = (0, cheerio_1.load)(res.data);
    const listArr = $("#warp #main .list-box .list li");
    listArr.each((_, item) => {
        // 获取 span 标签的内容
        const dateText = $(item).find("span").text().trim();
        const cleanedDateText = dateText.replace(/[\[\]]/g, ""); // 去掉方括号
        const lineDataText = cleanedDateText.replace(/年|月|日/g, "-").slice(0, -1);
        const timestamp = (0, dayjs_1.default)(lineDataText, "YYYY-MM-DD").unix();
        // 获取 a 标签的 href 和内容
        const linkElement = $(item).find("a");
        const href = linkElement.attr("href");
        const linkText = linkElement.text().trim();
        page1Posts.push({
            title: linkText,
            time: timestamp,
            target: href !== null && href !== void 0 ? href : "",
        });
    });
    return page1Posts;
});
exports.getPage1Posts = getPage1Posts;
const senWeChatInfo = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (data.length === 1) {
        const params = {
            title: data[0].title,
            desp: `
              # ${data[0].title}

              发布时间：${(0, dayjs_1.default)(data[0].time * 1000).format("YYYY-MM-DD")}
            
              目标地址： ${data[0].target}

              `,
        };
        yield axios_1.default.get(const_1.sendInfoUrl, { params });
    }
    else {
        const params = {
            title: "一次性发布了多条内容嗷",
            desp: data
                .map((item) => `
                # ${item.title}
  
                发布时间：${(0, dayjs_1.default)(item.time * 1000).format("YYYY-MM-DD")}
              
                目标地址： ${item.target}
  

                `)
                .join(),
        };
        yield axios_1.default.get(const_1.sendInfoUrl, { params });
    }
});
exports.senWeChatInfo = senWeChatInfo;

import axios from "axios";
import { PostItf } from ".";
import { load } from "cheerio";
import dayjs from "dayjs";
import { searchUrl, sendInfoUrl } from "./const";


export const getPage1Posts = async () => {
  // 发送请求
  const res = await axios.get(searchUrl);

  const page1Posts: PostItf[] = [];

  let $ = load(res.data);
  const listArr = $("#warp #main .list-box .list li");
  listArr.each((_, item) => {
    // 获取 span 标签的内容
    const dateText = $(item).find("span").text().trim();
    const cleanedDateText = dateText.replace(/[\[\]]/g, ""); // 去掉方括号
    const lineDataText = cleanedDateText.replace(/年|月|日/g, "-").slice(0, -1);
    const timestamp = dayjs(lineDataText, "YYYY-MM-DD").unix();

    // 获取 a 标签的 href 和内容
    const linkElement = $(item).find("a");
    const href = linkElement.attr("href");
    const linkText = linkElement.text().trim();

    page1Posts.push({
      title: linkText,
      time: timestamp,
      target: href ?? "",
    });
  });
  return page1Posts;
};

export const senWeChatInfo = async (data: PostItf[]) => {
  if (data.length === 1) {
    const params = {
      title: data[0].title,
      desp: `
              # ${data[0].title}

              发布时间：${dayjs(data[0].time * 1000).format("YYYY-MM-DD")}
            
              目标地址： ${data[0].target}

              `,
    };
    const res = await axios.get(sendInfoUrl, { params });
    if (res?.status === 200) {
      console.log("消息推送成功！");
    } else {
      console.log("消息推送失败！");
      console.error(res);
    }
  } else {
    const params = {
      title: `一次性发布了${data.length}条内容嗷`,
      desp: data
        .map(
          (item) => `
                # ${item.title}
  
                发布时间：${dayjs(item.time * 1000).format("YYYY-MM-DD")}
              
                目标地址： ${item.target}
  

                `
        )
        .join(),
    };
    const res = await axios.post(sendInfoUrl, params);
    if (res?.status === 200) {
      console.log("消息推送成功！");
    } else {
      console.log("消息推送失败！");
      console.error(res);
    }
  }
};

// ==MiruExtension==
// @name         DotMovies
// @version      v0.0.1
// @author       OshekharO
// @lang         hi
// @license      MIT
// @package      dotmovies
// @type         bangumi
// @icon         https://dotmovies.dad/wp-content/uploads/2022/09/favicon-1.png
// @webSite      https://dotmovies.dad
// @nsfw         false
// ==/MiruExtension==

export default class extends Extension {
  async latest(page) {
    const res = await this.request(`/page/${page}/`);
    const bsxList = await this.querySelectorAll(res, "article.post-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "h3 > a", "href");
      const title = await this.querySelector(html, "h3 > a").text;
      const cover = await this.querySelector(html, "img.blog-picture").getAttributeText("data-src");
      //console.log(title+cover+url)
      novel.push({
        title: title.replace("Download ", ""),
        url,
        cover,
      });
    }
    return novel;
  }

  async search(kw) {
    const res = await this.request(`/?s=${kw}`);
    const bsxList = await this.querySelectorAll(res, "article.post-item");
    const novel = [];
    for (const element of bsxList) {
      const html = await element.content;
      const url = await this.getAttributeText(html, "h3 > a", "href");
      const title = await this.querySelector(html, "h3 > a").text;
      const cover = await this.querySelector(html, "img.blog-picture").getAttributeText("data-src");
      //console.log(title+cover+url)
      novel.push({
        title: title.replace("Download ", ""),
        url,
        cover,
      });
    }
    return novel;
  }

  async detail(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });

    const title = await this.querySelector(res, "meta[property='og:title']").getAttributeText("content");
    const cover = await this.querySelector(res, "meta[property='og:image']").getAttributeText("content");
    const desc = await this.querySelector(res, "div.info").text;
    const urlPatterns = [/https:\/\/dotlinks\.[^\s'"]+/];

    let episodeUrl = "";

    for (const pattern of urlPatterns) {
      const match = res.match(pattern);
      if (match) {
        episodeUrl = match[0];
        break;
      }
    }

    return {
      title: title.replace("Download ", ""),
      cover,
      desc: desc.trim(),
      episodes: [
        {
          title: "Directory",
          urls: [
            {
              name: title,
              url: episodeUrl,
            },
          ],
        },
      ],
    };
  }

  async watch(url) {
    const res = await this.request("", {
      headers: {
        "Miru-Url": url,
      },
    });
    //console.log(res)
    const dwishLink = res.match(/https:\/\/v-cloud\.[^\s'"]+/); //1
    //console.log(dwishLink)
    const dwishLinkRes = await this.request("", {
      headers: {
        "Miru-Url": dwishLink,
        "Miru-Referer": dwishLink,
      },
    });
    //console.log(dwishLinkRes)
    const fast = dwishLinkRes.match(/https:\/\/v-cloud\.bio\/go\.php\?id=[A-Za-z0-9]+/); //2
    //console.log(fast)
    const FastRes = await this.request("", {
      headers: {
        "Miru-Url": fast,
        "Miru-Referer": fast,
      },
    });
    //console.log(FastRes)
    const hub = FastRes.match(/https:\/\/v-cloud\.bio\/[A-Za-z0-9-]+(\?token=[A-Za-z0-9%\/+=]+)?/); //3
    //console.log(hub)
    const HubRes = await this.request("", {
      headers: {
        "Miru-Url": hub,
        "Miru-Referer": hub,
      },
    });
    //console.log(HubRes)
    const directUrlMatch = HubRes.match(/https:\/\/pixeldra\.in\/api\/[^"?]*(\?[^"?]*)?/);
    const directUrl = directUrlMatch ? directUrlMatch[0] : "";
    //console.log(directUrl)
    return {
      type: "hls",
      url: directUrl || "",
    };
  }
}

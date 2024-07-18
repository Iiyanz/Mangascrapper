const express = require("express");
const cheerio = require("cheerio");
const sharp = require("sharp");
const axios = require("axios");
const stream = require("stream");
const https = require("https");
const cors = require('cors');

const REGION = ""; // If German region, set this to an empty string: ''
const BASE_HOSTNAME = "storage.bunnycdn.com";
const CDNHOST = "https://komiksekai.b-cdn.net";
const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
const STORAGE_ZONE_NAME = "komiksekai";
const ACCESS_KEY = "dfce7ab8-2ecf-4ca6-846b36450e61-8d0c-4cf1";

const app = express();
const port = 3000;

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const bufferToStream = (buffer) => {
  const readableStream = new stream.Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readableStream;
};

// Function to fetch image from URL and upload to S3
const uploadImageToS3 = async (imageUrl, key, animeName, chap, folderName) => {
  try {
    // Fetch the image
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });
    
    const alt = animeName.replace("-", " ").replace(/\s/gm, "") + ' chapter ' + chap + ' bahasa indonesia';

    const buffer = await sharp(response.data)
      .jpeg({ mozjpeg: true, quality: 80 })
      .toBuffer();

    const readStream = bufferToStream(buffer);
    const options = {
      method: "PUT",
      host: HOSTNAME,
      path: `/${STORAGE_ZONE_NAME}/${folderName}/${chap}/${key}`,
      headers: {
        AccessKey: ACCESS_KEY,
        "Content-Type": "application/octet-stream",
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            const imgSrc = `${CDNHOST}/${folderName}/${chap}/${key}`;
            const imgH = `<img src="${imgSrc}" alt="${alt}">`;
            resolve(imgH);
          } else {
            reject(new Error(`Failed to upload image: ${res.statusCode}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(error);
      });

      readStream.pipe(req);
    });
  } catch (error) {
    throw new Error(`Error fetching image: ${error.message}`);
  }
};

async function fetchDataKiryuu(url) {
  try {
    const res = await axios.get("https://kiryuu.id/" + url);
    var $ = cheerio.load(res.data, { scriptingEnabled: false });

    const article = $(".wrapper > .chapterbody")
      .find(".postarea > article")
      .html();
    const chap = $(article).find(".maincontent > #readerarea").html();
    const img = $(chap).find("noscript img");
    const chapter = $(article).find(".headpost > .entry-title").text();
    const noChap = chapter.match(/Chapter (\d+)/)[1];
    const anime = $(article).find(".headpost > .allc").children().text();
    const imgSrcs = img.map((i, el) => $(el).attr("src")).get();

    // const animeName = anime.replace(" ", "-").toLowerCase();
    var animeName = anime.replace(/\W/gm, "-").toLowerCase().trim();
    
    var folderName = anime.trim().replace(/\W/g, "-").toLowerCase();
    // Upload images concurrently
    const uploadPromises = imgSrcs.map((element, index) => {
      const name = `${index}-${generateString(10)}.jpg`;
      return uploadImageToS3(element, name, animeName, noChap, folderName);
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return {
      title: chapter,
      chap : noChap,
      images: uploadedImages,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function fetchDataKomikIndo(url) {
  try {
    const res = await axios.get("https://komikindo.tv/" + url);
    var $ = cheerio.load(res.data, { scriptingEnabled: false });

    const article = $("#wrap").find("#content > .postbody > article").html();
    const chapter = $(article).find(".chapter-area > .chapter-content").html();
      const aside = $("#wrap").find("#content > aside").html();
      const animeee = $(aside).find('.infoanime_wrap > .infox > h2').text();
      const namaAnimee = animeee.replace("Komik", "").replace('Indo', "").trim().replace(/\W/g, "-").toLowerCase();
    const images = $(chapter).find("#chimg-auh").children();
    const title = $(chapter).find(".dtlx > h1").text();
    const noChap = title.match(/\d/gm).join("");
    const namaAnime = title
      .replace("Komik", "")
      .replace("Chapter", "")
      .replace(/\d/gm, "")
      .trim();
    const src = images.map((i, el) => $(el).attr("src")).get();
    const finalTitle = title
      .replace("Komik", "")
      .concat("Bahasa Indonesia")
      .trim();

    var animeName = animeee.replace("Komik", "").replace('Indo', "").trim().toLowerCase();
    //  var folderName = namaAnime.trim().replace(/\s/gm, "-").toLowerCase();
    // Upload images concurrently
    const uploadPromises = src.map((element, index) => {
      const name = `${index}-${generateString(10)}.jpg`;
      return uploadImageToS3(element, name, animeName, noChap, namaAnimee);
    });

    const uploadedImages = await Promise.all(uploadPromises);

    return {
      title: namaAnime + ' Chapter ' + noChap + ' Bahasa Indonesia',
      chap : noChap,
      images: uploadedImages,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function fetchListKomikIndo(url) {
  try {
    const res = await axios.get("https://komikindo.tv/komik/" + url);
    var $ = cheerio.load(res.data, { scriptingEnabled: false });

    const article = $('#wrap > #content').find('.postbody > article').html();
    const sectionEps = $(article).find('section > .eps_lst > .listeps').html();
    const listEps = $(sectionEps).find('#chapter_list > ul').children();
    
    let data = [];
    listEps.each((index, element) => {
        const eps = $(listEps[index]).find('.lchx > a').attr('href');
        const chap = $(listEps[index]).find('.lchx > a > chapter').text();

        data.push({
            'chap' : chap.trim(),
            'eps' : eps.replace(/https:\/\/([^\/]+)\//, ""),
        })
    });

    return data.sort((a, b) => a.chap - b.chap);
  } catch (error) {
    console.log(error);
    return null;
  }
}

app.use(cors());

app.get("/fetch-list-komikindo/:url", async (req, res) => {
  const data = await fetchListKomikIndo(req.params.url);
  if (data) {
    res.json(data);
  } else {
    res.status(500).send("Error fetching data");
  }
});

app.get("/fetch-kiryuu/:url", async (req, res) => {
  const data = await fetchDataKiryuu(req.params.url);
  if (data) {
    res.json(data);
  } else {
    res.status(500).send("Error fetching data");
  }
});

app.get("/fetch-komikindo/:url", async (req, res) => {
  const data = await fetchDataKomikIndo(req.params.url);
  if (data) {
    res.json(data);
  } else {
    res.status(500).send("Error fetching data");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

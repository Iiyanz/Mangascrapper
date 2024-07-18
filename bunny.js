const cheerio = require("cheerio");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");
const stream = require("stream");
const https = require("https");

const REGION = ""; // If German region, set this to an empty string: ''
const BASE_HOSTNAME = "storage.bunnycdn.com";
const CDNHOST = "https://komiksekai.b-cdn.net";
const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
const STORAGE_ZONE_NAME = "komiksekai";
const ACCESS_KEY = "dfce7ab8-2ecf-4ca6-846b36450e61-8d0c-4cf1";

const url = "https://komikindo.tv/tokidoki-bosotto-roshiago-de-dereru-tonari-no-alya-san-chapter-41/";

const data = [];

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

// // Configure AWS SDK
// const s3 = new AWS.S3({
//   accessKeyId: "0083f54a410e4856e5e8",
//   secretAccessKey: "FD1mEDNDTMZjo8LqeGjD3TibcPTXaHcfLmdWsBF1",
//   region: "idn",
//   endpoint: "https://nos.jkt-1.neo.id",
// });

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
const uploadImageToS3 = async (imageUrl, key, animeName, chap) => {
  try {
    // Fetch the image
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    // console.log();
    sharp(response.data)
      .jpeg({ mozjpeg: true, quality: 50 })
      .toBuffer()
      .then((buffer) => {
        const readStream = bufferToStream(buffer);
        const options = {
          method: "PUT",
          host: HOSTNAME,
          path: `/${STORAGE_ZONE_NAME}/${animeName}/${chap}/${key}`,
          headers: {
            AccessKey: ACCESS_KEY,
            "Content-Type": "application/octet-stream",
          },
        };

        const req = https.request(options, (res) => {
          res.on("data", (chunk) => {
            console.log(`${CDNHOST}/${animeName}/${chap}/${key}`);
          });
        });

        req.on("error", (error) => {
          console.error(error);
        });

        // readStream.pipe(req);

        readStream.pipe(req);
      });
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function uploadImagesWithDelay(imgSrcs, animeName, noChap) {
  for (let index = 0; index < imgSrcs.length; index++) {
    let val = imgSrcs[index];
    let name = index + "-" + generateString(10) + ".jpg";
    uploadImageToS3(val, name, animeName, noChap);
    await delay(1000); // Wait for 1 second before the next upload
  }
}

axios.get(url).then(function (res) {
  // console.log(res.data);
  var $ = cheerio.load(res.data, { scriptingEnabled: false });
  // console.log(res.data);

  const article = $("#wrap").find("#content > .postbody > article").html();
    const chapter = $(article).find(".chapter-area > .chapter-content").html();
    const images = $(chapter).find("#chimg-auh").children();
    const title = $(chapter).find(".dtlx > h1").text();
    const noChap = title.match(/\d/gm).join("");
    const namaAnime = title.replace('Komik',"").replace('Chapter', "").replace(/\d/gm, "").trim();
    const src = images.map((i, el) => $(el).attr("src")).get();
    const finalTitle = title
      .replace("Komik", "")
      .concat("Bahasa Indonesia")
      .trim();

      var animeName = namaAnime.replace(/\W/gm, "-").toLowerCase().trim();
      // console.log(animeName)
      uploadImagesWithDelay(src, animeName, noChap);
  // noscript.each((index, element) => {
  //     const $2 = load($(element).html());
  //     console.log($2);
  // })

  // const listEps = $(chap).find('img').attr('src');

  // let data = [];
  // listEps.each((index, element) => {
  //     const eps = $(listEps[index]).find('.lchx > a').attr('href');
  //     const chap = $(listEps[index]).find('.lchx > a > chapter').text();

  //     data.push({
  //         'eps' : eps,
  //         'chap' : chap.trim()
  //     })
  // });

  // let data = [];
  // listEps.each((index, element) => {
  //     const eps = $(listEps[index]).find('.lchx > a').attr('href');
  //     const chap = $(listEps[index]).find('.lchx > a > chapter').text();

  //     data.push({
  //         'eps' : eps,
  //         'chap' : chap.trim()
  //     })
  // });
  // console.log(imgSrcs);
  // const finalTitle = title.replace('Komik', "").concat('Bahasa Indonesia').trim();
  // var animeName = anime.replace(" ", "-").toLowerCase();
  // for (let index = 0; index < imgSrcs.length; index++) {
  //   const element = imgSrcs[index];
  //   let name = index + "-" + generateString(10) + ".jpg";
  //   uploadImageToS3(element, name, animeName, noChap);
  // }

  // uploadImagesWithDelay(imgSrcs, animeName, noChap);
  // imgSrcs.forEach((val, index) => {
  // });
});
// uploadImageToS3()

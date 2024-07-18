const cheerio = require("cheerio");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const axios = require("axios");
const url = "https://kiryuu.id/witch-watch-chapter-161/";

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

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: "0083f54a410e4856e5e8",
  secretAccessKey: "FD1mEDNDTMZjo8LqeGjD3TibcPTXaHcfLmdWsBF1",
  region: "idn",
  endpoint: "https://nos.jkt-1.neo.id",
});

// Function to fetch image from URL and upload to S3
const uploadImageToS3 = async (imageUrl, bucketName, key) => {
  try {
    // Fetch the image
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
    });

    // console.log();
    sharp(response.data)
      .jpeg({ mozjpeg: true, quality: 50 })
      .toBuffer().then(buffer => {
            // Upload to S3
            const uploadParams = {
                Bucket: bucketName,
                Key: key,
                Body: buffer,
                ContentType: 'image/jpg',
            };

            s3.upload(uploadParams, (err, data) => {
                if (err) {
                console.error("Error uploading image:", err);
                } else {
                console.log("Successfully uploaded image:", data.Location);
                }
            });
      });
  } catch (error) {
    console.error("Error fetching image:", error);
  }
};

axios.get(url).then(function (res) {
  // console.log(res.data);
  var $ = cheerio.load(res.data, { scriptingEnabled: false });
  // console.log(res.data);

  const article = $(".wrapper > .chapterbody")
    .find(".postarea > article")
    .html();
  const chap = $(article).find(".maincontent > #readerarea").html();
  const img = $(chap).find("noscript img");

  const imgSrcs = img.map((i, el) => $(el).attr("src")).get();

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
  imgSrcs.forEach((val, index) => {
    let name = generateString(50) + ".jpg";
    uploadImageToS3(val, "komik", name);
  });
});
// uploadImageToS3()
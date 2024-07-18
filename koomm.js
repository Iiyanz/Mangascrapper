const cheerio = require("cheerio");
const axios = require("axios");

const url =
  "https://komikindo.tv/tokidoki-bosotto-roshiago-de-dereru-tonari-no-alya-san-chapter-41/";

const data = [];

axios.get(url).then(function (res) {
  // console.log(res.data);
  var $ = cheerio.load(res.data);
  // console.log(res.data);

  const article = $("#wrap").find("#content > .postbody > article").html();
  const aside = $("#wrap").find("#content > aside").html();
  const animeee = $(aside).find('.infoanime_wrap > .infox > h2').text();
  const namaAnimee = animeee.replace("Komik", "").replace('Indo', "").trim().replace(/\s/gm, "-").toLowerCase();
  const chapter = $(article).find(".chapter-area > .chapter-content").html();
  const images = $(chapter).find("#chimg-auh").children();
  const title = $(chapter).find(".dtlx > h1").text();
  const noChap = title.match(/\d/gm).join("");
  const namaAime = title.replace('Komik',"").replace('Chapter', "").replace(/\d/gm, "").trim();
  const src = images.map((i, el) => $(el).attr("src")).get();
  const finalTitle = title
    .replace("Komik", "")
    .concat("Bahasa Indonesia")
    .trim();

  console.log(namaAnimee);
//   src.forEach((val, index) => {
//     // let name = generateString(50) + ".jpg";
//     console.log(val);
//     // uploadImageToS3(val, "komik", name);
//   });

  // let data = [];
  // listEps.each((index, element) => {
  //     const eps = $(listEps[index]).find('.lchx > a').attr('href');
  //     const chap = $(listEps[index]).find('.lchx > a > chapter').text();

  //     data.push({
  //         'eps' : eps,
  //         'chap' : chap.trim()
  //     })
  // });

  // console.log(data.sort((a, b) => a.chap - b.chap));
  // const finalTitle = title.replace('Komik', "").concat('Bahasa Indonesia').trim();
});

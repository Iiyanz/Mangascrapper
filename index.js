const cheerio = require("cheerio");
const axios = require("axios");

const url = "https://komikindo.tv/komik/tokidoki-bosotto-roshiago-de-dereru-tonari-no-alya-san/";

const data = [];

 axios.get(url).then(function(res) {
    // console.log(res.data);
    var $ = cheerio.load(res.data);
    // console.log(res.data);

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

    console.log(data.sort((a, b) => a.chap - b.chap));
    // const finalTitle = title.replace('Komik', "").concat('Bahasa Indonesia').trim();
})

const express = require('express');
const cheerio = require('cheerio');
const axios = require('axios');

const app = express();
const port = 3000;

// const url = 'kimetsu-no-yaiba-chapter-205-6/';

async function fetchData(url) {
    try {
        const res = await axios.get('https://komikindo.tv/' + url);
        const $ = cheerio.load(res.data);

        const article = $('#wrap').find('#content > .postbody > article').html();
        const chapter = $(article).find('.chapter-area > .chapter-content').html();
        const images = $(chapter).find('#chimg-auh').children();
        const title = $(chapter).find('.dtlx > h1').text();

        const finalTitle = title.replace('Komik', "").concat('Bahasa Indonesia').trim();

        const obj = [];
        images.each((index, element) => {
            const imgElement = $(element);
            const attributes = imgElement[0].attribs;
            const imgSrc = `<img src="${attributes.src}" alt="${attributes.alt}" onerror="${attributes.onerror}">`;
            obj.push(imgSrc);
        });

        return {
            title: finalTitle,
            images: obj
        };
        
    } catch (error) {
        // console.error('Error fetching the URL:', error);
       console.log(error);
        return null;
    }
}

app.get('/fetch-data/:url', async (req, res) => {
    const data = await fetchData(req.params.url);
    if (data) {
        res.json(data);
    } else {
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
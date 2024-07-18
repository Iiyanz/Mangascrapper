const axios = require('axios');
const cheerio = require('cheerio');

const baseUrl = 'https://komikindo.tv/daftar-manga/page/';
const totalPages = 22; // The total number of pages you want to scrape
const results = [];

async function fetchPage(page) {
    const url = `${baseUrl}${page}/`;
        console.log(res.data);
    const res = await axios.get(url);
    // const $ = cheerio.load(res.data);
    // $('.animepost').each((index, element) => {
    //     const title = $(element).find('h4').text();
    //     // results.push(title);
    // });
}

async function fetchAllPages() {
    for (let i = 1; i <= totalPages; i++) {
        await fetchPage(i);
    }
    // console.log(results);
}

fetchAllPages();
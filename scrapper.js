const cloudflareBypass = require('./cloudflare-bypass');
const axios = require('axios');
(async function(){
    const cookie = await cloudflareBypass({
        url: 'https://komikindo.tv/kimetsu-no-yaiba-chapter-202/',
    });

    if(cookie){
        // Parse cookie array into correct header format
        const cookies = cookie.map(item => `${item.name}=${item.value};`);
        const options = {
            headers: {
                'User-Agent': cookie.useragent,
                'Cookie': cookies
            }
        }
        const result = await axios.get('https://komikindo.tv/kimetsu-no-yaiba-chapter-202/', options);
        console.log(`Cloudflare bypass cookie + result`, cookies, result.data);
    }else{
        console.log("Failed to get cf_clearance cookie");
    }
})();
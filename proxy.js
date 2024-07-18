const axios = require('axios');
    
axios.get('https://api.ipify.org/?format=json',
    {
        proxy: {
            protocol: 'http',
            host: '103.115.20.52',
            port: 8199
        }
    }
)
    .then(res => {
        console.log(res.data)
    }).catch(err => console.error(err))
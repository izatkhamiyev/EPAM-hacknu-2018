const rp = require('request-promise');
const request = require('request');
const cheerio = require('cheerio');

function scrape(query) {
    return new Promise((resolve, reject) => {
        var lang = 'en';
        if (/[а-яА-ЯЁё]/.test(query))
            lang = 'ru'
        console.log(query);
        var url = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${query}&format=json`;
        var url2 = '';
        var des = [];
        rp(encodeURI(url))
            .then((body) => {
                var wiki = JSON.parse(body);
                if (wiki[3].length > 0)
                    url2 = wiki[3][0];
                else
                    reject('No such book in a wiki');
                resolve(
                    rp(url2)
                        .then(function (html) {
                            var $ = cheerio.load(html);
                            $("p", '#mw-content-text').each(function (i, el) {
                                if ($(this).text().substring(0, 1) !== '\n')
                                    des.push($(this).text().replace(/ *\([^)]*\) */g, "").replace(/ *\[[^\]]*]/g, '').replace('\n',''));
                            })
                            var src = $("img", '#mw-content-text').attr('src');
                            const result ={
                                des: des,
                                src: src
                            }                            
                            return result;
                        })
                        .catch(function (err) {
                            resolve(err);
                        })
                );
            })
            .catch((err) => {
                resolve(err);
            })
    })
}
// scrape("introductio to algorithms")
//     .then((res) => {
//         console.log(res)
//     })
//     .catch(err => console.log(err))
module.exports = scrape;
/*
  네이버 카페 검색 API 크롤링.
*/
const fs = require('fs');
const request = require('request');
const INTV = 300;
const URI = 'https://section.cafe.naver.com/ArticleSearchAjax.nhn';
const KEYWORD = '원피스 피규어';

let intvCrawl = setInterval(() => {
  let formData = {
    query: KEYWORD,
    sortBy: 1,
    menuType: 0,
    searchBy: 0,
    duplicate: false,
    inCafe: '',
    withOutCafe: '',
    includeAll: '',
    exclude: '',
    include: '',
    exact: '',
    page: 1,
    escrow: '',
    onSale: ''
  };

  request.post({
    url: URI,
    form: formData
  }, (err, res, body) => {
    clearInterval(intvCrawl);

    if (err) {
      console.log('[ERR]', err);
      throw err;
    }

    try {
      let cleanBody = body.replace(/\\/ig, '').replace(/\'/ig, '').trim();
      let resJson = JSON.parse(cleanBody);

      if (resJson['isSuccess']) {
          let list = resJson['result']['searchList'];

          list.forEach((v) => {
            let title = v['articletitle'];
            title = title.replace(/\<(\w*)\>/ig, '');
            title = title.replace(/\<\/(\w*)\>/ig, '');

            let content = v['articlecontent'];
            content = content.replace(/\<(\w*)\>/ig, '');
            content = content.replace(/\<\/(\w*)\>/ig, '');

            let price = content.match(/가격\s*\w+\,*\w+\s*원/ig);
            let priceTwo = content.match(/\w+\,*\w+\s*원/ig);
            let link = 'https://cafe.naver.com' + v['linkUrl'];

            console.log(`제목 : ${title}\n내용 : ${content}\n${price}\n${priceTwo}\n${link}\n`);
          });

          /*
          fs.writeFile('result.json', cleanBody, (err) => {
            if (err) {
              console.log('[FS ERR]', err);
              throw err;
            }
          });
          */
      }
    } catch (e) {
      console.log(e.message);
    }
  })
}, INTV);

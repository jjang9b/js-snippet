/*
  네이버 카페 검색 API 크롤링.
*/
const fs = require('fs');
const request = require('request');
const moment = require('moment');
const { TelegramClient } = require('messaging-api-telegram');
const tClient = TelegramClient.connect('770798205:AAEKBfqqKqAXaJynh-bfkIm6e7tb_mp6pi0');
const TELEGRAM_M_ID = -317448016;
const INTV = 300;
const URI = 'https://section.cafe.naver.com/ArticleSearchAjax.nhn';
const KEYWORD = '원피스 피규어';
const LIMIT_MIN = 30;

let intvCrawl = setInterval(() => {
  clearInterval(intvCrawl);

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
    if (err) {
      console.log('[ERR]', err);
      throw err;
    }

    try {
      let cleanBody = body.replace(/\\/ig, '').replace(/\'/ig, '').trim();
      let resJson = JSON.parse(cleanBody);

      if (resJson['isSuccess']) {
          let list = resJson['result']['searchList'];
          let msg = `[${KEYWORD}][${moment().format('YY-MM-DD HH:mm')}]\n`;

          list.forEach((v) => {
            let title = v['articletitle'];
            title = title.replace(/\<(\w*)\>/ig, '');
            title = title.replace(/\<\/(\w*)\>/ig, '');

            let content = v['articlecontent'];
            content = content.replace(/\<(\w*)\>/ig, '');
            content = content.replace(/\<\/(\w*)\>/ig, '');

            let price = content.match(/가격\s*\w+\,*\w+\s*원/ig);
            let priceTwo = content.match(/\w+\,*\w+\s*원/ig);
            let writeDate = v['writeDate'];
            let link = 'https://cafe.naver.com' + v['linkUrl'];

            if (writeDate.indexOf('분') >= 0) {
              let writeMin = writeDate.replace('분 전', '').trim();

              if (parseInt(writeMin) <= LIMIT_MIN) {
                msg += `제목 : ${title}\n내용 : ${content}\n가격 정보 : ${price} | ${priceTwo}\n날짜 : ${writeDate}\n링크 : ${link}\n\n`;
              }
            }
          });

          tClient.sendMessage(TELEGRAM_M_ID, msg, {});
      }
    } catch (e) {
      console.log(e.message);
    }
  })
}, INTV);

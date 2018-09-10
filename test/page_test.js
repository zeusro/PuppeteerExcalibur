var assert = require('assert');
// const index = require('../index')
var url = 'https://shop36091539.taobao.com/index.htm?spm=2013.1.w5002-10305132041.2.302568b5Yu5Tkw'
const puppeteer = require('puppeteer');

it("test goto", function () {  
   
    puppeteer.launch().then(async browser => {
        const page = await browser.newPage();
        await page.goto('https://connect.aliyun.com/');
        await page.screenshot({path: 'screenshot.png'});
        await browser.close();
      });

});


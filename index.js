#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const args = process.argv.slice(2)

const puppeteer = require('puppeteer')
const host = 'http://www.yinwang.org'
//获取任务
puppeteer.launch().then(async browser => {
  const page = await browser.newPage()
  await page.goto(host, {
    waitUntil: 'load'
  })
  let bodyHTML = await page.evaluate(() => document.body.innerHTML)
  const cheerio = require('cheerio')
  var $ = cheerio.load(bodyHTML)
  var article_ul = $('.title a', '.list-group')
  var articles = []
  article_ul.each(function (i, elem) {
    var url = $(this).attr("href")
    if (!url.startsWith("http")) {
      url = host + url
    }
    const article = $(this).text()
    articles.push({
      "article": article,
      "url": url,
    })
  });
  // console.log(articles)
  const outputDir = "output"
  //开始抓取
  // articles.length
  const fs = require("fs");

  var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, index) {
        var curPath = path + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }

  // deleteFolderRecursive(outputDir)
  // fs.mkdir(outputDir, function (err) {
  //   if (err) {
  //     console.log(err);
  //   }
  // })

  for (let index = 0; index < articles.length; index++) {
    const element = articles[index];
    const fileName = outputDir + "/" + element.article + ".md"    
    if (fs.existsSync(fileName)) {
      console.log("文件已存在,跳过")
      continue
    }
    console.log("开始爬取 " + element.article + ":" + element.url)
    await page.goto(element.url)
    let articleHTML = await page.evaluate(() => document.body.innerHTML)
    //下载所有图片
    // var $ = cheerio.load(articleHTML)
    //phase 段落
    
    const newLine = "\r\n"

    //可以用markdown替换的
    const endTagRegex = /<\/(p|h1|h2|h3)>/g
    const h1Regex = /<h1[\s\S]*?>/g
    const h2Regex = /<h2[\s\S]*?>/g
    const h3Regex = /<h3[\s\S]*?>/g
    const pStartRegex = /<p[\s\S]*?>/g
    const pEndRegex = /<\/p>/g
    const strongStartRegex = /<strong[\s\S]*?>/g
    const strongEndRegex = /<\/strong>/g
    const preStartRegex = /<pre[\s\S]*?>/g
    const preEndRegex = /<\/pre>/g
    articleHTML = articleHTML.replace(endTagRegex, "")
    articleHTML = articleHTML.replace(h1Regex, "# ")
    articleHTML = articleHTML.replace(h2Regex, "## ")
    articleHTML = articleHTML.replace(h3Regex, "### ")    
    articleHTML = articleHTML.replace(preStartRegex, "```" + newLine)
    articleHTML = articleHTML.replace(preEndRegex, "```" + newLine)
    articleHTML = articleHTML.replace(pStartRegex, "> " + newLine + "> ")
    articleHTML = articleHTML.replace(pEndRegex, "")
    articleHTML = articleHTML.replace(strongStartRegex, "**")
    articleHTML = articleHTML.replace(strongEndRegex, "**")

    //暂时不替换的
    const srciptRegex = /<script[\s\S\r\n]*?\/script[\s\S]*?>/g
    const commentRegex = /<!--[\s\S\r\n]*?-->/g
    const codeStartRegex = /<code[\s\S]*?>/g
    const codeEndRegex = /<\/code>/g
    const divStartRegex = /<div[\s\S]*?>/g
    const divEndRegex = /<\/div>/g
    const spanStartRegex = /<span[\s\S]*?>/g
    const spanEndRegex = /<\/span>/g
    articleHTML = articleHTML.replace(srciptRegex, "")
    articleHTML = articleHTML.replace(commentRegex, "")
    articleHTML = articleHTML.replace(codeStartRegex, "")
    articleHTML = articleHTML.replace(codeEndRegex, "")
    articleHTML = articleHTML.replace(divStartRegex, "")
    articleHTML = articleHTML.replace(divEndRegex, "")
    articleHTML = articleHTML.replace(spanStartRegex, "")
    articleHTML = articleHTML.replace(spanEndRegex, "")

    //其他字符
    articleHTML = articleHTML.replace('&gt;', ">")

    const markdownContent = articleHTML

    fs.appendFile(fileName, markdownContent, (err) => {
      if (err) {
        throw err
      }
      // console.log(fileName + " created.")
    })

  }
  await browser.close();
});


// const scriptIndex = args.findIndex(
//   x => x === 'build' || x === 'eject' || x === 'start' || x === 'test'
// );
// const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
// const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

// switch (script) {
//   case 'build':
//   case 'eject':
//   case 'start':
//   case 'test': {    
//     // process.exit(1);
//     break;
//   }
//   default:
//     console.log('Unknown script "' + script + '".');
//     console.log('食屎啦你');    
//     break;
// }
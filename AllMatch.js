let req = require("request");

// cheerio -> pass HTML -> it will read and parse -> give tool
let ch = require("cheerio");

// used to do CRUD
const fs = require("fs");

let url = "https://www.espncricinfo.com/series/ipl-2021-1249214/match-results";
console.log("Before");

let match = require("./app.js");

// req -> to make request to server and to get HTML/response
// cb = callback

req(url, cb);

console.log("After");
console.log("Request sent");

function cb(err, res, data) {
    // resource not found
    if(res.statusCode == 404) {
        console.log("Not found");
    } else if(res.statusCode == 200) { // resource found
        // console.log(data);
        parseHTML(data);
    } else {
        console.log(err);
    }
}

function parseHTML(data) {
    let fTool = ch.load(data);
    let AllScorecardElem = fTool('a[data-hover=Scorecard]');
    // console.log(AllScorecardElem.length);
    for(let i=0;i<AllScorecardElem.length;i++) {
        let url = ch(AllScorecardElem[i]).attr("href");
        // console.log("https://www.espncricinfo.com" + url);
        let fullUrl = "https://www.espncricinfo.com" + url;
        match.processMatch(fullUrl);
    }
}
let req = require("request");

// cheerio -> pass HTML -> it will read and parse -> give tool
let ch = require("cheerio");
const fs = require("fs");

let url = "https://www.espncricinfo.com/series/ipl-2021-1249214/delhi-capitals-vs-punjab-kings-11th-match-1254068/full-scorecard";
console.log("Before");

// req -> to make request to server and to get HTML/response
// cb = callback
req(url, cb);
console.log("After");
console.log("Request sent");

function cb(err, res, data) {
    if(res.statusCode == 404) {
        console.log("Not found");
    } else if(res.statusCode == 200) {
        // console.log(data);
        parseHTML(data);
    } else {
        console.log(err);
    }
}

function parseHTML(data) {
    let fTool = ch.load(data); //find tool, selector tool
    // fs.writeFileSync("test.html", data);

    // fTool searches in whole HTML
    let venueElem = fTool(".match-info.match-info-MATCH .description");

    // the following 2 fn are on fTool elements and not venueElem[i] -> pehle usko cheerio mein wrap karna padhega index ke liye
    // console.log(venueElem.text());
    // console.log(venueElem.html());

    // text -> concatenates the text of all matching elements
    // html -> first element ka html dega

    let venue = venueElem.text();

    // let elems = fTool(".card.content-block.match-scorecard-table");
    // console.log(elems.length); // returns in array form

    let elems = fTool(".Collapsible");
    console.log(elems.length);

    whole = "";
    for(let i=0;i<elems.length;i++) {
        // index -> wrap in cheerio
        // let html = ch(elems[i]).html();
        // whole = whole + html + "</br>";

        let innElem = ch(elems[i]);
        let team = innElem.find("h5").text();
        // console.log(team);

        let teamName = team.split("INNINGS");
        // console.log(teamName[0]);

        
    }
    // fs.writeFileSync("tables.html", whole);
}
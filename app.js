let req = require("request");

// cheerio -> pass HTML -> it will read and parse -> give tool
let ch = require("cheerio");

// used to do CRUD
const fs = require("fs");

let path = require("path"); // internal node module

let xlsx = require("xlsx"); // io related to excel files

// let url = "https://www.espncricinfo.com/series/ipl-2021-1249214/delhi-capitals-vs-punjab-kings-11th-match-1254068/full-scorecard";
console.log("Before");

// req -> to make request to server and to get HTML/response
// cb = callback

// req(url, cb);
console.log("After");
console.log("Request sent");

function processMatch(url) {
    req(url, cb);
}

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

    // elems > 1 ? in array : only element
    let elems = fTool(".Collapsible");
    console.log(elems.length);

    whole = "";
    // loop for every inning
    for(let i=0;i<elems.length;i++) {
        // index -> wrap in cheerio
        // let html = ch(elems[i]).html();
        // whole = whole + html + "</br>";

        let innElem = ch(elems[i]);
        let team = innElem.find("h5").text();
        // console.log(team);

        let teamName = team.split("INNINGS");
        console.log(teamName[0].trim()); // removes whitespaces, both start and end 

        teamName = teamName[0].trim();

        // player details
        let playerRows = innElem.find(".table.batsman tbody tr");
        // console.log(player.length);

        // loop for every player 
        for(let j=0;j<playerRows.length;j++) {

            // option 1 (to neglect the commentary har player ka out)
            // let tds = ch(playerRows[j]).find("td"); // columns
            // // console.log(ch(tds).text());
            // if(tds.length > 1) {
            //     console.log("Valid row", ch(playerRows[j]).text());
            // }

            // option 2
            let cols = ch(playerRows[j]).find("td");
            let isAllowed = ch(cols[0]).hasClass("batsman-cell");
            if(isAllowed) { // only players here
                // console.log(ch(playerRows[j]).text());
                let playerName = ch(cols[0]).text().trim();
                let runs = ch(cols[2]).text().trim();
                let balls = ch(cols[3]).text().trim();
                let fours = ch(cols[5]).text().trim();
                let sixes = ch(cols[6]).text().trim();
                let sr = ch(cols[7]).text().trim();
                // console.log();

                console.log(teamName, playerName, runs, balls, fours, sixes, sr);
                // adds the data in required folder -> then required file 
                processPlayer(teamName, playerName, runs, balls, fours, sixes, sr);
            }
        }
        console.log("``````````````````````````````");
    }
    // fs.writeFileSync("tables.html", whole);
}

function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr) {
    // let msd = {{}, {}, {} each object signifies each match}
    let playerObject = {
        playerName: playerName,
        runs: runs,
        balls: balls,
        fours: fours,
        sixes: sixes,
        sr: sr,
        teamName: teamName
    };
    
    // checks -> folder exists ? (file exists ? data append : create file and add data) : create folder, file then add data

    let dirExist = checkExistence(teamName);
    if(dirExist) {
    } else {
        createFolder(teamName);
    }

    // file check
    // let playerFileName = path.join(__dirname, teamName, playerName + ".json");

    let playerFileName = path.join(__dirname, teamName, playerName + ".xlsx");
    let fileExist = checkExistence(playerFileName);
    let playerEntries = [];
    if(fileExist) {
        // append data, site: nodejs.dev

        // let binarydata = fs.readFileSync(playerFileName); // ye file file system se read kari hai, came into RAM
        // parse and convert into JSON format
        // playerEntries = JSON.parse(binarydata);
        // playerEntries.push(playerObject);

        // fs.writeFileSync(playerFileName, JSON.stringify(playerEntries));

        // after adding xlsx module

        let JSONdata = excelReader(playerFileName, playerName);
        playerEntries = JSONdata;
        playerEntries.push(playerObject);
        excelWriter(playerFileName, playerEntries, playerName);
    } else {
        // playerEntries.push(playerObject);
        // file exists ? then overrides the data : create file
        // fs.writeFileSync(playerFileName, JSON.stringify(playerEntries));

        // after adding xlsx module
        playerEntries.push(playerObject);
        excelWriter(playerFileName, playerEntries, playerName);
    }
};

function checkExistence(teamName) {
    return fs.existsSync(teamName);
};

function createFolder(teamName) {
    return fs.mkdirSync(teamName);
};

function excelReader(filePath, name) {
    if(!fs.readFileSync(filePath)) {
        return null;
    } else {
        let wt = xlsx.readFile(filePath);

        // msd ki workbook -> msd ki worksheet
        // get data from workbook
        let excelData = wt.Sheets[name];

        // convert excel format to JSON -> array of objs
        let ans = xlsx.utils.sheet_to_json(excelData);
        // console.log(ans);
        return ans;
    }
}

function excelWriter(filePath, json, name) {
    let newWB = xlsx.utils.book_new();
    // console.log(json);
    let newWS = xlsx.utils.json_to_sheet(json);
    // msd.xlsx -> msd sheet
    xlsx.utils.book_append_sheet(newWB, newWS, name); // workbook name as param
    xlsx.writeFile(newWB, filePath);
}

module.exports = {
    processMatch: processMatch
};
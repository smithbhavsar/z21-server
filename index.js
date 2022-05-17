const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const request = require('request');
const csvtojson = require('csvtojson');
const fs = require('fs');
const { success } = require("./response");
var cors = require('cors');
 
app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
  }));

  const url = 'https://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?tp=2&frmdt=01-Apr-2022&todt=11-Apr-2022'
  const options = {
    method: 'POST',
    json: true,
  }

  //Fetching Data from https://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?tp=2&frmdt=01-Apr-2022&todt=11-Apr-2022 
  //and storing it in Output.json in json format
  app.get('/post',function(req,res){
    request(url, options, (err,resp,body) => {
      const data = body;
      csvtojson({delimiter:[";"], noheader:false})
      .fromString(data)
      .then((csvrow)=>{
        console.log("true");
        fs.writeFile('output.json',JSON.stringify(csvrow),'utf-8',(err)=>{
          if(err){
            console.log(err);
          }
        });
      });
    });
  });

  //Create a GET API to get the top ten fund based on the returns of last 7 days
  app.get('/returns', function(req, res) {
    let result;
    fs.readFile('output.json', 'utf8', function(err, data){
      // Display the file content
      var obj = JSON.parse(data);
      const unique = [...new Map(obj.map(item =>[item['Scheme Code'], item])).values()]
      result = unique.sort((a,b)=> b['Net Asset Value'] - a['Net Asset Value']).slice(2,12)
      res.status(200)
      res.json(success("OK", { data: result}, res.statusCode))
    });
  });

  //Create a GET API to get the top ten fund based on highest standard deviation
  app.get('/standard', function(req, res) {

  });

  app.listen(process.env.PORT || 8080 , () => {console.log("App is listening")} );

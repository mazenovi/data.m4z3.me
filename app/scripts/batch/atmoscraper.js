// http://victorwyee.com/js/webscraping-with-casperjs-phantomjs/
var casper = require('casper').create({
  verbose: true,
  logLevel: 'error',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.2; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.2 Safari/537.36'
  }
});

var utils = require('utils');
var fs = require('fs');

// var url = "http://www.atmoauvergne.asso.fr/fr/mesures/mesures-automatiques-par-station?mesauv_station=034&mesauv_date[date]=#date#&op=Rechercher&form_build_id=form-bhkrvaykzl7nO26cpWrcocjMYi5JSsJcbLJWeKygUUg&form_id=_get_mesures_par_station_formulaire"
var url = "http://www.atmoauvergne.asso.fr/fr/mesures/mesures-automatiques-par-station?mesauv_station=034&mesauv_date[date]=#date#&op=Rechercher"

titles = [
  "Heure GMT (TU)",
  "Dioxyde de soufre (SO2)",
  "Monoxyde d'azote (NO)",
  "Dioxyde d'azote (NO2)", 
  "Monoxyde de carbone (CO/100 - divisé par 100)",
  "Particules en suspension PM10", 
  "Particules en suspension PM2.5",
  "Benzène (C6H6)"
];

var config = require('../../config/atmoscraper.js');

yearFrom = config.starting_year;
monthFrom = 0;
dayFrom = 1;

currentFolder = "./app";
csvFolder = currentFolder + '/csv' ;
//csvFile = csvFolder + '/file.csv' ;
if(!fs.isDirectory(csvFolder)) {
  fs.makeDirectory(csvFolder, 0777, function (err) {
      if (err) {
          console.log(err);
      } else {
          console.log(casper.echo("# csv directory created", "PARAMETER"));
      }
  });
}
else {
  console.log(casper.echo("# csv directory exists", "PARAMETER"));
}

function transpose(a) {
    return Object.keys(a[0]).map(
        function (c) { return a.map(function (r) { return r[c]; }); }
    );
}

// http://stackoverflow.com/questions/4413590/javascript-get-array-of-dates-between-2-dates
Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDatedUrls(startDate, stopDate) {
    var urlArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        var curr_day = currentDate.getDate();
        if(currentDate.getDate() < 10){
        curr_day = "0" + curr_day;
      }
      var curr_month = currentDate.getMonth() + 1;
      if(curr_month < 10){
        curr_month = "0" + (curr_month);
      }
      var curr_year = currentDate.getFullYear();
      var curr_date = curr_day + "%2F" + curr_month + "%2F" + curr_year;
      current_url = url.replace(/#date#/, curr_date );
      urlArray.push( current_url );
        currentDate = currentDate.addDays(1);
    }
    return urlArray;
}

var urls = getDatedUrls(new Date(yearFrom, monthFrom, dayFrom), new Date());

var save_curr_year = 0;

casper.start().each(urls, function(self, current_url) {
  
    self.thenOpen(current_url, function() {

      var curr_date = current_url.match(/.*=(\d+)%2F(\d+)%2F(\d+).*/);
      this.curr_day = curr_date[1];
      this.curr_month = curr_date[2];
      this.curr_year = curr_date[3];
      if(save_curr_year != curr_date[3])
      {
        this.csvFile = csvFolder + '/atmo-' + curr_date[3] + '.csv' ;
        fs.write(this.csvFile, '', 'w');
        fs.write(this.csvFile, titles.join(',') + "\n", 'a');
        save_curr_year = curr_date[3];
      }
  
      utils.dump(this.curr_day + "/" + this.curr_month + "/" + this.curr_year);
    
      var thead_selector = 'table[class="table table-mesures-par-station"] thead tr th';
      var thead_table = this.getElementsInfo(thead_selector);
      var thead_titles = [];  
      for (var i = 0; i < thead_table.length; i++) {
        thead_titles.push(thead_table[i].text); 
      }
      
    var tbody_selector = 'table[class="table table-mesures-par-station"] tbody tr td';
      var tbody_table = this.getElementsInfo(tbody_selector);
      var tbody_data = [];
      for (var i = 0; i < tbody_table.length; i++) {
        index = i % thead_table.length;
        if( Object.prototype.toString.call( tbody_data[index] ) !== '[object Array]' ) {
          tbody_data[index] = [];
        }
        if( index === 0) {
          if(tbody_table[i].text.match(/24h/) === null) {
            tbody_data[index].push(this.curr_year + "/" + this.curr_month +"/" + this.curr_day + " " + tbody_table[i].text.replace("h",":00", "gi"));
          }
          else {
            dayDate = new Date(this.curr_year, this.curr_month-1, this.curr_day);
            nextDayDate = dayDate.addDays(1);
            var next_day_day = nextDayDate.getDate();
            if(nextDayDate.getDate() < 10){
              next_day_day = "0" + next_day_day;
            }
            var next_day_month = nextDayDate.getMonth() + 1;
            if(next_day_month < 10){
              next_day_month = "0" + (next_day_month);
            }
            var next_day_year = nextDayDate.getFullYear();
            tbody_data[index].push(next_day_year + "/" + next_day_month +"/" + next_day_day + " " + tbody_table[i].text.replace("h",":00", "gi").replace("24:00","00:00", "gi")); 
          }
        }
        else {
          if(tbody_table[i].attributes.class == "empty") {
            tbody_data[index].push("0"); 
          }
          else
          {
            tbody_data[index].push(tbody_table[i].text?tbody_table[i].text:"0");
          }
        }
    }

    var full_data = [];
    for (var i = 0; i < titles.length; i++) {
      index_title = thead_titles.indexOf(titles[i]);
      if(index_title > -1) {
        full_data[i] = tbody_data[index_title];
      }
      else {
        full_data[i] = new Array(tbody_data[0].length+1).join('0').split('');
      }     
    }
    data_full = transpose(full_data);
    for (var i = 0; i < data_full.length; i++) {
      fs.write(this.csvFile, data_full[i].join(',') + "\n", 'a');
    }
    
  });
});

casper.run(function() {
  
  console.log("complete with empty value from " + this.curr_day +"/" + this.curr_month +"/" + this.curr_year + " to end of year");

  currentDate = new Date(this.curr_year, this.curr_month, this.curr_day);
  lastDayOfYear = new Date(this.curr_year, 11, 31);
  full_data = [];

  while (currentDate <= lastDayOfYear) {
    var curr_day = currentDate.getDate();
    if(currentDate.getDate() < 10){
      curr_day = "0" + curr_day;
    }
    var curr_month = currentDate.getMonth() + 1;
    if(curr_month < 10){
      curr_month = "0" + (curr_month);
    }
    var curr_year = currentDate.getFullYear();
    for(h=1;h<24;h++)
    {
      tmp = Array(titles.length);
      fs.write(this.csvFile, curr_year + "/" + curr_month +"/" + curr_day + " " + h + ":00" + tmp.join(",0") + "\n", 'a');
    }
    currentDate = currentDate.addDays(1);
  }
  this.exit();
});
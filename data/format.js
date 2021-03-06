const fs = require('fs')

let data = JSON.parse(fs.readFileSync('./violations-unformatted.json'));
let outputArr = [];

let fields = data['Active Out of Compliance System'][0];

data['Active Out of Compliance System'].forEach( (item, index) => {
  if(index > 0) {
    let obj = {};
    for(var key in fields) {
      obj[fields[key]] = item[key];
    }
    outputArr.push(obj)
  }
})

fs.writeFileSync('./violations.json',JSON.stringify(outputArr),'utf8');

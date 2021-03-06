import { updateList } from  './updatelist.js';
import { exportList } from './exportList.js';

let waterSystemId = window.location.search.replace('?id=','');

fetch('data/'+waterSystemId+'.json')
.then(function(response) {
  return response.json();
})
.then(function(systemData) {

  let uniqueSystemData = [];
  systemData.forEach( (item) => {
    let matchFound = false;
    uniqueSystemData.forEach( (existingItem) => {
      if(item.ANALYTE_NAME == existingItem.ANALYTE_NAME && item.VIOL_BEGIN_DATE == existingItem.VIOL_BEGIN_DATE && item.VIOL_END_DATE == existingItem.VIOL_END_DATE) {
        // skip
        // matchFound = true;
      }
    })
    if(!matchFound) {
      uniqueSystemData.push(item);
    }
  })

  // split these by unique analyte
  let uniqueAnalyteMap = new Map();
  uniqueSystemData.forEach( (item) => {
    let foundAnalyte = uniqueAnalyteMap.get(item.ANALYTE_NAME)
    if(typeof(foundAnalyte) == 'undefined') {
      uniqueAnalyteMap.set(item.ANALYTE_NAME,[item]);
    } else {
      updateList(uniqueAnalyteMap,item.ANALYTE_NAME,item);
    }
  })

  let output = `
  <h1>Water System: ${systemData[0].WATER_SYSTEM_NAME}</h1>
  <h2 style="text-align: center; font-weight: 500;">${parseInt(systemData[0].POPULATION).toLocaleString()} People affected</h2>
  <h3 class="erf-align">${systemData[0].CITY}, ${systemData[0].ZIPCODE}</h3>
  <h3 class="erf-align">${systemData[0].COUNTY} COUNTY</h3>
  <h3 class="erf-align">Regulating Agency:  ${systemData[0].REGULATING_AGENCY}</h3>
  <br><br>
  <h3 class="erf-align">The following table(s) show all measurements for all analytes which exceeded allowed levels</h3>
  <br><br>
  <div align="left">
  <button id="export-list">Export Displayed Data</button>
  </div>
  ${Array.from(uniqueAnalyteMap).map((analyte) => {
    return `
      <h2 class="erf-align">${analyte[0]} - ${analyte[1][0].VIOLATION_TYPE_NAME}</h2>
      <table class="violaters system-specific">
      <tr>
        <th class="head">Violation Begin Date</th>
        <th class="head">Violation End Date</th>
        <th class="head">Measured Level</th>
        <th class="head">Allowed Level</th>
        <th class="head">Action</th>
        <th class="head">Absolute Exceedance</th>
        <th class="head">% Exceedance</th>
        <th class="head" style="display:none">Regulating Agency</th>
        <th class="head" style="display:none">Water System #</th>
        <th class="head" style="display:none">Water System Name</th>
        <th class="head" style="display:none">Population</th>
        <th class="head" style="display:none">County</th>
        <th class="head" style="display:none">City</th>
        <th class="head" style="display:none">Zip</th>
        <th class="head" style="display:none">Violation #</th>
        <th class="head" style="display:none">Violation Type Name</th>
        <th class="head" style="display:none">Analyte Name</th>
        <th class="head" style="display:none">Enforcement Action #</th>
        <th class="head" style="display:none">Enforcement Action Issue Date</th>
        </tr>
        <!-- need to loop through all violations -->
        ${uniqueSystemData.map((item) => {
          if(item.ANALYTE_NAME == analyte[0]) {
            var absexc = item.RESULT - item.MCL_VALUE;
            var pctexc = absexc/item.MCL_VALUE*100;
            return `<tr>
              <td>${new Date(item.VIOL_BEGIN_DATE).toLocaleDateString("en-US")}</td>
              <td>${new Date(item.VIOL_END_DATE).toLocaleDateString("en-US")}</td>
              <td>${item.RESULT} ${item.RESULT_UOM}</td>
              <td>${item.MCL_VALUE} ${item.MCL_UOM}</td>
              <td>${item.ENF_ACTION_TYPE_ISSUED} ${new Date(item.ENF_ACTION_ISSUE_DATE).toLocaleDateString("en-US")}</td>
              <td>${absexc.toFixed(3) + " " + item.MCL_UOM}</td>
              <td>${pctexc.toFixed(2)}</td>
              <td style="display:none">${item.REGULATING_AGENCY}</td>
              <td style="display:none">${item.WATER_SYSTEM_NUMBER}</td>
              <td style="display:none">${item.WATER_SYSTEM_NAME}</td>
              <td style="display:none">${item.POPULATION}</td>
              <td style="display:none">${item.COUNTY}</td>
              <td style="display:none">${item.CITY}</td>
              <td style="display:none">${item.ZIPCODE}</td>
              <td style="display:none">${item.VIOLATION_NUMBER}</td>
              <td style="display:none">${item.VIOLATION_TYPE_NAME}</td>
              <td style="display:none">${item.ANALYTE_NAME}</td>
              <td style="display:none">${item.ENF_ACTION_NUMBER}</td>
              <td style="display:none">${item.ENF_ACTION_ISSUE_DATE}</td>
              </tr>
            `;
          }
        }).join(' ')}
      </table>
    `
  }).join(' ')}
  `;

  document.querySelector('.system-history').innerHTML = output;

    document.getElementById("export-list").addEventListener("click", function() {
      exportList(document.querySelectorAll('table tr'));

  })
})
/*
ANALYTE_NAME: "1,2,3-TRICHLOROPROPANE"
CITY: "DEL REY"
CLASSIFICATION: "COMMUNITY"
COUNTY: "FRESNO"
ENF_ACTION_ISSUE_DATE: "2018-05-18"
ENF_ACTION_NUMBER: "9511008"
ENF_ACTION_TYPE_ISSUED: "CA STATE ACTION ISSUED"
MCL: "0.005 UG/L"
POPULATION: "1500"
REGULATING_AGENCY: "DISTRICT 23 - FRESNO"
RESULT: "0.006 UG/L"
SERVICE_CONNECTIONS: "328"
VIOLATION_NUMBER: "9111005"
VIOLATION_TYPE_NAME: "STATE PRIMARY MCL VIOL - NOT CR6"
VIOL_BEGIN_DATE: "2018-04-01"
VIOL_END_DATE: "2018-06-30"
WATER_SYSTEM_NAME: "DEL REY COMMUNITY SERV DIST"
WATER_SYSTEM_NUMBER: "CA1010035"
ZIPCODE: "93616"*/

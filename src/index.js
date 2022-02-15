import * as d3 from "d3";
let data = require('json-loader!../annotatedData.geojson');
import Legend from './legend.js';
import * as Inputs from "@observablehq/inputs";

import Highcharts from 'highcharts';
import Exporting from 'highcharts/modules/exporting';
Exporting(Highcharts);

let width = 800;
let height = width/2;
let chart;

let yearSelect = Inputs.select(["2010","2011","2012","2013","2014","total"], {label:"Period",value:"total"})
document.querySelector("#app").append(yearSelect);

function handlePeriodChange(e) {
  e.preventDefault();
  let target = e.target;
  let selectedOption = target.options[target.value].text;
  let g = d3.select("#dc-neighborhoods");
  g.selectAll(".neighborhood")
    .attr('fill', d => {
      let accidentCount = d.properties[selectedOption];
      return myColor(accidentCount?accidentCount:0);
    })
}

yearSelect.querySelector("select").onchange = handlePeriodChange;

const equiProjection = d3.geoAlbersUsa()
  .fitExtent([[0,0],[width, height]], data);
const path = d3.geoPath().projection(equiProjection);

// Adds legend
let legendSvg = d3.select("#app")
  .append("svg")
  .attr("style","display:block")
  .attr("id", "legend")
  .attr("width", 300)
  .attr("height",50);

const accidentSpread = d3.extent(data.features, (d) => d.properties.total);
const myColor = d3.scaleQuantize(accidentSpread, ["#93c3df","#4b97c9","#1864aa","#08306b"]);
legendSvg.append("g")
  .attr("name", "legend")
  .append(() => Legend(myColor, { title: "Accident count" }));

// Adds incidents
let incidentsSvg = d3.select("#app")
  .append("svg")
  .attr("id", "incidents")
  .attr("width", width)
  .attr("height", height);

incidentsSvg.append("g")
  .attr("id","dc-neighborhoods")
  .selectAll("path")
  .data(data.features)
  .join('path')
  .attr('class',"neighborhood")
  .attr('fill', d => myColor(d.properties.total ? d.properties.total:0))
  .attr('stroke-width',0.2)
  .attr('stroke',"white")
  .attr('cursor',"pointer")
  .attr("d", path)
  .on('click',handleNeighbordClick)
  .append("title")
  .text(d => d.properties.name);

function handleNeighbordClick(e,d) {
  e.preventDefault();

  let neighborhoodName = d.properties.name;
  let values = [
    d.properties["2010"]||0,
    d.properties["2011"]||0,
    d.properties["2012"]||0,
    d.properties["/Applications 2013"]||0,
    d.properties["2014"]||0
  ];
  let seriesData = [{
    name: neighborhoodName,
    data: values
  }];
  let titleData = {
    text: `Incidents in ${neighborhoodName}`
  };

  if(!chart) {
    chart = Highcharts.chart('app2', {
      chart: {
        type: 'column'
      },
      title: titleData,
      xAxis: {
        categories: ['2010', '2011', '2012','2013','2014']
      },
      yAxis: {
        title: {
          text: 'Incident count'
        }
      },
      series: seriesData,
    })
    return;
  }

  debugger;
  chart.series[0].update(seriesData[0]);
  chart.title.update(titleData);
  return;
}

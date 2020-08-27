///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// fix tooltip position
// details = full details and variable descriptions
// add legend: https://data-map-d3.readthedocs.io/en/latest/steps/step_14.html#legend
// voronoi hover
// bouncy force
// transitions: https://github.com/veltman/flubber
// steps
// ripoff: https://www.bloomberg.com/graphics/2015-auto-sales/
// embed: symbolTriangle

// done
// dropdown: ("add buttons") https://blocks.roadtolarissa.com/1wheel/46874895034f5bded13c97097bf25a83
// "simple" dropdown: https://bl.ocks.org/ProQuestionAsker/8382f70af7f4a7355827c6dc4ee8817d

///////////////////////////////////////////////////////////////////////////
//////////////////////////// libs /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
import {
	select,
	extent,
	scaleLinear,
	// scaleBand,
	scaleOrdinal,
	// timeFormat,
	// axisLeft,
	axisBottom,
	format,
	forceSimulation,
	forceX,
	forceY,
	forceCollide,
	nest,
	range,
	map,
	symbol,
	symbolTriangle,
	scale,
	mouse,
	schemeCategory10
} from "d3";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

// import _ from "lodash";
import { split, forEach, chain, sortBy, constant, times, concat } from "lodash";

// import mustache
// import { Mustache } from "mustache";
const Mustache = require("mustache");
// const map = require("d3");

// import d3-legend
// import legendColor from "d3-legend.min.js";
// import {
// 	legendColor
// } from "./d3-legend.min.js";
// const legendColor = require("../lib/d3-legend.min.js");
// const legendColor = require("lib/d3-legend");
// const legendColor = require("../js/d3-legend.min.js");

///////////////////////////////////////////////////////////////////////////
//////////////////////////// globals //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const colorsCat = [
	"#113655",
	"#f28c00",
	"#3f8ca5",
	"#fab85f",
	"#99d4e3",
	"#fed061"
];

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dropdown //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var currentKey = "";

select("#dropdown").on("change", function (a) {
	// Change the current key and call the function to update the colors.
	currentKey = select(this).property("value");
	dotsUpdate();
});

window.onresize = legendUpdate;

///////////////////////////////////////////////////////////////////////////
//////////////////////////// svg //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var width = 1200,
	height = 300,
	radius = 20,
	margin = { top: 20, right: 20, bottom: 20, left: 120 };

var data;

// template
var template = select("#template").html();
Mustache.parse(template);

// containers
const svg = select("#chart") // id chart
	.append("svg")
	.attr("preserveAspectRatio", "xMidYMid")
	.attr("viewBox", [0, 0, width, height]);
// .attr("viewBox", "0 0 " + width + " " + height);
// .attr("width", [margin.left, width - margin.right])
// .attr("height", [0, height - margin.bottom])
// .attr("viewBox", [-200, 0, width * 1.2, height])
// .style("overflow", "visible");

var dots = svg.append("g").attr("class", "dots");

var tooltip = select("#chart").append("div").attr("class", "tooltip hidden");

// var dataById = map();

// scales
var xScale = scaleLinear().range([margin.left, width - margin.right]);

// var colorScale = scaleOrdinal(colorsCat);
var colorScale = scaleOrdinal().range(colorsCat);
// var colorScale = scale.colorsCat;
// console.log(colorScale([1, 2, 3]));

var formatAxis = format(".4r");

// const svgDetails = select("#details")
// 	.append("svg")
// 	.attr("viewBox", [width * 0.8, 0, width, height]);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// legend ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var legendSvg = select("#legend")
	.append("svg")
	.attr("width", "100%")
	.attr("height", "44");

var legend = legendSvg.append("g").attr("class", "legend");

legend
	.selectAll("circle")
	.data(colorScale.range())
	.enter()
	.append("circle")
	.attr("cx", 50)
	.attr("cy", 10)
	.attr("r", radius / 2)
	// .attr("width", 18)
	// .attr("height", 18)
	.style("fill", colorScale)
	.attr("transform", function (d, i) {
		return "translate(" + (i * width) / 8 + ",20)";
	});

legend
	.selectAll("text")
	.data(colorScale.domain())
	.enter()
	.append("text")
	.attr("x", 70)
	.attr("y", 9)
	.attr("dy", ".35em")
	.style("text-anchor", "start")
	.attr("transform", function (d, i) {
		return "translate(" + (i * width) / 8 + ",20)";
	});

// var legend = legendSvg.append("g").attr("class", "legend");

function legendUpdate() {
	var dataUnique = chain(data)
		.map((d) => d[currentKey])
		.uniq()
		.value();

	// fill unused domain slots with empty string
	if (dataUnique.length < 6) {
		var l = dataUnique.length;
		var m = 6 - l;
		var p = times(m, constant(" "));
		dataUnique = concat(dataUnique, p);
		// console.log(concat(dataUnique, p));
	}

	console.log(dataUnique);

	colorScale.domain(dataUnique);
	// console.log(colorScale.domain());

	legend
		.selectAll("circle")
		.data(colorScale.range())
		.style("fill", colorScale.range());

	legend
		.selectAll("text")
		.data(colorScale.domain())
		// .enter()
		.text(function (d) {
			return d;
		});
}

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

csv("data/EUISS Database.csv", (d) => {
	return {
		id: d.CPI_CODE,
		name: d.Name,
		startYear: +d.Start_year,
		startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
		endYear: +d.End_year,
		endLabel: d.end_day + "-" + d.End_month + "-" + d.End_year,
		attacker_jurisdiction: d.Attack_jurisdiction,
		target_jurisdiction: d.Target_jurisdiction,
		us_me: d.US_military_effects,
		military: d.Ongoing_military_confrontation,
		command: d.Attack_cyber_command.trim(),
		sector_i: d.Target_CI_sector.trim(),
		sector_ii: d.Target_CI_sector_II.trim(),
		sector_iii: d.Target_CI_sector_III.trim(),
		dyad_from: split(d.Dyad, "-")[0],
		dyad_to: split(d.Dyad, "-")[1]
	};
}).then(function (d) {
	// stuxnet fix
	data = forEach(d, function (value) {
		value.startYear = value.name === "Stuxnet" ? 2010 : value.startYear;
	});

	// console.log(data);

	// scales
	xScale.domain(
		extent(data, (d) => {
			return d.startYear;
		})
	);

	// axes
	const xAxis = axisBottom().scale(xScale).tickFormat(formatAxis);

	svg
		.append("g")
		.classed("x-axis", true)
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	// force simulation for beeswarm
	var simulation = forceSimulation(data)
		.force(
			"x",
			forceX(function (d) {
				return xScale(d.startYear);
			}).strength(0.99)
		)
		.force("y", forceY(height / 2).strength(0.05))
		.force("collide", forceCollide(radius))
		.stop();

	for (var i = 0; i < data.length * 2; ++i) simulation.tick();

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	dots
		.selectAll(".dots")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "dots")
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.attr("r", radius)
		// .attr("fill", "#eee")
		.on("mouseover", showTooltip)
		.on("mouseout", hideTooltip)
		.on("click", showDetails);

	dotsUpdate();
});

///////////////////////////////////////////////////////////////////////////
//////////////////////////// update ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function dotsUpdate() {
	var dataUnique = chain(data)
		.map((d) => d[currentKey])
		.uniq()
		.value();
	// console.log(dataUnique);
	// console.log(currentKey);

	colorScale.domain(dataUnique);

	// xScale.domain(
	// 	extent(data, (d) => {
	// 		return d.startYear;
	// 	})
	// );

	data = sortBy(data, currentKey);
	// data = sortBy(data,  d => d.id);
	// console.log(data);

	dots
		.selectAll(".dots")
		.transition()
		.duration(500)
		// .ease("easeCubic")
		.attr("fill", (d) => colorScale(d[currentKey]));
	// .attr("class", colorScale(data.map((d) => d[currentKey])));
	// function (d) {
	// return colorScale(getValueOfData(dataById.id));
	// return colorScale(getValueOfData(dataById[getIdOfFeature(f)]));
	// 	return ;
	// });

	// console.log(data.map(d => d[currentKey]));

	legendUpdate();
}

///////////////////////////////////////////////////////////////////////////
//////////////////////////// details //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function showDetails(f) {
	var detailsHtml = Mustache.render(template, f);
	// Hide the initial container.
	select("#initial").classed("hidden", true);
	// Put the HTML output in the details container and show (unhide) it.
	select("#details").html(detailsHtml);
	select("#details").classed("hidden", false);
}

function hideDetails() {
	// Hide the details
	select("#details").classed("hidden", true);
	// Show the initial content
	select("#initial").classed("hidden", false);
}

// update
// function updateChart() {
// 	// anything to filter, key, pick?
// 	dots
// }

// Handler for dropdown value change
// var dropdownChange = function () {
// 	var newValue = select(this).property("value"),
// 		newData = valueMap[newValue];

// 	update(newData);
// };

// Get names of cereals, for dropdown
// var value = Object.keys(valueMap).sort();

// var dropdown = select("#graph")
// 	.insert("select", "svg")
// 	.on("change", dropdownChange);

// dropdown
// 	.selectAll("option")
// 	.data(data)
// 	.enter()
// 	.append("option")
// 	.attr("value", function (d) {
// 		return d;
// 	})
// 	.text(function (d) {
// 		return d[0].toUpperCase() + d.slice(1, d.length); // capitalize 1st letter
// 	});

// var initialData = dataMap[data[0]];
// update(data);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// tooltip //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// from https://github.com/lvonlanthen/data-map-d3/blob/step-12/map.js

function showTooltip(d) {
	// var mousepos = mouse(select("#chart").node());
	var mousepos = mouse(select("#chart").node()).map((d) => parseInt(d));
	// var widthInner = window.innerWidth;
	// var heightInner = window.innerHeight;
	// var heightBound = select("#chart").node().getBoundingClientRect().height;
	// var widthBound = select("#chart").node().getBoundingClientRect().width;
	// console.log(widthBound, heightBound);

	// var left = Math.min(width - 4 * d.name.length, mousepos[0] + 5);
	// var left = mousepos[0];
	// var top = mousepos[1];
	// var top = mousepos[1] - 200;

	tooltip
		.classed("hidden", false)
		// .attr("style", "left:" + left + "px; top:" + top + "px")
		// .style("top", mouse(this)[1] + "px")
		// .style("left", mouse(this)[0] + "px")
		// .style("top", "50px")
		.attr(
			"transform",
			"translate(" + (mousepos[0] - 150) + "," + (mousepos[1] + 310) + ")"
		)
		.html(d.name);
	// console.log(left, top);
	// console.log(d.name)
}

function hideTooltip() {
	tooltip.classed("hidden", true);
}

///////////////////////////////////////////////////////////////////////////
//////////////////////////// helpers //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function getValueOfData(d) {
	// return +d[currentKey];
	return d[currentKey];
}

function getIdOfFeature(f) {
	return f.id;
	// return f.properties.GMDNR;
}

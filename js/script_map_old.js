///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// fix tooltip position
// details = full details and variable descriptions
// add legend: https://data-map-d3.readthedocs.io/en/latest/steps/step_14.html#legend
// voronoi hover
// transitions: https://github.com/veltman/flubber
// steps
// ripoff: https://www.bloomberg.com/graphics/2015-auto-sales/
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
	scaleBand,
	scaleOrdinal,
	// timeFormat,
	axisLeft,
	axisBottom,
	format,
	forceSimulation,
	forceX,
	forceY,
	forceCollide,
	nest,
	mouse
} from "d3";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

// import mustache
import { Mustache } from "mustache";

// import d3-legend as d3-legend from "d3-legend";
// import { legendColor } from "d3-legend";

// import _ from "lodash";
import { split, forEach, chain, trim, pick, sortBy } from "lodash";

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

const colorsSeq = [
	"#113655",
	"#245b78",
	"#3f8ca5",
	"#68c4d8",
	"#99d4e3",
	"#c0e3ed",
	"#e1f1f7",
	"#fed061",
	"#fab85f",
	"#f28c00"
];

const dropdownValues = [
	"attacker_jurisdiction",
	"target_jurisdiction",
	"us_me",
	"command",
	"military"
];

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dropdown //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var currentKey = "";

// window.onresize = updateLegend;

select("#dropdown").on("change", function (a) {
	// Change the current key and call the function to update the colors.
	currentKey = select(this).property("value");
	dotsUpdate();
});

// window.onresize = updateLegend;

///////////////////////////////////////////////////////////////////////////
//////////////////////////// svg //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var width = 1200,
	height = 300,
	radius = 15,
	margin = { top: 20, right: 20, bottom: 20, left: 120 };

var data;

// containers
const svg = select("#chart") // id app
	.append("svg")
	.attr("preserveAspectRatio", "xMidYMid")
	.attr("viewBox", [0, 0, width, height]);
// .attr("viewBox", [-200, 0, width * 1.2, height])
// .style("overflow", "visible");

var dots = svg.append("g").attr("class", "dotcolors");

var tooltip = select("#chart").append("div").attr("class", "tooltip hidden");

// scales
var xScale = scaleLinear().range([margin.left, width - margin.right]);

var colorScale = scaleOrdinal().range(colorsCat);

var formatAxis = format(".4r");

const svgDetails = select("#details")
	.append("svg")
	.attr("viewBox", [width * 0.8, 0, width, height]);

///////////////////////////////////////////////////////////////////////////
//////////////////////////// legend ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// // For the legend, we prepare a very simple linear scale. Domain and
// // range will be set later as they depend on the data currently shown.
// var legendX = d3.scale.linear();

// // We use the scale to define an axis. The tickvalues will be set later
// // as they also depend on the data.
// var legendXAxis = d3.svg.axis()
//   .scale(legendX)
//   .orient("bottom")
//   .tickSize(13)
//   .tickFormat(function(d) {
//     return formatNumber(d);
//   });

// // We create an SVG element in the legend container and give it some
// // dimensions.
// var legendSvg = d3.select('#legend').append('svg')
//   .attr('width', '100%')
//   .attr('height', '44');

// // To this SVG element, we add a <g> element which will hold all of our
// // legend entries.
// var g = legendSvg.append('g')
//     .attr("class", "legend-key YlGnBu")
//     .attr("transform", "translate(" + 20 + "," + 20 + ")");

// // We add a <rect> element for each quantize category. The width and
// // color of the rectangles will be set later.
// g.selectAll("rect")
//     .data(quantize.range().map(function(d) {
//       return quantize.invertExtent(d);
//     }))
//   .enter().append("rect");

// // We add a <text> element acting as the caption of the legend. The text
// // will be set later.
// g.append("text")
//     .attr("class", "caption")
// 		.attr("y", -6)

// function updateLegend() {

//   // We determine the width of the legend. It is based on the width of
//   // the map minus some spacing left and right.
//   var legendWidth = d3.select('#map').node().getBoundingClientRect().width - 50;

//   // We determine the domain of the quantize scale which will be used as
//   // tick values. We cannot directly use the scale via quantize.scale()
//   // as this returns only the minimum and maximum values but we need all
//   // the steps of the scale. The range() function returns all categories
//   // and we need to map the category values (q0-9, ..., q8-9) to the
//   // number values. To do this, we can use invertExtent().
//   var legendDomain = quantize.range().map(function(d) {
//     var r = quantize.invertExtent(d);
//     return r[1];
//   });
//   // Since we always only took the upper limit of the category, we also
//   // need to add the lower limit of the very first category to the top
//   // of the domain.
//   legendDomain.unshift(quantize.domain()[0]);

//   // On smaller screens, there is not enough room to show all 10
//   // category values. In this case, we add a filter leaving only every
//   // third value of the domain.
//   if (legendWidth < 400) {
//     legendDomain = legendDomain.filter(function(d, i) {
//       return i % 3 == 0;
//     });
//   }

// // We set the domain and range for the x scale of the legend. The
//   // domain is the same as for the quantize scale and the range takes up
//   // all the space available to draw the legend.
//   legendX
//     .domain(quantize.domain())
//     .range([0, legendWidth]);

//   // We update the rectangles by (re)defining their position and width
//   // (both based on the legend scale) and setting the correct class.
//   g.selectAll("rect")
//     .data(quantize.range().map(function(d) {
//       return quantize.invertExtent(d);
//     }))
//     .attr("height", 8)
//     .attr("x", function(d) { return legendX(d[0]); })
//     .attr("width", function(d) { return legendX(d[1]) - legendX(d[0]); })
//     .attr('class', function(d, i) {
//       return quantize.range()[i];
//     });

//   // We update the legend caption. To do this, we take the text of the
//   // currently selected dropdown option.
//   var keyDropdown = d3.select('#select-key').node();
//   var selectedOption = keyDropdown.options[keyDropdown.selectedIndex];
//   g.selectAll('text.caption')
//     .text(selectedOption.text);

//   // We set the calculated domain as tickValues for the legend axis.
//   legendXAxis
//     .tickValues(legendDomain)

//   // We call the axis to draw the axis.
//   g.call(legendXAxis);
// }

const svgLegend = select("#legend")
	.append("svg")
	.attr("width", "100%")
	.attr("height", "50");
// svg.append("g")
// .attr("class", "legend")
// .attr("viewBox", [width * 0.2, 0, width * 0.8, height / 2]);
// .attr("transform", "translate(50,30)");

var groupLegend = svgLegend
	.append("g")
	.attr("class", "legend-key")
	.attr("transform", "translate(" + 20 + "," + 20 + ")");

groupLegend.append("circle").data(colorsCat).enter().append("circle");

groupLegend.append("text").attr("class", "legend-caption").attr("y", -6);

function legendUpdate() {
	var legendWidth = 0.8 * width;
	// var legendxScale = domain().range([0, legendWdith])
	var dataUnique = chain(data)
		.map((d) => d[currentKey])
		.uniq()
		.value();

	// console.log(dataUnique);

	var legendxScale = scaleOrdinal()
		.range([margin.left, width - margin.right])
		.domain(dataUnique);
	// console.log(legendxScale(dataUnique));

	groupLegend
		.selectAll("circle")
		.data(dataUnique)
		.attr("cx", (d) => legendxScale(d))
		.attr("cy", "10")
		.attr("r", radius)
		.attr("fill", (d) => colorScale(dataUnique));
}

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// var dataById = d3.map();

// var chartFeatures = svg.append("g");

// var legendBox = d3.legendColor().scale(colorScale);

const url = "data/EUISS Database.csv";

csv(url, (d) => {
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

	// nesting and keying
	// var nested = nest()
	// 	.key((d) => d.id)
	// 	.rollup((d) => d[0])
	// 	.map(data);
	// console.log(nest);

	//// unique values
	const dataAttacker = chain(data)
		.map((d) => d.attacker_jurisdiction)
		.uniq()
		.value();

	//// unique types
	const dataType = chain(data)
		.map((d) => d.us_me)
		.uniq()
		.value();

	// scales
	xScale = xScale.domain(
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
		.attr("r", radius)
		.attr("fill", "#eee")
		.on("mousemove", showTooltip)
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

	data = sortBy(data, currentKey);
	// console.log(data);

	dots
		.selectAll(".dots")
		.attr("cx", (d) => d.x)
		.attr("cy", (d) => d.y)
		.transition()
		.duration(500)
		// .ease("easeCubic")
		.attr("fill", (d) => colorScale(d[currentKey]));

	legendUpdate();
}

// little helpers

///////////////////////////////////////////////////////////////////////////
//////////////////////////// tooltip //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// from https://github.com/lvonlanthen/data-map-d3/blob/step-12/map.js

function showTooltip(d) {
	// var mousepos = mouse(select("#chart").node()).map((d) => parseInt(d));

	// var left = Math.min(width - 4 * d.name.length, mouse[0] + 5);
	// var top = mouse[1] + 25;

	// var left = Math.min(width - 4 * d.name.length, mouse[0] + 5);
	// var top = mouse[1] + 25;

	// Get the current mouse position (as integer)
	var mousepos = mouse(select("#chart").node()).map((d) => parseInt(d));

	// var svgobj = document.querySelector('svg');
	var widthInner = window.innerWidth;

	// Calculate the absolute left and top offsets of the tooltip. If the
	// mouse is close to the right border of the map, show the tooltip on
	// the left.
	var left = mousepos[0];
	// var left = Math.min(width - 4 * d.name.length, mousepos[0] - 25);
	var top = mousepos[1] + Math.sqrt(widthInner) + 280;
	// var top = mousepos[1] + 650;

	tooltip
		.classed("hidden", false)
		.attr("style", "left:100px")
		.attr("style", "left:" + left + "px; top:" + top + "px")
		.html(d.name);
	// .attr("style", "left:" + left + "px; top:" + top + "px")
	// .attr("style", "left:" + (width - 500) + "px")
	// .attr("style", "top:0px")
	// tooltip text
	// select(".tooltip h2").text(d.name);
	// select(".tooltip .date").text("from " + d.startLabel + " to " + d.endLabel);
	// select(".tooltip .type").text("type: " + d.us_me);
	// select(".tooltip .attacker").text("attacker: " + d.attacker_jurisdiction);
	// select(".tooltip .target").text("target: " + d.name);
}

function hideTooltip() {
	tooltip.classed("hidden", true);
}

///////////////////////////////////////////////////////////////////////////
//////////////////////////// helpers //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
//////////////////////////// details //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

function showDetails(d) {
	// Get the ID of the feature.
	// var id = getIdOfFeature(f);
	// Use the ID to get the data entry.
	// var d = dataById[id];
	// Render the Mustache template with the data object and put the
	// resulting HTML output in the details container.
	// var detailsHtml = Mustache.render(template, d);
	// Hide the initial container.
	// d3.select('#initial').classed("hidden", true);
	// Put the HTML output in the details container and show (unhide) it.
	// d3.select('#details').html(detailsHtml);
	// d3.select('#details').classed("hidden", false);
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

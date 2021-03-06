///////////////////////////////////////////////////////////////////////////
//////////////////////////// to do ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// binned beeswarm https://bl.ocks.org/Kcnarf/277bf4ac0c5a91a0be08be5dc23115c7
// legend
// linerange (d3.line x.begin x.end?!)...
// dropdown selection
// load data at end as global var after plot function

///////////////////////////////////////////////////////////////////////////
//////////////////////////// dependencies /////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// import * as d3 from "d3";
import {
	select,
	extent,
	scaleLinear,
	timeFormat,
	timeYear,
	scaleBand,
	scaleOrdinal,
	line as _line,
	curveBasis,
	axisBottom,
	axisLeft,
	format,
	forceSimulation,
	forceX,
	forceY,
	forceCollide
} from "d3";

// import _ from "lodash";
// Load the core build.
import { filter, chain, replace } from "lodash";

// import fetch as d3-fetch from "d3-fetch";
import { csv } from "d3-fetch";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// Set up svg ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////

const width = 1200;
const height = 300;
const radius = 15;
const margin = { top: 20, right: 20, bottom: 20, left: 120 };
const svg = select("#timeline_usme") // id app
	.append("svg")
	// .attr("width", width)
	// .attr("height", height)
	.attr("viewBox", [0, 0, width, height])
	// .attr("viewBox", [-width / 2, -height / 2, width, height])
	.style("overflow", "visible");

const colorsType = [
	"#d82739",
	"#5ebfbc",
	"#f28c00",
	"#113655",
	"#3C1438",
	"#53A2BE"
];

// const t = d3.transition().duration(1500);

const url =
	// "https://docs.google.com/spreadsheets/d/e/2PACX-1vS_852u619EmtHZE3p4sq7ZXwfrtxhOc1IlldXIu7z43OFVTtVZ1A577RbfgZEnzVhM_X0rnkGzxytz/pub?gid=0&single=true&output=csv";
	"data/EUISS Database.csv";

///////////////////////////////////////////////////////////////////////////
//////////////////////////// data /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

csv(url, (d) => {
	// console.log(d);
	return {
		id: d.CPI_CODE,
		name: d.Name,
		start: new Date(+d.Start_year, +d.Start_month - 1, +d.Start_day),
		startYear: +d.Start_year,
		startFix: new Date(
			+d.Start_year,
			+d.Start_month - 1,
			replace(d.Start_day, "unknown", 1)
		),
		startLabel: d.Start_day + "-" + d.Start_month + "-" + d.Start_year,
		end: new Date(+d.End_year, +d.End_month, +d.end_day),
		endYear: +d.End_year,
		endFix: new Date(
			+d.End_year,
			+d.End_month - 1,
			replace(d.End_day, "unknown", 1)
		),
		endLabel: d.end_day + "-" + d.End_month + "-" + d.End_year,
		report: new Date(+d.Report_year, +d.Report_month, +d.Report_day),
		attacker_jurisdiction: d.Attacker_jurisdiction,
		target_jurisdiction: d.Target_jurisdiction,
		victim_jurisdiction: d.Victim_jurisdiction,
		us_me: d.US_military_effects
	};
}).then(function (data) {
	// console.log(data);
	// data = _.head(data);

	// crappy stuxnet fix
	data[3].startYear = 2010;

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// data table ///////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// new time formats for tooltip
	var formatDate = timeFormat("%d %b %Y");
	// console.log(data);

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// scales ///////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	const xScale = scaleLinear()
		.domain(
			extent(data, (d) => {
				return d.startYear;
			})
		)
		.range([margin.left, width - margin.right]);

	// y - attackers (by jurisdiction)
	//// unique attackers
	const dataAttacker = chain(data)
		.map((d) => d.attacker_jurisdiction)
		.uniq()
		.value();
	// console.log(dataAttacker);

	const yScale = scaleBand()
		.domain(dataAttacker)
		.range([height - margin.bottom, margin.top]);

	var simulation = forceSimulation(data)
		.force(
			"x",
			forceX(function (d) {
				return xScale(d.startYear);
			}).strength(0.935)
		)
		.force(
			"y",
			forceY(function (d) {
				return yScale(d.attacker_jurisdiction);
			}).strength(0.99)
		)
		.force("collide", forceCollide(radius))
		.stop();

	for (var i = 0; i < 10; ++i) simulation.tick();

	// fix y-coordinate for exact data-based encoding/positioning
	data.forEach(function (d) {
		d.fy = yScale(d.attacker_jurisdiction);
	});

	// checking whether it computed correctly
	// console.log(yScale.domain(), yScale.range());

	// color - types of attacks (US M+D)
	//// unique types
	const dataType = chain(data)
		.map((d) => d.us_me)
		.uniq()
		.value();
	// console.log(dataType);

	const colorScale = scaleOrdinal().domain(dataType).range(colorsType);
	// checking whether it computed correctly
	// console.log(colorScale.domain(), colorScale.range());

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// plot /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	// lines
	// var line = _line()
	// 	.curve(curveBasis)
	// 	.x((d) => xScale(d.startYear))
	// 	.y((d) => yScale(d.attacker_jurisdiction));

	// var linerange = svg
	// 	.selectAll("path.linerange")
	// 	.data(data)
	// 	.enter()
	// 	.append("g")
	// 	.attr("class", "linerange");

	// linerange
	// 	.append("path")
	// 	.attr("d", function (d) {
	// 		return line(d.attacker_jurisdiction);
	// 	})
	// 	.attr("id", (d) => d.attacker_jurisdiction);

	// labels
	// const labels = svg
	// 	.selectAll("label")
	// 	.data(data)
	// 	.enter()
	// 	.append("text")
	// 	.classed("label", true)
	// 	.text((d) => d.name)
	// 	.attr("x", (d) => xScale(d.startYear) + radius)
	// 	.attr("y", (d) => yScale(d.attacker_jurisdiction) + 15);

	// dots
	const dots = svg
		.selectAll("dots")
		.data(data)
		.enter()
		.append("circle")
		.attr("class", "dots")
		.attr("r", radius)
		.attr("cx", (d) => d.x)
		// y position needs some adjusting. why???
		.attr("cy", (d) => d.y)
		.attr("fill", (d) => colorScale(d.us_me))
		// tooltip
		.on("mouseover", (d, i) => {
			const mouseX = event.pageX;
			const mouseY = event.pageY;
			select(".tooltip")
				.style("left", mouseX + "px")
				.style("top", mouseY - 28 + "px")
				.style("opacity", 0)
				.transition()
				.duration(100)
				.style("visibility", "visible")
				.style("opacity", 1)
				.style("left", mouseX + "px")
				.style("top", mouseY - 28 + "px");
			// console.log(d);
			// name
			select(".tooltip h2").text(d.name);
			// date
			select(".tooltip .date").text(
				"from " + d.startLabel + " to " + d.endLabel
			);
			// name
			select(".tooltip .type").text("type: " + d.us_me);
			// attacker
			select(".tooltip .attacker").text("attacker: " + d.attacker_jurisdiction);
			// victim
			select(".tooltip .target").text("target: " + d.name);
		})
		.on("mouseout", function (d) {
			select(".tooltip").style("visibility", "hidden");
		});

	var legend = svg
		.selectAll(".legend")
		.data(colorScale.domain())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function (d, i) {
			return "translate(0," + i * 20 + ")";
		});

	legend
		.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", colorScale);

	legend
		.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function (d) {
			return d;
		});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// axes /////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var formatAxis = format(".4r");

	// axes
	const xAxis = axisBottom().scale(xScale).tickFormat(formatAxis);
	const yAxis = axisLeft().scale(yScale).tickSize(-width, width);

	svg
		.append("g")
		.classed("x-axis", true)
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);

	svg
		.append("g")
		.classed("y-axis", true)
		.attr("transform", `translate(${margin.left}, 0)`) // no transformation in x, but in y
		.call(yAxis)
		.select(".domain") // axis line is classed as .domain by default (check html); created by .call() above, .remove() after will drop it
		.remove();
});

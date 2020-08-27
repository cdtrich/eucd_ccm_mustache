var legendSvg = select("#legend")
	.append("svg")
	.attr("width", "100%")
	.attr("height", "50");

var groupLegend = legendSvg
	.append("g")
	.attr("class", "legend-key colors")
	.attr("transform", "translate(" + 20 + "," + 20 + ")");

// returns CSS class names for colors
groupLegend
	.selectAll("rect")
	.data(colorScale.range().map((d) => colorScale(extent(d).reverse())))
	.enter()
	.append("rect");

groupLegend.append("text").attr("class", "caption").attr("y", -6);

function legendUpdate() {
	var legendWidth = select("#chart").node().getBoundingClientRect().width - 50;

	var dataUnique = chain(data)
		.map((d) => d[currentKey])
		.uniq()
		.value();
	// console.log(dataUnique);

	var legendxScale = scaleOrdinal()
		.range([margin.left, width - margin.right])
		.domain(dataUnique);
	// console.log(legendxScale(dataUnique));

	legendxScale.domain(dataUnique).range([0, legendWidth]);

	groupLegend
		.selectAll("rect")
		// .data(dataUnique)
		.data(colorScale.range().map((d) => colorScale(extent(d).reverse())))
		.attr("height", 8)
		.attr("x", (d) => legendxScale(d[0]))
		.attr("width", (d) => legendxScale(d[1]) - legendxScale(d[0]))
		.attr("class", (d, i) => colorScale.range()[i]);
	// .attr("r", radius)
	// .attr("fill", (d) => colorScale(dataUnique));

	console.log((d) => "x " + legendxScale(d[0]));
	console.log((d) => "width " + legendxScale(d[1]) - legendxScale(d[0]));
}

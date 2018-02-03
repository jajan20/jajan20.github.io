// Build with the help of some online tutorials
// http://zeroviscosity.com/category/d3-js-step-by-step
// http://www.cagrimmett.com/til/2016/08/24/d3-pie-chart-update.html
// https://bost.ocks.org/mike/transition/

// Load local CSV files.
var datasets = []
var dataset

// Selecting the dataset I want to load.
var selectData = function () {
    var options = document.getElementById('options').selectedOptions[0].text;
    var dataFile = options + '.csv'

    d3.csv(dataFile, function( error, _dataset) {
		_dataset.forEach(function(d) {
            d.count = +d.count;
            d.enabled = true
        })

		// Set data to be rendered.
		dataset = _dataset
        d3.select('body').datum(dataset).call(render);
    })
};

// 
var hasOldData = function (element) {
    var oldData = d3.select(element)._groups
    if (oldData.length > 0) {
        document.querySelector(element).innerHTML = null
    }
}

// Drawing the pieChart.
var render = function () {

    // console.log('Current dataset: ', dataset)
    // hasOldData('#chart');
    // hasOldData('#legend');

    var width = 360,
        height = 360,
        radius = Math.min(width, height) / 2,
        donutWidth = 75

    var legendWidth = 360,
        legendRectSize = 18,
        legendSpacing = 4

    var color = d3.scaleOrdinal(d3.schemeCategory20c)

    // The size of the slices based on data
    var pie = d3.pie()
        .value(function(d) { return d.count; })
        .sort(null)

    // Give the radius and creating a donut
    var arc = d3.arc()
        .innerRadius(radius - donutWidth)
        .outerRadius(radius)

    // Drawing the svg to the ID of chart
    var svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    var svgLegend = d3.select('#legend')
        .append('svg')
        .attr('width', legendWidth)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (legendWidth / 5) + ',' + (height / 4) + ')');

    var tooltip = d3.select('#chart')
        .append('div')
            .attr('class', 'tooltip')

    tooltip.append('div')
        .attr('class', 'label')

    tooltip.append('div')
        .attr('class', 'count')

    tooltip.append('div')
        .attr('class', 'percent');

    // Creating tooltip and adding information
    var path = svg.selectAll('path')
        .data(pie(dataset))
        .enter()
            .append('path')
            .attr('d', arc)
        .attr('fill', function(d, i) { return color(d.data.label) })
        .each(function(d) { this._current = d })


    path.on('mouseover', function(d) {
        var total = d3.sum(dataset.map(function(d) {
            return (d.enabled) ? d.count : 0
        }))

        var percent = Math.round(1000 * d.data.count / total) / 10
        tooltip.select('.label').html(d.data.label)
        tooltip.select('.count').html(d.data.count)
        tooltip.select('.percent').html(percent + '%')
        tooltip.style('display', 'block')

    })

    path.on('mouseout', function(d) {
        tooltip.style('display', 'none');
    })

    // Creating the legend color squares
    var legend = svgLegend.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset =  height * color.domain().length / 2;
            var horz = -2 * legendRectSize;
            var vert = i * height - offset;
            return 'translate(' + horz + ',' + vert + ')';
        });
    // Add the rectangles and a on click event
    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color)
        .on('click', function(label) {
            var rect = d3.select(this)
            var enabled = true
            var totalEnabled = d3.sum(dataset.map(function(d) {
                return (d.enabled) ? 1 : 0
            }))

            // If i checked the box remove class.
            if (rect.attr('class') === 'disabled') {
                rect.attr('class', '')
            } else {
                if (totalEnabled < 2) return
                rect.attr('class', 'disabled')
                enabled = false
            }

            pie.value(function(d) {
                if (d.label === label) d.enabled = enabled
                return (d.enabled) ? d.count : 0
            })

            path = path.data(pie(dataset))

            //Controls the animation
            path.transition()
                .duration(750)
                .attrTween('d', function(d) {
                    var interpolate = d3.interpolate(this._current, d)
                    this._current = interpolate(0)
                    return function(t) {
                        return arc(interpolate(t))
                    }
                })
        })
    // Creating labels for the legend
    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d) { return d; });

}

// Call the data
selectData();
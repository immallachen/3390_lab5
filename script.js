var margin = ({top: 20, right: 10, bottom: 20, left: 50});
var width = 800 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xScale = d3
    .scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

const yScale = d3
    .scaleLinear()
    .range([height, 0]);

const xAxis = d3.axisBottom()
    .scale(xScale)

svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
    
const yAxis = d3.axisLeft()
    .scale(yScale);

svg.append("g")
    .attr("class", "axis y-axis")
    .call(yAxis);

svg.append("text")
    .attr("class", "axlabel")
    .attr('x', -30)
    .attr('y', -8)

let sortState = 0;
    
function update(data, type){
    // Update scale domains
    xScale.domain(data.map(d => d.company));
    yScale.domain([0, d3.max(data, function(d) { return d[type]; })]);
    
    // Implement the enter-update-exist sequence
    const bars = svg.selectAll('rect')
        .data(data, d => d.company)

    bars.enter()
        .append('rect')
        .merge(bars)
        .transition()   
        .delay(200)  
        .duration(1000)
        .attr('x', d => xScale(d.company))
        .attr('y', d => yScale(d[type]))
        .attr('width', xScale.bandwidth())
        .attr('height', d => yScale(0) - yScale(d[type]))
        .attr('fill', 'rgb(150, 152, 255)');
    
    bars.exit().remove();

    // Update axes and axis title
    svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(xAxis);
    
    svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(yAxis);

    if(type == "revenue") {
        svg.select(".axlabel")
            .text("Billion USD");
    }
    else {
        svg.select(".axlabel")
            .text("Stores");
    }
}

d3.csv('coffee-house-chains.csv', d3.autoType).then(data =>{
    let type =  d3.select('#group-by').node().value;
    update(data.sort((a, b) => b[type] - a[type]), type);
    console.log(data, type);
    
    d3.select('#group-by')
        .on("change",function(){
            type =  d3.select('#group-by').node().value;
            sortState = 0;
            update(data.sort((a, b) => b[type] - a[type]), type);
        });
    
    d3.select('#sort')
        .on("click",function(){
            type =  d3.select('#group-by').node().value;
            if(sortState == 0){
                update(data.sort((a, b) => a[type] - b[type]), type);
                sortState = 1;
            }
            else {
                update(data.sort((a, b) => b[type] - a[type]), type);
                sortState = 0;
            }
            
        });
});
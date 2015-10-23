console.log("Assignment 3-B");

//Set up drawing environment with margin conventions
var margin = {t:20,r:20,b:50,l:50};
var width = document.getElementById('plot').clientWidth - margin.l - margin.r,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var plot = d3.select('#plot')
    .append('svg')
    .attr('width',width + margin.l + margin.r)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','plot-area')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//Initialize axes
//Consult documentation here https://github.com/mbostock/d3/wiki/SVG-Axes
var scaleX,scaleY;


var axisX0=d3.svg.axis()
    .orient('bottom')
    .tickSize(-height)
    .tickValues([0]);

var axisX=d3.svg.axis()
    .orient('bottom')
    .tickSize(-height)
    //.tickValues([0]);
    //.tickValues([10000,50000,100000]);
var axisY=d3.svg.axis()
    .orient('left')
    .tickSize(-width)
    .tickValues([0,25,50,75,100,125]);

var div=d3.select('body').append('div')
    .attr('class','tooltip')
    .style('opacity',0);

//Set colors for each kind of Data
var color1='red';
var color2='98df8a';
var color3='blue';
var color4='orange';



//Start importing data
d3.csv('/data/world_bank_2012.csv', parse, dataLoaded);

function parse(d){

    //Eliminate records for which gdp per capita isn't available
    if(d['GDP per capita, PPP (constant 2011 international $)']=='..'){
        return ;
    }
    //Check "primary completion" and "urban population" columns
    //if figure is unavailable and denoted as "..", replace it with undefined
    //otherwise, parse the figure into numbers

    return {
        cName: d['Country Name'],
        cCode:d['Country Code'],
        gdpPerCap: +d['GDP per capita, PPP (constant 2011 international $)'],
        primaryCompletion: d['Primary completion rate, total (% of relevant age group)']!='..'?+d['Primary completion rate, total (% of relevant age group)']: undefined,
        urbanPop: d['Urban population (% of total)']!='..'?+d['Urban population (% of total)']:undefined
    }



}


function dataLoaded(error, rows){
    //with data loaded, we can now mine the data
    var gdpPercapMin=d3.min(rows, function(d){return d.gdpPerCap}),
        gdpPerCapMax=d3.max(rows, function(d){return d.gdpPerCap});

    //with mined information, set up domain and range for x and y scales
    //Log scale for x, linear scale for y
    //scaleX = d3.scale.log()...
    scaleX=d3.scale.log().domain([gdpPercapMin,gdpPerCapMax]).range([0,width]),
        scaleY=d3.scale.linear().domain([0,140]).range([height,0]);

    //Draw axisX and axisY
    axisX0.scale(scaleX);
    axisX.scale(scaleX);
    axisY.scale(scaleY);

    plot
        .append('g')
        .attr('class','axis axis-x0')
        .attr('transform','translate(0,'+height+')')
        .call(axisX0)
        .style('stroke','black')
   plot
        .append('g')
        .attr('class','axis axis-x')
        .attr('transform','translate(0,'+height+')')
        .call(axisX);


    plot
        .append('g')
        .attr('class','axis axis-y')
        .call(axisY)
        .style('stroke','black')

    //draw <line> elements to represent countries
    //each country should have two <line> elements, nested under a common <g> element
    var color5,color6;
    //if(){}

    var Countries= plot.selectAll('g')
        .data(rows)
        .enter()
        .append('g')
        .attr('class','Countries');

    Countries
            .append('line')
            .attr('class','primaryCompletion')
            .attr('x1', function(d)
            {
                return scaleX(d.gdpPerCap)}
            )
            .attr('y1',height)
            .attr('x2', function(d)
             {
                 return scaleX(d.gdpPerCap)
             })

            .attr('y2', function(d)
                {if
                (d.primaryCompletion==undefined)
                {return height; }else {
                    return scaleY
                    (d.primaryCompletion)
                }})
            .style('stroke',color1)
            .style('stroke-width','1px')

            .on('mouseover',function(d){
                 d3.select(this).style('stroke','#'+color2)
                .style('stroke-width','10px');

                div.transition()
                    .duration(10)
                    .style("opacity",.9);

                div .html(d.cName+ ", " + d.primaryCompletion)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 30) + "px");
        })
            .on('mouseout',function(){
                d3.select(this).style('stroke',color1)
                .style('stroke-width','1px')

                div.transition()
                    .duration(400)
                    .style("opacity", 0)
    })





            Countries
        .append('line')
        .attr('class','urbanPopulation')
        .attr('x1', function(d){
            return scaleX(d.gdpPerCap);
        })
        .attr('y1',height)
        .attr('x2', function(d)
        { return scaleX(d.gdpPerCap)})
        .attr('y2',function(d){if(d.urbanPop==undefined)
        {return height;}else{return scaleY(d.urbanPop)}})
        .style('stroke',color3)
        .style('stroke-width','1px')
        .on('mouseover',function(d){
            d3.select(this).style('stroke',color4)
                .style('stroke-width','10px')

                    div.transition()
                        .duration(10)
                        .style("opacity",.9);
                    div .html(d.cName+ ", " + d.urbanPop)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 30) + "px");
        })
        .on('mouseout',function(){
            d3.select(this).style('stroke',color3)
                .style('stroke-width','1px')

                    div.transition()
                        .duration(400)
                        .style("opacity", 0)
    })

    Countries
        .append("svg:title")
        .text(function(d) { return d.cName; })
        .style('fill','rgb(100,100,100)')
        .style('font-size','8px')

}


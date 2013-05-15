/*
`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
```````````***`````````````***```````***```````````***````````````******```````````************``````************````
```````***********`````````***```````***``````````*****```````````**********```````************``````************````
`````***`````````***```````***```````***`````````***`***``````````***`````***``````````***```````````````````***`````
````***```````````***``````***```````***````````***```***`````````***``````***`````````***`````````````````***```````
````***```````````***``````***```````***```````***`````***````````***********``````````***```````````````***`````````
````***``````***`***```````***```````***``````*************```````*********````````````***``````````````***``````````
`````***```````****`````````***`````***``````***************``````***````***```````````***````````````***````````````
```````*************`````````*********``````***```````````***`````***`````***``````````***```````````************````
```````````***`````**```````````***````````***`````````````***````***``````***`````````***```````````************````
`````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
*/
var yAxisIndex

var chartConfig = {
	container: "#chartContainer",
	colors: ["#ff4cf4","#ffb3ff","#e69ce6","#cc87cc","#b373b3","#995f99","#804c80","#665266","#158eff","#99cdff","#9cc2e6","#87abcc","#7394b3","#5f7d99","#466780","#525c66"],
	padding :{
		top: 25,
		bottom: 50,
		left: 10,
		right: 10
	},
	xAxis: {
		domain: [0,100],
		prefix: "",
		suffix: "",
		type: "linear",
		formatter: "m",
		mixed: true,
		ticks: 5
	},
	yAxis: [
		{
			domain: [null,null],
			tickValues: null,
			prefix: {
				value: "",
				use: "top" //can be "top" "all" "positive" or "negative"
			},
			suffix: {
				value: "",
				use: "top"
			},
			ticks: 4,
			formatter: null
		}
	],
	series: [
		{
			name: "Enter something new",
			data: [49.78, 49.32, 49.56, 50.01, 49.76, 49.54, 49.54, 49.82, 50.23, 50.11, 49.62, 49.86, 50.16, 50.14, 49.49, 50.04, 48.97, 49.2, 48.59, 47.79, 47.11],
			source: "Some Org",
			type: "line",
			axis: 0,
			color: null
		},
		{
			name: "Fake data",
			data: [49.31, 48.91, 49.53, 50.18, 50.67, 50.62, 50.53, 50.33, 50.19, 49.85, 49.63, 49.15, 49.36, 48.81, 49.2, 47.27, 47.23, 49.31, 48.91, 49.53, 50.18],
			source: "Some Org",
			type: "column",
			axis: 0,
			color: null
		},
		{
			name: "This data seems real",
			data: [49.31, 48.91, 49.53, 50.18, 50.67, 50.62, 50.53, 50.33, 50.19, 49.85, 49.63, 49.15, 49.36, 48.81, 49.2, 47.27, 47.23, 50.62, 50.53, 50.33, 50.19],
			source: "Some Org",
			type: "column",
			axis: 0,
			color: null
		}
	],
	dateRef: [
		{
			data: []
		}
	],
	sourceline: "",
	creditline: "Quartz | qz.com"
}

var QuartzCharts = {
	longMonths: ["January","February","March","April","May","June","July","August","September","October","November","December"],
	shortMonths: ["Jan.","Feb.","March","April","May","June","July","Aug.","Sept.","Oct.","Nov.","Dec."],
	dateParsers: {
		"mmddyyyy": function(d) {return [d.getMonth()+1,d.getDate(),d.getFullYear()].join("/");},
		"mmdd": function(d) {return [d.getMonth()+1,d.getDate()].join("/")},
		"mmyy": function(d) {return [d.getMonth()+1,String(d.getFullYear()).split("").splice(2,2).join("")].join("/")},
		"yy": function(d) {return "’"+String(d.getFullYear()).split("").splice(2,2).join("")},
		"yyyy": function(d) {return d.getFullYear()},
		"MM": function(d) {
			if(d.getMonth() == 0) {
				return d.getFullYear();
			}
			else {
				return QuartzCharts.longMonths[d.getMonth()]
			}
			
		},
		"M": function(d) {	
			if(d.getMonth() == 0){
				return "’"+String(d.getFullYear()).split("").splice(2,2).join("")
			} 
			else { 
				return QuartzCharts.shortMonths[d.getMonth()]
			}
		},
		"hmm": function(d) {var hours = d.getHours(), min = d.getMinutes(); hours = hours==0 ? 12 : hours ; return (hours > 12 ? hours-12 : hours) + ":" + (min < 10 ? "0"+min : min)},
	},
	build: function(config) {
		var q = config
		this.q = config //CHANGE 
		//set container as a jquery object
		q.$container = $(q.container);
		q.all = this;
		
		//append svg to container using svg
		q.chart = d3.select(q.container).append("svg")
			.attr("id","chart")
			.attr("width","100%") //set width to 100%
			.attr("height","100%") //set height to 100%
			
		q.width = q.$container.width() //save the width in pixels
		q.height = q.$container.height() //save the height in pixels
		
		//put a background rect to prevent transparency
		q.chart.append("rect")
			.attr("width",q.width)
			.attr("height",q.height)
			.attr("fill","#ffffff")
			.attr("stroke","none")
				
		
		//group the series by their type
		this.q.sbt = this.splitSeriesByType(this.q.series);
		this.calculateColumnWidths()
		
		this.setYScales(true);
		this.setXScales(true);
		
		this.setYAxes(true);
		this.setXAxis(true)
		
		this.drawSeriesAndLegend(true);
		
		q.metaInfo = q.chart.append("g")
			.attr("id","metaInfo")
			.attr("transform","translate(0,"+(q.height-4)+")")
		
		q.sourceLine = q.metaInfo.append("text")
			.attr("text-anchor","end")
			.attr("x",q.width-q.padding.right)
			.attr("class","metaText")
			.text(q.sourceline)
		
		q.creditLine = q.metaInfo.append("text")
			.attr("x",q.padding.left)
			.attr("class","metaText")
			.text(q.creditline)
		
		this.q = q;
		return this;
	},
	setYScales: function(first) {
		var q = this.q
		/*
		*
		* Y AXIS SECTION
		*
		*/	
		//calculate number of yaxes and their maxes and mins
		var axisIndex = 0;
		var extremes = [], ex;
		for (var i = q.series.length - 1; i >= 0; i--){
			
			//CHANGE if there is no axis set to 0
			if(!q.series[i].axis) {
				q.series[i].axis = 0;
			}
			
			
			axisIndex = q.series[i].axis;
			
			
			//CHANGE check if there are any extremes for the current axis
			if(extremes[axisIndex] === undefined) {
				extremes[axisIndex] = []
			}
			
			
			if(q.yAxis[axisIndex] === undefined) {
				console.error(q.series[i].name + " ["+i+"] is associated with axis " + axisIndex + ", but that axis does not exist")
			}
			
			//calculate extremes of current series and add them to extremes array
			e = d3.extent(q.series[i].data)
			extremes[axisIndex].push(e[0])
			extremes[axisIndex].push(e[1])
		};
		
		for (var i = extremes.length - 1; i >= 0; i--){
			var ex = d3.extent(extremes[i])
			if(q.yAxis[i].domain[0] == null) {
				q.yAxis[i].domain[0] = ex[0]
			}
			
			if(q.yAxis[i].domain[1]  == null) {
				q.yAxis[i].domain[1] = ex[1]
			}
		};
		
		if(first) {
			//set extremes in y axis objects and create scales
			for (var i = q.yAxis.length - 1; i >= 0; i--){
				//q.yAxis[i].domain = d3.extent(extremes[i])
				q.yAxis[i].scale = d3.scale.linear()
					.domain(q.yAxis[i].domain)
					.range([
						q.height - q.padding.bottom,
						q.padding.top
						])
			};
		}
		else {
			//set extremes in y axis objects and update scales
			for (var i = q.yAxis.length - 1; i >= 0; i--){
				q.yAxis[i].domain = d3.extent(q.yAxis[i].domain)
				q.yAxis[i].scale
					.domain(q.yAxis[i].domain)
					.range([
						q.height - q.padding.bottom,
						q.padding.top
						])
			};
		}		
		
		
		this.q = q;
	},
	setXScales: function(first) {
		var q = this.q
		var dateExtent, shortestPeriod = Infinity;
		if(first) {
			//create x scales
			
			/*
			*
			* X AXIS SECTION
			*
			*/

			//calculate extremes of axis
			if(q.xAxis.type == "date") {
				dateExtent = d3.extent(q.dateRef[0].data);
				q.xAxis.scale = d3.time.scale()
					//.domain(QuartzCharts.multiextent(q.series,function(d){return d.data}))
					.domain(dateExtent)
				
				//calculate smallest gap between two dates
				for (var i = q.dateRef[0].data.length - 2; i >= 0; i--){
					shortestPeriod = Math.min(shortestPeriod, Math.abs(q.dateRef[0].data[i] - q.dateRef[0].data[i+1]))
				}
				
				q.maxLength = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod))
			}
			else {

				//calculate longest series
				var maxLength = 0;
				for (var i = q.series.length - 1; i >= 0; i--){
					maxLength = Math.max(maxLength, q.series[i].data.length)
				};
				q.xAxis.scale = d3.scale.linear()
					.domain([0,maxLength-1])
					
				q.maxLength = maxLength;
			}
			
		}
		else {
			//update the existing scales

			//calculate extremes of axis
			if(q.xAxis.type == "date") {
				dateExtent = d3.extent(q.dateRef[0].data);
				q.xAxis.scale = d3.time.scale()
					//.domain(QuartzCharts.multiextent(q.series,function(d){return d.data}))
					.domain(dateExtent)
					
				//calculate smallest gap between two dates
				for (var i = q.dateRef[0].data.length - 2; i >= 0; i--){
					shortestPeriod = Math.min(shortestPeriod, Math.abs(q.dateRef[0].data[i] - q.dateRef[0].data[i+1]))
				}
				
				q.maxLength = Math.abs(Math.floor((dateExtent[0] - dateExtent[1]) / shortestPeriod))
			}
			else {

				//calculate longest series
				var maxLength = 0;
				for (var i = q.series.length - 1; i >= 0; i--){
					maxLength = Math.max(maxLength, q.series[i].data.length)
				};
				q.xAxis.scale.domain([0,maxLength-1])
				
				q.maxLength = maxLength;
			}
		}
		
		//set the range of the x axis
		if (q.xAxis.hasColumns) {
			q.xAxis.scale.range([q.padding.left + this.q.columnGroupWidth/2,q.width - q.padding.right - (10* (Math.round(this.q.yAxis[0].domain[1]*3/4*100) + "").length )]) 
		}
		else {
			q.xAxis.scale.range([q.padding.left,q.width - q.padding.right])
		};
		
		this.q = q;
		
	},
	setLineMakers: function(first) {
		var q = this.q
		if(first) {
			for (var i = q.yAxis.length - 1; i >= 0; i--){
				q.yAxis[i].line = d3.svg.line();
				q.yAxis[i].line.y(function(d,j){return q.yAxis[yAxisIndex].scale(d)})
				if(q.xAxis.type == "date") {
					q.yAxis[i].line.x(function(d,j){return q.xAxis.scale(QuartzCharts.dateRef[0].data[j])})
				}
				else {
					q.yAxis[i].line.x(function(d,j){return q.xAxis.scale(j)})
				}
			};
		}
		else {
			for (var i = q.yAxis.length - 1; i >= 0; i--){
				q.yAxis[i].line.y(function(d,j){return q.yAxis[yAxisIndex].scale(d)})
				if(q.xAxis.type == "date") {
					q.yAxis[i].line.x(function(d,j){return q.xAxis.scale(QuartzCharts.q.dateRef[0].data[j])})
				}
				else {
					q.yAxis[i].line.x(function(d,j){return q.xAxis.scale(j)})
				}
			};
		}
		this.q = q
	},
	setYAxes: function(first) {
		/*
		*
		* Y-Axis Drawing Section
		*
		*/
		var q = this.q;
		var curAxis,axisGroup;
		for (var i = q.yAxis.length - 1; i >= 0; i--){
			curAxis = q.yAxis[i]
			//create svg axis
			if(first) {
				q.yAxis[i].axis = d3.svg.axis()
					.scale(q.yAxis[i].scale)
					.orient(i==0?"right":"left")
					.tickSize(q.width - q.padding.left - q.padding.right)
					.ticks(q.yAxis[0].ticks)
					.tickValues(q.yAxis[i].tickValues)
					
				//append axis container
				axisGroup = q.chart.append("g")
					.attr("class","axis")
					.attr("id",i==0?"rightAxis":"leftAxis")
					.attr("transform",i==0?"translate("+q.padding.left+",0)":"translate(0,0)")
					.call(q.yAxis[i].axis)
			}
			else {
				q.yAxis[i].axis.ticks(q.yAxis[0].ticks)
					.tickValues(q.yAxis[i].tickValues);
					
				axisGroup = q.chart.selectAll(i==0?"#rightAxis":"#leftAxis")
					.call(q.yAxis[i].axis)
				
			}
				
			//adjust label position and add prefix and suffix
			var topAxisLabel, minY = 10000000000;
			axisGroup.selectAll("g")
				.each(function(d,i) {
					//create an object to store axisItem info
					var axisItem = {}
					
					//store the position of the axisItem
					//(figure it out by parsing the transfrom attribute)
					axisItem.y = parseFloat(d3.select(this)
						.attr("transform")
							.split(")")[0]
								.split(",")[1]
						)
					
					//store the text element of the axisItem
					//align the text right position it on top of the line
					axisItem.text = d3.select(this).select("text")
						.attr("text-anchor","end")
						.attr("y",-9)
						
					//store the line element of the axisItem	
					axisItem.line = d3.select(this).select("line")
						.attr("stroke","#E6E6E6")
					
					//apply the prefix as appropriate
					switch(curAxis.prefix.use) {
						case "all":
							//if the prefix is supposed to be on every axisItem label, put it there
							axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
						break;
						
						case "positive":
							//if the prefix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
							}
						break;
						
						case "negative":
							//if the prefix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(curAxis.prefix.value + axisItem.text.text())
							}
						break;
						
						case "top":
							//do nothing
						break;
					}
					
					//apply the suffix as appropriate
					switch(curAxis.suffix.use) {
						case "all":
							//if the suffix is supposed to be on every axisItem label, put it there
							axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
						break;

						case "positive":
							//if the suffix is supposed to be on positive values and it's positive, put it there
							if(parseFloat(axisItem.text.text()) > 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
							}
						break;

						case "negative":
							//if the suffix is supposed to be on negative values and it's negative, put it there
							if(parseFloat(axisItem.text.text()) < 0) {
								axisItem.text.text(axisItem.text.text() + curAxis.suffix.value)
							}
						break;

						case "top":
							//do nothing
						break;
					}
					
					//find the top most axisItem
					//store its text element
					if(axisItem.y < minY) {
						topAxisLabel = axisItem.text
						q.topAxisItem = axisItem
						minY = axisItem.y
					}
					
					//if the axisItem represents the zero line
					//change it's color and make sure there's no decimal
					if(parseFloat(axisItem.text.text()) == 0) {
						axisItem.line.attr("stroke","#666666")
						axisItem.text.text("0")
					}
				})
				
			//add the prefix and suffix to the top most label as appropriate
			if(curAxis.suffix.use == "top" && curAxis.prefix.use == "top") {
				//both preifx and suffix should be added to the top most label
				if(topAxisLabel) {
					topAxisLabel.text(q.yAxis[i].prefix.value + topAxisLabel.text() + q.yAxis[i].suffix.value)
				}
				else {
					console.error("top label not found")
				}
				
			}
			else if (curAxis.suffix.use == "top") {
				//only the suffix should be added (Because the prefix is already there)
				topAxisLabel.text(topAxisLabel.text() + q.yAxis[i].suffix.value)
			}
			else if(curAxis.prefix.use == "top") {
				//only the prefix should be added (Because the suffix is already there)
				topAxisLabel.text(q.yAxis[i].prefix.value + topAxisLabel.text())
			}
			
		};
		//this.q = q
	},
	setXAxis: function(first) {
		var q = this.q
		if(first) {
			/*
			*
			* X-Axis Drawing Section
			*
			*/
			q.xAxis.axis = d3.svg.axis()
				.scale(q.xAxis.scale)
				.orient("bottom")
				.tickFormat(q.xAxis.formatter ? this.dateParsers[q.xAxis.formatter] : function(d) {return d})
				.ticks(q.xAxis.ticks)
				
			if(q.xAxis.type == "date") {
				switch(q.xAxis.formatter) {
				   // "mmddyyyy":
				   // "mmdd"
					case "yy":
						q.xAxis.axis.ticks(d3.time.years,1)
					break;
					
					case "yyyy":
						q.xAxis.axis.ticks(d3.time.years,1)
					break;
					
					case "MM":
						q.xAxis.axis.ticks(d3.time.months,1)
					break;
					
					case "M":
						q.xAxis.axis.ticks(d3.time.months,1)
					break;
				   // "hmm"

					case "YY":
						q.xAxis.axis.ticks(d3.time.years,1)
					break;
				}
			}	
			
			q.chart.append("g")
				.attr("class",'axis')
				.attr("id","xAxis")
				.attr("transform","translate(0,"+(q.height - q.padding.bottom + 8)+")")
				.call(q.xAxis.axis)
				
			
		}
		else {
			q.xAxis.axis.scale(q.xAxis.scale)
				.tickFormat(q.xAxis.formatter ? this.dateParsers[q.xAxis.formatter] : function(d) {return d})
				.ticks(q.xAxis.ticks)
			
			if(q.xAxis.type == "date") {
				switch(q.xAxis.formatter) {
				   // "mmddyyyy":
				   // "mmdd"
					case "yy":
						q.xAxis.axis.ticks(d3.time.years,1)
					break;
					
					case "yyyy":
						q.xAxis.axis.ticks(d3.time.years,1)
					break;
					
					case "MM":
						q.xAxis.axis.ticks(d3.time.months,1)
					break;
					
					case "M":
						q.xAxis.axis.ticks(d3.time.months,1)
					break;
				   // "hmm"

					case "YY":
						q.xAxis.axis.ticks(d3.time.years,1)
					break;
				}
			}
			
			q.chart.selectAll("#xAxis")
				.call(q.xAxis.axis)
		}
		
		q.chart.selectAll("#xAxis text")
			.attr("text-anchor", q.xAxis.type == "date" ? "start":"middle")
			.each(function() {
				var pwidth = this.parentNode.getBBox().width
				var attr = this.parentNode.getAttribute("transform")
				var attrx = Number(attr.split("(")[1].split(",")[0])
				var attry = Number(attr.split(")")[0].split(",")[1])
				if (pwidth + attrx > q.width) {
					this.setAttribute("x",Number(this.getAttribute("x"))-(pwidth + attrx - q.width + q.padding.right))
				}
			})
		
		this.q = q
	},
	calculateColumnWidths: function() {
		var q = this.q
		//store split by type for convenience
		var sbt = q.sbt
		
		
		//determine the propper column width
		//								---- Width of chart area ----------     -Num Data pts-  -Num Column Series-
		var columnWidth = Math.floor(((q.width-q.padding.right-q.padding.left) / q.maxLength) / sbt.column.length) - 3;
		//make sure width is >= 1
		columnWidth = Math.max(columnWidth, 1);
		columnWidth = Math.min(columnWidth, (q.width-q.padding.right-q.padding.left) * 0.075)
		var columnGroupShift = columnWidth + 1;
		
		this.q.columnWidth = columnWidth;
		this.q.columnGroupWidth = (columnWidth + 1) * sbt.column.length;
		this.q.columnGroupShift = columnWidth +1;
	},
	drawSeriesAndLegend: function(first){
		/*
		*
		* Series Drawing Section
		*
		*/
		var q = this.q
		
		var lineSeries;
		
		//construct line maker helper functions for each yAxis
		this.setLineMakers(first)
		
		//store split by type for convenience
		var sbt = q.sbt
		
		var columnWidth = this.q.columnWidth;
		var columnGroupShift = this.q.columnGroupShift;
		
		
		if(first) {
			
			//create a group to contain series
			q.seriesContainer = q.chart.append("g")
				.attr("id","seriesContainer")
				
				
			lineSeries = q.seriesContainer.selectAll("path");
			columnSeries = q.seriesContainer.selectAll("g.seriesColumn")
			var columnGroups
			var columnRects
			var lineSeriesDots = q.seriesContainer.selectAll("g.lineSeriesDots")
			
			
				
			//create a group to contain the legend items
			q.legendItemContainer = q.chart.append("g")
				.attr("id","legendItemContainer")
				
				//add columns to chart
				columnGroups = columnSeries.data(sbt.column)
					.enter()
					.append("g") 
						.attr("class","seriesColumn seriesGroup")
						.attr("fill",function(d,i){return d.color? d.color : q.colors[i+sbt.line.length]})
						.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
						
				columnGroups.selectAll("rect")
					.data(function(d,i){return d.data})
					.enter()
						.append("rect")
						.attr("width",columnWidth)
						.attr("height", function(d,i) {yAxisIndex = 0; return Math.abs(q.yAxis[yAxisIndex].scale(d)-q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex])))})
						.attr("x",q.xAxis.type =="date" ? 
								function(d,i) {return q.xAxis.scale(QuartzCharts.q.dateRef[0].data[i])  - columnWidth/2}:
								function(d,i) {return q.xAxis.scale(i) - columnWidth/2}
						)
						.attr("y",function(d,i) {yAxisIndex = 0; return (q.yAxis[yAxisIndex].scale(d)-q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex]))) >= 0 ? q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex])) : q.yAxis[yAxisIndex].scale(d)})
				
				
				
				//add lines to chart
				lineSeries.data(sbt.line)
					.enter()
					.append("path")
						.attr("d",function(d,j) { yAxisIndex = d.axis; return q.yAxis[d.axis].line(d.data)})
						.attr("class","seriesLine seriesGroup")
						.attr("stroke",function(d,i){return d.color? d.color : q.colors[i]})
						.attr("stroke-width",3)
						.attr("stroke-linejoin","round")
						.attr("stroke-linecap","round")
						.attr("fill","none")
				
				lineSeriesDotGroups = lineSeriesDots.data(sbt.line)
					.enter()
					.append("g")
					.attr("class","lineSeriesDots seriesGroup")
					.attr("fill", function(d,i){return d.color? d.color : q.colors[i]})
				
				lineSeriesDotGroups
					.filter(function(d){return d.data.length < 15})
					.selectAll("circle")
					.data(function(d){ return d.data})
					.enter()
						.append("circle")
						.attr("r",4)
						.attr("transform",function(d,i){
							yAxisIndex = 0; 
							return "translate("+(q.xAxis.type=="date" ?
								q.xAxis.scale(QuartzCharts.q.dateRef[0].data[i]):
								q.xAxis.scale(i)) + "," + q.yAxis[yAxisIndex].scale(d) + ")"
							})
		}
		else {
			
			lineSeries = q.seriesContainer.selectAll("path");
			columnSeries = q.seriesContainer.selectAll("g.seriesColumn")
			var columnGroups
			var columnRects
			var lineSeriesDotGroups
			
			//add columns to chart
			columnGroups = q.seriesContainer.selectAll("g.seriesColumn")
				.data(sbt.column)
				.attr("fill",function(d,i){return d.color? d.color : q.colors[i+sbt.line.length]})
				
			columnGroups.enter()
				.append("g") 
					.attr("class","seriesColumn")
					.attr("fill",function(d,i){return d.color? d.color : q.colors[i+sbt.line.length]})
					.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
					
			columnSeries.transition()
				.duration(500)
				.attr("transform",function(d,i){return "translate("+(i*columnGroupShift - (columnGroupShift * (sbt.column.length-1)/2))+",0)"})
			
			columnGroups.exit().remove()
			
			columnRects = columnGroups.selectAll("rect")
				.data(function(d,i){return d.data})
				
			columnRects.enter()
					.append("rect")
					.attr("width",columnWidth)
					.attr("height", function(d,i) {yAxisIndex = 0; return Math.abs(q.yAxis[yAxisIndex].scale(d)-q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex])))})
					.attr("x",q.xAxis.type =="date" ? 
							function(d,i) {return q.xAxis.scale(QuartzCharts.q.dateRef[0].data[i])  - columnWidth/2}:
							function(d,i) {return q.xAxis.scale(i) - columnWidth/2}
					)
					.attr("y",function(d,i) {yAxisIndex = 0; return (q.yAxis[yAxisIndex].scale(d)-q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex]))) >= 0 ? q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex])) : q.yAxis[yAxisIndex].scale(d)})
			
			columnRects.transition()
				.duration(500)
				.attr("width",columnWidth)
				.attr("height", function(d,i) {yAxisIndex = 0; return Math.abs(q.yAxis[yAxisIndex].scale(d)-q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex])))})
				.attr("x",q.xAxis.type =="date" ? 
						function(d,i) {return q.xAxis.scale(QuartzCharts.q.dateRef[0].data[i])  - columnWidth/2}:
						function(d,i) {return q.xAxis.scale(i) - columnWidth/2}
				)
				.attr("y",function(d,i) {yAxisIndex = 0; return (q.yAxis[yAxisIndex].scale(d)-q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex]))) >= 0 ? q.yAxis[yAxisIndex].scale(QuartzCharts.helper.columnXandHeight(d,q.yAxis[yAxisIndex])) : q.yAxis[yAxisIndex].scale(d)})
				
			columnRects.exit().remove()
			
			
			lineSeries = q.seriesContainer.selectAll("path")
				.data(sbt.line)
				.attr("stroke",function(d,i){return d.color? d.color : q.colors[i]});

			lineSeries.enter()
				.append("path")
					.attr("d",function(d,j) { yAxisIndex = d.axis; return q.yAxis[d.axis].line(d.data)})
					.attr("class","seriesLine")
					.attr("stroke",function(d,i){return d.color? d.color : q.colors[i]})
					.attr("stroke-width",3)
					.attr("stroke-linejoin","round")
					.attr("stroke-linecap","round")
					.attr("fill","none");

			lineSeries.transition()
				.duration(500)
				.attr("d",function(d,j) { yAxisIndex = d.axis; return QuartzCharts.q.yAxis[d.axis].line(d.data)})

			lineSeries.exit().remove()
			
			
			//Add dots to the appropriate line series
			lineSeriesDotGroups = q.seriesContainer.selectAll("g.lineSeriesDots")
				.data(sbt.line)
				.attr("fill",function(d,i){return d.color? d.color : q.colors[i]})
			
			lineSeriesDotGroups
				.enter()
				.append("g")
				.attr("class","lineSeriesDots")
				.attr("fill", function(d,i){return d.color? d.color : q.colors[i]})
				
			lineSeriesDotGroups.exit().remove()
			
			lineSeriesDots = lineSeriesDotGroups.filter(function(d){return d.data.length < 15})
				.selectAll("circle")
				.data(function(d,i){return d.data})
				
				
			lineSeriesDots.enter()
				.append("circle")
				.attr("r",4)
				.attr("transform",function(d,i){
					yAxisIndex = 0; 
					return "translate("+(q.xAxis.type=="date" ?
						q.xAxis.scale(QuartzCharts.q.dateRef[0].data[i]):
						q.xAxis.scale(i)) + "," + q.yAxis[yAxisIndex].scale(d) + ")"
					})
			
			lineSeriesDots.transition()
				.duration(500)
				.attr("transform",function(d,i){
					yAxisIndex = 0; 
					return "translate("+(q.xAxis.type=="date" ?
						q.xAxis.scale(QuartzCharts.q.dateRef[0].data[i]):
						q.xAxis.scale(i)) + "," + q.yAxis[yAxisIndex].scale(d) + ")"
					})
			
			lineSeriesDots.exit().remove()
			
		}
		//CHANGE Bring lines to top (doesn't work)
		q.seriesContainer.selectAll(".seriesGroup").sort(function(a,b){
			if(a.data.type == "line") {
				return -1
			}
			else if(b.data.type == "line") {
				return 1
			}
			else {
				return 0
			}
			
		})
		
		
		//remove current legends
		q.legendItemContainer.selectAll("g.legendItem").remove()
		
		
		//add legend to chart
		var legendGroups = q.legendItemContainer.selectAll("g")
			.data(q.series);

		var legItems = 	legendGroups.enter()
			.append("g")
			.attr("class","legendItem")
			.attr("transform",function(d,i) {return "translate("+q.padding.left+",0)"});

		legItems.append("text")
				.attr("class","legendLabel")
				.attr("x",q.series.length > 1 ? 12 : 0)
				.attr("y",q.series.length > 1 ? 18 : q.topAxisItem.y - 4)
				.attr("fill",q.series.length > 1 ? function(d,i){return d.color? d.color : q.colors[i]} : "#666666")
				.text(function(d,i){return d.name});
					
		//if there is more than one line
		if(q.series.length > 1) {
			legItems.append("rect")
				.attr("width",10)
				.attr("height",10)
				.attr("x",0)
				.attr("y",8)
				.attr("fill", function(d,i){return d.color? d.color : q.colors[i]})

			var legendItemY = 0;
			legendGroups.each(function(d,i) {
				if(i > 0) {
					var prev = d3.select(legendGroups[0][i-1])
					var prevWidth = parseFloat(prev.select("text").style("width").split("p")[0])

					var cur = d3.select(this)
					var curWidth = parseFloat(cur.select("text").style("width").split("p")[0])

					var x = parseFloat(prev.attr("transform").split(",")[0].split("(")[1]) + prevWidth + 20

					if(x + curWidth > q.width) {
						x = q.padding.left
						legendItemY += 15;						
					}
					d3.select(this).attr("transform","translate("+x+","+legendItemY+")")
				}
			})
			
			//test if the chart needs more top margin because of a large number of legend items
			if (legendItemY > 0 && q.padding.top == 25) { //CHANGE
				q.padding.top = legendItemY + 25;
				this.q = q;				
				
			};
		}
		
		
		
		
		this.q = q;
		
		
	},
	splitSeriesByType: function(series) {
		var o = {
			"line":[],
			"column":[]
		}
		for (var i=0; i < series.length; i++) {
			o[series[i].type].push(series[i])
		}
		
		if(o.column.length > 0) {
			this.q.xAxis.hasColumns = true;
		}
		else {
			this.q.xAxis.hasColumns = false;
		}
		
		return o
	},
	update: function() {
		
	},
	updateSeries: function() {
		
	},
	redraw: function() {
		var q = this.q
		
		//group the series by their type
		this.q.sbt = this.splitSeriesByType(this.q.series);
		this.calculateColumnWidths()
		
		this.setYScales()
		this.setXScales()
		this.setYAxes()
		this.setXAxis()
		this.drawSeriesAndLegend();	
		return "Redrawn"
	},
	randomizeData: function(d) {
		delta = 10 * (Math.random() - 0.5)
		for (var i = d.length - 1; i >= 0; i--){
			d[i] = d[i] + ((Math.random()-0.5)*5) + delta
		};
		return d
	},
	helper: {
		multiextent: function(a,key) {
			//a function to find the max and min of multiple arrays
			var data = [],ext;
			if(key) {
				//if there is a key function
				for (var i = a.length - 1; i >= 0; i--){
					ext = d3.extent(key(a[i]))
					data.push(ext[0])
					data.push(ext[1])
				}
			}
			else {
				for (var i = a.length - 1; i >= 0; i--){
					ext = d3.extent(a[i])
					data.push(ext[0])
					data.push(ext[1])
				};
			}
			return d3.extent(data)
		},
		columnXandHeight: function(d,axis) {
			//a function to find the propper value to cut off a column
			if(d > 0 && axis.domain[0] > 0) {
				return axis.domain[0]
			}
			else if (d < 0 && axis.domain[1] < 0) {
				return axis.domain[1]
			}
			
			return 0
		}
	},
	q: {}
}
//transitionTo = (name) ->
//  if name == "stream"
//    streamgraph()
//  if name == "stack"
//    stackedAreas()
//  if name == "area"
//    areas()

d3.tsv("./vis/data-used/overview-height.tsv", function(error, data) {
		
	var category_color_scale = d3.scale.category20();
	
	var pieData = [];
	var snpCount = 0;
	
	for (var i = 0; i < data.length; i++){
		var item = data[i];
		item.value = +item.value;
		item.color = category_color_scale[i % 20];
		pieData.push(item);
		snpCount++;
	}
	snpCount--;

	var pie = new d3pie("pie-height", {	
		"header": {
			"title": {
				"text": "Height",
				"fontSize": 20
			}
		},
		"size": {
			"canvasHeight": 300,
			"canvasWidth": 300,
			"pieInnerRadius": "20%",
			"pieOuterRadius": "85%"
		},
		"data": {
			"sortOrder": "label-desc",
			"smallSegmentGrouping": {
				"enabled": true,
				"value": 1
			},
			"content": pieData
		},
		"labels": {
			"outer": {
				"format": "none",
				"pieDistance": 32
			},
			"inner": {
				"format": "label-percentage2"
			},
			"mainLabel": {
				"fontSize": 17
			},
			"percentage": {
				"color": "#ffffff",
				"decimalPlaces": 2
			},
			"value": {
				"color": "#adadad",
				"fontSize": 18
			}
		},
		"tooltips": {
			"enabled": true,
			"type": "placeholder",
			"string": "{label}: {percentage}%",
			"styles": {
				"fadeInSpeed": 240,
				"backgroundOpacity": 0.65
			}
		},
		"effects": {
			"load": {
				"speed": 1000
			},
			"pullOutSegmentOnClick": {
				"effect": "elastic",
				"speed": 400,
				"size": 16
			}
		},
		"callbacks": {
		}
	});

});

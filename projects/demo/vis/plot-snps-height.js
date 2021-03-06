//transitionTo = (name) ->
//  if name == "stream"
//    streamgraph()
//  if name == "stack"
//    stackedAreas()
//  if name == "area"
//    areas()

d3.tsv("./vis/data-used/trial-height.tsv", function(error, data) {
		
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
				"text": "Heritability explained by GWAS SNPs",
				"fontSize": 30
			},
			"subtitle": {
				"text": "Trait: Height",
				"color": "#585858",
				"fontSize": 20
			},
			"titleSubtitlePadding": 12
		},
		"footer": {
			"text": "In total, ".concat(snpCount.toString()).concat(" unique SNPs have been identified as trait loci."),
			"color": "#585858",
			"fontSize": 18,
			"location": "bottom-center"
		},
		"size": {
			"canvasHeight": 800,
			"canvasWidth": 1000,
			"pieInnerRadius": "20%",
			"pieOuterRadius": "85%"
		},
		"data": {
			"sortOrder": "value-desc",
			"smallSegmentGrouping": {
				"enabled": true,
				"value": 1
			},
			"content": pieData
		},
		"labels": {
			"outer": {
				"pieDistance": 32
			},
			"inner": {
				"hideWhenLessThanPercentage": 3
			},
			"mainLabel": {
				"fontSize": 15
			},
			"percentage": {
				"color": "#ffffff",
				"decimalPlaces": 2
			},
			"value": {
				"color": "#adadad",
				"fontSize": 13
			},
			"lines": {
				"enabled": true
			}
		},
		"tooltips": {
			"enabled": true,
			"type": "placeholder",
			"string": "{label}: {value}, {percentage}%",
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
			onClickSegment: function(info) {
				if (info.data.label !== "Unknown" && info.data.label.substring(0, 6) !== "Others") {
					var win = window.open("http://www.ncbi.nlm.nih.gov/projects/SNP/snp_ref.cgi?rs=".concat(info.data.label), '_blank');
					win.focus();
				}
			}
		}
	});

});

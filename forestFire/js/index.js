function init() {
	initMap();
	initEvent();
}

function initEvent() {
	//距离测量
	$('#distancetool').on('click', function() {
		if(!drawtool.measure) {
			drawtool.measure = new MeasureTool(map);
		}
		drawtool.measure.addInteraction('LineString');
	});
	//圆面积测量
	$('#areatool').on('click', function() {
		if(!drawtool.measure) {
			drawtool.measure = new MeasureTool(map);
		}
		drawtool.measure.addInteraction('Polygon');
	});
	//清除测量标记
	$('#cleartool').on('click', function() {
		if(drawtool.measure) {
			drawtool.measure.clearMap();
		}
	});
	//清除测量标记
	$('#downloadtool').on('click', function() {
		map.once('postcompose', function(event) {
			var canvas = event.context.canvas;
			if(navigator.msSaveBlob) {
				navigator.msSaveBlob(canvas.msToBlob(), '截图.png');
			} else {
				canvas.toBlob(function(blob) {
					saveAs(blob, '截图.png');
				});
			}
		});
		map.renderSync();
	});
	//地图切换
	$('#changemap').on('click', function() {
		if($(this).hasClass("active")) {
			$(this).removeClass("active");
			imageLayer.setVisible(false);
			vectorLayer.setVisible(true);
		} else {
			$(this).addClass("active");
			vectorLayer.setVisible(false);
			imageLayer.setVisible(true);
		}
	})
	//放大
	$('#zoomin').on('click', function() {
		var zoom = map.getView().getZoom(); //获取当前地图的缩放级别
		if(zoom < 18) {
			map.getView().setZoom(zoom + 1);
		}
	})
	//缩小
	$('#zoomout').on('click', function() {
		var zoom = map.getView().getZoom(); //获取当前地图的缩放级别
		if(zoom > 2) {
			map.getView().setZoom(zoom - 1);
		}
	})

	$('#layergroup').on('click', function() {
		if($(this).hasClass("active")) {
			$(this).removeClass("active");
			$('#aui-mapTitle').hide()
		} else {
			$(this).addClass("active");
			$('#aui-mapTitle').show()
		}
	})

	$('#toollist').on('click', function() {
		if($(this).hasClass("active")) {
			$(this).removeClass("active");
			$('.tool-list').hide()
		} else {
			$(this).addClass("active");
			$('.tool-list').show()
		}
	})

	$("#checkbox>li>input").click(function() {
		var cheackId = $(this).attr("id");
		layerOpenClose(cheackId);
	});

	$('#close').click(function() {
		layerLayer.closeAll();
	});

	$('.menu li').on('click', function() {
		$(this).siblings('li').removeClass('active');
		$(this).addClass('active');
		formateData();
	})
}
//控制图层显示与隐藏
function layerOpenClose(cheackId) {
	if($('#' + cheackId).is(':checked') === true) {
		layerGroup[cheackId].setVisible(true);
	} else {
		layerGroup[cheackId].setVisible(false);
	}
}

function renderChart(labels,values) {
	var option = {
		tooltip: {
			trigger: 'axis'
		},
		calculable: true,
		xAxis: [{
			type: 'category',
			data: labels,
			axisTick: {
				show: false
			},
			axisLine: {
				show: false,
			},
			axisLabel: {
				show: true,
				color: '#999999',
				fontSize: 10,
				interval: 0,
				rotate: 0
			}
		}],
		yAxis: [{
			type: 'value',
			axisTick: {
				show: false
			},
			axisLine: {
				lineStyle: {
					color: '#EDF0F3',
				},
				show: true,
			},
			axisLabel: {
				color: '#999999',
				fontSize: 10,
				interval: 0,
			},
			splitLine: {
				lineStyle: {
					color: '#EDF0F3'
				}
			},
			splitNumber: 5

		}],
		grid: {
			left: 70,
			right: 20,
			top: 20,
			bottom: 45
		},
		series: [{
			name: '天气指数',
			type: 'line',
			symbol: 'none',
			smooth: true,
			lineStyle: {
				normal: {
					color: '#5252FB'
				}
			},
			areaStyle: {
				normal: {
					color: new echarts.graphic.LinearGradient(
						0, 0, 0, 1, [{
								offset: 0,
								color: 'rgba(82,82,251,1)'
							},
							{
								offset: 0.5,
								color: 'rgba(82,82,251,0.75)'
							},
							{
								offset: 1,
								color: 'rgba(82,82,251,0)'
							}
						]
					)
				}
			},
			data: values,

		}]
	};
	var chart = echarts.init(document.getElementById('chart'));
	chart.setOption(option);
}
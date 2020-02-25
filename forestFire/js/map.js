var map = null;
let drawtool = {
	measure: null, //测量
}
var vectorLayer = null;
var imageLayer = null;

var layerGroup = {};
var layerNames = ['lindi', 'snow_year', 'snow_1yue', 'snow_3yue', 'snow_5yue', 'snow_7yue', 'snow_9yue', 'snow_11yue'];

function initMap() {
	map = new ol.Map({
		target: 'map',
		view: new ol.View({
			center: ol.proj.transform([104.06327, 30.66074], 'EPSG:4326', 'EPSG:3857'),
			zoom: 4,
			maxZoom: 18,
			minZoom: 2
		})
	});
	vectorLayer = new ol.layer.Tile({
		title: "3857底图",
		source: new ol.source.XYZ({
			crossOrigin: 'Anonymous',
			url: "http://t3.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=6e9650f48c0a7f5212f2243a4af7f14b"
		})
	});
	imageLayer = new ol.layer.Tile({
		title: "3857底图",
		source: new ol.source.XYZ({
			crossOrigin: 'Anonymous',
			url: "http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=6e9650f48c0a7f5212f2243a4af7f14b"
		})
	});
	imageLayer.setVisible(false);
	var labellayer = new ol.layer.Tile({
		title: "3857底图",
		source: new ol.source.XYZ({
			crossOrigin: 'Anonymous',
			url: "http://t3.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=6e9650f48c0a7f5212f2243a4af7f14b"
		})
	});
	map.addLayer(vectorLayer);
	map.addLayer(imageLayer);
	map.addLayer(labellayer);

	for(var i = 0; i < layerNames.length; i++) {
		if(!layerGroup[layerNames[i]]) {
			layerGroup[layerNames[i]] = new ol.layer.Image({
				source: new ol.source.ImageWMS({
					//			crossOrigin: 'Anonymous',
					ratio: 1,
					url: 'http://139.9.243.34:8060/geoserver/linhuo/wms',
					params: {
						'FORMAT': 'image/png',
						'VERSION': '1.1.1',
						"LAYERS": layerNames[i],
						"exceptions": 'application/vnd.ogc.se_inimage',
					}
				})
			});
			map.addLayer(layerGroup[layerNames[i]]);
			layerGroup[layerNames[i]].setVisible(false);
		}
	}

	map.on('click', function(evt) {
		if(drawtool.measure && drawtool.measure.state) return;
			var currentp = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
			var lon = currentp[0];
			var lat = currentp[1];
			if(lon > 137 || lon < 73 || lat > 56 || lat < 18) {
				layerLayer.msg('超出范围', {
					icon: 5
				});
				return;
			}
			layerLayer.open({
				type: 1,
				title: false,
				closeBtn: 0,
				area: ['800px', '400px'],
				shadeClose: true,
				content: $('#popup'),
				success: function() {
					requestPoint(lon, lat)
				}
			});
	})

	addThemeLayer();
}
var allData = [];

function requestPoint(lon, lat) {
	$$('getFireIndexData', {
		lon: lon,
		lat: lat
	}, function(result) {
		allData = result;
		formateData();
	})
}

function formateData() {
	var labels = [];
	var values = [];
	var target = getTarget();
	if(allData && allData.length) {
		for(var i = 0; i < allData.length; i++) {
			if(!allData[i]) continue;
			labels.push(allData[i]['date'].substring(4, 9));
			values.push(allData[i][target]);
		}
	}
	renderChart(labels, values);
}

function getTarget() {
	return $('.menu li.active').attr('target');
}
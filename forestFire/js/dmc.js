function addThemeLayer(){
	var zhishuLayer = new ol.layer.Image({
		opacity: 0.5,
		source: new ol.source.ImageStatic({
			url: getContourPath()+"dmc.png",
			imageExtent: [7070464.255054103, 2034951.410874784, 16321262.35111606, 7563093.356838228]
		})
	})
	map.addLayer(zhishuLayer);
}

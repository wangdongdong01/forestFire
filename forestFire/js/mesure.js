(function(window, undefined) {
	var measuretool;
	var MeasureTool = function(map) {
		this.map = map;
		this.sketch;
		this.helpTooltipElement;
		this.helpTooltip;
		this.measureTooltipElement;
		this.measureTooltip;
		this.continuePolygonMsg = '点击继续画面';
		this.continueLineMsg = '点击继续画线';
		this.source = new ol.source.Vector();
		this.vector= new ol.layer.Vector({
            source: this.source,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 0, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });

		this.draw = null;
		this.state=false;
		this.init();
	}
	MeasureTool.prototype = {
		constructor: MeasureTool,
		init: function() {
			measuretool = this;
			this.map.addLayer(this.vector);
			this.map.on('pointermove', this.pointerMoveHandler);
			this.map.getViewport().addEventListener('mouseout', function() {
				measuretool.helpTooltipElement.classList.add('hidden');
			});
		},
		pointerMoveHandler: function(evt) {
			if(!this.state){
				return;
			}
			if(evt.dragging) {
				return;
			}
			var helpMsg = '点击开始绘制';
			if(measuretool.sketch) {
				var geom = (measuretool.sketch.getGeometry());
				if(geom instanceof ol.geom.Polygon) {
					helpMsg = measuretool.continuePolygonMsg;
				} else if(geom instanceof ol.geom.LineString) {
					helpMsg = measuretool.continueLineMsg;
				}
			}
			measuretool.helpTooltipElement.innerHTML = helpMsg;
			measuretool.helpTooltip.setPosition(evt.coordinate);
			measuretool.helpTooltipElement.classList.remove('hidden');
		},
		clearMap:function(){
			this.state=false;
			measuretool.map.removeInteraction(measuretool.draw);
			measuretool.vector.getSource().clear();
			var dom=document.getElementsByClassName('measuretooltip');
			if(dom.length){
				for(var i=0;i<dom.length+1;i++){
					dom[i].parentNode.removeChild(dom[i]);
				}
			}
			//测试发现清楚一次会遗留一个标签
			var dom=document.getElementsByClassName('measuretooltip');
			if(dom.length){
				for(var i=0;i<dom.length+1;i++){
					dom[i].parentNode.removeChild(dom[i]);
				}
			}
			
			measuretool.measureTooltipElement=null;
			measuretool.helpTooltipElement=null;
			measuretool.map.removeOverlay(measuretool.measureTooltip);
		},
		addInteraction: function(type) {
			this.clearMap();
			this.state=true;
			this.draw = new ol.interaction.Draw({
				source: measuretool.source,
				type: (type),
				style: new ol.style.Style({
					fill: new ol.style.Fill({
						color: 'rgba(255, 255, 0, 0.2)'
					}),
					stroke: new ol.style.Stroke({
						color: 'rgba(255, 255, 0, 1)',
						lineDash: [10, 10],
						width: 2
					}),
					image: new ol.style.Circle({
						radius: 5,
						stroke: new ol.style.Stroke({
							color: 'rgba(255, 255, 0, 0.7)'
						}),
						fill: new ol.style.Fill({
							color: 'rgba(255, 255, 0, 0.2)'
						})
					})
				})
			});

			measuretool.map.addInteraction(this.draw);
			measuretool.createMeasureTooltip();
			measuretool.createHelpTooltip();

			var listener;
			this.draw.on('drawstart',
				function(evt) {
					
					measuretool.sketch = evt.feature;
					var tooltipCoord = evt.coordinate;
					listener = measuretool.sketch.getGeometry().on('change', function(evt) {
						var geom = evt.target;
						var output;
						if(geom instanceof ol.geom.Polygon) {
							output = measuretool.formatArea(geom);
							tooltipCoord = geom.getInteriorPoint().getCoordinates();
						} else if(geom instanceof ol.geom.Circle) {
							output = measuretool.formatCircleArea(geom);
							tooltipCoord = geom.getCenter();
						}else if(geom instanceof ol.geom.LineString) {
							output = measuretool.formatLength(geom);
							tooltipCoord = geom.getLastCoordinate();
						}
						measuretool.measureTooltipElement.innerHTML = output;
						measuretool.measureTooltip.setPosition(tooltipCoord);
					});
				}, this);

			this.draw.on('drawend',
				function() {
					measuretool.measureTooltipElement.className = 'measuretooltip measuretooltip-static';
					measuretool.measureTooltip.setOffset([0, -7]);
					measuretool.sketch = null;
					measuretool.measureTooltipElement = null;
					measuretool.createMeasureTooltip();
					ol.Observable.unByKey(listener);
					measuretool.map.removeInteraction(measuretool.draw);
					setTimeout(()=>{
						measuretool.state=false;
					},300)
				}, this);
		},
		formatLength: function(line) {
			var length;
			length = Math.round(line.getLength() * 100) / 100;
			var output;
			if(length > 100) {
				output = (Math.round(length / 1000 * 100) / 100) +
					' ' + 'km';
			} else {
				output = (Math.round(length * 100) / 100) +
					' ' + 'm';
			}
			return output;
		},
		formatArea: function(polygon) {
			var area;
			area = polygon.getArea();
			var output;
			if(area > 10000) {
				output = (Math.round(area / 1000000 * 100) / 100) +
					' ' + 'km<sup>2</sup>';
			} else {
				output = (Math.round(area * 100) / 100) +
					' ' + 'm<sup>2</sup>';
			}
			return output;
		},
		formatCircleArea: function(circle) {
			var area;
			area = circle.getRadius()*circle.getRadius()*Math.PI;
			var output;
			if(area > 10000) {
				output = (Math.round(area / 1000000 * 100) / 100) +
					' ' + 'km<sup>2</sup>';
			} else {
				output = (Math.round(area * 100) / 100) +
					' ' + 'm<sup>2</sup>';
			}
			return output;
		},
		createHelpTooltip: function() {
			if(measuretool.helpTooltipElement) {
				measuretool.helpTooltipElement.parentNode.removeChild(measuretool.helpTooltipElement);
			}
			measuretool.helpTooltipElement = document.createElement('div');
			measuretool.helpTooltipElement.className = 'measuretooltip hidden';
			measuretool.helpTooltip = new ol.Overlay({
				element: measuretool.helpTooltipElement,
				offset: [15, 0],
				positioning: 'center-left'
			});
			measuretool.map.addOverlay(measuretool.helpTooltip);
		},
		createMeasureTooltip: function() {
			if(measuretool.measureTooltipElement) {
				measuretool.measureTooltipElement.parentNode.removeChild(measuretool.measureTooltipElement);
			}
			measuretool.measureTooltipElement = document.createElement('div');
			measuretool.measureTooltipElement.className = 'measuretooltip measuretooltip-measure';
			measuretool.measureTooltip = new ol.Overlay({
				element: measuretool.measureTooltipElement,
				offset: [0, -15],
				positioning: 'bottom-center'
			});
			measuretool.map.addOverlay(measuretool.measureTooltip);
		}
	}

	window["MeasureTool"] = MeasureTool
})(self);
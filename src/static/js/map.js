export class Map {
    constructor() {
        this.root = null;
        this.container = null;
        this.chart = null;
        this.backgroundSeries = null;
        this.polygonSeries = null;
        this.lineSeries = null;
        this.pointSeries = null;
        this.fromLocationPoint = null;
        this.toLocationPoint = null;
        this.lineDataItem = null;
        this.planeSeries = null;
        this.plane = null;
        this.planeDataItem = null;
    }

    ready(container) {

        if (this.root?.container != null) {
            this.root.dispose();
        }
        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        this.root = am5.Root.new(container);
        
        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        this.root.setThemes([
            am5themes_Animated.new(this.root)
            // am5themes_`${theme}`.new(root)
        ]);

        // Create the map chart
        // https://www.amcharts.com/docs/v5/charts/map-chart/
        this.chart = this.root.container.children.push(am5map.MapChart.new(this.root, {
            panX: "rotateX",
            panY: "none",
            x: 0,
            y: 0,
            zoomLevel: 1,
            projection: am5map.geoEquirectangular(),
            // projection: am5map.geoNaturalEarth1(),
            homeGeoPoint: { latitude: 14.5995, longitude: 120.9842 }
        }));

        // Create series for background fill
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
        this.backgroundSeries = this.chart.series.push(am5map.MapPolygonSeries.new(this.root, {
            // fill: "#fff"
        }));

        this.backgroundSeries.mapPolygons.template.setAll({
            fill: this.root.interfaceColors.get("alternativeBackground"),
            fillOpacity: 0,
            strokeOpacity: 0
        });
        
        // Add background polygon
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
        this.backgroundSeries.data.push({
            geometry: am5map.getGeoRectangle(90, 180, -90, -180)
        });

        // Create main polygon series for countries
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
        this.polygonSeries = this.chart.series.push(am5map.MapPolygonSeries.new(this.root, {
            fill: "#0C2849",
            opacity: .4,
            geoJSON: am5geodata_worldLow,
            exclude: ["AQ"]
        }));

        // Make stuff animate on load
        this.chart.appear(1000, 100)
    }

    createTrajectoryLines() {

        // Create line series for trajectory lines
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
        this.lineSeries = this.chart.series.push(am5map.MapLineSeries.new(this.root, {}));
            this.lineSeries.mapLines.template.setAll({
            stroke: this.root.interfaceColors.get("alternativeBackground"),
            strokeOpacity: 0.3
        });

        // Create point series for markers
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
        this.pointSeries = this.chart.series.push(am5map.MapPointSeries.new(this.root, {}));

        this.pointSeries.bullets.push(() => {
            this.circle = am5.Circle.new(this.root, {
                radius: 7,
                tooltipText: "Drag me!",
                cursorOverStyle: "pointer",
                tooltipY: 0,
                fill: am5.color(0xffba00),
                stroke: this.root.interfaceColors.get("background"),
                strokeWidth: 2,
                draggable: true
            });

            this.circle.events.on("dragged", (event) => {
                var dataItem = event.target.dataItem;
                var projection = this.chart.get("projection");
                var geoPoint = this.chart.invert({ x: circle.x(), y: circle.y() });

                dataItem.setAll({
                    longitude: geoPoint.longitude,
                    latitude: geoPoint.latitude
                });
            });

            return am5.Bullet.new(this.root, {
                sprite: this.circle
            });
        });
        
        this.fromLocationPoint = this.addCity({ latitude: 14.5995, longitude: 120.9842 }, "Manila") 
        this.toLocationPoint = this.addCity({ latitude: 49.2827, longitude: -123.1207 }, "Vancouver")

        this.lineDataItem = this.lineSeries.pushDataItem({
            pointsToConnect: [this.fromLocationPoint, this.toLocationPoint]
            // pointsToConnect: [paris, toronto, la, havana]
        });
    }

    createPlane() {
        this.planeSeries = this.chart.series.push(am5map.MapPointSeries.new(this.root, {}));

        this.plane = am5.Graphics.new(this.root, {
            svgPath:
                "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47",
            scale: 0.06,
            centerY: am5.p50,
            centerX: am5.p50,
            fill: am5.color(0x000000)
        });

        this.planeSeries.bullets.push(() => {
            this.bulletContainer = am5.Container.new(this.root, {});
            this.bulletContainer.children.push(this.plane);

            return am5.Bullet.new(this.root, { sprite: this.bulletContainer });
        });

        this.planeDataItem = this.planeSeries.pushDataItem({
            lineDataItem: this.lineDataItem,
            positionOnLine: 0,
            autoRotate: true
        });

        this.planeDataItem.dataContext = {};    

        this.planeDataItem.animate({
            key: "positionOnLine",
            to: 1,
            duration: 10000,
            loops: Infinity,
            easing: am5.ease.yoyo(am5.ease.linear)
        });

        this.planeDataItem.on("positionOnLine", (value) => {
            if (this.planeDataItem.dataContext.prevPosition < value) {
                this.plane.set("rotation", 0);
            }

            if (this.planeDataItem.dataContext.prevPosition > value) {
                this.plane.set("rotation", -180);
            }

            this.planeDataItem.dataContext.prevPosition = value;
        });
        // polygonSeries.zoomToGeoPoint({ latitude: 14.5995, longitude: 120.9842 }, 2)
    }

    zoomToCity(iso_country, zoomLevel) {
        let dataItem = this.polygonSeries.getDataItemById(iso_country)
        this.polygonSeries.zoomToDataItem(dataItem, zoomLevel);
        // this.polygonSeries.zoomToGeoPoint({latitude: lat, longitude: long}, 3);
    }

    addCity(coords, title) {
        return this.pointSeries.pushDataItem({
            latitude: coords.latitude,
            longitude: coords.longitude
        });
    }
}
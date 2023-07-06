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

    ready(container, projection, panX, panY, wheelY, graticulate, mapOpacity) {
        this.projection = projection;

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
            panX: panX,
            panY: panY,
            wheelX: "none",
            wheelY: "none",
            pinchZoom: "none",
            x: 0,
            y: 0,
            zoomLevel: 1,
            projection: this.projection,
            // projection: am5map.geoEquirectangular(),
            // projection: am5map.geoNaturalEarth1(),
            homeGeoPoint: { latitude: 14.5995, longitude: 120.9842 }
        }));


        this.chart.events.on("wheel", (ev) => {
            if (ev.originalEvent.ctrlKey) {
              ev.originalEvent.preventDefault();
              this.chart.set("wheelY", "zoom");
            }
            else {
              this.chart.set("wheelY", "none");
            }
          });
        
        this.chart.set("zoomControl", am5map.ZoomControl.new(this.root, {}));
        
        // Create curtain + message to show when wheel is used over chart without CTRL
        this.overlay = this.root.container.children.push(am5.Container.new(this.root, {
            width: am5.p100,
            height: am5.p100,
            layer: 100,
            visible: false
          }));
                                                     
        this.curtain = this.overlay.children.push(am5.Rectangle.new(this.root, {
            x: am5.p0,
            y: am5.p50,
            fill: am5.color("#0C2849"),
            fillOpacity: 0.3
          }));
          
          this.message = this.overlay.children.push(am5.Label.new(this.root, {
            text: "Use CTRL + Scroll to zoom",
            fontSize: 30,
            fill: "#E4EEFD",
            x: am5.p50,
            y: am5.p50,
            background: am5.Rectangle.new(this.root, {
                fill: am5.color("#0C2849"),
                fillOpacity: 0.3
            }),
            centerX: am5.p50,
            centerY: am5.p50
          }));
          
          this.chart.events.on("wheel", (ev) => {
            // Show overlay when wheel is used over chart
            if (ev.originalEvent.ctrlKey) {
              ev.originalEvent.preventDefault();
              this.chart.set("wheelY", "zoom");
            }
            else {
              this.chart.set("wheelY", "none");
              this.overlay.show();
              this.overlay.setTimeout(() => {
                this.overlay.hide()
              }, 800);
            }
          });

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
            opacity: mapOpacity,
            geoJSON: am5geodata_worldLow,
            exclude: ["AQ"]
        }));

        // for tooltip hover
        // this.polygonSeries.mapPolygons.template.setAll({
        //     tooltipText: "{name}",
        //     color: "#fff",
        //     interactive: true
        // });

        // Create point series for markers
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
        this.pointSeries = this.chart.series.push(am5map.MapPointSeries.new(this.root, {}));

        this.polygonSeries.mapPolygons.template.states.create("active", {
            // fill: "#FFD700"
            fillGradient: am5.LinearGradient.new(this.root, {
                stops: [{
                    color: am5.color("#ff0000")
                  }, {
                    color: am5.color("#FFA500")
                  }],
                  rotation: 90
            })
        })

        if (graticulate) {
            let graticuleSeries = this.chart.series.unshift(
                am5map.GraticuleSeries.new(this.root, {
                step: 8  
                })
            );

            graticuleSeries.mapLines.template.setAll({
                stroke: am5.color("#0C2849"),
                strokeOpacity: 0.1
            });
        }

        this.createPoints();
        // Make stuff animate on load
        this.chart.appear(1000, 100)
    }

    setSource(longitude, latitude, name) {
        console.log(this.fromLocationPoint)
        if (this.fromLocationPoint != null) {
            this.fromLocationPoint.remove();
        }
        this.fromLocationPoint = this.#addCity({ latitude: latitude, longitude: longitude }, name) 
        this.createPoints() 
    }

    setDestination(longitude, latitude, name) {
        this.toLocationPoint = this.#addCity({ latitude: latitude, longitude: longitude }, name)
    }

    createPoints() {
        this.pointSeries.bullets.push(() => {

            this.circle = am5.Circle.new(this.root, {
                radius: 10,
                name: "point",
                tooltipText: "{title}",
                cursorOverStyle: "pointer",
                tooltipY: 0,
                fill: am5.color(0xffba00),
                stroke: this.root.interfaceColors.get("background"),
                strokeWidth: 2,
                draggable: false
            });

            return am5.Bullet.new(this.root, {
                sprite: this.circle
            });
        });
    }

    getAllFuncs(toCheck) {
        const props = [];
        let obj = toCheck;
        do {
            props.push(...Object.getOwnPropertyNames(obj));
        } while (obj = Object.getPrototypeOf(obj));
        
        return props.sort().filter((e, i, arr) => { 
           if (e!=arr[i+1] && typeof toCheck[e] == 'function') return true;
        });
    }

    removePoint() {
        // console.log(this.pointSeries.dataItems)
        // this.pointSeries.pop()
        // console.log(this.getAllFuncs(this.pointSeries));
        // this.pointSeries.bullets.removeIndex(this.fromLocationPoint)
    }

    createTrajectoryLines() {

        // Create line series for trajectory lines
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
        this.lineSeries = this.chart.series.push(am5map.MapLineSeries.new(this.root, {}));
            this.lineSeries.mapLines.template.setAll({
            stroke: this.root.interfaceColors.get("alternativeBackground"),
            strokeOpacity: 0.3
        });

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

    #addCity(coords, title) {
        return this.pointSeries.pushDataItem({
            latitude: coords.latitude,
            longitude: coords.longitude,
            title: title
        });
    }
}
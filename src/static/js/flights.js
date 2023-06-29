/******************
 *   FLIGHT PAGE  *
 ******************/

const dayOfTheWeek = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday', 
    5: 'Friday', 
    6: 'Saturday'
}

const departureDay = document.getElementById("departureDay");
const departureDate = document.querySelector(".departure-date");
departureDay.textContent = dayOfTheWeek[new Date(departureDate.textContent).getDay()];

const expandFlightDetailsBtn = document.querySelectorAll(".expand-flight-stops");
// const expandedSection = document.querySelectorAll(".expanded-section");

expandFlightDetailsBtn.forEach( btn => {
    btn.addEventListener("click", () => {
        btn.classList.toggle('expanded-btn');
        if (btn.classList.contains('expanded-btn')) {
            document.querySelector(`.expanded-section[data-index="${btn.dataset.index}"]`).classList.add('expanded');
            document.querySelector(`.available-flights__items[data-index="${btn.dataset.index}"]`).classList.add('expanded');
        } else {
            document.querySelector(`.expanded-section[data-index="${btn.dataset.index}"]`).classList.remove('expanded');
            document.querySelector(`.available-flights__items[data-index="${btn.dataset.index}"]`).classList.remove('expanded');
        }
    });
})

async function selectFlight(flight) {
    try {
        const response = await fetch(`selected-flight/${JSON.stringify(flight)}`, {
            method: 'POST',
            body: JSON.stringify(flight),
        });
    
        const result = await response.json();
        console.log("Success: ", result);
        document.getElementById("selectFlightForm").submit();
    } catch (error) {
        console.error("Error: ", error);
    }
}


function createGlobe(container) {
    am5.ready(function() {

        // Create root element
        // https://www.amcharts.com/docs/v5/getting-started/#Root_element
        var root = am5.Root.new(container);
        
        // Set themes
        // https://www.amcharts.com/docs/v5/concepts/themes/
        root.setThemes([
          am5themes_Animated.new(root)
        ]);
        
        // Create the map chart
        // https://www.amcharts.com/docs/v5/charts/map-chart/
        var chart = root.container.children.push(am5map.MapChart.new(root, {
          panX: "rotateX",
          panY: "none",
          x: 0,
          y: 0,
          projection: am5map.geoMercator(),
          homeGeoPoint: { latitude: 48.8567, longitude: 2.351 }
        }));
      
        // Create series for background fill
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
        var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
            // fill: "#E4EEFD"
        }));
        backgroundSeries.mapPolygons.template.setAll({
          fill: root.interfaceColors.get("alternativeBackground"),
          fillOpacity: 0,
          strokeOpacity: 0
        });
        
        // Add background polygon
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
        backgroundSeries.data.push({
          geometry: am5map.getGeoRectangle(90, 180, -90, -180)
        });
        
        // Create main polygon series for countries
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
        var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
            fill: "#0C2849",
            geoJSON: am5geodata_worldLow
        }));

        // Create line series for trajectory lines
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
        var lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
        lineSeries.mapLines.template.setAll({
          stroke: root.interfaceColors.get("alternativeBackground"),
          strokeOpacity: 0.3
        });
        
        // Create point series for markers
        // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
        var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
        
        pointSeries.bullets.push(function() {
          var circle = am5.Circle.new(root, {
            radius: 7,
            tooltipText: "Drag me!",
            cursorOverStyle: "pointer",
            tooltipY: 0,
            fill: am5.color(0xffba00),
            stroke: root.interfaceColors.get("background"),
            strokeWidth: 2,
            draggable: true
          });
        
          circle.events.on("dragged", function(event) {
            var dataItem = event.target.dataItem;
            var projection = chart.get("projection");
            var geoPoint = chart.invert({ x: circle.x(), y: circle.y() });
        
            dataItem.setAll({
              longitude: geoPoint.longitude,
              latitude: geoPoint.latitude
            });
          });
        
          return am5.Bullet.new(root, {
            sprite: circle
          });
        });
        
        var paris = addCity({ latitude: 48.8567, longitude: 2.351 }, "Paris");
        var toronto = addCity({ latitude: 43.8163, longitude: -79.4287 }, "Toronto");
        var la = addCity({ latitude: 34.3, longitude: -118.15 }, "Los Angeles");
        var havana = addCity({ latitude: 23, longitude: -82 }, "Havana");
        
        var lineDataItem = lineSeries.pushDataItem({
          pointsToConnect: [paris, toronto, la, havana]
        });
        
        var planeSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
        
        var plane = am5.Graphics.new(root, {
          svgPath:
            "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47",
          scale: 0.06,
          centerY: am5.p50,
          centerX: am5.p50,
          fill: am5.color(0x000000)
        });
        
        planeSeries.bullets.push(function() {
          var container = am5.Container.new(root, {});
          container.children.push(plane);
          return am5.Bullet.new(root, { sprite: container });
        });
        
        
        var planeDataItem = planeSeries.pushDataItem({
          lineDataItem: lineDataItem,
          positionOnLine: 0,
          autoRotate: true
        });
        planeDataItem.dataContext = {};
        
        planeDataItem.animate({
          key: "positionOnLine",
          to: 1,
          duration: 10000,
          loops: Infinity,
          easing: am5.ease.yoyo(am5.ease.linear)
        });
        
        planeDataItem.on("positionOnLine", (value) => {
          if (planeDataItem.dataContext.prevPosition < value) {
            plane.set("rotation", 0);
          }
        
          if (planeDataItem.dataContext.prevPosition > value) {
            plane.set("rotation", -180);
          }
          planeDataItem.dataContext.prevPosition = value;
        });
        
        function addCity(coords, title) {
          return pointSeries.pushDataItem({
            latitude: coords.latitude,
            longitude: coords.longitude
          });
        }

        var countryItem = polygonSeries.getDataItemById("FR");
        console.log(countryItem)

        // Make stuff animate on load
        chart.appear(1000, 100);
        
        }); // end am5.ready()
}

function removeGlobe(container) {
    container.childNodes.forEach(child => {
      if (child.nodeName === 'DIV') {
        container.remove(child)
      }
    })
}

const flightContainers = document.querySelectorAll(".flight-container");
const flightContainerGlobe = document.querySelector(".flight-details-section")

flightContainers.forEach(container => {
    container.addEventListener('click', (event) => {
        event.target.classList.toggle('opened');
        event.target.classList.toggle('closed');
        if (event.target.classList.contains('opened')) {
          createGlobe(flightContainerGlobe);
        } else {
          removeGlobe(flightContainerGlobe);
        }
    })
})
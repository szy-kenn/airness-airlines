/******************
 *     NAVBAR     *
 ******************/
let dateToday=document.getElementById("current-date-navbar");

let navBarToday = new Date();
let day = `${navBarToday.getDate() < 10 ?  "0" : ""}${navBarToday.getDate()}`;
let month =`${(navBarToday.getMonth()+1) < 10 ? "0" : ""}${navBarToday.getMonth()+1}`;
let year = navBarToday.getFullYear();
dateToday.textContent=`${day}/${month}/${year}`;

let time=document.getElementById("current-time-navbar");
setInterval(()=>{
    let d= new Date();
    time.innerHTML=d.toLocaleTimeString();
},  1000)

let navbar = document.querySelector('.navbar');
let homeBody = document.querySelector('.home-body');
let welcomeSection = document.querySelector('.home-welcome-section')

const options = {
    threshold: 0.1
};

const bodyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    })
}, options)

const welcomeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            navbar.classList.remove('scrolled');
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
            navbar.classList.add('scrolled');
        }
    })
}, options) 

bodyObserver.observe(homeBody);
// welcomeObserver.observe(welcomeSection);

// MAP CODE

// am5.ready(function() {

// Create root element
// https://www.amcharts.com/docs/v5/getting-started/#Root_element
var root = am5.Root.new("globe-container");

// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
root.setThemes([
  am5themes_Animated.new(root)
]);

// Create the map chart
// https://www.amcharts.com/docs/v5/charts/map-chart/
var chart = root.container.children.push(am5map.MapChart.new(root, {
  panX: "none",
  panY: "none",
  wheelY: "none",
  pinchZoom: false,
  maxPanOut: 0,
  zoomLevel: 1,
  minZoomLevel: 1,
  maxZoomLevel: 16,
  projection: am5map.geoOrthographic(),
  //projection: am5map.geoMercator(),
//   homeGeoPoint: {longitude: 121, latitude: 13}
  homeGeoPoint: { latitude: 2, longitude: 2 }
}));

chart.events.on("wheel", function(ev) {
    if (ev.originalEvent.ctrlKey) {
      ev.originalEvent.preventDefault();
      chart.set("wheelY", "zoom");
    }
    else {
      chart.set("wheelY", "none");
    }
  });

// chart.set("zoomControl", am5map.ZoomControl.new(root, {}));

// Create curtain + message to show when wheel is used over chart without CTRL
let overlay = root.container.children.push(am5.Container.new(root, {
    width: am5.p100,
    height: am5.p100,
    layer: 100,
    visible: false
  }));
                                             
//   let curtain = overlay.children.push(am5.Rectangle.new(root, {
//     x: am5.p0,
//     y: am5.p50,
//     fill: am5.color("#0C2849"),
//     fillOpacity: 0.3
//   }));
  
  let message = overlay.children.push(am5.Label.new(root, {
    text: "Use CTRL + Scroll to zoom",
    fontSize: 30,
    fill: "#E4EEFD",
    x: am5.p50,
    y: am5.p50,
    background: am5.Rectangle.new(root, {
        fill: am5.color("#0C2849"),
        fillOpacity: 0.3
    }),
    centerX: am5.p50,
    centerY: am5.p50
  }));
  
  chart.events.on("wheel", function(ev) {
    // Show overlay when wheel is used over chart
    if (ev.originalEvent.ctrlKey) {
      ev.originalEvent.preventDefault();
      chart.set("wheelY", "zoom");
    }
    else {
      chart.set("wheelY", "none");
      overlay.show();
      overlay.setTimeout(function() {
        overlay.hide()
      }, 800);
    }
  });

// Create series for background fill
// https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
    //   fill: "#fff"
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

// Rotate animation
chart.animate({
    key: "rotationX",
    from: 0,
    to: 360,
    duration: 30000,
    loops: Infinity
  });

// Create main polygon series for countries
// https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
var polygonSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
  geoJSON: am5geodata_worldLow,
  fill: "#0C2849",
//   fill: "#A3AAB4",
  exclude: ["AQ"]
}));

polygonSeries.mapPolygons.template.setAll({
    tooltipText: "{name}",
    interactive: true
});

polygonSeries.mapPolygons.template.states.create("active", {
    // fill: "#FFD700"
    fillGradient: am5.LinearGradient.new(root, {
        stops: [{
            color: am5.color("#ff0000")
          }, {
            color: am5.color("#FFA500")
          }],
          rotation: 90
    })
})


let graticuleSeries = chart.series.unshift(
    am5map.GraticuleSeries.new(root, {
      step: 8  
    })
);

graticuleSeries.mapLines.template.setAll({
stroke: am5.color("#0C2849"),
strokeOpacity: 0.1
});

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
    // tooltipText: "{name}",
    cursorOverStyle: "pointer",
    tooltipY: 0,
    fill: am5.color(0xffba00), // points
    stroke: root.interfaceColors.get("background"),
    strokeWidth: 2,
    draggable: false
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

// polygonSeries.mapPolygons.template.events.on("click", function(ev) {
//     var dataItem = polygonSeries.getDataItemById("FR");
//     console.log(dataItem)
//     polygonSeries.zoomToDataItem(dataItem, 3);
//   });



// chart.events.on("click", function(ev) {
//     polygonSeries.zoomToDataItem(ev.target.dataItem, 3.5)
//   });

var paris = addCity({ latitude: 48.8567, longitude: 2.351 }, "Paris");
var toronto = addCity({ latitude: 43.8163, longitude: -79.4287 }, "Toronto");
var la = addCity({ latitude: 34.3, longitude: -118.15 }, "Los Angeles");
var havana = addCity({ latitude: 23, longitude: -82 }, "Havana");

// var fromLocation = addCity({}, )
//var toLocation = 

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
// Make stuff animate on load
// chart.appear(1000, 100);

// }); 
// end am5.ready()






/******************
 * PASSENGER FORM *
 ******************/
const passengerCount = document.querySelectorAll('.passenger-form__container__passenger-count');
    // passengerCount[0] = adult, [1] = children, [2] = infant
const btnDown = document.querySelectorAll('.btn-down');
const btnUp = document.querySelectorAll('.btn-up');
const airlineClassSelected = document.querySelectorAll('.airline-class--selected');
const airlineClassChoices = document.querySelectorAll('.airline-class__group-choices')
const airlineClassContainer = document.querySelectorAll('.passenger-form__container__airline-class');

// maximum adult + children, excluding infants
const maxPassenger = 9;

function btnStateUpdate() {

    if (parseInt(passengerCount[0].value) < parseInt(passengerCount[2].value)) {
        passengerCount[2].value = passengerCount[0].value;
    }

    for (let idx = 0; idx < passengerCount.length; idx++) {
        if (idx === 0) {
            if (parseInt(passengerCount[idx].value) + parseInt(passengerCount[1].value) < maxPassenger) {
                btnUp[idx].disabled = false;
            } else {
                btnUp[idx].disabled = true;
            }
        }
        else if (idx === 1) {
            if (parseInt(passengerCount[0].value) === 0) {
                btnUp[idx].disabled = true;
            } else {
                if (parseInt(passengerCount[0].value) + parseInt(passengerCount[idx].value) < maxPassenger) {
                    btnUp[idx].disabled = false;
                } else {
                    btnUp[idx].disabled = true;
                }
            }
        }
        else if (idx === 2) {
            if (passengerCount[idx].value === passengerCount[0].value) {
                btnUp[idx].disabled = true;
            } else {
                btnUp[idx].disabled = false;
            }
        }

        if (parseInt(passengerCount[idx].value) === 0) {
            btnDown[idx].disabled = true;
        } else {
            btnDown[idx].disabled = false;
            if (idx === 0 && parseInt(passengerCount[idx].value) === 1) {
                btnDown[idx].disabled = true;
            }
        }

    }
}

function passengerBtnOnClick(btnType, idx) {
    /*
    button onClick function in passenger count section
    */

    if (btnType === 'up') {
        passengerCount[idx].value++;
    } else {
        passengerCount[idx].value--;
    }
    
    btnStateUpdate();
}

function selectAirlineClass(index, airlineClass) {
    airlineClassSelected[index].value = airlineClass;
}

function showChoices(choicesType, index) {

    if (choicesType === "airline-class") {
        airlineClassChoices[index].style.opacity = 1;
        airlineClassChoices[index].style.pointerEvents = 'all';
        airlineClassContainer[index].style.zIndex = 3;
    } else if (choicesType === 'airport') {
        airportChoicesContainer[index].style.opacity = 1;
        airportChoicesContainer[index].style.pointerEvents = 'all';
    }
}

for (let i = 0; i < airlineClassSelected.length; i++) {
    airlineClassSelected[i].addEventListener('blur', () => {
        airlineClassChoices[i].style.opacity = 0;
        setTimeout(() => {
            airlineClassChoices[i].style.pointerEvents = 'none';
            airlineClassContainer[i].style.zIndex = 0;
        }, 100);
    });
}

btnStateUpdate();

/******************
 *  FLIGHTS FORM  *
 ******************/

const fromLocation = document.getElementById("from-flight-location");
const toLocation = document.getElementById("to-flight-location");
const flightLocationInputDiv = document.querySelectorAll(".flight-location-input__container");
const fromContainer = document.getElementById("from");
const toContainer = document.getElementById("to");
const fromJSON = document.getElementById("fromJSON");
const toJSON = document.getElementById("toJSON");
const airportChoicesContainer = document.querySelectorAll(".flight-location-form__container");

const maxResult = 100

function flightFormUpdate(event, container) {
    let i = null;
    (container === fromContainer) ? i = 0 : i = 1;

    if (event.type === 'focus' || event === 'focus') {
        container.classList.add('focused');
    } else if (event.type === 'blur') {
        // container.classList.remove('focused');
        airportChoicesContainer[i].style.opacity = 0;

        setTimeout(() => {
            airportChoicesContainer[i].style.pointerEvents = 'none';
            if (i === 0) {
                if (fromLocation.value == '') {
                    container.classList.remove('focused');
                } 
                else {
                    container.classList.remove('invalid');
                }
                
            } else {
                if (toLocation.value == '') {
                    container.classList.remove('focused');
                } 
                else {
                    container.classList.remove('invalid');
                }
            }
        }, 100);
        // check if the input is valid
        event.target.value = '';
    }
}

function createChoice(inputSourceIdx, newChoiceData, choiceIdx) {

    let currentDiv = null;
    let newlyCreated = false;

    if (newChoiceData['iata'] === 0) {
        currentDiv = airportChoicesContainer[inputSourceIdx].children[choiceIdx];
    }

    if (airportChoicesContainer[inputSourceIdx].children[choiceIdx] !== undefined) {
        currentDiv = airportChoicesContainer[inputSourceIdx].children[choiceIdx];
        while (currentDiv.firstChild) {
            currentDiv.removeChild(currentDiv.firstChild);
        }
    } else {
        currentDiv = document.createElement("div");
        currentDiv.classList.add('with-dropdown-select__container__options', 
                                    'flight-location-form__container__options');
        newlyCreated = true;
    }

    if (choiceIdx === 0) {
        currentDiv.classList.add('first-choice');
    } else {
        currentDiv.classList.remove('first-choice');
    }

    const newP = document.createElement("p");
    newP.innerHTML = newChoiceData['municipality'];

    if (newChoiceData['iata'] !== 0) {
        const img = document.createElement("img");
        img.src = `https://flagcdn.com/32x24/${newChoiceData['iso_country'].toLowerCase()}.png`;
        img.width = 32;
        img.height = 24;
        img.style.paddingRight = '1rem';
        img.style.paddingLeft = '1rem';
        const span = document.createElement("span");
        span.innerHTML = newChoiceData['iata'];
        airportAddEventListener(currentDiv, inputSourceIdx, newChoiceData, choiceIdx);
        // currentDiv.addEventListener('click', (event) => selectAirportChoice(event.target, inputSourceIdx, newChoiceData, choiceIdx), { once: true });
        currentDiv.setAttribute('role', 'button');
        currentDiv.setAttribute('tabIndex', '0');
        currentDiv.append(img, newP, span);
    }
    else {
        airportAddEventListener(currentDiv, inputSourceIdx, newChoiceData, choiceIdx);
        // currentDiv.addEventListener('click', (event) => selectAirportChoice(event.target, inputSourceIdx, newChoiceData, choiceIdx), { once: true });
        currentDiv.appendChild(newP);
    }
    
    if (airportChoicesContainer[inputSourceIdx].children.length < maxResult && newlyCreated){
        airportChoicesContainer[inputSourceIdx].appendChild(currentDiv);
    }
}

function searchAirport(inputSourceIdx, substring) {

    let container = null;
    (inputSourceIdx === 0) ? container = fromContainer : container = toContainer;
    flightFormUpdate('focus', container)

    fetch('/api/iata-codes')
        .then(response => response.json())
        .then(data => {
            // Handle the received JSON data here
            let i = 0;
            let filtered = 0;
            while (data['index'][i] !== undefined && filtered < maxResult) {
                if (data['iata'][i].toLowerCase().includes(substring.toLowerCase()) ||
                    data['name'][i].toLowerCase().includes(substring.toLowerCase()) ||
                    data['iso_country'][i].toLowerCase().includes(substring.toLowerCase()) ||
                    data['municipality'][i].toLowerCase().includes(substring.toLowerCase())
                    ) {
                        if ((inputSourceIdx === 1 && fromLocation.value !== data['iata'][i]) ||
                            inputSourceIdx === 0) {
                                let newChoiceData = {
                                    'name':         data['name'][i],
                                    'iata':         data['iata'][i],
                                    'iso_country':  data['iso_country'][i],
                                    'municipality': data['municipality'][i],
                                    'url':          data['url'][i]
                                }
                                createChoice(inputSourceIdx, newChoiceData, filtered);
                                filtered++;
                            }
                }
                i++;
            }
            
            if (filtered === 0) {

                let newChoiceData = {
                    'name':         'No matches found',
                    'iata':         0,
                    'iso_country':  '',
                    'municipality': ''
                }

                createChoice(inputSourceIdx, newChoiceData, 0);
                filtered++;
            }

            while (airportChoicesContainer[inputSourceIdx].children.length > filtered) {
                    airportChoicesContainer[inputSourceIdx].removeChild(airportChoicesContainer[inputSourceIdx].lastChild)
                }

        })
        .catch(error => {
            // Handle any errors during the fetch request
            console.error('Error:', error);
        });

}

const airportDivListeners = {}

function airportAddEventListener(airportDiv, inputSourceIdx, newChoiceData, choiceIdx) {
    if (airportDivListeners[choiceIdx] !== undefined) {
        airportDiv.removeEventListener('click', airportDivListeners[choiceIdx]);
        airportDivListeners[choiceIdx] = () => { selectAirportChoice(inputSourceIdx, newChoiceData) };
        airportDiv.addEventListener('click', airportDivListeners[choiceIdx]);
    } else {
        airportDivListeners[choiceIdx] = () => { selectAirportChoice(inputSourceIdx, newChoiceData) };
        airportDiv.addEventListener('click', airportDivListeners[choiceIdx]);
    }
}

let currentFrom = null
let currentTo = null
const imagePopupContainer = document.querySelector(".image-popup-container");
const imagePopupElement = document.getElementById("image-popup-element");

function highlightCountry (previous_country, iso_country) {
    let dataItem = polygonSeries.getDataItemById(iso_country);
    let polygon = dataItem.get('mapPolygon');

    polygonSeries.zoomToDataItem(dataItem, 4);
    polygon.setAll({
        active: true
    })
    
    if (previous_country !== null) {
        let prevDataItem = polygonSeries.getDataItemById(previous_country);
        let prevPolygon = prevDataItem.get('mapPolygon');

        prevPolygon.setAll({
            active: false
        })
    } 
}

function selectAirportChoice(inputSourceIdx, newChoiceData) {
    console.log(`${newChoiceData['name']}`)
    imagePopupContainer.style.setProperty("--contentname", `"${newChoiceData['name']}"`);
    imagePopupContainer.classList.add("popped");
    imagePopupElement.src = newChoiceData['url'];
    
    if (inputSourceIdx === 0) {
        highlightCountry(currentFrom, newChoiceData['iso_country'])
        fromLocation.value = `${newChoiceData['municipality']} (${newChoiceData['iata']})`;
        currentFrom = newChoiceData['iso_country'];
        fromJSON.value = JSON.stringify(newChoiceData);
    } else {
        highlightCountry(currentTo, newChoiceData['iso_country'])
        toLocation.value = `${newChoiceData['municipality']} (${newChoiceData['iata']})`;
        currentTo = newChoiceData['iso_country'];
        toJSON.value = JSON.stringify(newChoiceData);
    }
}

function invalidInput(event, element) {
    event.preventDefault();
    element.classList.add('invalid');
}

fromLocation.addEventListener("focus", event => flightFormUpdate(event, fromContainer));
fromLocation.addEventListener("blur", event => flightFormUpdate(event, fromContainer));
toLocation.addEventListener("focus", event => flightFormUpdate(event, toContainer));
toLocation.addEventListener("blur", event => flightFormUpdate(event, toContainer));

fromLocation.addEventListener("input", () => searchAirport(0, fromLocation.value));
toLocation.addEventListener("input", () => searchAirport(1, toLocation.value));
fromLocation.addEventListener("invalid", event => invalidInput(event, fromContainer))
toLocation.addEventListener("invalid", event => invalidInput(event, toContainer))

setTimeout(() => {
    if (toLocation.value !== '') {
        toContainer.classList.add('focused');
    }
    if (fromLocation.value !== '') {
        fromContainer.classList.add('focused');
    }
}, 100);


/*************************/
/*  DEPARTURE DATE FORM  */
/*************************/

// initializations
const departureDate = document.getElementById("departureDate");
const today = new Date();
let todayValues = today.toISOString().split('T')[0].split('-');
console.log(todayValues)
departureDate.value = `${todayValues[0]}-${todayValues[1]}-${todayValues[2]}`;    // gets current date
departureDate.min = departureDate.value;
departureDate.max = `${parseInt(todayValues[0]) + 1}-${todayValues[1]}-${todayValues[2]}`;
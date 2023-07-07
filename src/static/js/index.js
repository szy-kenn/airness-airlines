// MAP CODE

// am5.ready(function() {

// Create root element
// https://www.amcharts.com/docs/v5/getting-started/#Root_element
// var root = am5.Root.new("globe-container");

// // Set themes
// // https://www.amcharts.com/docs/v5/concepts/themes/
// root.setThemes([
//   am5themes_Animated.new(root)
// ]);

// // Create the map chart
// // https://www.amcharts.com/docs/v5/charts/map-chart/
// var chart = root.container.children.push(am5map.MapChart.new(root, {
//   panX: "none",
//   panY: "none",
//   wheelY: "none",
//   pinchZoom: false,
//   maxPanOut: 0,
//   zoomLevel: 1,
//   minZoomLevel: 1,
//   maxZoomLevel: 16,
//   projection: am5map.geoOrthographic(),
//   //projection: am5map.geoMercator(),
// //   homeGeoPoint: {longitude: 121, latitude: 13}
//   homeGeoPoint: { latitude: 2, longitude: 2 }
// }));


// // Create series for background fill
// // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
// var backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {
//     //   fill: "#fff"
// }));

// backgroundSeries.mapPolygons.template.setAll({
//   fill: root.interfaceColors.get("alternativeBackground"),
//   fillOpacity: 0,
//   strokeOpacity: 0
// });

// // Add background polygon
// // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
// backgroundSeries.data.push({
//   geometry: am5map.getGeoRectangle(90, 180, -90, -180)
// });

// // Rotate animation
// chart.animate({
//     key: "rotationX",
//     from: 0,
//     to: 360,
//     duration: 30000,
//     loops: Infinity
//   });

// // Create line series for trajectory lines
// // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
// var lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
// lineSeries.mapLines.template.setAll({
//   stroke: root.interfaceColors.get("alternativeBackground"),
//   strokeOpacity: 0.3
// });

// // Create point series for markers
// // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
// var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

// pointSeries.bullets.push(function() {
//   var circle = am5.Circle.new(root, {
//     radius: 7,
//     // tooltipText: "{name}",
//     cursorOverStyle: "pointer",
//     tooltipY: 0,
//     fill: am5.color(0xffba00), // points
//     stroke: root.interfaceColors.get("background"),
//     strokeWidth: 2,
//     draggable: false
//   });

//   circle.events.on("dragged", function(event) {
//     var dataItem = event.target.dataItem;
//     var projection = chart.get("projection");
//     var geoPoint = chart.invert({ x: circle.x(), y: circle.y() });

//     dataItem.setAll({
//       longitude: geoPoint.longitude,
//       latitude: geoPoint.latitude
//     });
//   });

//   return am5.Bullet.new(root, {
//     sprite: circle
//   });
// });

// // polygonSeries.mapPolygons.template.events.on("click", function(ev) {
// //     var dataItem = polygonSeries.getDataItemById("FR");
// //     console.log(dataItem)
// //     polygonSeries.zoomToDataItem(dataItem, 3);
// //   });

// // chart.events.on("click", function(ev) {
// //     polygonSeries.zoomToDataItem(ev.target.dataItem, 3.5)
// //   });

// var paris = addCity({ latitude: 48.8567, longitude: 2.351 }, "Paris");
// var toronto = addCity({ latitude: 43.8163, longitude: -79.4287 }, "Toronto");
// var la = addCity({ latitude: 34.3, longitude: -118.15 }, "Los Angeles");
// var havana = addCity({ latitude: 23, longitude: -82 }, "Havana");

// // var fromLocation = addCity({}, )
// //var toLocation = 

// var lineDataItem = lineSeries.pushDataItem({
//    pointsToConnect: [paris, toronto, la, havana]
// });

// var planeSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

// var plane = am5.Graphics.new(root, {
//   svgPath:
//     "m2,106h28l24,30h72l-44,-133h35l80,132h98c21,0 21,34 0,34l-98,0 -80,134h-35l43,-133h-71l-24,30h-28l15,-47",
//   scale: 0.06,
//   centerY: am5.p50,
//   centerX: am5.p50,
//   fill: am5.color(0x000000)
// });

// planeSeries.bullets.push(function() {
//   var container = am5.Container.new(root, {});
//   container.children.push(plane);
//   return am5.Bullet.new(root, { sprite: container });
// });


// var planeDataItem = planeSeries.pushDataItem({
//   lineDataItem: lineDataItem,
//   positionOnLine: 0,
//   autoRotate: true
// });
// planeDataItem.dataContext = {};

// planeDataItem.animate({
//   key: "positionOnLine",
//   to: 1,
//   duration: 10000,
//   loops: Infinity,
//   easing: am5.ease.yoyo(am5.ease.linear)
// });

// planeDataItem.on("positionOnLine", (value) => {
//   if (planeDataItem.dataContext.prevPosition < value) {
//     plane.set("rotation", 0);
//   }

//   if (planeDataItem.dataContext.prevPosition > value) {
//     plane.set("rotation", -180);
//   }
//   planeDataItem.dataContext.prevPosition = value;
// });

// function addCity(coords, title) {
//   return pointSeries.pushDataItem({
//     latitude: coords.latitude,
//     longitude: coords.longitude
//   });
// }
// Make stuff animate on load
// chart.appear(1000, 100);

// }); 
// end am5.ready()

import { Map } from '../js/Map.js';
import { getGeoCode} from '../js/geocode.js';

const map = new Map();

map.ready("globe-container", am5map.geoOrthographic(), 
            'rotateX', 'rotateY',
            'zoom', true, "#0C2849", 1);

/******************
 * PASSENGER FORM *
 ******************/
const passengerCount = document.querySelectorAll('.passenger-form__container__passenger-count');
    // passengerCount[0] = adult, [1] = children, [2] = infant
const btnDown = document.querySelectorAll('.btn-down');
const btnUp = document.querySelectorAll('.btn-up');
const airlineClassSelected = document.querySelector('.airline-class--selected');
const airlineClassChoices = document.querySelectorAll('.airline-class__group-choices')
const airlineChoicesDiv = document.querySelectorAll('.airline-class--choices')
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

export function selectAirlineClass(airlineClass) {
    airlineClassSelected.value = airlineClass;
}

export function showChoices(choicesType, index) {

    if (choicesType === "airline-class") {
        airlineClassChoices.style.opacity = 1;
        airlineClassChoices.style.pointerEvents = 'all';
        airlineClassContainer.style.zIndex = 3;
    } else if (choicesType === 'airport') {
        airportChoicesContainer[index].style.opacity = 1;
        airportChoicesContainer[index].style.pointerEvents = 'all';
    }
}

airlineChoicesDiv.forEach(choice => {
    choice.addEventListener('click', () => selectAirlineClass(choice.data.airlineClass))
})

airlineClassSelected.addEventListener('blur', () => {
    airlineClassChoices.style.opacity = 0;
    setTimeout(() => {
        airlineClassChoices.style.pointerEvents = 'none';
        airlineClassContainer.style.zIndex = 0;
    }, 100);
});

airlineClassSelected.addEventListener("click", () => showChoices('airline-class', 0))

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

let currentFrom = null
let currentTo = null

function getCurrentFrom() {
    try {
        return JSON.parse(fromJSON.value);
    }
    catch {
        return undefined;
    }
}

function getCurrentTo() {
    try {
        return JSON.parse(toJSON.value);
    }
    catch {
        return undefined;
    }
}

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
    flightFormUpdate('focus', container);

    fetch('/query/search-airports', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({query : substring})
    })
        .then(response => response.json())
        .then(data => {
            // Handle the received JSON data here
            let i = 0;
            let filtered = 0;
            // console.log(data);
            
            for (let row of data) {

                    if ((inputSourceIdx === 1 && getCurrentFrom() != null && getCurrentFrom()['iata'] === row[0]) ||
                        (inputSourceIdx === 0 && getCurrentTo() != null && getCurrentTo()['iata'] === row[0])) {
                            continue;
                        }

                let newChoiceData = {
                    'iata': row[0],
                    'name': row[1],
                    'municipality': row[2],
                    'iso_country': row[3],
                    'country_name': row[4],
                    'url': row[9]
                }

                createChoice(inputSourceIdx, newChoiceData, filtered);
                filtered++;

            }
            
            if (filtered === 0) {

                let newChoiceData = {
                    'name':         'No matches found',
                    'iata':         0,
                    'iso_country':  '',
                    'country_name': '',
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

const imagePopupContainer = document.querySelector(".image-popup-container");
const imagePopupElement = document.getElementById("image-popup-element");
const access_token = "AAPK0935c5e69f6b41209b83b65c6d1142c8RhIxwlDmGo6x9fm-BgdVEy711mRD4k4MKxOqiivNeSOTM9ek-MzTAqTjql9L-kZj"

function highlightCountry (inputSourceIdx, previous_country, iso_country, municipality) {    
    let dataItem = map.polygonSeries.getDataItemById(iso_country);
    let polygon = dataItem.get('mapPolygon');

    fetch(`https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?token=${access_token}&f=pjson&singleLine=${municipality}`)
        .then(response => response.json())
        .then(data => {
            // console.log(data)
            const address = data['candidates'][0]
            // console.log(address.location.x, address.location.y)
            
            if (inputSourceIdx === 0) {
                map.setSource(address.location.x, address.location.y, address.address);
            } else {
                map.setDestination(address.location.x, address.location.y, address.address);
            }
            
            map.chart.zoomToGeoPoint({longitude: address.location.x, latitude: address.location.y}, 3, true, 2000, -address.location.x)
            polygon.setAll({
                active: true
            })
        })
        .catch(error => console.error(error))

    if (previous_country !== undefined) {
        if (previous_country['iso_country'] === getCurrentFrom()['iso_country'] || previous_country['iso_country'] === getCurrentTo()['iso_country']) {
            return;
        }

        let prevDataItem = map.polygonSeries.getDataItemById(previous_country['iso_country']);
        let prevPolygon = prevDataItem.get('mapPolygon');

        prevPolygon.setAll({
            active: false
        })
    } 
}

function selectAirportChoice(inputSourceIdx, newChoiceData) {
    imagePopupContainer.style.setProperty("--contentname", `"${newChoiceData['municipality']}"`);
    imagePopupContainer.classList.add("popped");
    imagePopupElement.src = newChoiceData['url'];
    
    if (inputSourceIdx === 0) {
        highlightCountry(inputSourceIdx, getCurrentFrom(), newChoiceData['iso_country'], newChoiceData['name'])
        fromLocation.value = `${newChoiceData['municipality']} (${newChoiceData['iata']})`;
        // currentFrom = newChoiceData['iso_country'];
        fromJSON.value = JSON.stringify(newChoiceData);
    } else {
        highlightCountry(inputSourceIdx, getCurrentTo(), newChoiceData['iso_country'], newChoiceData['name'])
        toLocation.value = `${newChoiceData['municipality']} (${newChoiceData['iata']})`;
        // currentTo = newChoiceData['iso_country'];
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

fromLocation.addEventListener("input", () => showChoices('airport', 0));
toLocation.addEventListener("input", () => showChoices('airport', 1));

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
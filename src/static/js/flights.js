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
document.querySelector("html").style.scrollSnapType = "y mandatory";
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

const flightContainers = document.querySelectorAll(".flight-container");
const flightContainerMap = document.querySelector(".map-flight-details-container")
const popupWrapper = document.querySelector(".popup-wrapper");
const popupContainer = document.querySelector(".popup-selected-details");

function getFlightContainersGlobe(container) {

    let children = [];
    container.childNodes.forEach(child => children.push(child));

    for (let i = 0; i < children.length; i++) {
        if (children[i].nodeName === 'DIV') {
            if (children[i].classList.contains('globe-flight-details-container')) {
                return children[i];
            }
        }
    }
} 

import { Map } from '../js/Map.js';

let map = new Map();
let mapCreated = false;

function createMap(container) {
    map.ready(container, am5map.geoEquirectangular(),
                'none', 'none', 'none', false, "#E4EEFD", 1);
    map.createButton();
}

function createPoints(iata, index) {
    fetch('/query/get-geocode', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            },
        body: JSON.stringify({'iata' : iata})
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data[0])
        let name = data[0][0];
        let longitude = data[0][1];
        let latitude = data[0][2];
        console.log(index)
        map.addPoint(latitude, longitude, index, name);
    })
    .catch(error => console.error(error))
}

let searched_flights = null

fetch('/api/searched-flights')
    .then(response => response.json())
    .then(data => searched_flights = data)
    .catch(error => console.error(error))

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP'
});

let currentSelectedFlightIdx = null;

function getSelectedFlight(itineraryCode) {
    fetch('/query/get_itinerary_details', {
        method: 'POST',
        body: JSON.stringify({'itineraryCode': itineraryCode})
    })
    .then(res => {
        res
    })
}

flightContainers.forEach(container => {
    container.addEventListener('click', async(event) => {
        popupWrapper.classList.add('selected');
        currentSelectedFlightIdx = event.target.dataset.index;

        if (!mapCreated) {
            setTimeout(() => {
                createMap(flightContainerMap);
                mapCreated = true;
            }, 100);
        }

        const toFetch = ['get-itinerary-details', 'get-departure-time', 'get-arrival-time']
        toFetch.forEach(_fetch => {
            fetch(`/query/${_fetch}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'itineraryCode': container.dataset.itineraryCode})
            })
            .then(res => res.json())
            .then(data => {
                if (_fetch === toFetch[0]) {
                    document.querySelector(".popup-sidebar-price__price").textContent = "PHP " + formatter.format(data[0][5]);
                } else if (_fetch === toFetch[1]) {
                    document.querySelector('.map-flights-from__time').textContent = data[0][0];
                } else {
                    document.querySelector('.map-flights-to__time').textContent = data[0][0];
                }
                    
            })
        })

        let stops = searched_flights['best'][container.dataset.index]['stops'];

        if (!mapCreated) {
            setTimeout(() => {
                createPoints(stops[0]['origin']['iata'], 0);
                for (let i = 0; i < stops.length; i++) {
                    createPoints(stops[i]['destination']['iata'], i+1);
                }
            }, 150);
            setTimeout(() => {
                map.createTrajectoryLines();
                map.chart.zoomToGeoPoint({longitude: map.pointsToConnect[0]._settings.longitude, latitude: map.pointsToConnect[0]._settings.latitude}, 3, true, 2000)
            }, 1000);

        } else {
            createPoints(stops[0]['origin']['iata'], 0);
            for (let i = 0; i < stops.length; i++) {
                createPoints(stops[i]['destination']['iata'], i+1);
            }
            setTimeout(() => {
                map.createTrajectoryLines();
                map.chart.zoomToGeoPoint({longitude: map.pointsToConnect[0]._settings.longitude, latitude: map.pointsToConnect[0]._settings.latitude}, 3, true, 2000)
            }, 300);
        }
        
    })
})

document.querySelector(".popup-sidebar-button").addEventListener("click", () => {
    // console.log(searched_flights['best'][currentSelectedFlightIdx]);
    selectFlight(searched_flights['best'][currentSelectedFlightIdx]);
})

popupWrapper.addEventListener('click', (event) => {
    if (event.target.classList.contains('popup-wrapper')) {
        popupWrapper.classList.remove('selected');
        popupWrapper.classList.add('closing');
        
        setTimeout(() => {
            popupWrapper.classList.remove('closing');
            map.clearPoints();
        }, 100);
    }
})
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

const flightContainers = document.querySelectorAll(".flight-container");
const flightContainerGlobe = document.querySelector(".map-flight-details-container")
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

function createGlobe(container) {
    map.ready(container, am5map.geoEquirectangular(),
                'none', 'none', 'none', false, "#E4EEFD", 1);
    //     setTimeout(() => {
    //     map.zoomToCity("PH", 2);
    // }, 300);

    // fetch(`https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?token=${access_token}&f=pjson&singleLine=${place}`)
    //     .then(response => response.json())
    //     .then(data => {
            
    //     })
    //     .catch(error => console.error(error))
}

function createPoints() {
    map.setSource()
}

createGlobe(flightContainerGlobe);

let searched_flights = null

fetch('/api/searched-flights')
    .then(response => response.json())
    .then(data => searched_flights = data)
    .catch(error => console.error(error))

flightContainers.forEach(container => {
    container.addEventListener('click', () => {
        popupWrapper.classList.add('selected');
        document.querySelector('.map-flights-from__time').textContent = (searched_flights['best'][container.dataset.index]['departure_time']).substring(11, 16);
        document.querySelector('.map-flights-to__time').textContent = (searched_flights['best'][container.dataset.index]['arrival_time']).substring(11, 16);
        console.log(searched_flights['best'][container.dataset.index]['stops'])
        // createPoints();
    })
})

popupWrapper.addEventListener('click', (event) => {
    if (event.target.classList.contains('popup-wrapper')) {
        popupWrapper.classList.remove('selected');
        popupWrapper.classList.add('closing');
        setTimeout(() => {
            popupWrapper.classList.remove('closing');
        }, 100);
    }
})
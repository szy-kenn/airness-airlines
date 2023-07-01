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
const flightContainerGlobe = document.querySelector(".globe-flight-details-container")

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
const access_token = "AAPK0935c5e69f6b41209b83b65c6d1142c8RhIxwlDmGo6x9fm-BgdVEy711mRD4k4MKxOqiivNeSOTM9ek-MzTAqTjql9L-kZj"

async function createGlobe(container) {
    map.ready(container);
        setTimeout(() => {
        map.zoomToCity("PH", 2);
    }, 300);

    fetch(`https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?token=${access_token}&f=pjson&singleLine=${place}`)
        .then(response => response.json())
        .then(data => {
            
        })
        .catch(error => console.error(error))
}

flightContainers.forEach(container => {
    container.addEventListener('click', (event) => {
    //   console.log(event.target)
        event.target.classList.toggle('opened');
        event.target.classList.toggle('closed');
        if (event.target.classList.contains('opened')) {
            createGlobe(getFlightContainersGlobe(event.target));
        }
    })
})
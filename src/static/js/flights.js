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

async function selectFlight(itineraryCode) {
    try {
        const response = await fetch(`selected-itinerary/${JSON.stringify(itineraryCode)}`, {
            method: 'POST',
            body: JSON.stringify({'itineraryCode': itineraryCode}),
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

// document.getElementById("cheapestBtn").addEventListener('click', (event) => {
//     fetch('/query/get-cheapest-itinerary')
//     .then(res => res.json())
//     .then(data => {
//         console.log(data);
//     })
// })

import { Map } from '../js/Map.js';

let map = new Map();
let mapCreated = false;

function createMap(container) {
    map.ready(container, am5map.geoEquirectangular,
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

// let searched_flights = null

// fetch('/api/searched-flights')
//     .then(response => response.json())
//     .then(data => searched_flights = data)
//     .catch(error => console.error(error))

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP'
});

let currentSelectedFlightIdx = null;
let currentSelectedItineraryCode = null;

flightContainers.forEach(container => {
    container.addEventListener('click', async(event) => {
        popupWrapper.classList.add('selected');
        currentSelectedFlightIdx = event.target.dataset.index;
        currentSelectedItineraryCode = container.dataset.itineraryCode;

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
        
        fetch('/query/get-stops', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'itineraryCode': container.dataset.itineraryCode})
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            let stops = data;

            if (!mapCreated) {
                setTimeout(() => {
                    createPoints(stops[0][4], 0);
                    for (let i = 0; i < stops.length; i++) {
                        createPoints(stops[i][5], i+1);
                    }
                }, 150);
                setTimeout(() => {
                    map.createTrajectoryLines();
                    map.chart.zoomToGeoPoint({longitude: map.pointsToConnect[0]._settings.longitude, latitude: map.pointsToConnect[0]._settings.latitude}, 3, true, 2000)
                }, 1000);
    
            } else {
                createPoints(stops[0][4], 0);
                for (let i = 0; i < stops.length; i++) {
                    createPoints(stops[i][5], i+1);
                }
                setTimeout(() => {
                    map.createTrajectoryLines();
                    map.chart.zoomToGeoPoint({longitude: map.pointsToConnect[0]._settings.longitude, latitude: map.pointsToConnect[0]._settings.latitude}, 3, true, 2000)
                }, 300);
            }
        })
        // let stops = searched_flights['best'][container.dataset.index]['stops'];        
    })
})

document.querySelector(".popup-sidebar-button").addEventListener("click", () => {
    // console.log(searched_flights['best'][currentSelectedFlightIdx]);
    selectFlight(currentSelectedItineraryCode);
})

let filtered = false
let filtersValue = {}
// EXISTING FILTERS
try {
    const filters = document.getElementById("filters");
    filtersValue = JSON.parse(filters.value);
    console.log(filtersValue)
    filtered = true;
} catch {

}

// HIDDEN INPUTS FOR FILTER
const sortByInput = document.getElementById("sortBy") 
const stopsInput = document.getElementById("stops") 
const departureFromInput = document.getElementById("departure-from") 
const departureToInput = document.getElementById("departure-to") 
const durationFromInput = document.getElementById("duration-from") 
const durationToInput = document.getElementById("duration-to") 

const sort_by_btns = document.querySelectorAll(".sort-by-btn")
sort_by_btns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('clicked');
        if (btn.classList.contains('clicked')) {
            sort_by_btns.forEach(sort_btn => {
                if (sort_btn != btn) {
                    sort_btn.classList.remove('clicked')
                }
            })
            sortByInput.value = btn.dataset.value;
        }
    })
})

if (filtered) {
    let sortBy = filtersValue["sortBy"]
    let stops = parseInt(filtersValue["sortBy"])

    if (sortBy !== '') {
        document.querySelector(`.${sortBy}`).classList.add('clicked')
    }
    if (stops == 0) {
        document.querySelectorAll('.stops-btn')[0].classList.add('clicked')
    } else if (stops == 1) {
        document.querySelectorAll('.stops-btn')[1].classList.add('clicked')
    } else {
        document.querySelectorAll('.stops-btn')[2].classList.add('clicked')
    }

}

const stops_btns = document.querySelectorAll(".stops-btn")
stops_btns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('clicked');
        if (btn.classList.contains('clicked')) {
            stops_btns.forEach(stop_btn => {
                if (stop_btn != btn) {
                    stop_btn.classList.remove('clicked')
                }
            })
            stopsInput.value = btn.dataset.value;
        }
    })
})

const pointer1DepartureTime = document.getElementById("point1-departure-time");
const pointer2DepartureTime = document.getElementById("point2-departure-time");
const includedRange = document.querySelector(".departure-time-included-range");

if (filtered) {
    let departureFrom = filtersValue['departure-from'];
    let departureTo = filtersValue['departure-to'];

    if (departureFrom !== "") {
        pointer1DepartureTime.value = parseInt(departureFrom.substring(0, 2)) * 60 + parseInt(departureFrom.substring(3, 5));
    }

    if (departureTo !== "") {
        pointer2DepartureTime.value = parseInt(departureTo.substring(0, 2)) * 60 + parseInt(departureTo.substring(3, 5));
        document.querySelector(".departure-from-value").textContent = departureFrom;
        document.querySelector(".departure-to-value").textContent = departureTo;
    }

    includedRange.style.right = `${pointer1DepartureTime.clientWidth - (pointer2DepartureTime.value/1440 * pointer1DepartureTime.clientWidth)}px`;
}

includedRange.style.left = `${(pointer1DepartureTime.value/1440 * pointer1DepartureTime.clientWidth)}px`;

pointer1DepartureTime.addEventListener('input', (event) => {
    if (parseInt(event.target.value) >= parseInt(pointer2DepartureTime.value)) {
        event.target.value = parseInt(pointer2DepartureTime.value) - 30;
    }
    includedRange.style.left = `${(event.target.value/1440 * pointer1DepartureTime.clientWidth)}px`;
    document.querySelector(".departure-from-value").textContent = 
            `${(parseInt(event.target.value/60)).toString().padStart(2, '0')}:${(event.target.value%60).toString().padStart(2, '0')}`;
    departureFromInput.value = document.querySelector(".departure-from-value").textContent;
});

pointer2DepartureTime.addEventListener('input', (event) => {
    if (parseInt(event.target.value) <= parseInt(pointer1DepartureTime.value)) {
        event.target.value = parseInt(pointer1DepartureTime.value) + 30;
    }

    includedRange.style.right = `${pointer1DepartureTime.clientWidth - (event.target.value/1440 * pointer1DepartureTime.clientWidth)}px`;
    
    if (parseInt(event.target.value) === 1440) {
        document.querySelector(".departure-to-value").textContent = "23:59";
        departureToInput.value = document.querySelector(".departure-to-value").textContent;
        return;
    }
    
    document.querySelector(".departure-to-value").textContent = 
            `${(parseInt(event.target.value/60)).toString().padStart(2, '0')}:${(event.target.value%60).toString().padStart(2, '0')}`;
    departureToInput.value = document.querySelector(".departure-to-value").textContent;
});

// =================================

const pointer1Duration = document.getElementById("point1-duration");
const pointer2Duration = document.getElementById("point2-duration");
const includedRange2 = document.querySelector(".duration-included-range");
let minDuration = 0;
let maxDuration = 0;
let steps = 0;

fetch('/query/min-max-duration')
.then(res => res.json())
.then(data => {
    minDuration = data[0][0];
    maxDuration = data[0][1];
    steps = parseFloat((maxDuration - minDuration) / 30);
    console.log(steps)
    pointer1Duration.min = minDuration;
    pointer1Duration.max = maxDuration;
    pointer1Duration.value = minDuration;

    pointer2Duration.min = minDuration;
    pointer2Duration.max = maxDuration;
    pointer2Duration.value = maxDuration;

    document.querySelector(".duration-from-value").textContent = `${parseInt(minDuration/60)}`;
    document.querySelector(".duration-to-value").textContent = `${parseInt(maxDuration/60)}`;

    durationFromInput.value = document.querySelector(".duration-from-value").textContent;
    durationToInput.value = document.querySelector(".duration-to-value").textContent;

    if (filtered) {
        let durationFrom = filtersValue['duration-from'];
        let durationTo = filtersValue['duration-to'];

        pointer1Duration.value = durationFrom * 60;
        pointer2Duration.value = durationTo * 60;

        document.querySelector(".duration-from-value").textContent = `${durationFrom}`;
        document.querySelector(".duration-to-value").textContent = `${durationTo}`;

        includedRange2.style.left = `${(((pointer1Duration.value)-minDuration)/maxDuration * pointer1Duration.clientWidth)}px`;
        includedRange2.style.right = `${pointer1Duration.clientWidth - (((pointer2Duration.value)-minDuration)/(maxDuration-minDuration) * pointer1Duration.clientWidth)}px`;
    }
})

pointer1Duration.addEventListener('input', (event) => {
    if (parseFloat(event.target.value) >= parseFloat(pointer2Duration.value)) {
        event.target.value = parseFloat(pointer2Duration.value) - steps;
    }
    includedRange2.style.left = `${((parseInt(event.target.value)-minDuration)/(maxDuration-minDuration) * pointer1Duration.clientWidth)}px`;
    document.querySelector(".duration-from-value").textContent = `${parseInt(event.target.value/60)}`;
    durationFromInput.value = document.querySelector(".duration-from-value").textContent;
});

pointer2Duration.addEventListener('input', (event) => {
    if (parseFloat(event.target.value) <= parseFloat(pointer1Duration.value)) {
        event.target.value = parseFloat(pointer1Duration.value) + steps;
    }

    includedRange2.style.right = `${pointer1Duration.clientWidth - ((parseInt(event.target.value)-minDuration)/(maxDuration-minDuration) * pointer1Duration.clientWidth)}px`;
    
    if (parseFloat(event.target.value) > maxDuration) {
        document.querySelector(".duration-to-value").textContent = `${parseInt(maxDuration/60)}`;
        durationToInput.value = document.querySelector(".duration-to-value").textContent;
        return;
    }
    
    document.querySelector(".duration-to-value").textContent =`${parseInt(event.target.value/60)}`; 
    durationToInput.value = document.querySelector(".duration-to-value").textContent;
});

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
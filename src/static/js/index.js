import { Map } from '../js/Map.js';

const map = new Map();

document.querySelector("html").style.scrollSnapType = "y mandatory";
// document.style.scrollSnapType = "y mandatory";
// scroll-snap-type: y mandatory;

// create new airport_t table   
// fetch('/query/create-airport-table')
//     .then(response => response.json())

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

for (let i = 0; i < btnDown.length; i++) {
    btnDown[i].addEventListener('click', () => {
        passengerBtnOnClick('down', i);
    })
}

for (let i = 0; i < btnDown.length; i++) {
    btnUp[i].addEventListener('click', () => {
        passengerBtnOnClick('up', i);
    })
}

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

        if (event.target.value === '') {
            if (i === 0 && getCurrentFrom() !== undefined) {
                map.removePoint('from', map.fromLocationPoint);
            } else if (i === 1 && getCurrentTo() !== undefined) {
                map.removePoint('to', map.toLocationPoint);
            }
            return;
        }

        if (i === 0 && getCurrentFrom() !== undefined) {
            event.target.value = `${getCurrentFrom()['municipality']} (${getCurrentFrom()['iata']})`;
        } else if (i === 1 && getCurrentTo() !== undefined) {
            event.target.value = `${getCurrentTo()['municipality']} (${getCurrentTo()['iata']})`;
        } else {
            event.target.value = '';            
        }
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
        body: JSON.stringify({query : substring.trim()})
    })
        .then(response => response.json())
        .then(data => {
            // Handle the received JSON data here
            let i = 0;
            let filtered = 0;
            
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
                    'continent_name': row[5],
                    'continent_code': row[6],
                    'longitude': row[7],
                    'latitude': row[8],
                    'url': row[9]
                }

                createChoice(inputSourceIdx, newChoiceData, filtered);
                filtered++;

            }
            
            if (filtered === 0) {

                let newChoiceData = {
                    'iata': 0,
                    'name': 'No matches found',
                    'municipality': 'No matches found',
                    'iso_country': '',
                    'country_name': '',
                    'continent_name': '',
                    'continent_code': '',
                    'longitude': '',
                    'latitude': '',
                    'url': ''
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
        if (newChoiceData['iata'] !== 0) {
            airportDiv.addEventListener('click', airportDivListeners[choiceIdx]);
        }
        
    } else {
        airportDivListeners[choiceIdx] = () => { selectAirportChoice(inputSourceIdx, newChoiceData) };
        if (newChoiceData['iata'] !== 0) {
            airportDiv.addEventListener('click', airportDivListeners[choiceIdx]);
        }
    }
}

const imagePopupContainer = document.querySelector(".image-popup-container");
const imagePopupElement = document.getElementById("image-popup-element");
const access_token = "AAPK0935c5e69f6b41209b83b65c6d1142c8RhIxwlDmGo6x9fm-BgdVEy711mRD4k4MKxOqiivNeSOTM9ek-MzTAqTjql9L-kZj"

function highlightCountry (inputSourceIdx, previous_country, newChoiceData) {    
    let dataItem = map.polygonSeries.getDataItemById(newChoiceData['iso_country']);
    let polygon = dataItem.get('mapPolygon');

    const address = {'longitude': newChoiceData['longitude'], 'latitude': newChoiceData['latitude']};

    if (inputSourceIdx === 0) {
        map.setSource(address.longitude, address.latitude, newChoiceData['name']);
    } else {
        map.setDestination(address.longitude, address.latitude, newChoiceData['name']);
    }
    
    map.chart.zoomToGeoPoint({longitude: address.longitude, latitude: address.latitude}, 3, true, 2000, -address.longitude)
    polygon.setAll({
        active: true
    })

    if (previous_country !== undefined) {
        if (inputSourceIdx === 0) {
            if (getCurrentTo() !== undefined && (previous_country['iso_country'] === getCurrentTo()['iso_country'])) {
                return;
            }
        } else {
            if (getCurrentFrom() !== undefined && (previous_country['iso_country'] === getCurrentFrom()['iso_country'])) {
                return;
            }
        }
        
        // if (previous_country['iso_country'] === getCurrentFrom()['iso_country'] || previous_country['iso_country'] === getCurrentTo()['iso_country']) {
        //     return;
        // }

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
        highlightCountry(inputSourceIdx, getCurrentFrom(), newChoiceData)
        fromLocation.value = `${newChoiceData['municipality']} (${newChoiceData['iata']})`;
        // currentFrom = newChoiceData['iso_country'];
        fromJSON.value = JSON.stringify(newChoiceData);
    } else {
        highlightCountry(inputSourceIdx, getCurrentTo(), newChoiceData)
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
fromLocation.addEventListener("focus", () => showChoices('airport', 0));
fromLocation.addEventListener("focus", () => searchAirport(0, fromLocation.value));
fromLocation.addEventListener("blur", event => {
    setTimeout(() => {
        flightFormUpdate(event, fromContainer);
    }, 100);
});
toLocation.addEventListener("focus", event => flightFormUpdate(event, toContainer));
toLocation.addEventListener("focus", () => showChoices('airport', 1));
toLocation.addEventListener("focus", () => searchAirport(1, toLocation.value));
toLocation.addEventListener("blur", event => {
    setTimeout(() => {
        flightFormUpdate(event, toContainer);
    }, 100);
});

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
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

const options = {

};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    })
}, options)

observer.observe(homeBody);

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
        currentDiv.addEventListener('click', () => selectAirportChoice(inputSourceIdx, newChoiceData));
        currentDiv.setAttribute('role', 'button');
        currentDiv.setAttribute('tabIndex', '0');
        currentDiv.append(img, newP, span);
    }
    else {
        currentDiv.addEventListener('click', () => selectAirportChoice(inputSourceIdx, newChoiceData));
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
                                    'municipality': data['municipality'][i]
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

function selectAirportChoice(inputSourceIdx, newChoiceData) {
    if (inputSourceIdx === 0) {
        fromLocation.value = `${newChoiceData['municipality']} (${newChoiceData['iata']})`;
        fromJSON.value = JSON.stringify(newChoiceData);
    } else {
        toLocation.value = `${newChoiceData['municipality']} (${newChoiceData['iata']})`;
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
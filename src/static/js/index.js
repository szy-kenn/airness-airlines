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

function showChoices(index) {
    airlineClassChoices[index].style.opacity = 1;
    airlineClassChoices[index].style.pointerEvents = 'all';
    airlineClassContainer[index].style.zIndex = 3;
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
const fromDiv = document.querySelector(".from");
const toDiv = document.querySelector(".to");

function flightFormUpdate(event, element) {
    if (event.type === 'focus') {
        element.classList.add('focused');
    } else if (event.type === 'blur') {
        element.classList.remove('focused');
        // check if the input is valid
        event.target.value = '';
    }
}

fromLocation.addEventListener("focus", event => flightFormUpdate(event, fromDiv))
fromLocation.addEventListener("blur", event => flightFormUpdate(event, fromDiv))
toLocation.addEventListener("focus", event => flightFormUpdate(event, toDiv))
toLocation.addEventListener("blur", event => flightFormUpdate(event, toDiv))


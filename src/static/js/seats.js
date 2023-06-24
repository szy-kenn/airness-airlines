const selectedSeatsContainer = document.querySelector(".selected-seats-container");
const adultPassengerContainer = [] 
const childPassengerContainer = []



function getStatusText(element) {
    return document.getElementById(`${element.dataset.age}${element.dataset.number}statusText`);
}

function getStatusIcon(element) {
    return document.getElementById(`${element.dataset.age}${element.dataset.number}statusIcon`);
}

function getCurrentlySelecting() {
    return selectedSeatsContainer.dataset.currentlySelecting;
}

function makeSelected(element, seat) {
    element.dataset.state = 'Selected';
    element.classList.remove('selecting');
    element.classList.add('selected', 'active');
    getStatusText(element).textContent = 'Seat ' +  seat.id;
    getStatusIcon(element).className = "fa-solid fa-circle-check";
}

function makeInactive(element) {

    if (element.classList.contains('selecting')) {
        element.dataset.state = 'Pending...';
        element.classList.remove('selecting', 'active');
        element.classList.add('pending', 'inactive');
        getStatusText(element).textContent = element.dataset.state;
        getStatusIcon(element).className = "fa-solid fa-pause";

    } else if (element.classList.contains('selected')) {
        element.classList.remove('active');
        element.classList.add('inactive');
    }
}

function makeActive(element) {

    if (element.classList.contains('pending') || element.classList.contains('new') ) {
        // pending -> selecting
        element.classList.remove('pending', 'inactive', 'new');
        element.classList.add('selecting', 'active');
        element.dataset.state = 'Selecting...';
        getStatusText(element).textContent = element.dataset.state;
        getStatusIcon(element).className = "fa-solid fa-spinner selecting";
    } else if (element.classList.contains('selected')) {
        // selected -> active
        element.classList.remove('inactive');
        element.classList.add('active');
    }

    selectedSeatsContainer.dataset.currentlySelecting = element.id;
}

function makeConfirmed(element) {
    element.classList.remove('selected', 'active');
    element.classList.add('confirmed');
    getStatusIcon(element).className = "fa-regular fa-circle-check";
}

function selectSeat(seat) {
    const id = getCurrentlySelecting();
    if (id !== undefined) {
        const container = document.getElementById(id);
        makeSelected(container, seat);

    } else {
        console.log("Select a passenger first.");
    }
    
}

function confirmSeat(icon) {
    if (icon.classList.contains("fa-circle-check")) {
        const container = icon.parentNode.parentNode;
        makeConfirmed(container);
    }
}

function updateSelectedSeatsContainer() {

    selectedSeatsContainer.childNodes.forEach(child => {
        if (child.nodeName === 'DIV'){
            makeInactive(child);
        }
    })
}

function passengerSelectedSeatOnClick(element) {
    updateSelectedSeatsContainer();
    makeActive(element);
}

function createPassengerSelectedSeat(container) {

    if (!document.querySelector(".selected-seats-no-items").classList.contains('entered-items')) {
        document.querySelector(".selected-seats-no-items").classList.add('entered-items');
    }

    updateSelectedSeatsContainer();

    let passengerSelectedSeat = document.createElement("div");
    passengerSelectedSeat.dataset.age = container.dataset.age;
    passengerSelectedSeat.dataset.number = container.dataset.number;
    passengerSelectedSeat.id = container.dataset.age + container.dataset.number + 'passengerSelectedSeat';
    passengerSelectedSeat.className = 'passenger-selected-seat new';

    passengerSelectedSeat.addEventListener('click', () => passengerSelectedSeatOnClick(passengerSelectedSeat));

    let passengerSeatStatus = document.createElement("div");
    passengerSeatStatus.className = 'select-seat-status';

    let passengerSeatStatusText = document.createElement("p");
    passengerSeatStatusText.className = 'select-seat-status-text';
    passengerSeatStatusText.id = container.dataset.age + container.dataset.number + 'statusText';

    let passengerSeatStatusIcon = document.createElement("i");

    passengerSeatStatusIcon.addEventListener('click', (event) => {
        confirmSeat(event.target);
    })

    passengerSeatStatusIcon.id = container.dataset.age + container.dataset.number + 'statusIcon';

    passengerSeatStatus.append(passengerSeatStatusText, passengerSeatStatusIcon);

    let passengerInfoExtra = document.createElement("div");
    passengerInfoExtra.className = 'passenger-info-extra';

    let passengerInfoExtraNumber = document.createElement("p");
    passengerInfoExtraNumber.textContent = (container.dataset.age).charAt(0).toUpperCase() +(container.dataset.age).slice(1) + " " + container.dataset.number;
    passengerInfoExtraNumber.className = 'passenger-info-extra__number';

    let passengerInfoExtraValue = document.createElement("p");
    passengerInfoExtraValue.innerHTML = "Extras:&nbsp&nbsp<span>PHP 0.00</span>";
    passengerInfoExtraValue.className = 'passenger-info-extra__value';

    passengerInfoExtra.append(passengerInfoExtraNumber, passengerInfoExtraValue);
    passengerSelectedSeat.append(passengerSeatStatus, passengerInfoExtra);
    selectedSeatsContainer.append(passengerSelectedSeat);

    makeActive(passengerSelectedSeat);
}

let i = 1;
while (document.getElementById(`adultPassengerContainer${i}`) !== null) {
    adultPassengerContainer.push(document.getElementById(`adultPassengerContainer${i}`));
    i++;
}

let j = 1;
while (document.getElementById(`childPassengerContainer${j}`) !== null) {
    childPassengerContainer.push(document.getElementById(`childPassengerContainer${j}`));
    j++;
}

adultPassengerContainer.forEach(container => {
    container.addEventListener('click', () => {
        if (container.dataset.state === 'pending') {
            createPassengerSelectedSeat(container);
            container.dataset.state = 'added';
        } else {
            console.log("already added");
        }
    })
})

childPassengerContainer.forEach(container => {
    container.addEventListener('click', () => {
        if (container.dataset.state === 'pending') {
            createPassengerSelectedSeat(container);
            container.dataset.state = 'added';
        } else {
            console.log("already added");
        }
    })
});
const selectedSeatsContainer = document.querySelector(".selected-seats-container");
const seatsDoneBtn = document.querySelector(".seats-done-btn");
const adultPassengerContainer = [];
const childPassengerContainer = [];

let completed = 0;
let totalPassengers = document.querySelector('.sticky-passenger-list-container').dataset.totalpassengers;
let infants = document.querySelector('.sticky-passenger-list-container').dataset.infants;
let passengersToBook = totalPassengers - infants;

function getStatusText(element) {
    return document.getElementById(`${element.dataset.age}${element.dataset.number}statusText`);
}

function getStatusIcon(element) {
    return document.getElementById(`${element.dataset.age}${element.dataset.number}statusIcon`);
}

function getAllBookedSeats() {
    let bookedSeats = {};

    selectedSeatsContainer.childNodes.forEach(child => {
        if (child.nodeName === 'DIV' && child.dataset.state !== undefined){
            bookedSeats[`${child.dataset.age + child.dataset.number}`] = child.dataset.state;
        }
    })

    return bookedSeats;
}

function getCurrentlySelecting() {
    return selectedSeatsContainer.dataset.currentlySelecting;
}

function makeSelected(element, seat) {

    if (seat.classList.contains('selected') || seat.classList.contains('reserved')) {
        // forced make selecting
        element.dataset.state = 'Selecting...';
        element.classList.remove('selected', 'active');
        element.classList.add('selecting');
        getStatusText(element).textContent = element.dataset.state;
        getStatusIcon(element).className = "fa-solid fa-spinner selecting";
        return;
    }

    seat.dataset.passenger = element.dataset.age.charAt(0).toUpperCase() + element.dataset.number;
    seat.classList.add('selected');

    element.dataset.state = seat.id;
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

    } else if (element.classList.contains('selected') || element.classList.contains('confirmed')) {
        element.classList.remove('active');
        element.classList.add('inactive');

        seat = document.getElementById(element.dataset.state);

        if (seat.classList.contains("selected") || seat.classList.contains("reserved")) {
            seat.classList.remove('active');
            seat.classList.add('inactive');
        }
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
    } else if (element.classList.contains('selected') || element.classList.contains('confirmed')) {
        // selected -> active
        element.classList.remove('inactive');
        element.classList.add('active');
        let seat = document.getElementById(element.dataset.state)
        seat.classList.remove('inactive');
        seat.classList.add('active');
    }

    selectedSeatsContainer.dataset.currentlySelecting = element.id;
}

function toggleConfirmed(element) {

    if (element.classList.contains("selected")) {
        element.classList.remove('selected', 'active');
        element.classList.add('confirmed');
        getStatusIcon(element).className = "fa-regular fa-circle-check";
    
        let seat = document.getElementById(element.dataset.state);
        seat.classList.remove('selected', 'active');
        seat.classList.add('reserved', 'active');

        checkCompletion(1);

    } else if (element.classList.contains("confirmed")) {

        element.classList.remove('confirmed');
        element.classList.add('selected', 'active');
        getStatusIcon(element).className = "fa-solid fa-circle-check";
    
        let seat = document.getElementById(element.dataset.state);
        seat.classList.remove('reserved', 'active');  
        seat.classList.add('selected', 'active');

        checkCompletion(-1);
    }
}

function selectSeat(seat) {

    const id = getCurrentlySelecting();
    if (id !== undefined) {
        const container = document.getElementById(id);

        if (container.classList.contains("confirmed")) {
            // confirmed passengers cant choose another seat
            return;
        }

        if (container.dataset.state !== 'Selecting...') {
            document.getElementById(container.dataset.state).classList.remove('selected');
        }
        
        makeSelected(container, seat);

    } else {
        console.log("Select a passenger first.");
    }
    
}

function confirmSeat(icon) {
    if (icon.classList.contains("fa-circle-check")) {
        const container = icon.parentNode.parentNode;
        toggleConfirmed(container);
    } 
}

function updateSelectedSeatsContainer() {

    selectedSeatsContainer.childNodes.forEach(child => {
        if (child.nodeName === 'DIV'){
            makeInactive(child);
        }
    })
}

function checkCompletion(add) {
    completed += add;
    if (completed === passengersToBook) {
        console.log("all passengers have already booked a seat");
        seatsDoneBtn.disabled = false;

    } else {
        console.log(`There are still ${passengersToBook - completed} with no booked seat.`);
    }
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

seatsDoneBtn.addEventListener('click', () => {
    fetch("/payment", {
        method: "POST",
        body: JSON.stringify(getAllBookedSeats())
    }).then((res) => {
        window.location.href = '/payment';
        console.log(res);
    })
})
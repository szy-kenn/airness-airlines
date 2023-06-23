const selectedSeatsContainer = document.querySelector(".selected-seats-container");
const adultPassengerContainer = [] 
const childPassengerContainer = []

function getStatusText(element) {
    return document.getElementById(`${element.dataset.age}${element.dataset.number}statusText`);
}

function getStatusIcon(element) {
    return document.getElementById(`${element.dataset.age}${element.dataset.number}statusIcon`);
}

function updateSelectedSeatsContainer() {

    selectedSeatsContainer.childNodes.forEach(child => {
        if (child.nodeName === 'DIV'){
            if (child.dataset.state === 'Selecting...') {
                child.dataset.state = 'Pending...';
                child.classList.remove('selecting');
                child.classList.add('pending');
                getStatusText(child).textContent = child.dataset.state;
                getStatusIcon(child).className = "fa-solid fa-pause";
            }
        }
    })
}

function updateCurrentlySelecting(element) {

    if (element.classList.contains('pending')) {
        element.classList.remove('pending');
    }
    element.classList.add('selecting');
    element.dataset.state = 'Selecting...';
    getStatusText(element).textContent = element.dataset.state;
    getStatusIcon(element).classList.add("fa-solid", "fa-spinner", "selecting");

    selectedSeatsContainer.dataset.currentlySelecting = element.id;
    console.log(selectedSeatsContainer.dataset.currentlySelecting);
}

function passengerSelectedSeatOnClick(element) {
    updateSelectedSeatsContainer();
    updateCurrentlySelecting(element);
}

function createPassengerSelectedSeat(container) {

    updateSelectedSeatsContainer();

    let passengerSelectedSeat = document.createElement("div");
    passengerSelectedSeat.dataset.age = container.dataset.age;
    passengerSelectedSeat.dataset.number = container.dataset.number;
    passengerSelectedSeat.id = container.dataset.age + container.dataset.number + 'passengerSelectedSeat';
    passengerSelectedSeat.className = 'passenger-selected-seat selecting';

    passengerSelectedSeat.addEventListener('click', () => passengerSelectedSeatOnClick(passengerSelectedSeat));

    let passengerSeatStatus = document.createElement("div");
    passengerSeatStatus.className = 'select-seat-status';

    let passengerSeatStatusText = document.createElement("p");
    passengerSeatStatusText.className = 'select-seat-status-text';
    passengerSeatStatusText.id = container.dataset.age + container.dataset.number + 'statusText';

    let passengerSeatStatusIcon = document.createElement("i");
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

    updateCurrentlySelecting(passengerSelectedSeat);
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

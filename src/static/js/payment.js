const gcash = document.querySelector(".gcash")
const maya = document.querySelector(".maya")
const paypal = document.querySelector(".paypal")
const mobileNumbers = [gcash, maya, paypal]

const mastercard = document.querySelector(".mastercard")
const visa = document.querySelector(".visa")
const creditCards = [mastercard, visa]

const modeOfPayments = [gcash, maya, paypal, mastercard, visa]
const modeOfPaymentInput = document.getElementById("mode-of-payment");

const accountNumberLabel = document.getElementById("account-number-label")
const accountExpDate = document.getElementById("account-exp-date")
const inputFields = document.querySelectorAll(".payment-pg-details__item")
const inputs = document.querySelectorAll(".payment-input")

document.getElementById("pgIndicator1").classList.add('done');
document.getElementById("pgIndicator2").classList.add('done');
document.getElementById("pgIndicator3").classList.add('done');
document.getElementById("pgIndicator4").classList.add('current');

for (let i = 0; i < inputFields.length; i++) {
    inputs[i].addEventListener("focus", () => inputFields[i].classList.add("focused"))
    inputs[i].addEventListener("blur", () => inputFields[i].classList.remove("focused"))
}

mobileNumbers.forEach(method => {   
    method.addEventListener("click", () => {
        accountExpDate.disabled = true;
        accountNumberLabel.textContent = "Mobile Number";
        method.classList.add('clicked')
        modeOfPaymentInput.value = method.dataset.mode;
        modeOfPayments.forEach(mode => {
            if (mode != method) {
                mode.classList.remove('clicked');
            }
        })
    })
})

creditCards.forEach(method => {
    method.addEventListener("click", () => {
        accountExpDate.disabled = false;
        accountNumberLabel.textContent = "Account Number";
        method.classList.add('clicked')
        modeOfPayments.forEach(mode => {
            if (mode != method) {
                mode.classList.remove('clicked');
            }
        })
    })
})

const namesFields = document.querySelectorAll(".name-field")
const alphanumericFields = document.querySelectorAll(".alphanumeric-field")
const numberFields = document.querySelectorAll(".number-field")

namesFields.forEach(field => {
    field.addEventListener("keypress", (event) => {
        if (!/[a-z -.]/i.test(event.key)) {
            event.preventDefault();
        }
    })
}) 

alphanumericFields.forEach(field => {
    field.addEventListener("keypress", (event) => {
        event.preventDefault();
        if (/[0-9a-z]/i.test(event.key)) {
            field.value = (field.value + event.key).toUpperCase();
        }
    })
})

numberFields.forEach(field => {
    field.addEventListener("keypress", (event) => {
        if (!/[0-9-()]/.test(event.key)) {
            event.preventDefault()
        }
    })
})

const paymentDateValue = document.getElementById("payment-date-value");
const paymentFareValue = document.getElementById("payment-fare-value");

const _date = new Date();

paymentDateValue.textContent = `${_date.getFullYear()}-${(_date.getMonth()).toString().padStart(2, 0)}-${(_date.getDate()).toString().padStart(2, 0)}`;
// paymentFareValue.textContent =

// const submitReservationBtn = document.getElementById("submit-reservation");
// submitReservationBtn.addEventListener("click", () => {
//     fetch('/query/post-reservation', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//             },
//         body: JSON.stringify({'reservation' : 'reservation'})
//     })
// })
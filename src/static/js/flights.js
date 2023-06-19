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
    } catch (error) {
        console.error("Error: ", error);
    }
}
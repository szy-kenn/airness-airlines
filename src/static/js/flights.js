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
        } else {
            document.querySelector(`.expanded-section[data-index="${btn.dataset.index}"]`).classList.remove('expanded');
        }
    });
})


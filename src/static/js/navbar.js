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
let welcomeSection = document.querySelector('.home-welcome-section')

const options = {
    threshold: 0.1
};

const bodyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    })
}, options)

const welcomeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            navbar.classList.remove('scrolled');
            navbar.classList.add('hidden');
        } else {
            navbar.classList.remove('hidden');
            navbar.classList.add('scrolled');
        }
    })
}, options) 

const logoNavbarIcon = document.querySelector(".logo-navbar-link")
const logoNavbarImg = document.getElementById("logo-navbar-img")

logoNavbarImg.addEventListener("dragstart", (event) => {
    event.preventDefault()
    console.log("dropped")
})

bodyObserver.observe(homeBody);
// welcomeObserver.observe(welcomeSection);
document.querySelector('.navbar').classList.add('scrolled');

document.getElementById("pgIndicator1").classList.add('done');
document.getElementById("pgIndicator2").classList.add('done');
document.getElementById("pgIndicator3").classList.add('done');
document.getElementById("pgIndicator4").classList.add('done');

let splides = document.querySelectorAll(".splide");

for (let i = 0; i < splides.length; i++) {
    new Splide(splides[i]).mount()
}



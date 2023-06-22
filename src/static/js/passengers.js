let ageGroupExpandBtns = {}

function expandForm(btn, container) {
    btn.classList.toggle('collapsed');
    container.classList.toggle('collapsed');

    if (btn.classList.contains('collapsed')) {
        container.style.height = '3rem';
    } else {
        container.style.height = (container.dataset.count > 0) ? `${(19 * container.dataset.count) + 4}rem` : '3rem';
    }
}

try {

    ageGroupExpandBtns = {
        0: ['adult_expand', 'adult_container', null, null], 
        1: ['children_expand', 'children_container', null, null], 
        2: ['infant_expand', 'infant_container', null, null]
    }

    for (let i = 0; i < 3; i++) {
        ageGroupExpandBtns[i][2] = document.getElementById(ageGroupExpandBtns[i][0]); // expand btn
        ageGroupExpandBtns[i][3] = document.getElementById(ageGroupExpandBtns[i][1]); // container

        ageGroupExpandBtns[i][3].style.height = ageGroupExpandBtns[i][3].style.height = (ageGroupExpandBtns[i][3].dataset.count > 0) ? `${(19 * ageGroupExpandBtns[i][3].dataset.count) + 4}rem` : '3rem';

        ageGroupExpandBtns[i][2].addEventListener('click', () => {
            expandForm(ageGroupExpandBtns[i][2], ageGroupExpandBtns[i][3]);
        })
    }

} catch {
    ;
}
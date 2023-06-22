let ageGroupExpandBtns = {}
let passengerForms = [];
let passengerFormsExpandBtns = [];

function getCurrentIdx(ageGroupIdx) {
    let idx = 0;
    for (let k = ageGroupIdx-1; k >= 0; k--) {
        idx += parseInt(ageGroupExpandBtns[k][3].dataset.count);
    }
    return idx;
}

function expandForm(category, btn, container, ageGroup) {
    btn.classList.toggle('collapsed');
    container.classList.toggle('collapsed');


    if (category == 'ageGroup') {
        if (btn.classList.contains('collapsed')) {
            container.style.height = '3rem';
        } else {
            container.style.height = (container.dataset.count > 0) ? `${(19 * container.dataset.count) + 4}rem` : '3rem';
        }
    } else if (category == 'passenger') {

        ageGroupContainer = ageGroupExpandBtns[ageGroup][3];

        if (btn.classList.contains('collapsed')) {
            container.style.height = '2.7rem';
            ageGroupContainer.style.height =  `${parseFloat(ageGroupContainer.style.height) - 16.3}rem`;
        } else {
            container.style.height = '19rem';
            ageGroupContainer.style.height =  `${parseFloat(ageGroupContainer.style.height) + 16.3}rem`;
        }   
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
            expandForm('ageGroup', ageGroupExpandBtns[i][2], ageGroupExpandBtns[i][3], 0);
        });

        for (let j = 0; j < parseInt(ageGroupExpandBtns[i][3].dataset.count); j++) {
            
                
            passengerForms.push(document.getElementById(`p${(getCurrentIdx(i) + j)+1}`));
            passengerFormsExpandBtns.push(document.getElementById(`p${(getCurrentIdx(i) + j)+1}_expand`));

            passengerFormsExpandBtns[(getCurrentIdx(i) + j)].addEventListener('click', () => {
                expandForm('passenger', passengerFormsExpandBtns[(getCurrentIdx(i) + j)], 
                            passengerForms[(getCurrentIdx(i) + j)], i);
            })
        }

    }

} catch {
    ;
}
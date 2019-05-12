var addColBtn = document.querySelector(".add-task-offer");

var addnewCol = function (newColForm) {

    return function () {
        newColForm.querySelector(".add-task-offer").style.display = 'none';
        newColForm.querySelector(".new-task").style.display = 'block';
        newColForm.querySelector(".add-task-confirm").style.display = 'block';
        newColForm.querySelector(".add-task-reject").style.display = 'block';
    };

};

var addNewColumn = addnewCol(addColBtn.parentNode);

addColBtn.addEventListener('click', addNewColumn);
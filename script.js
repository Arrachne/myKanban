var addColBtn = document.querySelector(".add-column");
var rejectAddBtn = document.querySelector(".add-task-reject");
var addColConfirmBtn = document.querySelector(".add-task-confirm");
var kanban = document.querySelector(".kanban");


var addNewColumnOffer = function () {
    newColForm = this.parentNode;
    hide(newColForm, ".add-task-offer");
    show(newColForm, ".new-task");
    show(newColForm, ".add-task-confirm");
    show(newColForm, ".add-task-reject");        
};

var rejectAddingColumn = function () {
    newColForm = this.parentNode;
    show(newColForm, ".add-task-offer");
    hide(newColForm, ".new-task");
    clear(newColForm, ".columnName");
    hide(newColForm, ".add-task-confirm");
    hide(newColForm, ".add-task-reject");
};

var compileCreateForm = function (formHTML, entityType) {
    switch(entityType) {
        case 'task': 
            return formHTML.replace('{{classType}}', 'adding-task').replace('{{entityType}}', 'карточку');
        default:
            return formHTML.replace('{{classType}}', 'add-column').replace('{{entityType}}', 'колонку');
    };    
    
};

var createNewCol = function () {
    // аппендить новую колонку
    var newCol = document.createElement('div');
    newCol.classList.add("column");
    newCol.innerHTML = compileCreateForm(document.getElementById('formCreate').innerHTML, 'column');
    // newCol.innerHTML = document.getElementById('formCreate').innerHTML;
    kanban.appendChild(newCol);
};

var addNewColumn = function () {
    thisCol = this.parentNode.parentNode;

    // создать имя колонки    
    colName = document.createElement('div');
    colName.classList.add("col-name");
    colName.textContent = thisCol.querySelector(".columnName").value; 
    a = thisCol.firstChild;
    thisCol.insertBefore(colName, thisCol.firstChild);

    // поменять форму создания на создание таска
    thisCol.querySelector('.add-task').innerHTML = compileCreateForm(document.getElementById('formCreateInner').innerHTML, 'task');

    // аппендить новую пустую колонку
    createNewCol();
};


kanban.onclick = function(event) {
    // debugger;
    var target = event.target; // где был клик?

    if (target.classList.contains('add-column')) {
        addNewColumnOffer.apply(target);
    };

    if (target.classList.contains('add-task-reject')) {
        rejectAddingColumn.apply(target);
    };

    if (target.classList.contains('add-task-confirm')) {
        addNewColumn.apply(target);
    };
  
  };  

// addColBtn.addEventListener('click', addNewColumnOffer);
// rejectAddBtn.addEventListener('click', rejectAddingColumn);
// addColConfirmBtn.addEventListener('click', addNewColumn);

function show(element, childSelector) { 
    element.querySelector(childSelector).style.display = 'block'; 
}

function hide(element, childSelector) { 
    element.querySelector(childSelector).style.display = 'none'; 
}

function clear(element, childSelector) { 
    element.querySelector(childSelector).value = ''; 
}
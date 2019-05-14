var addColBtn = document.querySelector(".add-column");
var rejectAddBtn = document.querySelector(".add-element-reject");
var addColConfirmBtn = document.querySelector(".add-element-confirm");
var kanban = document.querySelector(".kanban");


var addNewColumnOffer = function () {
    newColForm = this.parentNode;
    hide(newColForm, ".add-element-offer");
    show(newColForm, ".new-element");
    show(newColForm, ".add-element-confirm");
    show(newColForm, ".add-element-reject");        
};

var rejectAddingColumn = function () {
    newColForm = this.parentNode;
    show(newColForm, ".add-element-offer");
    hide(newColForm, ".new-element");
    clear(newColForm, ".elementName");
    hide(newColForm, ".add-element-confirm");
    hide(newColForm, ".add-element-reject");
};

var compileCreateForm = function (formHTML, entityType) {
    let compiled = '';
    switch(entityType) {
        case 'task': 
            compiled = formHTML.replace(/{{classType}}/gmi, 'task');
            compiled = compiled.replace(/{{entityType}}/gmi, 'карточку');
            compiled = compiled.replace(/{{entityTypeGenitive}}/gmi, 'карточки');
            compiled = compiled.replace(/{{rowsCount}}/gmi, '2');
            break;
        default:
            compiled = formHTML.replace(/{{classType}}/gmi, 'column');
            compiled = compiled.replace(/{{entityType}}/gmi, 'колонку');
            compiled = compiled.replace(/{{entityTypeGenitive}}/gmi, 'колонки');
            compiled = compiled.replace(/{{rowsCount}}/gmi, '1');
    };    
    return compiled
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
    colName.textContent = thisCol.querySelector(".elementName").value; 
    thisCol.insertBefore(colName, thisCol.firstChild);

    // поменять форму создания на создание таска
    thisCol.querySelector('.add-element').innerHTML = compileCreateForm(document.getElementById('formCreateInner').innerHTML, 'task');

    // аппендить новую пустую колонку
    createNewCol();
};

var addNewTask = function () {
    // debugger;
    // контейннер для тасков
    colInner = this.parentNode.previousElementSibling;

    

    // создать и вставить таск в колонку
    task = document.createElement('div');
    task.classList.add("task");
    task.textContent = thisCol.querySelector(".elementName").value; 
    colInner.appendChild(task);

    rejectAddingColumn.apply(this.parentNode.querySelector(".add-element-reject"));
    
};

kanban.onclick = function(event) {
    // debugger;
    var target = event.target; // где был клик?

    if (target.classList.contains('add-element-offer')) {
        addNewColumnOffer.apply(target);
        return;
    };

    if (target.classList.contains('add-element-reject')) {
        rejectAddingColumn.apply(target);
        return;
    };

    if (target.classList.contains('add-column-confirm')) {
        addNewColumn.apply(target);
        return;
    };

    if (target.classList.contains('add-task-confirm')) {
        addNewTask.apply(target);
        return;
    };
  
  };  

function show(element, childSelector) { 
    element.querySelector(childSelector).style.display = 'block'; 
}

function hide(element, childSelector) { 
    element.querySelector(childSelector).style.display = 'none'; 
}

function clear(element, childSelector) { 
    element.querySelector(childSelector).value = ''; 
}
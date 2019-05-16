
// TODO: при взятии таска его размер шрифта меняется

var kanban = document.querySelector(".kanban");

var getParent = function (parentName) {
    parent = this.parentNode;
    while ((!parent.classList.contains(parentName)) && (parent != document.body)) {
        parent = parent.parentNode;
    }
    return parent
};

var addNewColumnOffer = function () {
    newColForm = getParent.call(this, 'add-element');
    hide(newColForm, ".add-element-offer");
    show(newColForm, ".new-element");
    show(newColForm, ".buttons");
};

var rejectAddingColumn = function () {
    newColForm = getParent.call(this, 'add-element');
    show(newColForm, ".add-element-offer");
    hide(newColForm, ".new-element");
    clear(newColForm, ".elementName");
    hide(newColForm, ".buttons");
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
    var newCol = document.createElement('div');
    newCol.classList.add("column");
    newCol.innerHTML = compileCreateForm(document.getElementById('formCreate').innerHTML, 'column');
    kanban.appendChild(newCol);
};

var addNewColumn = function () {
    thisCol = getParent.call(this, 'column');

    // создать контейнер для тасков в текущей колонке
    colName = document.createElement('div');
    colName.classList.add("column-inner");
    thisCol.insertBefore(colName, thisCol.firstChild);

    // создать имя для текущей колонки    
    colName = document.createElement('div');
    colName.classList.add("col-name");
    colName.textContent = thisCol.querySelector(".elementName").value; 
    thisCol.insertBefore(colName, thisCol.firstChild);    

    // поменять форму создания в текущей колонке на создание таска
    thisCol.querySelector('.add-element').innerHTML = compileCreateForm(document.getElementById('formCreateInner').innerHTML, 'task');

    // добавить новую пустую колонку
    createNewCol();
};

var addNewTask = function () {
    // контейннер для тасков
    thisCol = getParent.call(this, 'column');
    colInner = thisCol.querySelector('.column-inner');

    // создать и вставить таск в колонку
    task = document.createElement('div');
    task.classList.add("task");
    task.textContent = thisCol.querySelector(".elementName").value; 
    colInner.appendChild(task);

    // скрыть форму создания таска
    rejectAddingColumn.apply(getParent.call(this, 'column').querySelector(".add-element-reject"));
    
};

kanban.onclick = function(event) {
    var target = event.target;

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

kanban.onmousedown = function(event) { // 1. отследить нажатие
    // правая кнопка мыши не интересует
    if (event.button === 2) {
        return
    };

    var target = event.target; 

    if (target.classList.contains('task')) {
        // запомнить, из какого контейнера достали
        colInnerFrom = getParent.call(target, 'column-inner');
        nextTaskFrom = target.nextSibling;
        // разместить на том же месте, но в абсолютных координатах
        marginLeft = Number(window.getComputedStyle(target).getPropertyValue('margin-left').replace(/\D/g,''));
        marginTop = Number(window.getComputedStyle(target).getPropertyValue('margin-top').replace(/\D/g,''));
        target.style.width = target.offsetWidth - 2 * marginLeft + 'px';
        target.style.height = target.offsetHeight - 2 * marginTop + 'px';
        target.style.position = 'absolute';
        moveAt(event);
        
        // переместим в body, чтобы таск был точно не внутри position:relative
        document.body.appendChild(target);
    
        target.style.zIndex = 1000; // показывать таск над другими элементами
    
        // передвинуть таск под координаты курсора
        // и сдвинуть на половину ширины/высоты для центрирования
        function moveAt(event) {
            target.style.left = event.pageX - target.offsetWidth / 2 + 'px';
            target.style.top = event.pageY - target.offsetHeight / 2 + 'px';
        }
    
        // перемещать по экрану
        document.onmousemove = function(event) {
            moveAt(event);
        }
    
        // отследить окончание переноса
        target.onmouseup = function(event) {
            document.onmousemove = null;

            // целевой контейнер
            NodesUnderCursor = document.elementsFromPoint(event.pageX, event.pageY);

            debugger;
            targetCol = NodesUnderCursor.find((elem) => elem.classList.contains("column"));
            // если отпустили на колонке, и в нем есть иннер, вставить после ближайшего таска
            if ((targetCol) && (targetInnerCol = targetCol.querySelector('.column-inner'))) {
                    insertInInner(targetInnerCol, target, event.pageY);      
            }
            // если отпустили не на колонке, вернуть обратно
            else {
                if (nextTaskFrom) {
                    colInnerFrom.insertBefore(target, nextTaskFrom);
                }
                else {
                    colInnerFrom.appendChild(target);
                }                
            }

            target.style.position = 'inherit';            
            target.onmouseup = null;
        }

    };    
}

function insertInInner(inner, task, y) { 
    // debugger;
    a = Array.from(inner.children);
    nextTask = a.find((elem) => elem.offsetTop + elem.offsetHeight / 2 >= y);
    if (nextTask) {
        inner.insertBefore(task, nextTask);    
    }
    else {
        inner.appendChild(task);
    }
}

function show(element, childSelector) { 
    element.querySelector(childSelector).classList.remove("hideBlock");
}

function hide(element, childSelector) { 
    element.querySelector(childSelector).classList.add("hideBlock");
}

function clear(element, childSelector) { 
    element.querySelector(childSelector).value = ''; 
}
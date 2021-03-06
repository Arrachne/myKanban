var kanban = document.querySelector(".kanban");

kanban.onclick = function (event) {
    var target = event.target;

    // если попали в свг, надо найти его родителя - обычный элемент
    if (target instanceof SVGElement) {
        target = getParentforSVG(target);
    };

    // показать форму добавления элемента
    if (target.classList.contains('add-element-offer')) {
        addNewColumnOffer(target);
        return;
    };

    // скрыть форму добавления элемента
    if (target.classList.contains('add-element-reject')) {
        rejectAddingColumn(target);
        return;
    };

    // создать новую колонку
    if (target.classList.contains('add-column-confirm')) {
        addNewColumn(target);
        return;
    };

    // создать новый таск
    if (target.classList.contains('add-task-confirm')) {
        addNewTask(target);
        return;
    };

    // при клике на таск ничего не должно быть
    if (target.classList.contains('task')) {
        var colInnerFrom = getParent(target, 'column-inner');
        dropTask(event, target, null, colInnerFrom);
        return;
    };
};

// устранить выделение всех последующих объектов когда перетягиваем таск
kanban.onselectstart = function (event) { event.preventDefault() };

// двигать таск
kanban.onmousedown = function (event) {
    // правая кнопка мыши не интересует
    if (event.button === 2) {
        return;
    };

    var target = event.target;

    if (target.classList.contains('task')) {
        // запомнить, из какого контейнера достали
        var colInnerFrom = getParent(target, 'column-inner');
        var nextTaskFrom = getNextTask(target);

        // разместить на том же месте, но в абсолютных координатах
        var marginLeft = Number(window.getComputedStyle(target).getPropertyValue('margin-left').replace(/\D/g, ''));
        var marginTop = Number(window.getComputedStyle(target).getPropertyValue('margin-top').replace(/\D/g, ''));
        target.style.width = target.offsetWidth - 2 * marginLeft + 'px';
        target.style.height = target.offsetHeight - 2 * marginTop + 'px';
        target.classList.add('dragging');
        target.style.position = 'absolute';
        moveAt(event);

        // переместим в body, чтобы таск был точно не внутри position:relative
        document.body.appendChild(target);

        target.style.zIndex = 1000; // показывать таск над другими элементами

        // передвинуть таск под координаты курсора и сдвинуть на половину ширины/высоты для центрирования
        function moveAt(event) {
            target.style.left = event.pageX - target.offsetWidth / 2 + 'px';
            target.style.top = event.pageY - target.offsetHeight / 2 + 'px';
        }

        // вставить пустой контейнер там, откуда взяли таск
        showBlankSpotAtNewPos = showNewTaskPosition(nextTaskFrom);

        // перемещать по экрану
        document.onmousemove = function (event) {
            moveAt(event);
            showBlankSpotAtNewPos(target, event);
        }

        // отследить окончание переноса
        target.onmouseup = function (event) {
            dropTask(event, target, nextTaskFrom, colInnerFrom);
            deleteBlankSpot(target);
        };
    };
};

function dropTask(event, target, nextTaskFrom, colInnerFrom) {
    document.onmousemove = null;

    // целевой контейнер
    var NodesUnderCursor = document.elementsFromPoint(event.pageX, event.pageY);
    var targetCol = NodesUnderCursor.find((elem) => elem.classList.contains("column"));

    // если отпустили на колонке, и в ней есть иннер, вставить после ближайшего таска
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
        };
    };

    target.classList.remove('dragging');
    target.style.position = 'inherit';
    target.onmouseup = null;
};

function addNewColumnOffer(bttn) {
    var newColForm = getParent(bttn, 'add-element');
    hide(newColForm, ".add-element-offer");
    show(newColForm, ".new-element");
    show(newColForm, ".buttons");
};

function rejectAddingColumn(bttn) {
    var newColForm = getParent(bttn, 'add-element');
    show(newColForm, ".add-element-offer");
    hide(newColForm, ".new-element");
    clear(newColForm, ".elementName");
    hide(newColForm, ".buttons");
};

function addNewColumn(bttn) {
    var thisCol = getParent(bttn, 'column');

    // создать контейнер для тасков в текущей колонке
    var colName = document.createElement('div');
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

function addNewTask(bttn) {
    // контейннер для тасков
    var thisCol = getParent(bttn, 'column');
    var colInner = thisCol.querySelector('.column-inner');

    var taskText = thisCol.querySelector(".elementName").value;
    if (taskText) {
        // создать и вставить таск в колонку
        var task = document.createElement('div');
        task.classList.add("task");
        task.textContent = taskText;
        colInner.appendChild(task);

        // скрыть форму создания таска
        rejectAddingColumn(getParent(bttn, 'column').querySelector(".add-element-reject"));
    };
};

// заменить "переменные" в шаблоне
function compileCreateForm(formHTML, entityType) {
    let compiled = '';
    switch (entityType) {
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
    return compiled;
};

function createNewCol() {
    var newCol = document.createElement('div');
    newCol.classList.add("column");

    var innerForm = compileCreateForm(document.getElementById('formCreateInner').innerHTML, 'column');
    var inner = document.getElementById('formCreate').innerHTML.replace(/{{formCreateInner}}/gmi, innerForm);

    newCol.innerHTML = inner;
    kanban.appendChild(newCol);
};

function deleteBlankSpot(target) {
    var inner = getParent(target, 'column-inner');
    var blankSpot = inner.querySelector('.blank-spot');
    if (blankSpot) {
        inner.removeChild(blankSpot);
    };
};

// вставлять пустой контейнер размером с task, если позиция контейнера должна измениться
function showNewTaskPosition(initialNextTask) {
    // предыдущий элемент, перед которым встал бы движущийся таск при  onmouseup
    var nextTask = initialNextTask;
    var blankSpot;

    return function (target, event) {
        // целевой контейнер
        var NodesUnderCursor = document.elementsFromPoint(event.pageX, event.pageY);
        var targetCol = NodesUnderCursor.find((elem) => elem.classList.contains("column"));

        // если находимся на колонке, и в ней есть иннер, найти следующий nextTask
        if ((targetCol) && (targetInnerCol = targetCol.querySelector('.column-inner'))) {
            var newNextTask = getNewTaskPos(targetInnerCol, event.pageY);

            // найти предыдущий контейнер таска
            var prevInner = nextTask ? getParent(nextTask, 'column-inner') : false;

            // нарисовать пустой контейнер на месте, где встанет таск на onmouseup
            var movedOnNewPlace = (nextTask != newNextTask);
            var cannotDefinePrevPlace = ((nextTask == newNextTask) && (targetInnerCol != prevInner));
            if (!prevInner || movedOnNewPlace || cannotDefinePrevPlace) {
                deleteChild(blankSpot);
                blankSpot = insertBlankSpot(targetInnerCol, target, newNextTask);
                nextTask = newNextTask;
            };
        }
        else {
            // удалить пред.пустой контейнер, если он есть
            deleteChild(blankSpot);
        };
    };
};

// вставить пустой контейнер размером с task перед элементом nextTask
function insertBlankSpot(inner, task, nextTask) {
    var blankSpot = document.createElement('div');
    blankSpot.classList.add("task", "blank-spot");
    blankSpot.style.height = task.style.height;
    inner.insertBefore(blankSpot, nextTask);
    return blankSpot;
};

// вернуть элемент, перед которым встал бы таск, если его отпустить
function getNewTaskPos(inner, y) {
    var a = Array.from(inner.children);
    var nextTask = a.find((elem) => {
        var elemY = elem.offsetTop + elem.offsetHeight / 2;
        return (!elem.classList.contains("blank-spot")) && (elemY >= y);
    });
    return nextTask;
}

// вставить таск в inner
function insertInInner(inner, task, y) {
    var nextTask = getNewTaskPos(inner, y)
    if (nextTask) {
        inner.insertBefore(task, nextTask);
    }
    else {
        inner.appendChild(task);
    };
}

function show(element, childSelector) {
    element.querySelector(childSelector).classList.remove("hidden");
}

function hide(element, childSelector) {
    element.querySelector(childSelector).classList.add("hidden");
}

function clear(element, childSelector) {
    element.querySelector(childSelector).value = '';
}

function getParent(elem, parentName) {
    var parent = elem.parentNode;
    while ((!parent.classList.contains(parentName)) && (parent != document.body)) {
        parent = parent.parentNode;
    };
    return parent;
};

function getParentforSVG(elem) {
    var parent = elem.parentNode;
    while ((parent instanceof SVGElement) && (parent != document.body)) {
        parent = parent.parentNode;
    };
    return parent;
};

function deleteChild(child) {
    if (child) {
        var parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        };
    };
};

function getNextTask(target) {
    var colInnerFrom = getParent(target, 'column-inner');
    var a = Array.from(colInnerFrom.children);
    var NextTaskIndex = a.findIndex((elem) => elem == target) + 1;
    if (a[NextTaskIndex]) {
        return a[NextTaskIndex];
    };
}
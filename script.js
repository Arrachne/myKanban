var kanban = document.querySelector(".kanban");

kanban.onclick = function (event) {
    var target = event.target;

    // если попали в свг, надо найти его родителя - обычный элемент
    if (target instanceof SVGElement) {
        target = getParentforSVG.apply(target);
    };

    // показать форму добавления элемента
    if (target.classList.contains('add-element-offer')) {
        addNewColumnOffer.apply(target);
        return;
    };

    // скрыть форму добавления элемента
    if (target.classList.contains('add-element-reject')) {
        rejectAddingColumn.apply(target);
        return;
    };

    // создать новую колонку
    if (target.classList.contains('add-column-confirm')) {
        addNewColumn.apply(target);
        return;
    };

    // создать новый таск
    if (target.classList.contains('add-task-confirm')) {
        addNewTask.apply(target);
        return;
    };
};

kanban.onselectstart = function (e) { e.preventDefault() };

var MoveTask100ms = debounce(moveTask, 100);
// двигать таск
kanban.onmousedown = function (event) {
    MoveTask100ms(event)
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

// заменить "переменные" в шаблоне
var compileCreateForm = function (formHTML, entityType) {
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
    return compiled
};

var createNewCol = function () {
    var newCol = document.createElement('div');
    newCol.classList.add("column");

    innerForm = compileCreateForm(document.getElementById('formCreateInner').innerHTML, 'column');
    inner = document.getElementById('formCreate').innerHTML.replace(/{{formCreateInner}}/gmi, innerForm);

    newCol.innerHTML = inner;
    kanban.appendChild(newCol);
};

function moveTask(event) {
    // правая кнопка мыши не интересует
    if (event.button === 2) {
        return
    };

    var target = event.target;

    if (target.classList.contains('task')) {
        // debugger;
        // запомнить, из какого контейнера достали
        colFrom = getParent.call(target, 'column');
        colInnerFrom = getParent.call(target, 'column-inner');
        nextTaskFrom = getNextTask(target, colInnerFrom);
        // nextTaskFrom = target.nextSibling;

        // разместить на том же месте, но в абсолютных координатах
        marginLeft = Number(window.getComputedStyle(target).getPropertyValue('margin-left').replace(/\D/g, ''));
        marginTop = Number(window.getComputedStyle(target).getPropertyValue('margin-top').replace(/\D/g, ''));
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
            document.onmousemove = null;

            // целевой контейнер
            NodesUnderCursor = document.elementsFromPoint(event.pageX, event.pageY);
            targetCol = NodesUnderCursor.find((elem) => elem.classList.contains("column"));

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
                }
            };

            // удалить пустые контейнеры из-под таска
            deleteChild(blankSpot);
            // deleteChild(prevBlankSpot);
            target.classList.remove('dragging');

            target.style.position = 'inherit';
            target.onmouseup = null;
        };
    };
};

function debounce(f, ms) {
    var timer = null;

    return function (event) {
        var doIt = () => {
            f.call(this, event);
            timer = null;
        }

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(doIt, ms);
    };
};

// вставлять пустой контейнер размером с task, если позиция контейнера должна измениться
function showNewTaskPosition(initialNextTask) {
    // предыдущий элемент, перед которым встал бы движущийся таск при  onmouseup
    var nextTask = initialNextTask;
    var blankSpot;

    return function (target, event) {
        // целевой контейнер
        NodesUnderCursor = document.elementsFromPoint(event.pageX, event.pageY);
        targetCol = NodesUnderCursor.find((elem) => elem.classList.contains("column"));

        // если находимся на колонке, и в ней есть иннер, найти следующий nextTask
        if ((targetCol) && (targetInnerCol = targetCol.querySelector('.column-inner'))) {
            newNextTask = getNewTaskPos(targetInnerCol, event.pageY);

            // найти предыдущий контейнер таска
            prevInner = nextTask ? getParent.call(nextTask, 'column-inner') : false;

            // нарисовать пустой контейнер на месте, где встанет таск на onmouseup
            if (!(prevInner) || (nextTask != newNextTask) || ((nextTask == newNextTask) && (targetInnerCol != prevInner))) {
                deleteChild(blankSpot);
                blankSpot = insertBlankSpot(targetInnerCol, target, newNextTask);
                nextTask = newNextTask;
            }
        }
        else {
            // удалить пред.пустой контейнер, если он есть
            deleteChild(blankSpot);
        };
    }
};

// вставить пустой контейнер размером с task перед элементом nextTask
function insertBlankSpot(inner, task, nextTask) {
    blankSpot = document.createElement('div');
    blankSpot.classList.add("task", "blank-spot");
    blankSpot.style.height = task.style.height;
    inner.insertBefore(blankSpot, nextTask);
    return blankSpot
};

// вернуть элемент, перед которым встал бы таск, если его отпустить
function getNewTaskPos(inner, y) {
    a = Array.from(inner.children);
    nextTask = a.find((elem) => { return (!elem.classList.contains("blank-spot")) && (elem.offsetTop + elem.offsetHeight / 2 >= y) });
    return nextTask
}

// вставить таск в inner
function insertInInner(inner, task, y) {
    // debugger;
    nextTask = getNewTaskPos(inner, y)
    if (nextTask) {
        inner.insertBefore(task, nextTask);
    }
    else {
        inner.appendChild(task);
    }
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

function getParent(parentName) {
    parent = this.parentNode;
    while ((!parent.classList.contains(parentName)) && (parent != document.body)) {
        parent = parent.parentNode;
    }
    return parent
};

var getParentforSVG = function () {
    parent = this.parentNode;
    while ((parent instanceof SVGElement) && (parent != document.body)) {
        parent = parent.parentNode;
    }
    return parent
};

function deleteChild(child) {
    if (child) {
        parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    }
};

function getNextTask(target, colInnerFrom) {
    a = Array.from(colInnerFrom.children);
    NextTaskIndex = a.findIndex((elem) => elem == target) + 1;
    if (a[NextTaskIndex]) {
        return a[NextTaskIndex]
    }
}
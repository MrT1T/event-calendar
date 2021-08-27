// variables

const DIV = 'div';
const SPAN = 'span';
const BUTTON = 'button';
const INPUT = 'input';

// helpers

const createElement = (teg, attributes = {}, text = '') => {
    const element = document.createElement(teg);
    Object.keys(attributes).map(attribute => {
        element.setAttribute(attribute, attributes[attribute]);
    })
    text && (element.innerText = text);
    return element;
}

const changeContainer = (before, after) => {
    const beforeContainer = document.querySelector(`.${before}`);
    beforeContainer && beforeContainer.remove();
    return document.querySelector(`.${after}`);
}

const eventExecution = (key, message) => {
    alert(message);
    localStorage.removeItem(key);
}

const setEvent = (time, message) => {
    const nowDate = new Date();
    const needDate = new Date(time);
    const timer = needDate - nowDate;
    setTimeout(() => eventExecution(time, message), timer);
}

const deleteEvent = (key, line) => {
    localStorage.removeItem(key);
    line.remove();
}

const addLines = (container) => {
    Object.keys(localStorage).map(key => {
        const line = createElement(DIV, {class: 'line', id: key});
        const dateCell = createElement(DIV, {class: 'cell dateCell'}, key);
        const eventCell = createElement(DIV, {class: 'cell eventCell'}, localStorage.getItem(key));
        const editButton = createElement(BUTTON, {class: 'cell'}, 'Edit');
        const deleteButton = createElement(BUTTON, {class: 'cell'}, 'Delete');

        deleteButton.addEventListener('click', () => deleteEvent(key, line));
        editButton.addEventListener('click', () => openModal(key, localStorage.getItem(key)));

        line.append(dateCell, eventCell, editButton, deleteButton);
        container.append(line);
    })
}

const updateLine = (key, newDate, newText) => {
    const line = document.getElementById(key);
    const dateCell = line.querySelector('.dateCell');
    const eventCell = line.querySelector('.eventCell');
    dateCell.innerText = newDate;
    eventCell.innerText = newText;
}

const getToday = () => new Date().toISOString().substring(0, 16);

// modal

const createModal = () => {
    const body = document.querySelector('body');
    const container = createElement(DIV, {class: 'modalContainer'});
    const content = createElement(DIV, {class: 'modalContent'});
    const header = createElement(DIV, {class: 'modalHeader'});
    const title = createElement(SPAN, {class: 'modalTitle'}, 'Edit event');
    const closeIcon = createElement(SPAN, {class: 'closeIcon'}, 'X');
    const main = createElement(DIV, {class: 'modalBody'});
    const datepicker = createElement(INPUT, {type: 'datetime-local', class: 'datepicker', min: getToday()});
    const reminderText = createElement(INPUT, {class: 'reminderText'});
    const footer = createElement(DIV, {class: 'modalFooter'});
    const saveButton = createElement(BUTTON, {class: 'saveButton'}, 'Save');
    const cancelButton = createElement(BUTTON, {class: 'cancelButton'}, 'Cancel');

    container.append(content);
    content.append(header, main, footer);
    header.append(title, closeIcon);
    main.append(datepicker, reminderText);
    footer.append(saveButton, cancelButton);

    const outsideClick = ({target}) => {
        if (target === container) {
            container.style.display = 'none';
        }
    }

    container.addEventListener('click', outsideClick);
    closeIcon.addEventListener('click', () => closeModal(container));
    cancelButton.addEventListener('click', () => closeModal(container));

    body.append(container)
    return container;
}

const addModalValue = (date, text) => {
    let modal = document.querySelector('.modalContainer');
    !modal && (modal = createModal());
    const datepicker = document.querySelector('.datepicker');
    const reminderText = document.querySelector('.reminderText');
    const saveButton = document.querySelector('.saveButton');
    datepicker.value = date;
    reminderText.value = text;

    saveButton.addEventListener('click', () => handlerSaveButton(date, datepicker.value, reminderText.value, modal));
    return modal;
}

function handlerSaveButton(key, newDate, newText, modal) {
    saveChanges(key, newDate, newText);
    updateLine(key, newDate, newText);
    closeModal(modal);
}

function saveChanges(key, newDate, newText) {
    localStorage.removeItem(key);
    localStorage.setItem(newDate, newText);
    setEvent(newDate, newText);
}

function openModal(date, text) {
    const modal = addModalValue(date, text);
    modal.style.display = 'flex';
}

function closeModal(modal) {
    modal.style.display = 'none';
}


// library

(function (window) {
    function define_library() {
        const eventCalendar = {};
        eventCalendar.init = function (el) {
            const container = document.querySelector(el);

            if (!container) {
                console.error('No container element. Please make sure you pass the class to eventCalendar.');
                return;
            }

            if (localStorage.length > 0) {
                Object.keys(localStorage).map(key => {
                    setEvent(key, localStorage.getItem(key));
                })
            }

            const tabsContainer = createElement(DIV, {class: 'tabsContainer'});
            const createTab = createElement(SPAN, {}, 'Create event');
            const showTab = createElement(SPAN, {}, 'Show events');

            const handlerCreateTab = () => {
                let createContainer = changeContainer('showEventContainer', 'createContainer');
                if (createContainer) return;
                createContainer = createElement(DIV, {class: 'createContainer'});
                const datepicker = createElement(INPUT, {type: 'datetime-local', class: 'datepicker', min: getToday()});
                const reminderText = createElement(INPUT, {class: 'reminderText'});
                const createEventButton = createElement(BUTTON, {class: 'createEventButton'}, 'Create');

                const handlerCreateButton = () => {
                    const date = datepicker.value;
                    const event = reminderText.value;
                    localStorage.setItem(date, event);
                    setEvent(date, event);
                    datepicker.value = null;
                    reminderText.value = null;
                }

                createEventButton.addEventListener('click', handlerCreateButton);

                createContainer.append(datepicker, reminderText, createEventButton);
                container.append(createContainer);
            }

            const handlerShowTab = () => {
                let showEventContainer = changeContainer('createContainer', 'showEventContainer');
                if (showEventContainer) return;
                showEventContainer = createElement(DIV, {class: 'showEventContainer'});
                addLines(showEventContainer);

                container.append(showEventContainer);
            }

            createTab.addEventListener('click', handlerCreateTab);
            showTab.addEventListener('click', handlerShowTab);

            tabsContainer.append(createTab, showTab);
            container.append(tabsContainer);
        }
        return eventCalendar;
    }


    if (typeof (eventCalendar) === 'undefined') {
        window.eventCalendar = define_library();
    } else {
        console.log("Library already defined.");
    }
})(window);
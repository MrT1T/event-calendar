function startTime() {
    const tm = new Date();
    const date = tm.toDateString();
    const h = tm.getHours();
    let m = tm.getMinutes();
    m = checkMinutes(m);
    document.getElementById('watch').innerHTML = `${date} <br/> ${h}:${m}`;
    setTimeout('startTime()', 30000);
}

function checkMinutes(i) {
    if (i < 10) i = "0" + i;
    return i;
}

(function (window) {
    function library() {
        // add watch
        startTime();
        let eventList = [];
        // add observer
        const config = {
            attributes: true,
            childList: true,
            subtree: true
        };

        const checkEventDate = () => {
            const nowDate = new Date();
            eventList = eventList.filter(event => {
                if (event.time <= nowDate) {
                    console.log(`Name of event is ${event.name}`);
                    event.callback();
                    return false;
                }
                return true;
            })
            console.log(eventList);
        }

        let observer = new MutationObserver(checkEventDate);
        const target = document.getElementById('watch');
        observer.observe(target, config);

        const addEvent = (name, callback, eventTime) => {
            const time = new Date(eventTime);
            const nowDate = new Date();
            if (nowDate > time) return console.error('The specified callback date is less than the current date.');
            eventList.push({name, callback, time});
        }

        const getEventList = ({
                                  startTime = null,
                                  endTime = null,
                                  day = null,
                                  week = null,
                                  month = null
                              } = {}) => {
            if (startTime > endTime) return console.error('Start time is greater than end time. ');
            const checkStartTime = (time) => startTime ? new Date(startTime) <= time : true;
            const checkEndTime = (time) => endTime ? time <= new Date(endTime) : true;
            return eventList.length === 0 ?
                console.log('Event list is empty')
                : eventList.filter(event => checkStartTime(event.time) && checkEndTime(event.time));
        }

        const deleteEvent = (name) => {
            eventList = eventList.filter(event => event.name !== name)
        }

        const changeEvent = ({name, newName = null, newTime = null} = {}) => {
            if (eventList.length === 0) return console.error('Event list is empty');
            if (!name) return console.error("You haven't entered the name of the event.");
            if (!eventList.some(event => event.name === name)) {
                return console.error("There is no event with this name.");
            }
            const changeName = (oldName) => newName ? newName : oldName;
            const changeTime = (oldTime) => newTime ? new Date(newTime) : oldTime;
            eventList = eventList.map(event => {
                if (event.name === name) {
                    event.name = changeName(event.name)
                    event.time = changeTime(event.time)
                }
                return event;
            })
        }
        return {addEvent, getEventList, deleteEvent, changeEvent};
    }

    if
    (typeof (eventCalendar) === 'undefined') {
        window.eventCalendar = library();
    } else {
        console.log("Library already defined.");
    }
})(window);

const dayMs = 86400000;
const weekMs = 604800000;
const sixDaysMs = 518400000;

Date.prototype.getFirstDayWeek = function (week) {
    const firstJan = new Date(this.getFullYear(), 0, 1);
    const offSetTimeStart = dayMs * (firstJan.getDay() - 1);
    return firstJan.getTime() + weekMs * (week - 1) - offSetTimeStart;
};
Date.prototype.getEndDayWeek = function (week) {
    const firstDayWeek = new Date().getFirstDayWeek(week);
    return firstDayWeek + sixDaysMs;
};

(function () {
    function library() {

        let eventList = [];

        if (localStorage.length !== 0) {
            Object.keys(localStorage).map(key => {
                const id = parseInt(key);
                const eventIndex = eventList.findIndex(item => item.id === `${id}`)

                if (!key.includes('callback')) {
                    const event = JSON.parse(localStorage.getItem(key));

                    if (eventIndex !== -1) {
                        eventList[eventIndex].name = event.name;
                        eventList[eventIndex].time = event.time;
                    } else {
                        eventList.push({id: key, ...event})
                    }

                } else {

                    if (eventIndex !== -1) {
                        eventList[eventIndex].callback = localStorage.getItem(key);
                    } else {
                        eventList.push({id: `${id}`, callback: localStorage.getItem(key)})
                    }

                }
            });
        }

        const makeEvent = (key, name, callback) => {
            console.log(`Name of event is ${name}`);
            eval(callback)();
            localStorage.removeItem(key);
            localStorage.removeItem(`${key}_callback`);
            eventList = eventList.filter(event => event.id !== key)
        }

        const checkEventDate = (event) => {
            const nowDate = new Date();
            const eventTime = new Date(event.time);

            if (eventTime <= nowDate) {
                makeEvent(event.id, event.name, event.callback)
            }

            const nextDay = new Date(nowDate.getTime() + dayMs);

            if (nowDate < eventTime && eventTime <= nextDay) {
                const timeout = eventTime - nowDate;
                const timeoutId = setTimeout(() => makeEvent(event.id, event.name, event.callback), timeout);
                eventList = eventList.map(item => {
                    if (item.id === event.id) {
                        item.timeoutId = timeoutId;
                    }
                    return item;
                });
            }
        }

        const checkEventList = () => {
            eventList.map(event => {
                checkEventDate(event)
            })
            console.log(localStorage);
        }

        setTimeout(function timer() {
            checkEventList();
            setTimeout(timer, dayMs);
        }, 0);


        const addEvent = (name, callback, time) => {
            const eventTime = new Date(time);
            const nowDate = new Date();
            if (nowDate > eventTime) {
                return console.error('The specified callback date is less than the current date.');
            }
            const id = Math.ceil(Math.random() * 1000).toString(); // generate ID
            localStorage.setItem(`${id}_callback`, `${callback}`)
            localStorage.setItem(id, JSON.stringify({name, time}));
            eventList.push({id, name, callback, time});
            checkEventDate({id, name, callback, time})
            console.log({id, name, callback, time});
        }

        const getEventList = ({
                                  startTime = null,
                                  endTime = null,
                                  day = null,
                                  week = null,
                                  month = null
                              } = {}) => {
            if (startTime > endTime) {
                return console.error('Start time is greater than end time. ');
            }
            if (eventList.length === 0) {
                return console.log('Event list is empty');
            }
            const today = new Date();

            if (startTime) {
                startTime = new Date(startTime)
            }

            if (endTime) {
                endTime = new Date(endTime)
            }

            if (month) {
                startTime = new Date(today.getFullYear(), month - 1, 1);
                endTime = new Date(today.getFullYear(), month, 0);
            }

            if (week) {
                startTime = new Date(today.getFirstDayWeek(week));
                endTime = new Date(today.getEndDayWeek(week));
            }

            if (day) {
                startTime = new Date(day);
                endTime = new Date(new Date(day).setHours(24));
            }

            const checkStartTime = (time) => startTime ? startTime <= time : true;
            const checkEndTime = (time) => endTime ? time <= endTime : true;
            const checkDate = (time) => checkStartTime(time) && checkEndTime(time);

            const searchEventList = eventList.filter(event => checkDate(new Date(event.time)))

            return searchEventList.length === 0
                ? console.log('No results were found for your search.') : eventList;
        }

        const deleteEvent = (id) => {
            const event = eventList.find(event => event.id === id);
            if (!event) {
                return console.error('There is no event with this id');
            }
            localStorage.removeItem(id);
            localStorage.removeItem(`${id}_callback`);
            if (event.timeoutId) {
                clearTimeout(event.timeoutId);
            }
            eventList = eventList.filter(event => event.id !== id)
            console.log('You have deleted an event')
            return console.log({...event})
        }

        const changeEvent = ({id, newName = null, newTime = null} = {}) => {
            if (eventList.length === 0) {
                return console.error('Event list is empty');
            }
            if (!id) {
                return console.error("You haven't entered the id of the event.");
            }
            if (newName || newTime) {

                const event = eventList.find(event => event.id === id);
                if (!event) {
                    return console.error('There is no event with this id');
                }
                if (newTime) {
                    const now = new Date();
                    if (now > new Date(newTime)) {
                        return console.error('The new date is less than the current date, specify a different one.');
                    }
                }

                const changeName = (oldName) => newName || oldName;
                const changeTime = (oldTime) => newTime || oldTime;

                event.name = changeName(event.name);
                event.time = changeTime(event.time);

                localStorage.setItem(id, JSON.stringify({name: event.name, time: event.time}));

                eventList = eventList.map(item => {
                    if (item.id === event.id) {
                        item.name = event.name;
                        item.time = event.time;
                    }
                    return item;
                });

                if (event.timeoutId) {
                    clearTimeout(event.timeoutId);
                }

                checkEventDate(event);

                console.log('The event has been changed');
                return console.log({id, ...event})
            }
            return console.error('You must have entered newName or newTime ')
        }
        return {addEvent, getEventList, deleteEvent, changeEvent};
    }

    if
    (typeof (eventCalendar) === 'undefined') {
        window.eventCalendar = library();
    } else {
        console.log("Library already defined.");
    }
})();

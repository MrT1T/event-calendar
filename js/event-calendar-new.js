Date.prototype.getWeek = function () {
    const firstJan = new Date(this.getFullYear(), 0, 1);
    const currentDay = new Date(this.getFullYear(), this.getMonth(), this.getDate());
    const dayOfYear = ((currentDay - firstJan + 86400000) / 86400000);
    return Math.ceil(dayOfYear / 7)
};

(function (window) {
    function library() {

        const checkEventDate = () => {
            const nowDate = new Date();
            Object.keys(localStorage).map(key => {
                const event = JSON.parse(localStorage.getItem(key));
                if (new Date(event.time) <= nowDate) {
                    console.log(`Name of event is ${event.name}`);
                    console.log(event.message);
                    localStorage.removeItem(key);
                }
            })
        }

        setTimeout(function timer() {
            checkEventDate();
            setTimeout(timer, 30000);
        }, 0);


        const addEvent = (name, message, time) => {
            const eventTime = new Date(time);
            const nowDate = new Date();
            if (nowDate > eventTime) return console.error('The specified callback date is less than the current date.');
            const id = (localStorage.length + 1).toString();
            localStorage.setItem(id, JSON.stringify({name, message, time}));
        }

        const getEventList = ({
                                  startTime = null,
                                  endTime = null,
                                  day = null,
                                  week = null,
                                  month = null
                              } = {}) => {
            if (startTime > endTime) return console.error('Start time is greater than end time. ');
            if (localStorage.length === 0) return console.log('Event list is empty');

            const checkStartTime = (time) => startTime ? new Date(startTime) <= time : true;
            const checkEndTime = (time) => endTime ? time <= new Date(endTime) : true;
            const checkDay = (time) => day ? time.getDay() === new Date(day).getDay() : true;
            const checkWeek = (time) => week ? time.getWeek() === week : true;
            const checkMonth = (time) => month ? (time.getMonth() + 1) === month : true;
            const checkDate = (time) => checkStartTime(time) && checkEndTime(time)
                && checkDay(time) && checkMonth(time) && checkWeek(time);

            const eventList = Object.keys(localStorage).map(key => {
                const event = JSON.parse(localStorage.getItem(key));
                const time = new Date(event.time);
                if (checkDate(time)) {
                    return {id: key, ...event}
                }
            });

            return typeof (eventList[0]) === 'undefined'
                ? console.log('No results were found for your search.') : eventList;
        }

        const deleteEvent = (id) => {
            if (!localStorage.getItem(id)) return console.error('There is no event with this id');
            localStorage.removeItem(id);
            return console.log('You have deleted an event')
        }

        const changeEvent = ({id, newName = null, newTime = null} = {}) => {
            if (localStorage.length === 0) return console.error('Event list is empty');
            if (!id) return console.error("You haven't entered the id of the event.");
            const event = JSON.parse(localStorage.getItem(id));
            if (!event) return console.error('There is no event with this id');

            const changeName = (oldName) => newName ? newName : oldName;
            const changeTime = (oldTime) => newTime ? newTime : oldTime;

            event.name = changeName(event.name);
            event.time = changeTime(event.time);

            localStorage.removeItem(id);
            localStorage.setItem(id, JSON.stringify({...event}))

            console.log('The event has been changed')
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

const monthYear = 12
const weekYear = 53
const weekDay = 7

class ValidationService {
    #getDate (time) {
        if (time) {
            return new Date(time)
        }
        return new Date()
    }

    #isId (id) {
        if (!id) {
            console.error('You have not entered an id')
            return false
        }
        return true
    }

    #isEventListEmpty (eventList) {
        if (eventList.length === 0) {
            console.error('Event list is empty')
            return true
        }
        return false
    }

    isAddEvent (name, callback, time, id) {
        let result = true
        if (!name || !callback || !time) {
            console.error('You did not pass any of the parameters name or callback or time')
            result = false
        }

        if (id && Object.keys(localStorage).includes(id)) {
            console.error('An element with the same id already exists')
            result = false
        }

        if (this.#getDate() > this.#getDate(time)) {
            console.error('The specified callback date is less than the current date.')
            result = false
        }
        return result
    }

    isGetEventList (eventList, startTime, endTime, week, month) {
        let result = true
        if (startTime > endTime) {
            console.error('Start time is greater than end time. ')
            result = false
        }
        if (month < 0 || month > monthYear) {
            console.error('Enter the month from 1 to 12')
            result = false
        }
        if (week < 0 || week > weekYear) {
            console.error('Enter the week from 1 to 53')
            result = false
        }
        if (this.#isEventListEmpty(eventList)) {
            result = false
        }
        return result
    }

    isEvent (eventList, event, id) {
        let result = true
        if (!this.#isId(id)) {
            result = false
        }
        if (!event) {
            console.error('There is no event with this id')
            result = false
        }
        if (this.#isEventListEmpty(eventList)) {
            result = false
        }
        return result
    }

    isChangeEvent (eventList, id) {
        let result = true
        if (this.#isEventListEmpty(eventList)) {
            result = false
        }
        if (!this.#isId(id)) {
            result = false
        }
        return result
    }

    isAddRepeatEvent (name, callback, time, repeatDay) {
        let result = this.isAddEvent(name, callback, time)
        if (repeatDay < 0 || repeatDay > weekDay) {
            console.error('Enter the day of week from 0 to 7')
            result = false
        }
        return result
    }
}

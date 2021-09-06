const dayMs = 86400000
const weekMs = 604800000
const sixDaysMs = 518400000
const dayHour = 24
const monthYear = 12
const weekYear = 53

Date.prototype.getFirstDayWeek = (week) => {
  const firstJan = new Date(new Date().getFullYear(), 0, 1)
  const offSetTimeStart = dayMs * (firstJan.getDay() - 1)
  return firstJan.getTime() + weekMs * (week - 1) - offSetTimeStart
}
Date.prototype.getEndDayWeek = (week) => {
  const firstDayWeek = new Date().getFirstDayWeek(week)
  return firstDayWeek + sixDaysMs
}

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

  isAddEvent (name, callback, time) {
    let result = true
    if (!name || typeof callback !== 'function' || !time) {
      console.error('You did not pass any of the parameters name or callback or time')
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
}

(() => {
  function library () {
    let eventList = []

    const validate = new ValidationService()

    if (localStorage.length !== 0) {
      Object.keys(localStorage).map((id) => {
        const testId = parseInt(id, 10);
        if (testId) {
          const event = JSON.parse(localStorage.getItem(id))
          eventList.push({id, ...event})
        }
      })
    }

    const getDate = () => new Date()
    const setDate = time => new Date(time)

    const makeEvent = ({id, name, callback}) => {
      console.log(`Name of event is ${name}`)
      eval(callback)()
      localStorage.removeItem(id)
      eventList = eventList.filter(event => event.id !== id)
    }

    const checkEvent = (event) => {
      const nowDate = getDate()
      const eventTime = setDate(event.time)

      if (eventTime <= nowDate) {
        makeEvent(event)
      }

      const nextDay = setDate(nowDate.getTime() + dayMs)

      if (nowDate < eventTime && eventTime <= nextDay) {
        const timeout = eventTime - nowDate
        const timeoutId = setTimeout(() => makeEvent(event), timeout)
        eventList = eventList.map((item) => {
          if (item.id === event.id) {
            item.timeoutId = timeoutId
          }
          return item
        })
      }
    }

    setTimeout(function timer () {
      eventList.map(event => checkEvent(event))
      setTimeout(timer, dayMs)
    }, 0)

    const addEvent = (name, callback, time) => {
      if (!validate.isAddEvent(name, callback, time)) {
        return
      }
      const id = Math.ceil(Math.random() * 1000).toString() // generate ID
      localStorage.setItem(id, JSON.stringify({ name, time, callback: `${callback}` }))
      eventList.push({
        id, name, callback, time
      })
      checkEvent({
        id, name, callback, time
      })
      return {
        id, name, callback, time
      }
    }

    const getEvent = (id) => {
        id = typeof id === 'number' ? `${id}` : id
        const eventKey = Object.keys(localStorage).find(key => key === id)
        if (!validate.isEvent(eventList, eventKey, id)) {
            return
        }
        const event = JSON.parse(localStorage.getItem(eventKey))
        return {id, ...event}
    }

    const getEventList = ({
      startTime = null,
      endTime = null,
      day = null,
      week = null,
      month = null
    } = {}) => {
      if (!validate.isGetEventList(eventList, startTime, endTime, week, month)) {
        return
      }

      const setStartTime = () => {
        startTime = setDate(startTime)
      }

      const setEndTime = () => {
        endTime = setDate(endTime)
      }

      const getEventListByMonth = () => {
        startTime = new Date(getDate().getFullYear(), month - 1, 1)
        endTime = new Date(getDate().getFullYear(), month, 0)
      }

      const getEventListByWeek = () => {
        startTime = setDate(getDate().getFirstDayWeek(week))
        endTime = setDate(getDate().getEndDayWeek(week))
      }

      const getEventListByDay = () => {
        startTime = setDate(day)
        endTime = setDate(setDate(day).setHours(dayHour))
      }

     startTime && setStartTime();
     endTime && setEndTime();
     month && getEventListByMonth();
     week && getEventListByWeek();
     day && getEventListByDay();

      const isAfterStart = time => (startTime ? startTime <= time : true)
      const isBeforeEnd = time => (endTime ? time <= endTime : true)
      const isInRange = time => isAfterStart(time) && isBeforeEnd(time)

      return eventList.filter(event => isInRange(setDate(event.time)))
    }

    const deleteEvent = (id) => {
      id = typeof id === 'number' ? `${id}` : id
      const event = eventList.find(item => item.id === id)
      if (!validate.isEvent(eventList, event, id)) {
        return
      }

      localStorage.removeItem(id)
      if (event.timeoutId) {
        clearTimeout(event.timeoutId)
      }
      eventList = eventList.filter(item => item.id !== id)
      console.log('You have deleted an event')
      return event
    }

    const changeEvent = ({ id, newName = null, newTime = null } = {}) => {
      if (!validate.isChangeEvent(eventList, id)) {
        return
      }
      if (newName || newTime) {
        const event = eventList.find(item => item.id === id)
        if (!event) {
          return console.error('There is no event with this id')
        }
        if (newTime) {
          if (getDate() > setDate(newTime)) {
            return console.error('The new date is less than the current date, specify a different one.')
          }
        }

        event.name = newName || event.name
        event.time = newTime || event.time

        localStorage.setItem(id, JSON.stringify({ name: event.name, time: event.time }))

        eventList = eventList.map((item) => {
          if (item.id === event.id) {
            item.name = event.name
            item.time = event.time
          }
          return item
        })

        if (event.timeoutId) {
          clearTimeout(event.timeoutId)
        }

        checkEvent(event)

        console.log('The event has been changed')
        return { id, ...event }
      }
      return console.error('You must have entered newName or newTime ')
    }
    return {
      addEvent, getEventList, deleteEvent, changeEvent, getEvent
    }
  }

  if
  (typeof (eventCalendar) === 'undefined') {
    window.eventCalendar = library()
  } else {
    console.log('Library already defined.')
  }
})()

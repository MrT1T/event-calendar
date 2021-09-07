const dayMs = 86400000
const weekMs = 604800000
const sixDaysMs = 518400000
const dayHour = 24

Date.prototype.getFirstDayWeek = (week) => {
  const firstJan = new Date(new Date().getFullYear(), 0, 1)
  const offSetTimeStart = dayMs * (firstJan.getDay() - 1)
  return firstJan.getTime() + weekMs * (week - 1) - offSetTimeStart
}
Date.prototype.getEndDayWeek = (week) => {
  const firstDayWeek = new Date().getFirstDayWeek(week)
  return firstDayWeek + sixDaysMs
}

(() => {
  function library () {
    let eventList = []

    const validate = new ValidationService()

    if (localStorage.length !== 0) {
      Object.keys(localStorage).map((id) => {
        const testId = parseInt(id, 10)
        if (testId) {
          const event = JSON.parse(localStorage.getItem(id))
          eventList.push({ id, ...event })
        }
      })
    }

    const getCurrentDate = () => new Date()
    const getNeedDate = time => new Date(time)

    const makeEvent = ({ id, name, callback }) => {
      console.log(`Name of event is ${name}`)
      eval(callback)()
      localStorage.removeItem(id)
      eventList = eventList.filter(event => event.id !== id)
    }

    const checkEvent = (event) => {
      const nowDate = getCurrentDate()
      const eventTime = getNeedDate(event.time)

      if (eventTime <= nowDate) {
        return makeEvent(event)
      }

      const nextDay = getNeedDate(nowDate.getTime() + dayMs)

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

    const addEvent = (name, callback, time, id = null) => {
      id = String(id || Math.ceil(Math.random() * 1000)) // generate ID
      if (!validate.isAddEvent(name, callback, time, id)) {
        return
      }
      localStorage.setItem(id, JSON.stringify({ name, time, callback: `${callback}` }))
      const event = {
        id, name, callback, time
      }
      eventList.push({ ...event })
      checkEvent(event)
      return event
    }

    const getEvent = (id) => {
      id = String(id || '')
      const eventKey = Object.keys(localStorage).find(key => key === id)
      if (!validate.isEvent(eventList, eventKey, id)) {
        return
      }
      const event = JSON.parse(localStorage.getItem(eventKey))
      return { id, ...event }
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
        startTime = getNeedDate(startTime)
      }

      const setEndTime = () => {
        endTime = getNeedDate(endTime)
      }

      const getEventListByMonth = () => {
        startTime = new Date(getCurrentDate().getFullYear(), month - 1, 1)
        endTime = new Date(getCurrentDate().getFullYear(), month, 0)
      }

      const getEventListByWeek = () => {
        startTime = getNeedDate(getCurrentDate().getFirstDayWeek(week))
        endTime = getNeedDate(getCurrentDate().getEndDayWeek(week))
      }

      const getEventListByDay = () => {
        startTime = getNeedDate(day)
        endTime = getNeedDate(getNeedDate(day).setHours(dayHour))
      }

      startTime && setStartTime()
      endTime && setEndTime()
      month && getEventListByMonth()
      week && getEventListByWeek()
      day && getEventListByDay()

      const isAfterStart = time => (startTime ? startTime <= time : true)
      const isBeforeEnd = time => (endTime ? time <= endTime : true)
      const isInRange = time => isAfterStart(time) && isBeforeEnd(time)

      return eventList.filter(event => isInRange(getNeedDate(event.time)))
    }

    const deleteEvent = (id) => {
      id = String(id || '')
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
      id = String(id || '')
      if (!validate.isChangeEvent(eventList, id)) {
        return
      }
      if (newName || newTime) {
        const event = eventList.find(item => item.id === id)
        if (!event) {
          return console.error('There is no event with this id')
        }
        if (newTime) {
          if (getCurrentDate() > getNeedDate(newTime)) {
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

const dayWeek = 7
const sunday = 7
const msSecond = 1000;

((eventCalendar) => {
  const validate = new ValidationService()
  const baseLibrary = eventCalendar

  const getCurrentDate = () => new Date()
  const getNeedDate = time => new Date(time)

  const getNeedTime = (repeat, time) => {
    const today = getCurrentDate()
    const date = today.toDateString()
    let needTime = `${date} ${time}`

    if (getNeedDate(needTime) < today) {
      const needDate = getNeedDate(today.getTime() + repeat).toDateString()
      needTime = `${needDate} ${time}`
    }
    return needTime
  }

  const addProxy = (callback, time) => {
    const proxyHandler = {
      get (target, name) {
        if (name === 'addEvent') {
          return (...args) => {
            const needDate = getNeedDate(
              getNeedDate(args[2]).getTime() - time * msSecond
            ).toLocaleString()

            target[name]('preEvent', callback, needDate)

            return target[name](...args)
          }
        }
        return target[name]
      }
    }
    window.eventCalendar = new Proxy(baseLibrary, proxyHandler)
  }

  const parseProxy = JSON.parse(localStorage.getItem('proxy'))

  if (parseProxy) {
    addProxy(parseProxy.callback, parseProxy.time)
  }

  eventCalendar.addEveryDayEvent = (name, callback, time) => {
    if (!validate.isAddRepeatEvent(name, callback, time)) {
      return
    }

    const needTime = getNeedTime(dayMs, time)

    const everyDayCallback = () => {
      eval(callback)()
      eventCalendar.addEveryDayEvent(name, callback, time)
    }

    return eventCalendar.addEvent(name, everyDayCallback, needTime)
  }

  eventCalendar.addWeekDayEvent = (name, callback, time, weekDay = 0) => {
    if (!validate.isAddRepeatEvent(name, callback, time, weekDay)) {
      return
    }

    let needTime
    const weekDayNow = getCurrentDate().getDay() || sunday

    if (weekDayNow !== weekDay) {
      const weekOffset = weekDayNow < weekDay
        ? weekDay - weekDayNow
        : dayWeek - weekDayNow + weekDay

      const needDate = getNeedDate(getCurrentDate().getTime() + dayMs * weekOffset).toDateString()

      needTime = `${needDate} ${time}`
    } else {
      needTime = getNeedTime(weekMs, time)
    }

    const weekDayCallback = () => {
      eval(callback)()
      eventCalendar.addWeekDayEvent(name, callback, time, weekDay)
    }

    return eventCalendar.addEvent(name, weekDayCallback, needTime)
  }

  eventCalendar.preEvents = (callback, time) => {
    if (!validate.isPreEvents(callback, time)) {
      return
    }

    const eventList = eventCalendar.getEventList()

    if (eventList.length > 0) {
      eventList.map((event) => {
        if (event.name !== 'preEvent') {
          const needDate = getNeedDate(
            getNeedDate(event.time).getTime() - time * msSecond
          ).toLocaleString()

          return eventCalendar.addEvent('preEvent', callback, needDate)
        }
      })
    }
    localStorage.setItem('proxy', JSON.stringify({ time, callback: `${callback}` }))
    addProxy(callback, time)
  }

  eventCalendar.preEvent = (id, callback, time) => {
    if (!validate.isPreEvent(id, callback, time)) {
      return
    }

    const event = eventCalendar.getEvent(id)

    const needDate = getNeedDate(
      getNeedDate(event.time).getTime() - time * msSecond
    ).toLocaleString()

    return baseLibrary.addEvent('preEvent', callback, needDate)
  }
})(window.eventCalendar)

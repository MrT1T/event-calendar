const dayWeek = 7
const sunday = 7;

((eventCalendar) => {
  const validate = new ValidationService()

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
})(window.eventCalendar)

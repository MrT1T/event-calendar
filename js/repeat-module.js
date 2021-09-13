const daysWeek = 7
const sunday = 7;

((eventCalendar) => {
  const validate = new ValidationService()

  const getCurrentDate = () => new Date()
  const getDate = time => new Date(time)

  const getNeedTime = (repeat, time) => {
    const today = getCurrentDate()
    const date = today.toDateString()
    let needTime = `${date} ${time}`

    if (getDate(needTime) < today) {
      const needDate = getDate(today.getTime() + repeat).toDateString()
      needTime = `${needDate} ${time}`
    }
    return needTime
  }

  eventCalendar.addEveryDayEvent = (name, callback, time) => {
    if (!validate.isEveryDayEvent(name, callback, time)) {
      return
    }

    const needTime = getNeedTime(dayMs, time)

    const everyDayCallback = () => {
      eval(callback)()
      eventCalendar.addEveryDayEvent(name, callback, time)
    }

    return eventCalendar.addEvent(name, everyDayCallback, needTime)
  }

  eventCalendar.addWeekDayEvent = (name, callback, time, weekDays = []) => {
    if (!validate.isAddRepeatEvent(name, callback, time, weekDays)) {
      return
    }

    let needTime
    const currentWeekDay = getCurrentDate().getDay() || sunday

    weekDays.map((weekDay) => {
      if (currentWeekDay !== weekDay) {
        const weekOffset = currentWeekDay < weekDay
          ? weekDay - currentWeekDay
          : daysWeek - currentWeekDay + weekDay

        const needDate = getDate(getCurrentDate().getTime() + dayMs * weekOffset).toDateString()

        needTime = `${needDate} ${time}`
      } else {
        needTime = getNeedTime(weekMs, time)
      }

      const weekDayCallback = () => {
        eval(callback)()
        eventCalendar.addWeekDayEvent(name, callback, time, weekDay)
      }

      return eventCalendar.addEvent(name, weekDayCallback, needTime)
    })
  }
})(window.eventCalendar)

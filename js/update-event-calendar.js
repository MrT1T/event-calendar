const PERIODICITY = 'periodicity'
const weekDays = ['everyday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

(() => {
  function module () {
    let periodicity = {
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      everyday: []
    }

    const validate = new ValidationService()

    if (localStorage.length === 0) {
      localStorage.setItem(PERIODICITY, JSON.stringify(periodicity))
    } else {
      periodicity = JSON.parse(localStorage.getItem(PERIODICITY))
      const today = new Date()
      const weekDay = weekDays[today.getDay()]
      const repeatEventList = periodicity[weekDay].concat(periodicity.everyday)
      repeatEventList.map((event) => {
        const isEvent = localStorage.getItem(event.id)
        if (!isEvent) {
          const {
            name, callback, time, id
          } = event
          const dateString = today.toDateString()
          const needTime = new Date(time).toLocaleTimeString()
          let needDate = `${dateString} ${needTime}`
          if (new Date(needDate) < today) {
            needDate = new Date(today.getTime() + 1000)
          }
          setTimeout(() => window.eventCalendar.addEvent(name, callback, needDate, id), 0)
        }
      })
    }

    const addRepeatEvent = (name, callback, time, repeat) => {
      if (!validate.isAddRepeatEvent(name, callback, time, repeat)) {
        return
      }
      const event = window.eventCalendar.addEvent(name, callback, time)
      if (event) {
        periodicity[weekDays[repeat]].push({
          id: event.id, name, callback: `${callback}`, time
        })
        localStorage.setItem(PERIODICITY, JSON.stringify(periodicity))
      }
      return event
    }

    return {
      addRepeatEvent
    }
  }

  if
  (typeof (updateCalendar) === 'undefined') {
    window.updateCalendar = module()
  } else {
    console.log('Library already defined.')
  }
})()

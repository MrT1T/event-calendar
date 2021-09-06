const PERIODICITY = 'periodicity';

(() => {
  function module () {
    let periodicity = {
      everyday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    }

    if (localStorage.length === 0) {
      localStorage.setItem(PERIODICITY, JSON.stringify(periodicity))
    } else {
      Object.keys(localStorage).map((key) => {
        if (key === PERIODICITY) {
          periodicity = JSON.parse(localStorage.getItem(key))
        }
      })
    }

    const addRepeatEvent = (name, callback, time, repeat) => {
      const event = window.eventCalendar.addEvent(name, callback, time)
      if (event) {
        periodicity[repeat].push({
          id: event.id, name, callback, time
        })
      }
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

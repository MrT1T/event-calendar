const msSecond = 1000;

((eventCalendar) => {
  const validate = new ValidationService()
  const originalAddEvent = eventCalendar.addEvent
  let notification = null

  const getNeedTime = (eventTime, secondBefore) => new Date(
    new Date(eventTime).getTime() - secondBefore * msSecond
  ).toLocaleString()

  eventCalendar.addEvent = (name, callback, time, id = null) => {
    if (notification) {
      const needTime = getNeedTime(time, notification.time)

      originalAddEvent('notification', notification.callback, needTime)
    }
    return originalAddEvent(name, callback, time, id)
  }

  eventCalendar.addEventsNotifications = (callback, time) => {
    if (!validate.isEventsNotifications(callback, time)) {
      return
    }

    const eventList = eventCalendar.getEventList()

    if (eventList.length > 0) {
      eventList.map((event) => {
        if (event.name !== 'notification') {
          const needDate = getNeedTime(event.time, time)

          return originalAddEvent('notification', callback, needDate)
        }
      })
    }
    notification = { callback, time }
  }

  eventCalendar.addEventNotification = (id, callback, time) => {
    if (!validate.isEventNotification(id, callback, time)) {
      return
    }

    const event = eventCalendar.getEvent(id)

    const needDate = getNeedTime(event.time, time)

    return originalAddEvent('notification', callback, needDate)
  }
})(window.eventCalendar)

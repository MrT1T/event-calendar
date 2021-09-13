const msSecond = 1000;

((eventCalendar) => {
  const validate = new ValidationService()
  const originalLibrary = { ...eventCalendar }
  let notification = null

  const getNeedTime = (eventTime, secondBefore) => new Date(
    new Date(eventTime).getTime() - secondBefore * msSecond
  ).toLocaleString()

  const getNotificationEvent = (id) => {
    const eventList = eventCalendar.getEventList()
    return eventList.find(item => item.id === `${id}_notification`)
  }

  eventCalendar.addEvent = (name, callback, time, id = null) => {
    const event = originalLibrary.addEvent(name, callback, time, id)

    if (notification) {
      const needTime = getNeedTime(time, notification.time)

      originalLibrary.addEvent(notification.name, notification.callback, needTime, `${event.id}_notification`)
    }
    return event
  }

  eventCalendar.changeEvent = ({ id, newName = null, newTime = null } = {}) => {
    const event = originalLibrary.getEvent(id)

    if (event) {
      const newEvent = originalLibrary.changeEvent({ id, newName, newTime })
      const notificationEvent = getNotificationEvent(event.id)

      if (notificationEvent) {
        const notificationOffsetSeconds = (new Date(event.time) - new Date(notificationEvent.time)) / msSecond
        const needTime = getNeedTime(newEvent.time, notificationOffsetSeconds)
        originalLibrary.changeEvent(
          { id: `${event.id}_notification`, newName: notificationEvent.name, newTime: needTime }
        )
      }

      return newEvent
    }
  }

  eventCalendar.deleteEvent = (id) => {
    const event = originalLibrary.deleteEvent(id)

    if (event) {
      const notificationEvent = getNotificationEvent(event.id)

      if (notificationEvent) {
        originalLibrary.deleteEvent(notificationEvent.id)
      }
      return event
    }
  }

  eventCalendar.addEventsNotifications = (callback, time, name = 'notification') => {
    if (!validate.isEventsNotifications(callback, time)) {
      return
    }

    const eventList = eventCalendar.getEventList()

    if (eventList.length > 0) {
      eventList.map((event) => {
        if (!event.id.includes('notification')) {
          const needDate = getNeedTime(event.time, time)

          return originalLibrary.addEvent(name, callback, needDate, `${event.id}_notification`)
        }
      })
    }
    notification = { callback, time, name }
  }

  eventCalendar.addEventNotification = (id, callback, time, name = 'notification') => {
    if (!validate.isEventNotification(id, callback, time)) {
      return
    }

    const event = eventCalendar.getEvent(id)

    const needDate = getNeedTime(event.time, time)

    return originalLibrary.addEvent(name, callback, needDate, `${event.id}_notification`)
  }
})(window.eventCalendar)

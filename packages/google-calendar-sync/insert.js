insertEvent = function(event, calendarId){
  console.log("insert event to GCal - " + event.title);
  HTTP.post(
    gCalAPIprefix + "/calendars/"+calendarId+"/events",
    {
      headers: authHeader,
      data: {
        summary: event.title, // perhaps change to "tsnug: " + event.title
        start: {dateTime: moment(event.start).format("YYYY-MM-DDTHH:mm:ssZ")},
        end: {dateTime: moment(event.end).format("YYYY-MM-DDTHH:mm:ssZ")}
      }
    },
    function (error, result){
      if (result.statusCode != 200) console.log('return code not 200');
      else appEvents.update(event._id, {$set:{gCalId: result.data.id}});
    });
};

insertCalendar = function(calendar){
  console.log("insert calendar to GCal - " + calendar.title);
  HTTP.post(
    gCalAPIprefix + "/calendars",
    {
      headers: authHeader,
      data: {summary: calendarTitlePrefix +calendar.title}
    },
    function (error, result) {
      if (result.statusCode === 200) {
        appCalendars.update(calendar._id, {$set:{gCalId: result.data.id}});
        _.each(calendar.eventIds, function(eventId){
          console.log("event added from insertCalendar");
          event = appEvents.findOne({_id:eventId});
          insertEvent(event, result.data.id);
        });
      }
    });
};
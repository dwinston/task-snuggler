insertEvent = function(event, calendarId){
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
  HTTP.post(
    gCalAPIprefix + "/calendars",
    {
      headers: authHeader,
      data: {summary: calendarTitlePrefix +calendar.title}
    },
    function (error, result) {
      if (result.statusCode === 200) {
        console.log(result.data.id);
        appCalendars.update(calendar._id, {$set:{gCalId: result.data.id}});
        console.log(calendar.eventIds);
        _.each(calendar.eventIds, function(eventId){
          event = appEvents.findOne({_id:eventId});
          insertEvent(event, result.data.id);
        });
      }
    });
};
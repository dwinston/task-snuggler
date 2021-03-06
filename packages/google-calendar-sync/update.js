updateEvent = function (event, calendarId){
  // tsnug TODO: update Event doesn't work
  // there is some sync timing problem which makes event.gCalId unavailable
  console.log(event.gCalId);
  HTTP.put(
    gCalAPIprefix + "/calendars/" + calendarId + "/events/" + event.gCalId,
    {
      headers: authHeader,
      data: {
        summary: event.title,
        start: event.start,
        end: event.end
      }
    },
    function(error, result){
      if (result.statusCode != 200) console.log('return code not 200');
      else console.log("updated an event");
    }
  );
};

updateCalendar = function(calendar){
  HTTP.put(
    gCalAPIprefix + "/calendars/" + calendar.gCalId,
    {
      headers: authHeader,
      data: {
        summary: calendarTitlePrefix+calendar.title
      }
    },
    function(error, result){
      if (result.statusCode != 200) console.log('return code not 200');
      else console.log("updated a calendar");
    }
  );
};
gCalFunc.updateEvent = function (calendarId, event){
  HTTP.put(
    gcalAPIprefix + "/calendars/" + calendarId + "/events/" + event.gCalId,
    {
      headers: authHeader,
      data: {
        summary: event.title,
        start: event.start,
        end: event.end
      }
    },
    updateCallBack
  );
}

gCalFunc.updateCalendar = function(calendar){
  HTTP.put(
    gcalAPIprefix + "/calendars/" + calendarId,
    {
      headers: authHeader,
      data: {
        summary: calendar.title
      }
    },
    updateCallBack
  );
}

var updateCallBack = function (error, result){
  if (result.statusCode != 200) console.log('return code not 200');
}
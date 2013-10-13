gCalFunc.insertEvent = function(event, calendarId){
  HTTP.post(
    gcalAPIprefix + "/calendars/"+calendarId+"/events",
    {
      headers: authHeader,
      data: {
        summary: event.title,
        start: {dateTime: moment(event.start).format("YYYY-MM-DDTHH:mm:ssZ")},
        end: {dateTime: moment(event.end).format("YYYY-MM-DDTHH:mm:ssZ")}
      }
    },
    insertCallBack);
});
}

gCalFunc.insertCalendar = function(calendarTitle){
  HTTP.post(
    gcalAPIprefix + "/calendars",
    {
      headers: authHeader,
      data: {summary: calendarTitle}
    },
    insertCallBack);
}

var insertCallBack = function(error, result){
  if (result.statusCode != 200) console.log('return code not 200');
}
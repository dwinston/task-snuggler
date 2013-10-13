var insertEvent = function(event, calendarId){
  HTTP.post(
    gcalAPIprefix + "/calendars/"+calendarId+"/events",
    {
      headers: {'Authorization': Auth},
      data: {
        summary: event.title,
        start: {dateTime: moment(event.start).format("YYYY-MM-DDTHH:mm:ssZ")},
        end: {dateTime: moment(event.end).format("YYYY-MM-DDTHH:mm:ssZ")}
      }
    },
    insertCallBack);
});
}

var insertCalendar = function(title){
  HTTP.post(
    gcalAPIprefix + "/calendars",
    {
      headers: {'Authorization': Auth},
      data: {summary: title}
    },
    insertCallBack);
}

var insertCallBack = function(error, result){
  if (result.statusCode != 200) console.log('return code not 200');
}
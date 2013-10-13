removeCalendar = function(calendarId){
  HTTP.del(
    gcalAPIprefix + "/calendars/"+calendarId,
    {
      headers: {'Authorization': Auth}
    },
    removeCallBack
  );
}

removeEvent = function (eventId, calendarId){
  HTTP.del(
    gcalAPIprefix + "/calendars/"+calendarId+"/events/"+eventId,
    {
      headers: {'Authorization': Auth}
    },
    removeCallBack
  );
}

var removeCallBack = function(error, result){
  if (result.statuscode != 200) console.log('return code not 200');
}
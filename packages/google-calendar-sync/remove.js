gCalFunc.removeCalendar = function(calendarId){
  HTTP.del(
    gcalAPIprefix + "/calendars/"+calendarId,
    headers: authHeader,
    removeCallBack
  );
}

gCalFunc.removeEvent = function (eventId, calendarId){
  HTTP.del(
    gcalAPIprefix + "/calendars/"+calendarId+"/events/"+eventId,
    headers: authHeader,
    removeCallBack
  );
}

var removeCallBack = function(error, result){
  if (result.statuscode != 200) console.log('return code not 200');
}
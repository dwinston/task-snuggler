/*removeCalendar = function(calendarId){
  HTTP.del(
    gcalAPIprefix + "/calendars/"+calendarId,
    {headers: authHeader},
    removeCallBack
  );
};

removeEvent = function (eventId, calendarId){
  HTTP.del(
    gcalAPIprefix + "/calendars/"+calendarId+"/events/"+eventId,
    {headers: authHeader},
    removeCallBack
  );
};

var removeCallBack = function(error, result){
  if (result.statusCode != 200) console.log('return code not 200');
};
*/
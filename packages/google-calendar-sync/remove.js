removeCalendar = function(calendar){
  HTTP.del(
    gCalAPIprefix + "/calendars/"+ calendar.gCalId,
    {headers: authHeader},
    function(error, result){
      if (result.statusCode != 200) console.log('return code not 200');
    }
  );
};

removeEvent = function (eventId, calendarId){
  HTTP.del(
    gCalAPIprefix + "/calendars/"+calendarId+"/events/"+eventId,
    {headers: authHeader},
    function(error, result){
      if (result.statusCode != 200) console.log('return code not 200');
    }
  );
};

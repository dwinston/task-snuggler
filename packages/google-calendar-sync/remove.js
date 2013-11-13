removeEvent = function (event, calendarId){
  // console.log("remove event - ");
  HTTP.del(
    gCalAPIprefix + "/calendars/"+calendarId+"/events/"+ event.gCalId,
    {headers: authHeader},
    function(error, result){
      if (result.statusCode != 200) console.log('return code not 200');
    }
  );
};

removeCalendar = function(calendar){
  // console.log("remove calendar");
  HTTP.del(
    gCalAPIprefix + "/calendars/"+ calendar.gCalId,
    {headers: authHeader},
    function(error, result){
      if (result.statusCode != 200) console.log('return code not 200');
    }
  );
};
Template.userLoggedIn.showAll = function(){
  if (Session.get("showDashboard")){
    return true;
  }
  else{
    return false;
  }
};

// Is there a simple way to do the visibility swap?
// Simply by setting the visible or display property of the 
// corresponding div
Template.userLoggedIn.events({
  "click #panelHideBtn": function(evt, templ){
    evt.preventDefault();
    Session.set("showDashboard", false);
  },
  
  "click #panelShowBtn": function(evt, templ){
    evt.preventDefault();
    Session.set("showDashboard", true);
  }
});
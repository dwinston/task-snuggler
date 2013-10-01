Template.loginPage.events({
  "click #buttonGoogle": function (evt, templ){
    evt.preventDefault();
    Meteor.loginWithGoogle(
      {
        requestPermissions:
        ['openid','email','https://www.googleapis.com/auth/calendar.readonly']
      }, errorCallBack);  
  },
  "submit #loginPage": function (evt, templ) {
    evt.preventDefault();
    var status = Session.get("loginStatus");
    if (status=="signIn") {
      var username = templ.find("#userName").value;
      var password = templ.find("#inputPassword").value;
      Meteor.loginWithPassword(username, password, errorCallBack);
    }
    else if (status=="createAccountReady"){
      var username = templ.find("#userName").value;
      var password = templ.find("#inputPassword").value;
      var passwordAgain = templ.find("#confirmPassword").value;
      // Need account details validation before creation
      Accounts.createUser({
        username:username, 
        password: password
      }, errorCallBackCreateAccount);
    }
  },
  "click #createAccountBtn": function (evt, templ){
    evt.preventDefault();
    Session.set("loginStatus", "createAccountReady");
  },
  "click #signInBtn": function (evt, templ){
    evt.preventDefault();
    Session.set("loginStatus", "signIn");
  }  
});

Template.loginPage.createAccount = function(){
  var status = Session.get("loginStatus");
  if (status=="createAccountReady") return true;
  else return false;
}

var errorCallBack = function(err){
  if (err){
    alert("Login Failed");
  }
}

var errorCallBackCreateAccount = function(err){
  if(err){
    alert("Cannot create user");
  }
}
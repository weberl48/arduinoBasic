module.exports = function(object) {
  error = {errors: []};

  if(object.name.trim() ===  "" ) {
    error.errors.push("Name Cannot be Blank");
  }
  if( object.subject.trim() ===  "" ) {
    error.errors.push("Subject Cannot be Blank");
  }
  if(object.body.trim() ==="" ) {
    error.errors.push("Message cannot be blank");
  }
  if( object.body < 30) {
    error.errors.push("Message must be more than 30 characters");
  }
  if( object.email.trim() === "") {
    error.errors.push("Must enter a email address ");
  }
return error;
};

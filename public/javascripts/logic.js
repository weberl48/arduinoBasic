module.exports = function(object) {
  master = {errors: []};

  if(object.First.trim() ===  "" ) {
    master.errors.push("Name Cannot be Blank");
  }
  if(object.Last.trim() ==="" || object.puppyID < 3) {
    master.errors.push("Must be more than 3 numbers");
  }
  if (object.email === "" ){
  master.errors.push("Name Cannot be Blank");
}
if (object.message === "" ){
  master.errors.push("Hobby Cannot be Blank");
}
return master;
};

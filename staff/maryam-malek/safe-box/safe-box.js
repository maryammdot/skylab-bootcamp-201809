// safe-box.js

var safeBox = {
    saveSecret: function(secret, password) {
        if(typeof password === 'undefined' || typeof password === 'null' || !password.length || !password.trim().length) throw Error ('invalid password');
        this.secret = secret;
        var pass = password;
        return {
            saveSecret: function(){
                
            },
            password: function () {
                return pass;
            }
        }
    },

    retrieveSecret: function(password) {
      debugger;
        if (password === this.saveSecret().password){
            return this.secret;
        }
    }
}


safeBox.saveSecret('hola', '123');
console.log(safeBox.retrieveSecret('123'));
// safe-box.js

var safeBox = {
    saveSecret: function(secret, password) {
        var secr = secret;
        var pass = password;
        return secret;
    },

    retrieveSecret: function(password) {
        if (password === this.saveSecret.pass){
            return this.saveSecret.secr;
        }
    }
};

safeBox.saveSecret('hola', '123');
console.log(safeBox.retrieveSecret('123'));
class User{    
    constructor(name,surname, email, hash, numNoleggi) {
        
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.hash = hash;
        this.numNoleggi = numNoleggi;
    }
}

module.exports = User;

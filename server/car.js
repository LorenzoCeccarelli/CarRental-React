class Car{    
    constructor(id, categoria, marca, modello) {
        if(id)
            this.id = id;

        this.categoria = categoria;
        this.marca = marca;
        this.modello = modello;

    }
}

module.exports = Car;
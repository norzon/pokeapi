module.exports = function (db) {
    return function (req, res) {
        db.query(
            `SELECT *
            FROM pokemon_species
            INNER JOIN pokemon ON pokemon.species_id = pokemon_species.id`
        )
        .then(results => {
            res
            .status(200)
            .json(results)
        });
    }
}
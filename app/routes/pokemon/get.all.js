module.exports = function (db) {
    return async function (req, res) {
        let pokemon = {};
        (await db.query(
            `SELECT *
            FROM pokemon_species`
        )).forEach(p => pokemon[p.id] = Object.assign({
            pokemon: {},
            abilities: [],
            moves: []
        }, p));
        
        (await db.query(
            `SELECT *
            FROM pokemon`
        )).forEach(p => {
            if (!pokemon[p.species_id]) { return; }
            pokemon[p.species_id].pokemon = p
        });
        
        (await db.query(
            `SELECT
                pokemon_moves.pokemon_id,
                moves.identifier AS move,
                pokemon_move_methods.identifier AS pokemon_move_method
            FROM pokemon_moves
            INNER JOIN moves ON moves.id = pokemon_moves.move_id
            INNER JOIN pokemon_move_methods 
                ON pokemon_move_methods.id = pokemon_moves.pokemon_move_method_id
            GROUP BY moves.id, pokemon_id`
        )).forEach(m => {
            if (!pokemon[m.pokemon_id]) { return; }
            pokemon[m.pokemon_id].moves.push(m);
        });

        res
        .status(200)
        .json(pokemon);
    }
}
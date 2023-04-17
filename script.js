const maxPokemon = 1008;            // As of 4/16/2023, PokeAPI has sprites for 1008 Pokemons
const numQuestions = 10;
const delayBeforeStart = 3000;      // To let website fetch more data before starting the quiz
let allTypes = [];
let allPokemons = []
let allPokemonsSingleType = []
let pokemonQuestions = []

function getAllPokemonTypes() {
    fetch(`https://pokeapi.co/api/v2/type`)
        .then((response) => response.json())
        .then((data) => {
            for(let i = 0; i < data.results.length; i++) {
                allTypes[i] = data.results[i].name.toUpperCase();
            }
        })
        .catch((err) => {
            console.log("Error getting Pokemon types", err);
        });
}

function getAllPokemons() {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${maxPokemon}&offset=0`)
        .then((response) => response.json())
        .then((data) => {
            for(let i = 0; i < data.results.length; i++) {
                allPokemons[i] = data.results[i].name;
            }
        })
        .then(() => { getSingleTypePokemons(); })
        .catch((err) => {
            console.log("Error getting all Pokemon", err);
        });
}

function getSingleTypePokemons() {
    for(let i = 0; i < allPokemons.length; i++) {
        let pokemon = allPokemons[i];
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
            .then((response) => response.json())
            .then((data) => {
                if(data.types.length == 1) {
                    allPokemonsSingleType[allPokemonsSingleType.length] = pokemon;
                }
            })
            .catch((err) => {
                console.log("Error getting all single type Pokemon", err);
            });
    }
}

function createQuestion(pokemon) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
        .then((response) => response.json())
        .then((data) => {
            // Get 3 options (answers) randomized
            let options = ["", "", ""];
            options[Math.floor(Math.random() * 3)] = data.types[0].type.name.toUpperCase();
            for(let i = 0; i < options.length; i++) {
                if(options[i] == "") {
                    let newOption = "";
                    do {
                        let index = Math.floor(Math.random() * allTypes.length);
                        newOption = allTypes[index];

                        // Both UNKNOWN and SHADOW types are only present in limited versions of Pokemon
                        if((newOption == "UNKNOWN") || (newOption == "SHADOW")) {
                            newOption = "";
                        }
                    } while(options.includes(newOption));
                    options[i] = newOption;
                }
            }

            document.querySelector(".wrapperQuiz").innerHTML += `
            <div class="question" style="margin-top: 3%;">
                <img alt="test image"
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png" />

                <div class="answers">
                    <div class="answerOption1">
                        <p>${options[0]}</p>
                    </div>

                    <div class="answerOption2">
                        <p>${options[1]}</p>
                    </div>

                    <div class="answerOption3">
                        <p>${options[2]}</p>
                    </div>
                </div>
            </div>
            `;
        })
        .then(() => { document.getElementById("startButton").style.display = "none"; })
        .catch((err) => {
            console.log("Pokemon not found", err);
        });
}

function getQuestions(n) {
    while(n > 0) {
        console.log(allPokemonsSingleType.length);
        let pokemon = Math.floor(Math.random() * allPokemonsSingleType.length);
        if(!pokemonQuestions.includes(allPokemonsSingleType[pokemon])) {
            createQuestion(allPokemonsSingleType[pokemon]);
            pokemonQuestions[pokemonQuestions.length] = allPokemonsSingleType[pokemon];
            n--;
        }
    }
}

function startQuiz() {
    setTimeout(function() { getQuestions(numQuestions) }, delayBeforeStart);
}

function start() {
    document.getElementById("startButton").addEventListener("click", startQuiz, false);
}

// Get all Pokemon types
getAllPokemonTypes();
getAllPokemons();

// Start
window.addEventListener("load", start, false);

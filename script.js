const maxPokemon = 1008;    // As of 4/16/2023, PokeAPI has sprites for 1008 Pokemons
const allTypes = [];

function getPokemonTypes() {
    fetch("https://pokeapi.co/api/v2/type")
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

function createQuestion(pokemon) {
    let result = true;
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
        .then((response) => response.json())
        .then((data) => {
            if(data.types.length == 1) {
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
            } else {
                console.log("HERE WTF");
                result = false;
            }
        })
        .catch((err) => {
            console.log("Pokemon not found", err);
            result = false;
        });
    console.log("SLKJDF");
    return result;
}

function getQuestions(n) {
    while(n > 0) {
        let index = Math.floor(Math.random() * maxPokemon) + 1;
        console.log(n + " : " + createQuestion(index));
        n -= 1;
    }
}

// Get all Pokemon types
getPokemonTypes();

// Gather 10 questions
getQuestions(10);

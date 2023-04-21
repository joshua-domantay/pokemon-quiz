const maxPokemon = 1008;            // As of 4/16/2023, PokeAPI has sprites for 1008 Pokemons
const numQuestions = 10;
const delayBeforeStart = 3500;      // To let website fetch more data before starting the quiz
let allTypes = [];
let allPokemons = []
let allPokemonsSingleType = []
let pokemonQuestions = []
let pokemonQuestionsClicked = []
let pokemonQnA = []

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

function createQuestion(pokemon, index) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
        .then((response) => response.json())
        .then((data) => {
            // Get 3 options (answers) randomized
            let options = ["", "", ""];
            let answerIndex = Math.floor(Math.random() * 3);
            options[answerIndex] = data.types[0].type.name.toUpperCase();
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

            let questionArr = [
                `<div class="question" id="question`,
                `">
                    <div class="imgHolder">
                        <img id="img`,
                `" alt="test image"
                            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png" />
                    </div>

                    <div class="answers">
                        <div class="answerOption0" id="answer0For`,
                `">
                            <p>${options[0]}</p>
                        </div>

                        <div class="answerOption1" id="answer1For`,
                `">
                            <p>${options[1]}</p>
                        </div>

                        <div class="answerOption2" id="answer2For`,
                `">
                            <p>${options[2]}</p>
                        </div>
                    </div>
                </div>`
            ];

            pokemonQnA.push({
                question: questionArr,
                answer: answerIndex
            });
        })
        .catch((err) => {
            console.log("Pokemon not found", err);
        });
}

function showQuestions() {
    for(let i = 0; i < pokemonQnA.length; i++) {
        let toShow = "";
        for(let j = 0; j < (pokemonQnA[i].question.length - 1); j++) {
            toShow += pokemonQnA[i].question[j];
            toShow += `${i}`;
        }
        toShow += pokemonQnA[i].question[(pokemonQnA[i].question.length - 1)];
        document.querySelector(".wrapperQuiz").innerHTML += toShow;
    }
}

function animateQuestions() {
    let delay = 0;
    for(let i = 0; i < pokemonQnA.length; i++) {
        setTimeout(function() {
            document.getElementById(`question${i}`).style.display = "flex";
            let question = popmotion.styler(document.querySelector(`#question${i}`));
            popmotion.tween({
                from: {
                    scale: .6,
                    opacity: 0
                },
                to: {
                    scale: 1,
                    opacity: 1
                },
                duration: 1000,
            }).start(question.set);
        }, delay);
        delay += 500;
    }
}

function setAnswersOnClick() {
    for(let i = 0; i < pokemonQnA.length; i++) {
        pokemonQuestionsClicked[i] = false;
        for(let j = 0; j < 3; j++) {    // 3 answers/options
            document.getElementById(`answer${j}For${i}`).addEventListener(
                "click",
                function() { answerOnClick((j == pokemonQnA[i].answer), i); },
                false);
        }
    }
}

function answerOnClick(correct, index) {
    if(pokemonQuestionsClicked[index]) { return; }

    // Remove cursor pointer for 3 answers/options
    for(let j = 0; j < 3; j++) {    // 3 answers/options
        document.getElementById(`answer${j}For${index}`).style.cursor = "default";
    }

    if(correct) {
        let img = popmotion.styler(document.getElementById(`img${index}`));
        popmotion.tween({
            from: {
                rotate: -25
            },
            to: {
                rotate: 25
            },
            duration: 500,
            flip: Infinity
        }).start(img.set);
    } else {
        let img = popmotion.styler(document.getElementById(`img${index}`));
        popmotion.tween({
            from: {
                x: 0,
                opacity: 1
            },
            to: {
                x: -125,
                opacity: 0
            },
            duration: 1000,
        }).start(img.set);
    }
    pokemonQuestionsClicked[index] = true;
}

function getQuestions(n) {
    while(n > 0) {
        let pokemon = Math.floor(Math.random() * allPokemonsSingleType.length);
        if(!pokemonQuestions.includes(allPokemonsSingleType[pokemon])) {
            createQuestion(allPokemonsSingleType[pokemon]);
            pokemonQuestions[pokemonQuestions.length] = allPokemonsSingleType[pokemon];
            n--;
        }
    }
}

function initializeQuiz() {
    getAllPokemonTypes();
    getAllPokemons();
}

function startQuiz() {
    document.getElementById("startButton").innerText = "Loading...";

    document.getElementById("startButton").style.display = "none";
    document.getElementById("pokeBallLoading").style.display = "block";
    let startButton = popmotion.styler(document.querySelector(".pokeBallLoading"));
    popmotion.tween({
        from: {
            x: -100,
            rotate: -300
        },
        to: {
            x: 100,
            rotate: 600
        },
        duration: 1000,
        flip: Infinity
    }).start(startButton.set);

    initializeQuiz();

    setTimeout(function() { getQuestions(numQuestions) }, delayBeforeStart);
    setTimeout(function() {
        document.getElementById("startContainer").style.display = "none";
        showQuestions(numQuestions);
        animateQuestions();
        setAnswersOnClick();
    }, (delayBeforeStart * 2));
}

function start() {
    document.getElementById("startButton").addEventListener("click", startQuiz, false);
}

// Start
window.addEventListener("load", start, false);

let sixLttrFound = false;
let gaveUp = false;
let score = 0;

function updateScore() {
    document.querySelector("#score").innerHTML = `Score: ${score}`;
};

// Home screen stuff
const title = document.querySelector("#special-title");
let titleName_o = "anagrams";
let titleName_s = scrambleWord(titleName_o);
let iter = 0;
letterify(titleName_s, title);
const titleAnimation = setInterval(() => {
    iter++;
    if (iter === 20) {
        titleName_s = titleName_o;
        letterify(titleName_s, title);
        clearInterval(titleAnimation);
        iter = 0;
        return;
    }
    titleName_s = scrambleWord(titleName_o);
    letterify(titleName_s, title);
}, 100);

const targetWord = document.querySelector("#target-word-container");
const wordList = document.querySelector("#word-list");
const wordInput = document.querySelector("#word-input");

function letterify(str, div) {
    if (div.lastElementChild) {
        while (div.lastElementChild) {
            div.removeChild(div.lastElementChild);
        };
    }

    const arr = str.split("");

    for (let i = 0; i < arr.length; i++) {
        const elem = document.createElement("p");
        elem.classList.add("target-letter");
        if (gaveUp === true) {
            elem.classList.add("target-letter-f");
        } else if (sixLttrFound === true || iter === 20) {
            elem.classList.add("target-letter-g");
        }
        elem.innerHTML = arr[i].toUpperCase();
        div.append(elem);
    };
};

let originalWord = getRandomWord();
let mixedWord = scrambleWord(originalWord);
letterify(mixedWord, targetWord);

const newBoardBtn = document.querySelector("#new-word");
const reshuffleBtn = document.querySelector("#reshuffle");
const giveUpBtn = document.querySelector("#give-up");
function newBoard() {
    enableTyping();
    if (highlight) {
        clearInterval(highlight);
        highlight = null;
    }
    highlightBtn(newBoardBtn, false);
    giveUpBtn.classList.remove("btn-disabled");
    reshuffleBtn.classList.remove("btn-disabled");
    sixLttrFound = false;
    gaveUp = false;
    originalWord = getRandomWord();
    mixedWord = scrambleWord(originalWord);
    letterify(mixedWord, targetWord);
    while (wordList.lastElementChild) {
        wordList.removeChild(wordList.lastElementChild);
    };
    score = 0;
    updateScore();
};

let highlight = null;
giveUpBtn.addEventListener("click", () => {
    if (highlight !== null) return;
    gaveUp = true;
    sixLttrFound = false;
    letterify(originalWord, targetWord);
    wordInput.disabled = true;
    highlightBtn(newBoardBtn, true, "purple");
    giveUpBtn.classList.add("btn-disabled");
    reshuffleBtn.classList.add("btn-disabled");
    let alt = 1;
    highlight = setInterval(() => {
        alt++;
        if (alt % 2 === 0) {
            highlightBtn(newBoardBtn, false);
        } else {
            highlightBtn(newBoardBtn, true, "purple");
        }
    }, 300);
});

function highlightBtn(btn, toggle, color) {
    if (toggle === true) {
        btn.style.border = `2px solid ${color}`;
        btn.style.padding = "8px 18px";
    } else if (toggle === false) {
        btn.style.border = "none";
        btn.style.padding = "10px 20px";
    }
};

reshuffleBtn.addEventListener("click", () => {
    if (highlight !== null) return;
    mixedWord = scrambleWord(mixedWord);
    letterify(mixedWord, targetWord);
    enableTyping();
});

newBoardBtn.addEventListener("click", () => { newBoard(); });

document.querySelector("#btn-start").addEventListener("click", () => {
    document.querySelector("#home-menu").style.display = "none";
    document.querySelector("#big-container").style.display = "flex";
});

// VALIDATE USER INPUT
// Step 1: Check if word is valid
async function isValidEnglishWord(word) {
    wordInput.disabled = true;
    wordInput.value = "";
    if (typeof word !== "string" || !/^[a-zA-Z]+$/.test(word)) {
        return false;
    }

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!response.ok) {
            return false;
        }
        const data = await response.json();
        return Array.isArray(data) && data.length > 0;
    } catch (error) {
        return false;
    };
};

// Step 2: Confirm that no extraneous letters are used
function preventExtraLetters(str) {
    const arr_i = str.split("");
    const arr_w = originalWord.split("");

    for (let i = 0; i < arr_i.length; i++) {
        let idx = arr_w.indexOf(arr_i[i]);
        if (idx === -1) return true;
        arr_w.splice(idx, 1);
    };
};

// Step 3: Make sure that the word hasn't been used yet
function checkRepeat(str) {
    for (let i = 0; i < wordList.children.length; i++) {
        for (let x = 0; x < wordList.children[i].children.length; x++) {
            if (wordList.children[i].children[x].innerHTML.toLowerCase() === str) return true;
        };
    };
};

function sendAlert(msg, type) {
    let alert = document.querySelector("#alert-msg");
    alert.innerHTML = msg;
    switch (type) {
        case "warn":
            alert.style.color = "red";
            break;
        case "win":
            alert.style.color = "rgb(255, 183, 0)";
            break;
        case "score":
            alert.style.color = "limegreen";
            break;
    };

    setTimeout(() => {
        alert.style.color = "lightgray";
    }, 1500);
};

wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") validateInput(e, wordInput.value.toLowerCase());
});

function enableTyping() {
    wordInput.disabled = false;
    wordInput.focus();
    wordInput.select();
};

async function validateInput(e, str) {
    e.preventDefault();

    if (str.length < 3) return;

    await isValidEnglishWord(str).then((data) => {
        if (str === "ayman") {
            sendAlert("BOOM", "warn");
            enableTyping();
            return;
        } else if (str === "namya") {
            sendAlert("MOOB", "warn");
            enableTyping();
            return;
        } else if (data === false) {
            sendAlert(`"${str}" not in word list`, "warn");
            enableTyping();
            return;
        } else if (preventExtraLetters(str) === true) {
            sendAlert("Use each provided letter only once", "warn");
            enableTyping();
            return;
        } else if (checkRepeat(str) === true) {
            sendAlert(`"${str}" already used`, "warn");
            enableTyping();
            return;
        }

        const elem = document.createElement("p");
        elem.innerHTML = str.toUpperCase();
        elem.classList.add("found-word");
        let div = document.createElement("div");
        div.classList.add("word-list-row");
        let selectedRow = null;
        if (wordList.children.length === 0) {
            div.id = `row-${wordList.children.length + 1}`;
            selectedRow = div;
        } else if (wordList.lastElementChild.children.length / 3 === 1) {
            div.id = `row-${wordList.children.length + 1}`;
            selectedRow = div;
        } else if (wordList.lastElementChild.children.length / 3 !== 1) {
            selectedRow = wordList.lastElementChild;
            wordList.lastElementChild.lastElementChild.style.marginRight = "clamp(5px, 0.5vw, 15px)";
        }
        selectedRow.append(elem);
        wordList.append(selectedRow);
        enableTyping();

        if (str.length === 6) {
            sixLttrFound = true;

            let organized = true;
            const arr_m = mixedWord.split("");
            const arr_o = originalWord.split("");
            for (let i = 0; i < arr_m.length; i++) {
                if (arr_m[i] === arr_o[i]) continue;

                organized = false;
            };
            letterify((organized) ? originalWord : mixedWord, targetWord);
            sendAlert("Well done!", "win")
        }

        let value = 0;
        switch (str.length) {
            case 3:
                value = 100;
                break;
            case 4:
                value = 400;
                break;
            case 5:
                value = 1200;
                break;
            case 6:
                value = 2000;
                break;
        };
        score += value;
        sendAlert(`"${str.toUpperCase()}" +${value}`, "score");
        updateScore();
    });
};
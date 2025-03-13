document.addEventListener("DOMContentLoaded", function () {
    const equationGrid = document.getElementById("equationGrid");
    const wordGame = document.getElementById("wordGame");
    const equationGame = document.getElementById("equationGame");
    const toggleButton = document.getElementById("toggleGameButton");
    const message = document.getElementById("equationMessage");
    let attemptIndex = 0;
    let selectedCellIndex = 0;
    const maxAttempts = 6;
    const equationLength = 8;
    let attempts = Array.from({ length: maxAttempts }, () => Array(equationLength).fill(""));

    // Input invisível para ativar teclado no mobile
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "text";
    hiddenInput.id = "mobileInput";
    hiddenInput.classList.add("hidden-input");
    document.body.appendChild(hiddenInput);

    function safeEvaluate(num1, op1, num2, op2, num3) {
        let result;
        try {
            if (op1 === "*" || op1 === "/") {
                result = eval(`${num1} ${op1} ${num2}`);
                result = eval(`${result} ${op2} ${num3}`);
            } else {
                result = eval(`${num2} ${op2} ${num3}`);
                result = eval(`${num1} ${op1} ${result}`);
            }
        } catch (e) {
            return null;
        }
        return Number.isInteger(result) && result >= 0 && result < 100 ? result : null;
    }

    function generateDailyEquation() {
        const operators = ['+', '-', '*', '/'];
        const seed = new Date().getDate(); // Usa o dia do mês como semente
        let num1 = (seed * 3) % 9 + 1;
        let num2 = (seed * 5) % 9 + 1;
        let num3 = (seed * 7) % 9 + 1;
        let operator1 = operators[seed % operators.length];
        let operator2 = operators[(seed + 1) % operators.length];

        let result = safeEvaluate(num1, operator1, num2, operator2, num3);
        if (result === null) return "5+3*2=11"; // Fallback seguro

        let resultStr = result < 10 ? `0${result}` : `${result}`;
        return `${num1}${operator1}${num2}${operator2}${num3}=${resultStr}`;
    }

    const correctEquation = generateDailyEquation();

    function createGrid() {
        let gridHTML = "";
        for (let i = 0; i < maxAttempts; i++) {
            gridHTML += '<div class="row">';
            for (let j = 0; j < equationLength; j++) {
                gridHTML += `<div class="cell" id="eq-cell-${i}-${j}"></div>`;
            }
            gridHTML += '</div>';
        }
        equationGrid.innerHTML = gridHTML;
        document.querySelectorAll(".cell").forEach((cell, index) => {
            cell.addEventListener("click", () => selectCell(index % equationLength));
        });
    }

    function selectCell(index) {
        selectedCellIndex = index;
        hiddenInput.focus();
    }

    function processInput(event) {
        const key = event.key;
        const validNumbers = "0123456789";
        const validOperators = "+-*/";

        if (key === "Enter" && attempts[attemptIndex].join("").length === equationLength) {
            checkEquation();
            return;
        }

        if (key === "Backspace" && selectedCellIndex > 0) {
            removeCharacter();
            return;
        }

        if ([0, 2, 4].includes(selectedCellIndex)) {
            if (!validNumbers.includes(key)) return;
        } else if ([1, 3].includes(selectedCellIndex)) {
            if (!validOperators.includes(key)) return;
        } else if (selectedCellIndex === 5) {
            if (key !== "=") return;
        } else if (selectedCellIndex >= 6) {
            if (!validNumbers.includes(key)) return;
            if (selectedCellIndex === 7 && attempts[attemptIndex][6] === "0" && key === "0") return;
        }

        addCharacter(key);
    }

    function addCharacter(char) {
        attempts[attemptIndex][selectedCellIndex] = char;
        document.getElementById(`eq-cell-${attemptIndex}-${selectedCellIndex}`).innerText = char;
        if (selectedCellIndex < equationLength - 1) {
            selectedCellIndex++;
        }
    }

    function removeCharacter() {
        attempts[attemptIndex][selectedCellIndex - 1] = "";
        document.getElementById(`eq-cell-${attemptIndex}-${selectedCellIndex - 1}`).innerText = "";
        selectedCellIndex--;
    }

    function checkEquation() {
        const userAttempt = attempts[attemptIndex].join("");
        if (userAttempt.length !== equationLength) return;

        if (userAttempt === correctEquation) {
            message.innerText = "🎉 Parabéns! A equação está correta!";
        } else {
            validateCharacters();
            attemptIndex++;
            selectedCellIndex = 0;
            if (attemptIndex === maxAttempts) {
                message.innerText = `❌ Fim de jogo! A equação correta era: ${correctEquation}`;
            }
        }
    }

    function validateCharacters() {
        for (let i = 0; i < equationLength; i++) {
            const cell = document.getElementById(`eq-cell-${attemptIndex}-${i}`);
            if (attempts[attemptIndex][i] === correctEquation[i]) {
                cell.classList.add("correct");
            } else if (correctEquation.includes(attempts[attemptIndex][i])) {
                cell.classList.add("wrong-position");
            } else {
                cell.classList.add("wrong");
            }
        }
    }

    function toggleGame() {
        wordGame.style.display = wordGame.style.display === "none" ? "block" : "none";
        equationGame.style.display = equationGame.style.display === "none" ? "block" : "none";
    }

    toggleButton.addEventListener("click", toggleGame);
    createGrid();
    hiddenInput.addEventListener("keydown", processInput);
});
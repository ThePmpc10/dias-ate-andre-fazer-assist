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

    function generateDailyEquation() {
        const seed = new Date().getDate(); // Usa o dia do mês como semente
        const operators = ['+', '-', '*', '/'];
        let validEquation = "";
        let result;
        let randomGen = (max) => (seed * 17) % max + 1; // Gera números previsíveis baseados na data

        while (true) {
            let num1 = randomGen(9);
            let num2 = randomGen(9);
            let num3 = randomGen(9);
            let operator1 = operators[seed % operators.length];
            let operator2 = operators[(seed + 1) % operators.length];

            let equation = `${num1} ${operator1} ${num2} ${operator2} ${num3}`;

            try {
                result = new Function(`return (${equation})`)();
                if (Number.isInteger(result) && result >= 0 && result < 100) {
                    let resultStr = result < 10 ? `0${result}` : `${result}`;
                    validEquation = `${num1}${operator1}${num2}${operator2}${num3}=${resultStr}`;
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        return validEquation;
    }

    const correctEquation = generateDailyEquation();

    function createGrid() {
        for (let i = 0; i < maxAttempts; i++) {
            const row = document.createElement("div");
            row.classList.add("row");

            for (let j = 0; j < equationLength; j++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");
                cell.id = `eq-cell-${i}-${j}`;
                cell.addEventListener("click", () => selectCell(j));
                row.appendChild(cell);
            }
            equationGrid.appendChild(row);
        }
    }

    function selectCell(index) {
        selectedCellIndex = index;
        hiddenInput.focus();
    }

    function processInput(event) {
        const key = event.key;
        const validNumbers = "0123456789";
        const validOperators = "+-*/";

        if (key === "Enter" && attempts[attemptIndex].join("" ).length === equationLength) {
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
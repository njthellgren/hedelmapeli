let lockingPhase = false;
let lockedDuringTurn = false;

document.addEventListener("DOMContentLoaded", function () {
    
    // Rahan lisäys
    document.getElementById("addMoney").addEventListener("click", function () {
        const moneyInput = document.getElementById("moneyInput").value;
        const addedMoney = parseFloat(moneyInput);

        if (isNaN(addedMoney) || addedMoney <= 0) {
            alert("Anna kelvollinen rahamäärä");
            return;
        }

        const moneyDisplay = document.getElementById("moneyDisplay");
        let currentMoney = parseFloat(moneyDisplay.textContent.replace("Rahaa", "").replace("€", "").trim());
        if (isNaN(currentMoney)) currentMoney = 0;

        const newMoneyTotal = currentMoney + addedMoney;

        moneyDisplay.textContent = `Rahaa ${newMoneyTotal.toFixed(2)}€`;
    });

    // Panoksen asettaminen
    let currentBet = 1;

    document.querySelectorAll(".setBet span").forEach(betOption => {
        betOption.addEventListener("click", function () {
            const selectedBet = parseInt(this.textContent.replace("€", ""));

            if (!isNaN(selectedBet)) {
                currentBet = selectedBet;

                const betDisplay = document.querySelector(".betsDiv p");
                betDisplay.textContent = `Panos: ${currentBet}€`;

                document.querySelectorAll(".setBet span").forEach(option => {
                    option.classList.remove("selected-bet");
                });

                this.classList.add("selected-bet");
            }
        });
    });

    // Pelaa nappula
    document.querySelector(".playButton").addEventListener("click", function () {
        const moneyDisplay = document.getElementById("moneyDisplay");
        let currentMoney = parseFloat(moneyDisplay.textContent.replace("Rahaa", "").replace("€", "").trim());

        if (currentMoney >= currentBet) {
            currentMoney -= currentBet;
            moneyDisplay.textContent = `Rahaa ${currentMoney.toFixed(2)}€`;

            spinSlotMachine();

            if (lockedDuringTurn) {
                lockingPhase = false;
            } else if (!lockingPhase) {
                lockingPhase = true;
            }

            lockedDuringTurn = false;
        } else {
            alert("Ei tarpeeksi rahaa!");
        }
    });

    // Pelaaminen
    function spinSlotMachine() {
        const slots = document.querySelectorAll(".slotsDiv img");

        slots.forEach((slot, index) => {
            if (!lockedSlots[index]) {
                slot.classList.add("spinning");
            }
        });

        const slotImages = ["./img/apple.png", "./img/bananas.png", "./img/grapes.png", "./img/peach.png", "./img/seven.png"];

        const interval = setInterval(() => {
            slots.forEach((slot, index) => {
                if (!lockedSlots[index]) {
                    const randomImage = slotImages[Math.floor(Math.random() * slotImages.length)];
                    slot.src = randomImage;
                }
            });
        }, 100);

        setTimeout(() => {
            clearInterval(interval);

            slots.forEach((slot, index) => {
                if (!lockedSlots[index]) {
                    const randomImage = slotImages[Math.floor(Math.random() * slotImages.length)];
                    slot.src = randomImage;
                }
            });

            slots.forEach((slot, index) => {
                if (!lockedSlots[index]) {
                    slot.classList.remove("spinning");
                }
            });

            if (!lockedDuringTurn) {
                lockedSlots = [false, false, false, false, false];
                slots.forEach(slot => {
                    slot.classList.remove("locked");
                });
            }

            checkWin(slots, currentBet);
        }, 1000);
    }

    // Lukitseminen
    let lockedSlots = [false, false, false, false, false];

    document.querySelectorAll('.lock').forEach((lock, index) => {
        lock.addEventListener('click', function () {
            if (lockingPhase) {
                lockedSlots[index] = !lockedSlots[index];

                const slot = document.querySelectorAll(".slotsDiv img")[index];
                slot.classList.toggle("locked", lockedSlots[index]);

                lockedDuringTurn = lockedSlots.some(locked => locked);
            }
        });
    });

    // Voittojen tarkistus
    function checkWin(slots, currentBet) {
        const winningCombinations = [
            { pattern: ["seven", "seven", "seven", "seven"], multiplier: 10 },
            { pattern: ["peach", "peach", "peach", "peach"], multiplier: 6 },
            { pattern: ["seven", "seven", "seven"], multiplier: 5 },
            { pattern: ["bananas", "bananas", "bananas", "bananas"], multiplier: 5 },
            { pattern: ["apple", "apple", "apple", "apple"], multiplier: 4 },
            { pattern: ["grapes", "grapes", "grapes", "grapes"], multiplier: 3 },
        ];

        const slotResults = Array.from(slots).map(slot => {
            const src = slot.src.split("/").pop();
            return src.replace(".png", "");
        });

        let win = false;
        let totalWin = 0;

        for (const combination of winningCombinations) {
            const { pattern, multiplier } = combination;
            const patternLength = pattern.length;

            for (let i = 0; i <= slotResults.length - patternLength; i++) {
                let isMatch = true;
                for (let j = 0; j < patternLength; j++) {
                    if (slotResults[i + j] !== pattern[j]) {
                        isMatch = false;
                        break;
                    }
                }

                if (isMatch) {
                    win = true;
                    totalWin += currentBet * multiplier;
                    break;
                }
            }

            if (win) break;
        }

        const messageDisplay = document.getElementById("winMessageDisplay");
        if (win) {
            messageDisplay.textContent = `Voitit ${totalWin}€!`;

            const moneyDisplay = document.getElementById("moneyDisplay");
            let currentMoney = parseFloat(moneyDisplay.textContent.replace("Rahaa", "").replace("€", "").trim());
            currentMoney += totalWin;
            moneyDisplay.textContent = `Rahaa ${currentMoney.toFixed(2)}€`;

            lockingPhase = false;
            lockedSlots = [false, false, false, false, false];
            slots.forEach(slot => slot.classList.remove("locked"));
        } else {
            messageDisplay.textContent = "Ei voittoa";
        }
    }
});

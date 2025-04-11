<template>
  <div class="game-container">
    <h1>Rock, Paper, Scissors</h1>

    <div class="buttons">
      <!-- Buttons for player's move -->
      <button @click="play('rock')">🪨 Rock</button>
      <button @click="play('paper')">📜 Paper</button>
      <button @click="play('scissors')">✂️ Scissors</button>
    </div>

    <!-- The game result is rendered as HTML to allow line breaks and highlighting -->
    <div class="result" v-html="resultMessage"></div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';

// Define component events: "win" and "lose"
const emit = defineEmits(['win', 'lose']);

// Reactive variable for the game result message
const resultMessage = ref('Make your move');

/**
 * Main game function.
 * Generates a random move for the computer, compares it with the player's choice,
 * and updates the result message accordingly.
 * Emits "win" event if the player wins, and "lose" event if the player loses.
 *
 * @param {string} userChoice - The player's move ('rock', 'paper', or 'scissors').
 */
function play(userChoice: string) {
  // Array of possible moves for the computer.
  const choices = ['rock', 'paper', 'scissors'];
  // Generate computer's random move.
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];

  // Build a message with each move on a new line.
  let message =
      "You chose " + userChoice + "<br>" +
      "Computer chose " + computerChoice + "<br>";

  // Determine game outcome.
  if (userChoice === computerChoice) {
    resultMessage.value = message + `<span class="tie">Tie!</span>`;
  } else if (
      (userChoice === 'rock' && computerChoice === 'scissors') ||
      (userChoice === 'paper' && computerChoice === 'rock') ||
      (userChoice === 'scissors' && computerChoice === 'paper')
  ) {
    resultMessage.value = message + `<span class="win">Victory!</span>`;
    emit("win");
  } else {
    resultMessage.value = message + `<span class="lose">Defeat!</span>`;
    emit("lose");
  }
}
</script>

<style lang="scss" scoped>
/* Styles for the game container */
.game-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  margin: 40px auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h1 {
    margin-top: 0;
    font-size: 24px;
    color: #333;
  }

  .buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    gap: 10px
  }

  .result {
    font-size: 18px;
    font-weight: bold;
    color: #555;
    line-height: 1.4;
  }

  /* Highlight styles for win, tie and lose messages */
  :deep(.tie) {
    font-weight: bold;
    font-size: 24px;
  }

  :deep(.win) {
    color: green;
    font-weight: bold;
    font-size: 24px;
  }

  :deep(.lose) {
    color: red;
    font-weight: bold;
    font-size: 24px;
  }
}
</style>

const TRACK_WIDTH = 100;
const MOVE_SPEED = 20;
const FINISH_AT = 100;
const GREEN_MIN = 900;
const GREEN_MAX = 1800;
const RED_MIN = 700;
const RED_MAX = 1500;

function initRedLightChallenge(root) {
  if (!root || root.dataset.initialized === "true") return;
  root.dataset.initialized = "true";

  const startBtn = root.querySelector("[data-start-btn]");
  const restartBtn = root.querySelector("[data-restart-btn]");
  const moveBtn = root.querySelector("[data-move-btn]");
  const player = root.querySelector("[data-player]");
  const signalBoard = root.querySelector("[data-signal-board]");
  const statusPill = root.querySelector("[data-status-pill]");
  const timeValue = root.querySelector("[data-time-value]");
  const bestValue = root.querySelector("[data-best-value]");
  const progressValue = root.querySelector("[data-progress-value]");
  const messageBox = root.querySelector("[data-message-box]");
  const track = root.querySelector(".track");
  const finishZone = root.querySelector(".finish-zone");

  let gameState = "idle";
  let signal = "idle";
  let moving = false;
  let progress = 0;
  let animationId = null;
  let signalTimeout = null;
  let startTime = 0;
  let lastFrame = 0;
  let bestTime = loadBestTime();

  renderBestTime();
  updatePlayer();
  updateStatus("Ready to Start", "idle");
  updateSignalBoard("Tap Start to Begin", "Green means move. Red means freeze.");

  function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function loadBestTime() {
    const raw = localStorage.getItem("gamesbrowse_red_light_best");
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }

  function saveBestTime(value) {
    localStorage.setItem("gamesbrowse_red_light_best", String(value));
  }

  function renderBestTime() {
    bestValue.textContent = bestTime == null ? "--" : `${bestTime.toFixed(2)}s`;
  }

  function updateStatus(text, type) {
    statusPill.textContent = text;
    statusPill.className = "status-pill";
    if (type === "green") statusPill.classList.add("status-green");
    else if (type === "red") statusPill.classList.add("status-red");
    else statusPill.classList.add("status-idle");
  }

  function updateSignalBoard(title, subtitle) {
    signalBoard.innerHTML = `${title}<small>${subtitle}</small>`;
  }

  function updatePlayer() {
    const trackWidth = track.clientWidth;
    const finishZoneWidth = finishZone.clientWidth;
    const playerWidth = player.clientWidth;
    const usableWidth = trackWidth - finishZoneWidth - playerWidth - 20;
    const x = 10 + usableWidth * (progress / TRACK_WIDTH);

    player.style.left = `${x}px`;
    progressValue.textContent = `${Math.min(100, Math.round(progress))}%`;
    player.classList.toggle("moving", moving && gameState === "running" && signal === "green");
  }

  function resetRunVisuals() {
    progress = 0;
    moving = false;
    timeValue.textContent = "0.00s";
    messageBox.textContent = "Hold the button or press the spacebar only when the signal is green.";
    updatePlayer();
  }

  function clearTimers() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (signalTimeout) {
      clearTimeout(signalTimeout);
      signalTimeout = null;
    }
  }

  function scheduleSignalChange(nextSignal, delay) {
    signalTimeout = setTimeout(() => {
      if (gameState !== "running") return;
      setSignal(nextSignal);
    }, delay);
  }

  function setSignal(nextSignal) {
    signal = nextSignal;

    if (signal === "green") {
      updateStatus("Green Light", "green");
      updateSignalBoard("Green Light", "Move now. Hold to advance.");
      scheduleSignalChange("red", randomBetween(GREEN_MIN, GREEN_MAX));
      return;
    }

    updateStatus("Red Light", "red");
    updateSignalBoard("Red Light", "Freeze immediately.");
    if (moving && gameState === "running") {
      loseGame("You moved on red. Run failed.");
      return;
    }
    scheduleSignalChange("green", randomBetween(RED_MIN, RED_MAX));
  }

  function startGame() {
    clearTimers();
    gameState = "running";
    signal = "idle";
    progress = 0;
    moving = false;
    startTime = performance.now();
    lastFrame = startTime;
    timeValue.textContent = "0.00s";
    messageBox.textContent = "Stay calm. Move on green and freeze on red.";
    updatePlayer();
    setSignal("green");
    animationId = requestAnimationFrame(gameLoop);
  }

  function restartGame() {
    clearTimers();
    gameState = "idle";
    signal = "idle";
    resetRunVisuals();
    updateStatus("Ready to Start", "idle");
    updateSignalBoard("Tap Start to Begin", "Green means move. Red means freeze.");
  }

  function winGame() {
    clearTimers();
    gameState = "won";
    moving = false;

    const elapsed = (performance.now() - startTime) / 1000;
    timeValue.textContent = `${elapsed.toFixed(2)}s`;
    updateStatus("You Win", "green");
    updateSignalBoard("Finish Reached", "Great timing. Tap Restart to play again.");
    messageBox.textContent = `You reached the finish in ${elapsed.toFixed(2)} seconds.`;

    if (bestTime == null || elapsed < bestTime) {
      bestTime = elapsed;
      saveBestTime(bestTime);
      renderBestTime();
      messageBox.textContent += " New best time.";
    }

    updatePlayer();
  }

  function loseGame(reason) {
    clearTimers();
    gameState = "lost";
    moving = false;
    updateStatus("Run Failed", "red");
    updateSignalBoard("Game Over", "You moved at the wrong moment.");
    messageBox.textContent = reason;
    updatePlayer();
  }

  function gameLoop(now) {
    if (gameState !== "running") return;

    const delta = (now - lastFrame) / 1000;
    lastFrame = now;
    const elapsed = (now - startTime) / 1000;
    timeValue.textContent = `${elapsed.toFixed(2)}s`;

    if (moving && signal === "green") {
      progress += MOVE_SPEED * delta;
      if (progress >= FINISH_AT) {
        progress = FINISH_AT;
        updatePlayer();
        winGame();
        return;
      }
    }

    updatePlayer();
    animationId = requestAnimationFrame(gameLoop);
  }

  function startMoving() {
    if (gameState !== "running") return;
    moving = true;

    if (signal === "red") {
      loseGame("You started moving during red light.");
      return;
    }

    updatePlayer();
  }

  function stopMoving() {
    moving = false;
    moveBtn.classList.remove("pressed");
    updatePlayer();
  }

  function pressMoveButton() {
    moveBtn.classList.add("pressed");
    startMoving();
  }

  function releaseMoveButton() {
    stopMoving();
  }

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restartGame);
  moveBtn.addEventListener("mousedown", pressMoveButton);
  moveBtn.addEventListener("mouseup", releaseMoveButton);
  moveBtn.addEventListener("mouseleave", releaseMoveButton);
  moveBtn.addEventListener(
    "touchstart",
    (event) => {
      event.preventDefault();
      pressMoveButton();
    },
    { passive: false }
  );
  moveBtn.addEventListener(
    "touchend",
    (event) => {
      event.preventDefault();
      releaseMoveButton();
    },
    { passive: false }
  );
  moveBtn.addEventListener("touchcancel", releaseMoveButton);

  document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && root.isConnected) {
      event.preventDefault();
      if (!event.repeat) startMoving();
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.code === "Space" && root.isConnected) {
      event.preventDefault();
      stopMoving();
    }
  });

  window.addEventListener("blur", stopMoving);
  window.addEventListener("resize", updatePlayer);
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-red-light-challenge]").forEach(initRedLightChallenge);
});

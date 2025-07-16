<script>
  import { onMount } from "svelte";

  const STORAGE_KEY = "site-unlocked";
  const CORRECT_PASSWORD = "m4mm41"; // 🔐 Replace with your real password

  let enteredPassword = "";
  let unlocked = false;
  let error = false;
  let ready = false;

  onMount(() => {
    unlocked = localStorage.getItem(STORAGE_KEY) === "true";
    ready = true;
  });

  function checkPassword() {
    if (enteredPassword === CORRECT_PASSWORD) {
      unlocked = true;
      error = false;
      localStorage.setItem(STORAGE_KEY, "true");
    } else {
      error = true;
    }
  }

  function lockAgain() {
    localStorage.removeItem(STORAGE_KEY);
    unlocked = false;
    enteredPassword = "";
  }
</script>

{#if !ready}
  <!-- nothing shown until localStorage is checked -->
{:else if !unlocked}
  <div class="overlay">
    <div class="password-box">
      <h2>Enter Password</h2>
      <input
        type="password"
        bind:value={enteredPassword}
        on:keydown={(e) => e.key === "Enter" && checkPassword()}
        placeholder="Password"
      />
      <button on:click={checkPassword}>Unlock</button>
      {#if error}
        <p class="error">Incorrect password</p>
      {/if}
    </div>
  </div>
{:else}
  <div class="unlocked-wrapper">
    <slot />
    <button class="lock-button" on:click={lockAgain}>🔒 Lock Again</button>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .password-box {
    background: #1a1a1a;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    color: white;
    max-width: 320px;
    width: 100%;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  }

  input {
    width: 100%;
    padding: 0.6rem;
    margin-top: 1rem;
    font-size: 1rem;
    border-radius: 4px;
    border: none;
  }

  button {
    margin-top: 1rem;
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    cursor: pointer;
    background: white;
    color: black;
    border: none;
    border-radius: 4px;
  }

  .error {
    color: red;
    margin-top: 1rem;
  }

  .unlocked-wrapper {
    position: relative;
  }

  .lock-button {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: #222;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0.6;
  }

  .lock-button:hover {
    opacity: 1;
  }
</style>

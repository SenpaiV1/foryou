const heartLock = document.getElementById('heartLock');
  const key = document.getElementById('key');
  const revealButton = document.getElementById('revealButton');
  const modal = document.getElementById('loveModal');
  const closeModal = document.getElementById('closeModal');

  let isDragging = false;

  key.addEventListener('dragstart', (e) => {
    isDragging = true;
    e.dataTransfer.effectAllowed = 'move';
  });

  key.addEventListener('dragend', () => {
    isDragging = false;
  });

  heartLock.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  heartLock.addEventListener('drop', (e) => {
    e.preventDefault();
    if (isDragging) {
      const answer = prompt("Who's your favorite person?");
      const correctPassword = "nella"; // Change this to your secret word
      if(answer && answer.toLowerCase() === correctPassword) {
        alert("Password correct! ");
        revealButton.style.display = "inline-block";
      } else {
        alert("Wrong password! ");
      }
    }
  });

  revealButton.addEventListener('click', () => {
    modal.style.display = "flex";
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = "none";
  });

  window.addEventListener('click', (e) => {
    if(e.target === modal) modal.style.display = "none";
  });
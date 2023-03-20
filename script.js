const form = document.querySelector('form');
const userList = document.getElementById('userList');

form.addEventListener('submit', event => {
  event.preventDefault();
  const searchTerm = form.elements.searchTerm.value;
  fetch(`/users?searchTerm=${searchTerm}`)
    .then(response => response.json())
    .then(users => {
      userList.innerHTML = '';
      for (const user of users) {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email})`;
        userList.appendChild(li);
      }
    });
});
(async function() {
  const $list = document.getElementById('list');
  const $rightPart = document.getElementById('right-part');
  const $leftPart = document.getElementById('left-part');
  const $addBlock = document.getElementById('add-block');
  let messages = messageList || [];

  $leftPart.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && e.target.id === 'add-input') {
      e.stopPropagation();
      e.preventDefault();

      try {
        await addessage(document.getElementById('form'));
      } catch (error) {
        console.error(error);
      }
    }
  });

  $leftPart.addEventListener('click', async (e) => {
    if (e.target.id === 'add') {
      document.getElementById('add-block').classList.add('edit');
    }
    else if (e.target.id === 'cancel') {
      document.getElementById('add-block').classList.remove('edit');
    }
    else if (e.target.id === 'add-submit') {
      e.preventDefault();
  
      try {
        await addessage(document.getElementById('form'));
      } catch (error) {
        console.error(error);
      }
    }
  });

  $rightPart.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && e.target.id === 'login-input') {
      e.stopPropagation();
      e.preventDefault();

      try {
        await login(document.getElementById('form-login'));
      } catch (error) {
        console.error(error);
      }
    }
  });

  $rightPart.addEventListener('click', async (e) => {
    if (e.target.id === 'logout') {
      try {
        await logout();
      } catch (error) {
        console.error(error);
      }
    }
    else if (e.target.id === 'login') {
      try {
        await login(document.getElementById('form-login'));
      } catch (error) {
        console.error(error);
      }
    }
  });

  $list.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit')) {
      setEditMode(e.target);
    }
    else if (e.target.classList.contains('cancel')) {
      removeEditMode(e.target);
    }
    else if (e.target.classList.contains('delete')) {
      deleteMessage(e.target);
    }
    else if (e.target.classList.contains('submit')) {
      editMessage(e.target);
    }
  });

  async function logout() {
    try {
      await sendRequest({
        url: 'http://localhost:8000/api/auth/logout',
        method: 'GET',
        callback: response => {
          console.log(response);
          location.reload();
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function login(form) {
    const { username: { value: username } } = form.elements;

    try {
      await sendRequest({
        url: 'http://localhost:8000/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username }),
        callback: response => {
          console.log(response);
          location.reload();
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function addessage(form) {
    const { Text: { value: Text } } = form.elements;

    try {
      await sendRequest({
        url: 'http://localhost:8000/api/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Text }),
        callback: response => {
          messages.push(response);
          buildList();
          $addBlock.classList.remove('edit');
        }
      });
    } catch (error) {
      console.error(error);
    }

  }

  async function deleteMessage(elem) {
    const id = elem.closest('.message').dataset.id;

    try {
      await sendRequest({
        url: `http://localhost:8000/api/messages/${id}`,
        method: 'DELETE',
        callback: response => {
          messages = messages.filter(x => x.Id !== response);
          buildList();
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function editMessage(elem) {
    const parent = elem.closest('.message');
    const id = parent.dataset.id;
    const Text = parent.querySelector('.txt-input').value;

    try {
      await sendRequest({
        url: `http://localhost:8000/api/messages/${id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Text }),
        callback: response => {
          message = messages.find(x => x.Id === response.Id);
          Object.assign(message, response);
          buildList();
        }
      });
    } catch (error) {
      console.error(error);
    }

  }

  async function sendRequest({url, method = 'GET', callback, ...props}) {
    try {
      let response = await fetch(url, { method, ...props });
      let responseJson = await response.json();
      callback && callback(responseJson);
    } catch (error) {
      console.log(error);
    }
  }

  function setEditMode(elem) {
    elem.closest('.message').classList.add('edit');
  }

  function removeEditMode(elem) {
    elem.closest('.message').classList.remove('edit');
  }

  function buildList() {
    let data = messages.reduce((acc, item) => {
      const listItem = `
        <li class="message" data-id="${item.Id}">
          <div class="message-content">
            <div class="message-top">
              <div class="author">Author: ${item.Sender}</div>
              <div class="date">${new Date(item.AddedAt).toISOString().split('T')[0]}</div>
            </div>
            <input class="txt-input" type="text" name="text">
            <div class="txt">${item.Text}</div>
          </div>
          <div class="actions">
            <button class="action edit">edit</button>
            <button class="action delete">delete</button>
            <button class="action cancel">cancel</button>
            <button class="action submit">submit</button>
          </div>
        </li>
      `;
      return acc += listItem;
    }, '');
    $list.innerHTML = data;
  }

})();

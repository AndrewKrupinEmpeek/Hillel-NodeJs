(async function() {
  const $list = document.getElementById('list');
  const $add = document.getElementById('add');
  const $cancel = document.getElementById('cancel');
  const $form = document.getElementById('form');
  const $addBlock = document.getElementById('add-block');
  let messages = messageList || [];

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

  $cancel.addEventListener('click', (e) => {
    $addBlock.classList.remove('edit');
  });

  $add.addEventListener('click', (e) => {
    $addBlock.classList.add('edit');
  });

  $form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await addessage(e.target);
  });

  async function addessage(form) {
    const { Sender: { value: Sender }, Text: { value: Text } } = form.elements;

    await sendRequest({
      url: 'http://localhost:8000/api/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Sender,
        Text
      }),
      callback: response => {
        console.log(response);
        messages.push(response);
        buildList();
        $addBlock.classList.remove('edit');
      }
    });
  }

  async function deleteMessage(elem) {
    const id = elem.closest('.message').dataset.id;
    await sendRequest({
      url: `http://localhost:8000/api/messages/${id}`,
      method: 'DELETE',
      callback: response => {
        messages = messages.filter(x => x.Id !== response);
        buildList();
      }
    });
  }

  async function editMessage(elem) {
    const parent = elem.closest('.message');
    const id = parent.dataset.id;
    const Text = parent.querySelector('.txt-input').value;

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

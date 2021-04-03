(async function() {
    const $list = document.getElementById('list');
    const $add = document.getElementById('add');
    const $cancel = document.getElementById('cancel');
    const $form = document.getElementById('form');
    const $addBlock = document.getElementById('add-block');
    let messages = [];

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

        const { author: { value: author }, text: { value: text } } = e.target.elements;

        await sendRequest({
            url: 'http://localhost:8000/messages',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                author,
                text
            }),
            callback: response => {
                messages.push(response);
                buildList();
                $addBlock.classList.remove('edit');
            }
        });
    });

    await sendRequest({
        url: 'http://localhost:8000/messages',
        callback: response => {
            messages = response;
            buildList();
        }
    });

    function setEditMode(elem) {
        elem.closest('.message').classList.add('edit');
    }

    function removeEditMode(elem) {
        elem.closest('.message').classList.remove('edit');
    }

    async function deleteMessage(elem) {
        const id = elem.closest('.message').dataset.id;
        await sendRequest({
            url: `http://localhost:8000/messages/${id}`,
            method: 'DELETE',
            callback: response => {
                messages = messages.filter(x => x.id !== response);
                buildList();
            }
        });
    }

    async function editMessage(elem) {
        const parent = elem.closest('.message');
        const id = parent.dataset.id;
        const text = parent.querySelector('.txt-input').value;
        await sendRequest({
            url: `http://localhost:8000/messages/${id}`,
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text
            }),
            callback: response => {
                message = messages.find(x => x.id === response.id);
                Object.assign(message, response);
                buildList();
            }
        });
    }

    function buildList() {
        let data = messages.reduce((acc, item) => {
            const listItem = `
                <li class="message" data-id="${item.id}">
                    <div class="message-content">
                        <div class="message-top">
                            <div class="author">Author: ${item.author}</div>
                            <div class="date">${new Date(item.date).toLocaleString()}</div>
                        </div>
                        <input class="txt-input" type="text" name="text">
                        <div class="txt">${item.text}</div>
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

    async function sendRequest({url, method = 'GET', callback, ...props}) {
        try {
            let response = await fetch(url, { method, ...props });
            let responseJson = await response.json();
            callback && callback(responseJson);
        } catch (error) {
            console.log(error);
        }
    }
})();
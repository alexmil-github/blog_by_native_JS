const baseUrl = 'http://kino.vippo.ru/api';

// Функция для управления страницами
function openPage(page) {
    // Скрываем все страницы
    const pagesToHide = ['indexPage', 'registerPage', 'loginPage', 'postPage', 'createPostPage', 'profilePage'];

    pagesToHide.forEach(pageId => {
        if (pageId !== page) {
            document.getElementById(pageId).style.display = 'none';
        } else {
            document.getElementById(pageId).style.display = '';
        }
    });

    if (page === 'indexPage') {
        loadPosts();
    }
}

// Функция для отображения постов на главном экране
function loadPosts() {
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch(`${baseUrl}/post`, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            const row = document.querySelector('#indexPage div.row');
            row.innerHTML = "";


            result.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('col-12', 'col-sm-6', 'col-md-4', 'col-lg-3', 'mb-4');
                postElement.innerHTML =
                    `
                <div class="card">
                        <img src="${post.image}" class="card-img-top" alt="${post.name}">
                        <div class="card-body">
                            <div class="badge bg-success mb-3">${post.user}</div>
                            <h5 class="card-title">${post.name}</h5>
                            <p class="card-text">${post.text}</p>
                            <a href="#" class="btn btn-primary" onclick="loadPost(${post.id})">Читать пост</a>
                        </div>
                    </div>                
                `;
                row.appendChild(postElement);
            })
        })



        .catch((error) => console.error(error));
}

// Функция для отображения поста по id
function loadPost(postId) {
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch(baseUrl + "/post/" + postId, requestOptions)
        .then((response) => response.json())
        .then((result) => {
            const postSelector = document.querySelector('#postPage');
            postSelector.innerHTML = `
             <h2 class="mb-4">${result.name}</h2>

            <img src="${result.image}" alt="${result.name}" width = "600">

            <p>${result.text}</p>

            <h4 class="mt-3">Комментарии</h4>

            <form class="mb-4">
                <textarea rows="3" class="form-control" placeholder="Введите комментарий"></textarea>
                <button class="btn btn-success mt-2">Отправить</button>
            </form>         

            `;

            result.comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');
                commentElement.innerHTML = `
                    <div class="comments">
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="d-flex justify-content-between">
                                    <h5 class="card-title">${comment.user}</h5>
                                    <small class="card-text text-muted">${comment.created_at}</small>
                                </div>
                                <p class="card-text">${comment.text}</p>
                            </div>
                        </div>
                    </div>   
                `;

                postSelector.appendChild(commentElement);
            })

        })
        .catch((error) => console.error(error));

    openPage('postPage');
}

//Регистрация
function register(event) {
    event.preventDefault();

    const name = document.querySelector('#registerName').value;
    const login = document.querySelector('#registerLogin').value;
    const password = document.querySelector('#registerPassword').value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "name": name,
        "login": login,
        "password": password
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(baseUrl + "/register", requestOptions)
        .then((response) => {
            if (response.ok) {
                this.showToast('Вы успешно зарегистрировались',['alert-success']);
                openPage('loginPage');
            } else {
                this.showToast('Что-то пошло не так',['alert-danger']);
            }
        })
        // .then((result) => {
        //     openPage('loginPage');
        // })
        .catch((error) => console.error(error));
}

//Авторизация
function login(event) {
    event.preventDefault();

    const login = document.querySelector('#loginLogin').value;
    const password = document.querySelector('#loginPassword').value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        "login": login,
        "password": password
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    fetch(`${baseUrl}/login`, requestOptions)
        .then((response) => {
            if (!response.ok)
                showToast('Неверный логин или пароль',['alert-danger']);
                return response.json()
        })
        .then((result) => {
            if (result.token) {
                showToast('Вы вошли. Здравствуйте, '+result.username,['alert-success']);
                localStorage.setItem('token', result.token);
                localStorage.setItem('userName', result.username);
                profile();
                updateMenu();
            } else {
                console.log(result.errors.login[0]);
            }
        })
        .catch((error) => console.error(error));

}

//Функция для обновления меню в зависимости от наличия токена
function updateMenu() {
    // const token = localStorage.getItem("token");
    const token = localStorage.token;
    const profileLink = document.querySelector('#profileLink');
    const logoutLink = document.querySelector('#logoutLink');
    const registerLink = document.querySelector('#registerLink');
    const loginLink = document.querySelector('#loginLink');

    if (token) {
        // Если токен доступен, показываем пункты: Главная, Профиль, Выйти
        profileLink.classList.remove('hidden');
        logoutLink.classList.remove('hidden');
        registerLink.classList.add('hidden');
        loginLink.classList.add('hidden');
    } else {
        // Если токена нет, показываем пункты: Главная, Регистрация, Войти
        profileLink.classList.add("hidden");
        logoutLink.classList.add("hidden");
        registerLink.classList.remove("hidden");
        loginLink.classList.remove("hidden");
    }

}

//Выход
function logout() {
    localStorage.removeItem('token');
    updateMenu();
    openPage('loginPage');
}

//Вывод в профиле своих постов
function profile() {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${localStorage.token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    fetch(baseUrl+"/my-post", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            const title = document.querySelector('#profilePage h2');
            const table = document.querySelector('.table');

            title.innerHTML = `Добро пожаловать, ${localStorage.userName}`;
  
            result.forEach(post => {
                const postElement = document.createElement('tr');
                postElement.innerHTML = `
                <tr>
                    <td>${post.id}</td>
                    <td>${post.name}</td>
                    <td>${post.created_at}</td>
                    <td>
                        <button  class="btn btn-outline-primary btn-sm" onclick="loadPost(${post.id})">Перейти к посту</button >
                        <button  class="btn btn-outline-danger btn-sm">Удалить пост</button >
                    </td>
                </tr>
                `;
                table.appendChild(postElement);
            })
            openPage('profilePage');
        })
        // .catch((error) => console.error(error));

}

//Создание поста
function createPost(event) {
    event.preventDefault();

    const name = document.querySelector('#postName').value;
    const text = document.querySelector('#postText').value;
    const image = document.querySelector('#postImage').files[0];

    const myHeaders = new Headers();
    myHeaders.append("Accept", "application/json");
    myHeaders.append("Authorization", `Bearer ${localStorage.token}`);

    const formdata = new FormData();
    formdata.append("name", name);
    formdata.append("text", text);
    formdata.append("image", image);

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
        redirect: "follow"
    };

    fetch(baseUrl + "/post", requestOptions)
        .then((response) => response.json())
        .then((result) => {
            profile();
        })
        .catch((error) => console.error(error));

}

function showToast(text, classes, duration = 2000) {
    // Создаем новый элемент тоста
    const toastContainer = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = `toast show mb-2 ${classes}`;
    toast.innerHTML = `<div class="toast-body">${text}</div>`;

    // Добавляем тост в контейнер
    toastContainer.appendChild(toast);

    // Удаляем тост через указанный интервал
    setTimeout(() => {
        toast.classList.remove('show'); // Сначала убираем класс show для анимации

        // Ждем окончания анимации перед удалением
        toast.addEventListener('transitionend', () => {
            toastContainer.removeChild(toast);
        });
    }, duration);
}


updateMenu();
openPage('indexPage');
document.addEventListener("DOMContentLoaded", function () {
    // Функция для загрузки данных и обновления таблицы
    function loadData() {
        fetch('/get_data')
            .then(response => response.json())
            .then(data => {
                updateTable(data);
            })
            .catch(error => console.error("Ошибка загрузки данных:", error));
    }

    // Функция для обновления таблицы
    function updateTable(data) {
        let tableHead = document.querySelector(".table thead");
        let tableBody = document.querySelector(".table tbody");

        tableHead.innerHTML = "";
        tableBody.innerHTML = "";

        // Заголовки таблицы
        let headers = ["ID", "Участник", "цель/день", "ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС", "Слов/неделя", "Цель/неделя"];

        // Создаем строку заголовков
        let headerRow = document.createElement("tr");
        headers.forEach(header => {
            let th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
        tableHead.appendChild(headerRow);

        // Заполняем таблицу данными
        data.forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                td.textContent = row[header] || "";
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }

    // Загружаем данные при загрузке страницы
    loadData();

    // Обработчик отправки формы
    const submitButton = document.getElementById("submit");

    submitButton.addEventListener("click", function (event) {
        event.preventDefault(); // Останавливаем стандартное поведение кнопки

        const nickname = document.getElementById("nickname").value;
        const day = document.getElementById("day").value;  // День (например, ПН, ВТ, ...)
        const goal = document.getElementById("goal").value;
        const wordCount = document.getElementById("word-count").value;

        // Создаем объект с данными, где все дни кроме выбранного будут равны "0"
        const formData = new FormData();
        formData.append("nickname", nickname);
        formData.append("day", day);  // Отправляем день
        formData.append("goal", goal);
        formData.append("word-count", wordCount);

        // Отправляем данные на сервер с помощью fetch
        fetch("/submit_data", {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                // После успешного ответа, обновляем таблицу с новыми данными
                updateTable(data);
            })
            .catch(error => console.error("Ошибка при отправке данных:", error));
    });


    // Загружаем никнеймы с сервера при фокусировке на поле ввода
    const nicknameInput = document.getElementById("nickname");
    const nicknameList = document.getElementById("nickname-list");

    nicknameInput.addEventListener("focus", function () {
        fetch('/get_nicknames')
            .then(response => response.json())
            .then(nicknames => {
                nicknameList.innerHTML = '';  // Очищаем список перед добавлением новых элементов
                nicknameList.style.display = 'block';  // Показываем список
                nicknames.forEach(nickname => {
                    let listItem = document.createElement("li");
                    listItem.textContent = nickname;
                    listItem.addEventListener("click", function () {
                        nicknameInput.value = nickname;  // При клике на никнейм устанавливаем его в input
                        nicknameList.style.display = 'none';  // Скрываем список
                    });
                    nicknameList.appendChild(listItem);
                });
            })
            .catch(error => console.error("Ошибка загрузки никнеймов:", error));
    });

    // Закрытие списка, если пользователь кликнул вне поля ввода
    document.addEventListener("click", function (event) {
        if (!nicknameInput.contains(event.target)) {
            nicknameList.style.display = 'none';
        }
    });
});

document.getElementById('nickname').addEventListener('input', function () {
    let inputValue = this.value.toLowerCase();
    let nicknameList = document.getElementById('nickname-list');
    nicknameList.innerHTML = '';  // Очищаем список

    // Запрашиваем никнеймы с сервера
    fetch('/get_nicknames')
        .then(response => response.json())
        .then(nicknames => {
            // Фильтруем никнеймы по введенному тексту
            let filteredNicks = nicknames.filter(nick => nick.toLowerCase().startsWith(inputValue));

            // Заполняем список отфильтрованными никами
            filteredNicks.forEach(nick => {
                let li = document.createElement('li');
                li.textContent = nick;
                li.addEventListener('click', function () {
                    document.getElementById('nickname').value = nick;
                    nicknameList.style.display = 'none';  // Скрыть список после выбора

                    // После выбора никнейма, получаем цель/день
                    fetch(`/get_goal_for_participant?nickname=${nick}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Не удалось получить данные, сервер вернул ошибку');
                            }
                            return response.json(); // Переходим к преобразованию ответа в JSON
                        })
                        .then(data => {
                            // Если goal отсутствует или пусто, можем поставить дефолтное значение
                            document.getElementById('goal').value = data.goal || '';
                        })
                        .catch(error => {
                            console.error('Ошибка при получении цели/дня:', error);
                            // Можем показать пользователю ошибку на UI, если нужно
                        });
                });
                nicknameList.appendChild(li);
            });

            // Показываем или скрываем список в зависимости от наличия значений
            if (filteredNicks.length > 0) {
                nicknameList.style.display = 'block';
            } else {
                nicknameList.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Ошибка при получении данных:', error);
        });
});

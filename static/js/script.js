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

    function clearInputs() {
        document.getElementById("nickname").value = "";
        document.getElementById("day").value = "ПН";
        document.getElementById("goal").value = "";
        document.getElementById("word-count").value = "";
    }

    // Загружаем данные при загрузке страницы
    loadData();

    document.getElementById("submit").addEventListener("click", function (event) {
        event.preventDefault();

        const nickname = document.getElementById("nickname").value.trim();
        const day = document.getElementById("day").value;
        const goal = document.getElementById("goal").value;
        const wordCount = document.getElementById("word-count").value;

        const formData = new FormData();
        formData.append("nickname", nickname);
        formData.append("day", day);
        formData.append("goal", goal);
        formData.append("word-count", wordCount);

        fetch("/submit_data", {
            method: "POST",
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {
                updateTable(data); // Успешный запрос — обновляем таблицу
            })
            .catch(error => {
                console.error("Ошибка при отправке данных:", error);
                alert(error.error || "Произошла ошибка, попробуйте снова!");
                loadData(); // Грузим актуальные данные, чтобы таблица не исчезала
            });
        clearInputs();
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

    // Очищаем поля при загрузке страницы
    clearInputs();
});




document.addEventListener('DOMContentLoaded', function () {
    // Получаем данные с сервера
    fetch('/get_graph_data')
        .then(response => response.json())
        .then(data => {
            const labels = data.map(item => item.nickname);  // Ники участников
            const daysOfWeek = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

            // Цвета для столбцов по дням недели
            const colors = [
                'FF6B6B', // ПН
                'E8A5E9', // ВТ
                'F6DDE1', // СР
                'FF9090', // ЧТ
                'FA3353', // ПТ
                'FAB8DF', // СБ
                'CD547F'  // ВС
            ];

            // Данные для графика, где каждый участник будет иметь серию столбцов (по дням недели)
            const datasets = daysOfWeek.map((day, index) => {
                return {
                    label: day,
                    data: data.map(item => item.days[day] || 0),  // Для каждого участника для этого дня
                    backgroundColor: `#${colors[index]}`,  // Применяем соответствующий цвет для каждого дня
                    borderColor: `#131A24`,
                    borderWidth: 2,
                    barThickness: 9,  // Устанавливаем ширину столбца
                };
            });

            // Создаем график
            const ctx = document.getElementById('bar-chart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,  // Ники участников
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: '#79787c',  // Цвет сетки по оси Y
                                borderWidth: 1,
                                lineWidth: 1, // Толщина линии сетки
                                drawBorder: false, // Отключаем границу по оси Y
                                drawOnChartArea: true, // Рисуем сетку
                                drawTicks: true, // Отключаем риски
                                tickLength: 5, // Убираем длину рисок
                            }
                        },
                        x: {
                            grid: {
                                color: '#79787c',  // Цвет сетки по оси X
                                borderWidth: 2,
                                lineWidth: 1, // Толщина линии сетки
                                drawBorder: false, // Отключаем границу по оси X
                                drawOnChartArea: true, // Рисуем сетку
                                drawTicks: true, // Отключаем риски
                                tickLength: 10, // Убираем длину рисок
                            },
                            barPercentage: 0.6,
                            categoryPercentage: 0.8
                        }
                    }
                }
            });
            updateGraph(data)

        })
        .catch(error => console.error('Ошибка при получении данных:', error));
});
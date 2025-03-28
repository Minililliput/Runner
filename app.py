from flask import Flask, render_template, jsonify, request
from scripts.BD import load_database, save_database, DAYS

app = Flask(__name__)

path = "C:\\Users\\user\\Desktop\\Забег\\database\\забег.csv"


@app.route("/")
def index():
    # Отправляем HTML страницу с таблицей
    return render_template("main.html")


@app.route("/get_data")
def get_data():
    # Читаем данные из CSV файла
    data = load_database(path)  # Указываем путь к вашему CSV файлу
    return jsonify(data)  # Отправляем данные в формате JSON


@app.route("/submit_data", methods=["POST"])
def submit_data():
    nickname = request.form["nickname"]
    day = request.form["day"]
    goal = request.form["goal"]
    word_count = request.form["word-count"]

    # Загружаем текущие данные
    data = load_database(path)

    # Обрабатываем данные: добавляем или обновляем запись участника
    participant_found = False
    for row in data:
        if row["Участник"] == nickname:
            # Обновляем только тот день, который указан
            for d in DAYS:
                if not row[d]:  # Если день пустой, то ставим 0
                    row[d] = "0"
            row[day] = word_count  # Обновляем выбранный день
            participant_found = True
            break

    # Если участник не найден, добавляем его новую запись
    if not participant_found:
        new_entry = {
            "ID": str(len(data) + 1),  # Генерируем новый ID
            "Участник": nickname,
            "цель/день": goal,
            **{day: "0" for day in DAYS},  # Заполняем все дни нулями
            "Слов/неделя": word_count,  # Начальное значение
            "Цель/неделя": int(goal) * 7,  # Цель/неделя
        }
        new_entry[day] = word_count  # Заполняем выбранный день
        data.append(new_entry)

    # Сохраняем обновленные данные в CSV
    save_database(data, path)

    return jsonify(data)


@app.route("/get_nicknames")
def get_nicknames():
    data = load_database(path)
    nicknames = [row["Участник"] for row in data]
    return jsonify(nicknames)


@app.route("/get_goal_for_participant", methods=["GET"])
def get_goal_for_participant():
    nickname = request.args.get("nickname")  # Получаем имя участника из запроса
    database = load_database(path)  # Указываем путь к CSV файлу

    # Поиск участника в базе данных
    for row in database:
        if row["Участник"] == nickname:
            return jsonify(
                {"goal": row["цель/день"]}
            )  # Возвращаем цель/день для найденного участника
    return jsonify({"goal": ""})


if __name__ == "__main__":
    app.run(debug=True)

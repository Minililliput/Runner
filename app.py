from flask import Flask, render_template, jsonify, request
from scripts.BD import load_database, save_database, is_valid_number, DAYS
from scripts.archive import is_new_week, archive_data, clear_database
import datetime

#! /usr/bin/env python3
# -*- coding: utf-8 -*-

app = Flask(__name__)

path = "database\забег.csv"


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

    # Последняя дата (можно сохранять эту информацию в базе или файле)
    # last_week_date = datetime.date(2025, 3, 23)  # Пример

    # if is_new_week(last_week_date):
    #     archive_data(path)
    #     clear_database(path)
    #     # Обновляем последнюю дату недели
    #     last_week_date = datetime.date.today()

    nickname = request.form["nickname"]
    day = request.form["day"]
    goal = request.form["goal"]
    word_count = request.form["word-count"]

    # Проверяем корректность введенного никнейма
    if not nickname or " " in nickname or len(nickname) <= 2:
        return (
            jsonify(
                {
                    "error": "Некорректный никнейм. Убедитесь, что он не содержит пробелов и длиннее 3 символов."
                }
            ),
            400,
        )

    if not is_valid_number(word_count):
        return (
            jsonify(
                {
                    "error": "Количество слов (word_count) должно быть числом и не может быть отрицательным."
                }
            ),
            400,
        )

    # Загружаем текущие данные
    data = load_database(path)

    # Обрабатываем данные: добавляем или обновляем запись участника
    participant_found = False
    for row in data:
        if row["Участник"] == nickname:
            # Обновляем цель, если введено новое значение (и оно не пустое)
            if goal:
                row["цель/день"] = goal
            row[day] = word_count  # Обновляем выбранный день
            participant_found = True
            break

    # Если участник не найден, добавляем его новую запись
    if not participant_found:
        new_entry = {
            "ID": str(len(data) + 1),  # Генерируем новый ID
            "Участник": nickname,
            "цель/день": goal,
            "Слов/неделя": word_count,  # Начальное значение
            "Цель/неделя": int(goal) * 7,  # Цель/неделя
        }
        new_entry[day] = word_count  # Заполняем выбранный день
        data.append(new_entry)

    # Сохраняем обновленные данные в CSV
    save_database(data, path)
    # Загружаем текущие данные
    data = load_database(path)

    return jsonify(data)


@app.route("/get_nicknames")
def get_nicknames():
    data = load_database(path)
    nicknames = [row["Участник"] for row in data]
    return jsonify(nicknames)


@app.route("/get_graph_data", methods=["GET"])
def get_graph_data():
    data = load_database(path)

    # Подготавливаем данные для графика
    graph_data = []
    for row in data:
        nickname = row["Участник"]
        days_data = {
            day: int(row[day]) for day in DAYS
        }  # Собираем данные по дням недели
        graph_data.append({"nickname": nickname, "days": days_data})

    return jsonify(graph_data)


if __name__ == "__main__":
    app.run(debug=True)

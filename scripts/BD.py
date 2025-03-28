import csv

# Определяем фиксированный порядок колонок
COLUMNS_ORDER = [
    "ID",
    "Участник",
    "цель/день",
    "ПН",
    "ВТ",
    "СР",
    "ЧТ",
    "ПТ",
    "СБ",
    "ВС",
    "Слов/неделя",
    "Цель/неделя",
]

DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"]


def load_database(path):
    # path - это путь к файлу, который надо открыть и прочитать
    # обработка ошибки, если файл отсутствует
    try:
        with open(
            path,
            newline="",
            encoding="utf-8-sig",
        ) as db:
            reader = csv.DictReader(db, delimiter=";")  # Указываем разделитель ";"
            database = []
            for row in reader:
                # Заполняем пустые значения днями "0"
                for day in DAYS:
                    if row.get(day) is None or row[day].strip() == "":
                        row[day] = "0"

                # Подсчитываем сумму слов за неделю
                total_words = sum(
                    int(row[day]) if row[day].isdigit() else 0 for day in DAYS
                )

                # Вычисляем недельную цель
                daily_goal = int(row["цель/день"]) if row["цель/день"].isdigit() else 0
                weekly_goal = daily_goal * 7

                # Обновляем словарь с новыми значениями
                row["Слов/неделя"] = total_words
                row["Цель/неделя"] = weekly_goal

                # Гарантируем порядок ключей
                sorted_row = {key: row.get(key, "") for key in COLUMNS_ORDER}
                database.append(sorted_row)
    except FileNotFoundError:
        # если файла нет, создать пустой словарь
        database = []
    # вернуть словарь
    return database


# функция сохраняет словарь в формате csv в файл
def save_database(database: list[str, dict], path: str) -> None:
    # Открываем файл в режиме записи ('w' - перезапись, 'a' - добавление)
    with open(path, mode="w", newline="", encoding="utf-8") as db:
        # Создаем объект writer
        writer = csv.DictWriter(db, fieldnames=database[0].keys(), delimiter=";")
        # Используем ключи первого словаря как заголовки
        # Записываем заголовки (ключи словаря)
        writer.writeheader()
        # Записываем строки данных
        writer.writerows(database)

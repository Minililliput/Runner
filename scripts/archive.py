import datetime
import os
import shutil
from scripts.BD import COLUMNS_ORDER


def is_new_week(last_week_date):
    # Получаем текущую дату
    today = datetime.date.today()
    # Получаем первый день недели (понедельник)
    start_of_week = today - datetime.timedelta(days=today.weekday())

    # Если дата последней записи отличается от понедельника текущей недели — это новая неделя
    if last_week_date != start_of_week:
        return True
    return False


def archive_data(database_path):
    # Создаем архив с текущими данными
    archive_folder = "archive"

    # Если папка не существует, создаем ее
    if not os.path.exists(archive_folder):
        os.makedirs(archive_folder)

    # Создаем уникальное имя для файла архива
    archive_filename = f"week_{datetime.date.today()}.csv"
    archive_path = os.path.join(archive_folder, archive_filename)

    # Переносим данные в архив
    shutil.copy(database_path, archive_path)
    print(f"Данные перенесены в архив: {archive_path}")


def clear_database(database_path):
    # Открываем файл базы данных для перезаписи
    with open(database_path, "w") as db_file:
        # Записываем только заголовки, все данные удаляются
        db_file.write(COLUMNS_ORDER, "\n")
    print(f"База данных очищена, сохранились только заголовки.")

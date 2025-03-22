import json
from flask import Flask, render_template

app = Flask(__name__)
DATA_FILE = "data.json"


if __name__ == "__main__":
    app.run(debug=True)

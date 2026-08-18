from flask import Flask, request, jsonify
from flask_cors import CORS
from database import init_db, get_db

app = Flask(__name__)
CORS(app)

# Initialize database if first time running
init_db()

# Testing
@app.route("/")
def home():
    return "Backend is working!"

# Retrieve pins from database
@app.route("/api/pins", methods=["GET"])
def get_pins():
    conn = get_db()
    pins = conn.execute("""
        SELECT id, latitude, longitude, title, description, created_at
        FROM tbl_Pin
        ORDER BY id
    """).fetchall()
    conn.close()

    return jsonify([dict(pin) for pin in pins])

# Creating a new pin
@app.route("/api/pins", methods=["POST"])
def create_pin():
    data = request.get_json()

    latitude = data.get("latitude")
    longitude = data.get("longitude")
    title = data.get("title")
    description = data.get("description")

    # Must have valid geography
    if latitude is None or longitude is None:
        return jsonify({"error": "latitude and longitude are required"}), 400

    conn = get_db()

    # Insert into database
    cursor = conn.execute("""
        INSERT INTO tbl_Pin (latitude, longitude, title, description)
        VALUES (?, ?, ?, ?)
    """, (latitude, longitude, title, description))

    conn.commit()

    # Find pin from database and display
    pin = conn.execute("""
        SELECT id, latitude, longitude, title, description, created_at
        FROM tbl_Pin
        WHERE id = ?
        """, (cursor.lastrowid,)).fetchone()

    conn.close()

    return jsonify(dict(pin)), 201

if __name__ == "__main__":
    app.run(debug=True)
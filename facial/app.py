from PIL import Image
import os
import dlib
import numpy as np
from flask import Flask, jsonify, request, render_template, send_from_directory
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
import uuid

predictor_path = "./shape_predictor_5_face_landmarks.dat"
face_rec_model_path = "./dlib_face_recognition_resnet_model_v1.dat"

detector = dlib.get_frontal_face_detector()
sp = dlib.shape_predictor(predictor_path)
face_rec = dlib.face_recognition_model_v1(face_rec_model_path)

# storage Upload location
storage = "./storage"
# Init app
app = Flask(__name__)

# MongoDB
client = MongoClient('localhost', 27017)
db = client.facial


def allowed_file(filename, allow_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allow_extensions


@app.route('/')
def page_users():
    return render_template('users.html')


@app.route('/upload')
def page_upload():
    return render_template('upload.html')


@app.route('/api/users', methods=['GET'])
def api_get_users():
    res = []
    for user in db.users.find():
        user['_id'] = str(user['_id'])
        res.append(user)
    return jsonify(res)


@app.route('/api/users', methods=['POST'])
def api_create_user():
    user = request.get_json()
    if user["name"] is None or len(user["name"]) == 0:
        return jsonify({"error": "name is required"}), 400
    user["encodings"] = []
    user["_id"] = str(db.users.insert_one(user).inserted_id)
    return jsonify(user)


@app.route('/files/<filename>', methods=['GET'])
def get_file(filename):
    return send_from_directory(storage,
                               filename)


@app.route('/api/upload', methods=['POST'])
def upload():
    allow_extensions = {'png', 'jpg', 'jpeg'}
    file = request.files['file']

    if file and allowed_file(file.filename, allow_extensions):
        filename = str(uuid.uuid1()) + "_" + secure_filename(file.filename)
        file_path = os.path.join(storage, filename)
        file.save(file_path)

        # detect faces in picture
        im = Image.open(file_path)
        width, height = im.size
        im = im.convert("RGB")
        img = np.array(im)
        faces = detector(img, 1)
        items = []
        for index, d in enumerate(faces):
            shape = sp(img, d)
            face_descriptor = face_rec.compute_face_descriptor(img, shape)
            items.append({
                "top": d.top(),
                "left": d.left(),
                "right": d.right(),
                "bottom": d.bottom(),
                "encoding": list(face_descriptor),  # convert dlib vector to array
            })

        obj = {"name": filename, "width": width, "height": height, "faces": items}
        # save to mongodb
        obj["_id"] = str(db.images.insert_one(obj).inserted_id)
        return jsonify(obj)

    return jsonify({"error": "image not found"})


if __name__ == '__main__':
    app.run()

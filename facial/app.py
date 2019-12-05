from PIL import Image
import os
import dlib
import numpy as np
from flask import Flask, jsonify, request, render_template, send_from_directory
from werkzeug.utils import secure_filename
from pymongo import MongoClient
from bson.objectid import ObjectId
import uuid
from sklearn import neighbors
import pickle
import math

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


@app.route('/api/tag', methods=['POST'])
def api_tag_user():
    obj = request.get_json()
    if obj["id"] is None or len(obj["id"]) == 0:
        return jsonify({"error": "id is required"}), 400
    if obj["userId"] is None or len(obj["userId"]) == 0:
        return jsonify({"error": "userId is required"}), 400
    if obj["index"] is None or len(obj["id"]) == 0:
        return jsonify({"error": "id is required"}), 400

    image_object = db.images.find_one({"_id": ObjectId(obj["id"])})
    if image_object is None:
        return jsonify({"error": "image not found"})
    image_encoding = image_object["faces"][obj["index"]]["encoding"]
    if image_encoding is None:
        return jsonify({"error": "face encoding not found"})
    # update encoding to user
    db.users.update_one({"_id": ObjectId(obj["userId"])}, {"$push": {"encodings": image_encoding}})

    return jsonify({"success": True})


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


@app.route('/api/train', methods=['POST'])
def api_train():
    x = []
    y = []
    for user in db.users.find():
        for face_encoding in user["encodings"]:
            x.append(face_encoding)
            y.append(str(user["_id"]))

    if len(x) == 0:
        return jsonify({"error": "No face encodings"}), 400

    n_neighbors = int(round(math.sqrt(len(x))))
    knn_clf = neighbors.KNeighborsClassifier(n_neighbors=n_neighbors, algorithm="ball_tree", weights='distance')
    knn_clf.fit(x, y)
    with open("trained.model", 'wb') as f:
        pickle.dump(knn_clf, f)
    return jsonify({"success": True})


@app.route('/api/detect', methods=['POST'])
def api_detect():
    allow_extensions = {'png', 'jpg', 'jpeg'}
    file = request.files['file']
    # load trained model
    with open("./trained.model", 'rb') as f:
        knn_clf = pickle.load(f)
    distance_threshold = 0.65

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
        face_encodings = []
        for index, d in enumerate(faces):
            shape = sp(img, d)
            face_encoding = face_rec.compute_face_descriptor(img, shape)
            face_encodings.append(face_encoding)

        closest_distances = knn_clf.kneighbors(face_encodings, n_neighbors=1)
        are_matches = [closest_distances[0][i][0] <= distance_threshold for i in range(len(faces))]
        predictions = [(pred, loc) if rec else ("", loc) for pred, loc, rec in
                       zip(knn_clf.predict(face_encodings), faces, are_matches)]
        items = []
        for userId, d in predictions:
            user = None
            if len(userId) > 0:
                user = db.users.find_one({"_id": ObjectId(userId)})
                if user is not None:
                    user["_id"] = str(user["_id"])
                    del user["encodings"]

            items.append({
                "top": d.top(),
                "left": d.left(),
                "right": d.right(),
                "bottom": d.bottom(),
                "user": user,
            })

        obj = {"name": filename, "width": width, "height": height, "faces": items}
        return jsonify(obj)

    return jsonify({"error": "image not found"})


if __name__ == '__main__':
    app.run()

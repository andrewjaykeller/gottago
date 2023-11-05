from flask import Flask, render_template, jsonify, request
import json
import numpy as np

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


json_data = json.load(open("static/js/test-aj-2.json"))["data"]

embedding_data = np.load("embeddings2.npy")
n_datapoints = embedding_data.shape[0]
numbers = list(range(n_datapoints))
used_suggestions = []


@app.route("/api/user-feedback", methods=["POST"])
def receive_data():
    global used_suggestions
    data = request.json  # This is the data sent from the client
    # print(data)
    # Do something with the data
    user_feedback = data["userFeedback"]
    id = data["id"]
    used_suggestions.append(id)
    # print("current id", id)
    # print("number of used suggestions", len(used_suggestions))
    # print("user feedback", user_feedback)
    if user_feedback == 1:
        nextId = recommendation(id, user_feedback, used_suggestions)
    else:
        nextId, used_suggestions = recommendation(id, user_feedback, used_suggestions)
    # print("nextId", nextId)
    return jsonify({"status": "success", "nextId": int(nextId)}), 200


@app.route("/api/get-new-card", methods=["POST"])
def receive_new_card():
    global used_suggestions
    data = request.json  # This is the data sent from the client
    # Do something with the data
    id = data["id"]
    return jsonify({"status": "success", "data": json_data[id]}), 200


def recommendation(a_random_number, USER_FEEDBACK, used_suggestion):
    # Cosine Similarity
    data2 = np.expand_dims(embedding_data[a_random_number, :], 0)
    numerator = np.dot(embedding_data, data2.T).T
    denominator = np.linalg.norm(embedding_data, axis=1) * np.linalg.norm(data2, axis=1)
    output = np.divide(numerator, denominator).T

    if USER_FEEDBACK == 0:  # no
        # Removing Similar No's
        for i in np.argsort(output.T)[0][::-1]:
            if i in used_suggestion:
                continue
            dummy = i
            used_suggestion.append(dummy)
            break

        for i in np.argsort(output.T)[0]:
            if i in used_suggestion:
                continue
            a_random_number = i
            break

        return a_random_number, used_suggestion

    else:  # yes
        for i in np.argsort(output.T)[0][::-1]:
            if i in used_suggestion:
                continue
            a_random_number = i
            break

        return a_random_number


if __name__ == "__main__":
    app.run(debug=True)

# from flask import Flask, render_template

# app = Flask(__name__)


# @app.route("/")
# def index():
#     return render_template("index.html")


# if __name__ == "__main__":
#     app.run(debug=True)

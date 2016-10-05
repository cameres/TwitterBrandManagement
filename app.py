from flask import Flask, request, json
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import pdb

app = Flask(__name__)

sid = SentimentIntensityAnalyzer()

# only need one route for determining words
@app.route('/sentiment', methods=['POST'])
def sentiment():
    # get the content
    # request.headers['Content-Type'] == 'application/json'
    text = request.form['text']
    global sid
    # call sentiment analysis on text
    scores = sid.polarity_scores(text)
    # return json for the scores
    return json.dumps(scores)

if __name__ == '__main__':
    app.run(debug=True)

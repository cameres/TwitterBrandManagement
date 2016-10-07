from flask import Flask, request, json
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import pdb
import re

app = Flask(__name__)

sid = SentimentIntensityAnalyzer()

# compile regex for airport codes, i.e. "LAX"
airport = re.compile('\\b[A-Z0-9]{3}\\b')

# only need one route for determining words
@app.route('/parse', methods=['POST'])
def parse():
    # get the content
    # request.headers['Content-Type'] == 'application/json'
    text = request.form['text']
    global sid
    # call sentiment analysis on text
    scores = sid.polarity_scores(text)

    global airport

    #find airport codes in text
    codes = re.findall(airport, text)

    #remove duplicates
    codes = list(set(codes))

    #define response dict
    response = {
        'sentiment': json.dumps(scores),
        'codes': codes
    }
    # return json response
    return json.dumps(response)

if __name__ == '__main__':
    app.run(debug=True)

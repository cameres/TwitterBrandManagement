# BrandManagement - A MSAN 692 Project
<!-- We will create a dashboard for the marketing teams of various companies. In our application we will focus on major American airlines. Our application will have the following features: -->

<!-- - Receive tweets live corresponding to known handles of American operated airlines without refreshing the page
- Analyze the sentiment of incoming tweets using the nltk Vader package to classify into happy, sad, or neutral tweets w/ an assigned "sentiment" value. Happy and sad tweets are presented to the dashboard under happy/sad feeds respectively, while neutral is excluded (those tweets whose 'sentiment' value magnitude fall below a certain 'nuetrality' threshold).
- Dashboard allows marketing team to respond to tweets individually
    - Browser communicates said action to server, which then removes Tweet in question from all feeds. This prevents duplication of efforts by marketing team in replying to tweets.
- Map those tweets that have locations to their coordinates on the map
     -Actual locations given are polygonal areas. Will compute centroid for pin coords
     - The dashboard will aggregate tweets by location "areas" live, with each "area"               represented by a circle
     - The size of each circle will represent the # of tweets in that area
     - The color of each circle will describe the ratio of positive/negative tweets under              each area, from green to red
- In addition, the dashboard will track the overall "impression" of a brand live using a      barchart.
      - "Impression" for each brand is defined as the sum of sentiment values of each               tweet, weighted by the # of followers for that handle.
      - The idea here is to capture the overall "impression" of the brand by the public by            not only taking into account the # of good/bad tweets and their strength, but also            the size of the audience being reached by said tweets (# of followers). For                       example, a negative tweet by Barack Obama about JetBlue will have a greater           affect on the public's impression of JetBlue than a negative tweet by Connor.
      - We want to keep track of this overall -->

from flask import Flask, render_template, jsonify, json
import flask
# import numpy as np
import pandas as pd

app = Flask(__name__)

# import csv
fileNameStr = 'static/input/Video_Games_Sales_as_at_22_Dec_2016.csv'
gamesDf = pd.read_csv(fileNameStr, dtype='object')


def traitementGeneral(df):
    subGamesDf = df.drop(columns=['Developer', 'Rating'])
    ### 对用户评分那四列进行填充
    subGamesDf['Critic_Score'].fillna(0, inplace=True)
    subGamesDf['Critic_Count'].fillna(0, inplace=True)
    subGamesDf['User_Score'].fillna(0, inplace=True)
    subGamesDf['User_Count'].fillna(0, inplace=True)
    ### 删掉含有缺失值的行
    subGamesDf = subGamesDf.dropna(how='any')
    ### 数据类型转换
    '''
    subGamesDf['Year_of_Release'] = subGamesDf['Year_of_Release'].astype('int')
    '''
    subGamesDf['NA_Sales'] = subGamesDf['NA_Sales'].astype('float')
    subGamesDf['EU_Sales'] = subGamesDf['EU_Sales'].astype('float')
    subGamesDf['JP_Sales'] = subGamesDf['JP_Sales'].astype('float')
    subGamesDf['Other_Sales'] = subGamesDf['Other_Sales'].astype('float')
    subGamesDf['Global_Sales'] = subGamesDf['Global_Sales'].astype('float')
    '''
    subGamesDf['Critic_Score'] = subGamesDf['Critic_Score'].astype('float')
    '''
    # User_Score里有异常字符串，需转化
    subGamesDf.loc[subGamesDf['User_Score'] == 'tbd', 'User_Score'] = 0
    '''
    subGamesDf['User_Score'] = subGamesDf['User_Score'].astype('float')
    subGamesDf['Critic_Count'] = subGamesDf['Critic_Count'].astype('int')
    subGamesDf['User_Count'] = subGamesDf['User_Count'].astype('int')
    '''
    return subGamesDf


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/overview')
def overview():
    subGamesDf = traitementGeneral(gamesDf)
    # years = [1980,....,2020]
    years = sorted(subGamesDf['Year_of_Release'].unique())
    # numbersGame = [9,...] per year
    numbersGame = list(subGamesDf.groupby(by=['Year_of_Release'])['Name'].count())
    # salesGame = [11.77,...] per year
    salesGame = list(subGamesDf.groupby(by=['Year_of_Release'])['Global_Sales'].sum())

    return jsonify({
        "years": years,
        "numbers": numbersGame,
        "sales": salesGame
    })


@app.route('/peiNumber', methods=["GET", "POST"])
def peiNumber():
    # cat = '2016'
    if flask.request.method == 'POST':
        year = flask.request.json['year']
    else:
        year = '2016'
    # if flask.request.method == 'GET' :
    subGamesDf = traitementGeneral(gamesDf)
    dfGroupby = subGamesDf.groupby(by=['Year_of_Release']).count()
    dfGroupby['na'] = dfGroupby['NA_Sales'] / dfGroupby['Global_Sales']
    dfGroupby['eu'] = dfGroupby['EU_Sales'] / dfGroupby['Global_Sales']
    dfGroupby['jp'] = dfGroupby['JP_Sales'] / dfGroupby['Global_Sales']
    dfGroupby['ot'] = dfGroupby['Other_Sales'] / dfGroupby['Global_Sales']

    return jsonify({
        "NA": dfGroupby['na'][year],
        "EU": dfGroupby['eu'][year],
        "JP": dfGroupby['jp'][year],
        "OT": dfGroupby['ot'][year]
    })


@app.route('/peiSale', methods=["GET", "POST"])
def peiSale():
    if flask.request.method == 'POST':
        year = flask.request.json['year']
    else:
        year = '2016'
    # if flask.request.method == 'GET' :
    subGamesDf = traitementGeneral(gamesDf)
    dfGroupby = subGamesDf.groupby(by=['Year_of_Release']).sum()
    dfGroupby['na'] = dfGroupby['NA_Sales'] / dfGroupby['Global_Sales']
    dfGroupby['eu'] = dfGroupby['EU_Sales'] / dfGroupby['Global_Sales']
    dfGroupby['jp'] = dfGroupby['JP_Sales'] / dfGroupby['Global_Sales']
    dfGroupby['ot'] = dfGroupby['Other_Sales'] / dfGroupby['Global_Sales']

    return jsonify({
        "NA": dfGroupby['na'][year],
        "EU": dfGroupby['eu'][year],
        "JP": dfGroupby['jp'][year],
        "OT": dfGroupby['ot'][year]
    })


@app.route('/wordcloud', methods=["GET", "POST"])
def wordcloud():
    if flask.request.method == 'POST':
        year = flask.request.json['year']
    else:
        year = 2016
    subGamesDf = traitementGeneral(gamesDf)
    text = subGamesDf['Name'][subGamesDf['Year_of_Release'] == year].sum()
    return jsonify({"text": text})


@app.route('/boxplotScore', methods=["GET", "POST"])
def boxplotScore():
    if flask.request.method == 'POST':
        year = flask.request.json['year']
    else:
        year = '2016'
    subGamesDf = traitementGeneral(gamesDf)
    subGamesDf['User_Score'] = subGamesDf['User_Score'].astype('float')
    subYearDF = subGamesDf[subGamesDf['Year_of_Release'] == '2016']
    #subYearDF = subGamesDf.loc[subGamesDf['Year_of_Release' == '2016']]
    subYearDF = subYearDF[-subYearDF['User_Score'].isin([0])]
    genre = list((subGamesDf['Genre'].unique()))
    sta = []
    for i in genre:
        line = []
        scoreDF = subYearDF[subYearDF['Genre'] == i]
        if subYearDF['Name'][subYearDF['Genre']==i].count()>0:
            line.append(scoreDF['User_Score'].min())
            line.append(scoreDF['User_Score'].quantile(0.25))
            line.append(scoreDF['User_Score'].median())
            line.append(scoreDF['User_Score'].quantile(0.75))
            line.append(scoreDF['User_Score'].max())
        else:
            line.append(0)
            line.append(0)
            line.append(0)
            line.append(0)
            line.append(0)
        sta.append(line)

    return jsonify({"genre": genre,
                    "score": sta})


if __name__ == '__main__':
    app.run()

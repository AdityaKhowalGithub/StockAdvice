from datetime import datetime
from flask import Flask, request, render_template
import pandas as pd
import numpy as np
from yahoo_fin import stock_info as si
from fbprophet import Prophet
import plotly.graph_objs as go
import plotly.express as px

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    stock = request.form['stock']
    start_date = request.form['start_date']
    end_date = request.form['end_date']

    # Get the stock data from Yahoo Finance
    stock_data = si.get_data(stock, start_date=start_date, end_date=end_date)

    # Preprocess the data for Prophet
    stock_data = stock_data.reset_index()[['date', 'adjclose']]
    stock_data.columns = ['ds', 'y']
    stock_data['ds'] = pd.to_datetime(stock_data['ds'])

    # Train the Prophet model
    model = Prophet()
    model.fit(stock_data)

    # Make predictions
    future = model.make_future_dataframe(periods=365)
    forecast = model.predict(future)

    # Plot the predictions
    fig = px.line(forecast, x='ds', y='yhat', labels={'yhat': 'Price'})
    fig.update_layout(title='Stock Price Prediction for ' + stock)

    return render_template('result.html', plot=fig.to_html())

if __name__ == '__main__':
    app.run(debug=True)

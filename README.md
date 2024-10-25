# Machine_Learning_and_IoT_Based_Inteligent_Energy_Monitoring_System_Phase_1
# Project Description
This project is focused on intelligent energy monitoring and prediction using a combination of IoT (Internet of Things) and machine learning. The system collects real-time energy readings from IoT devices and uses machine learning algorithms to predict future power consumption trends.
# Key Features
  1.IoT-Based Energy Monitoring:
    The IoT devices monitor critical parameters such as voltage, current, power factor, and energy consumption in real-time.
    Sensors send these readings to the microcontroller, which processes and transmits the data to the server using GSM/GPRS modules.

  2.Machine Learning for Prediction:
    Collected data is used to predict future energy consumption trends.
    Machine learning models analyze patterns in the data to anticipate peak energy demands and potential power outages.

  3.Real-Time Alerts:
    The system sends SMS alerts to the user for specific events like low voltage, high voltage, or short circuits.
    Alerts are also sent to the local fire department in case of short circuit detection.

  4.Daily Usage Notifications:
    Daily energy consumption summaries are sent to users to help them keep track of their usage.

  5.User-Friendly Visuals:
    The system provides easy-to-understand graphical representations of predicted energy consumption trends.

# Overview
This code is part of Inteligent energy monitoring system where we fetch the sample data from Firebase realtime database which is in json format to the local server which is Express js and then store that data in local database which is MongoDB. After that we will convert that data in csv format and pass it to Machine Learning algorithm for predicting next month data. Now that prediction will be stored in MongoDB in different collection.
# Required libraries
1.axios
2.body-parser
3.cors
4.express
5.firebase-admin
6.fs
7.json2csv
8.mongodb
9.mongoose
10.mqtt
11.nodemon
12.serialport

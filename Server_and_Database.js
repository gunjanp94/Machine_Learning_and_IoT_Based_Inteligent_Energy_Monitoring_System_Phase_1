// Import required modules
const express = require('express');
const admin = require('firebase-admin');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { spawn } = require('child_process');

// Initialize Express.js app
const app = express();

// Firebase Admin SDK setup
const serviceAccount = require('./firebase-service-account.json'); // Update with your Firebase credentials file path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://project2-c4f52-default-rtdb.firebaseio.com/" // Update with your Firebase Realtime Database URL
});

// Reference to Firebase Realtime Database
const db = admin.database();

// MongoDB connection
async function connectToMongoDB() {
  try {
    await mongoose.connect('mongodb+srv://Gunjan:admin%40123@cluster1.d8lmd.mongodb.net/energyDB?retryWrites=true&w=majority',{ // Use your MongoDB URI here
      serverSelectionTimeoutMS: 50000,
      socketTimeoutMS: 45000});
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

// Step 2: Define a Mongoose Schema
const consumptionSchema = new mongoose.Schema({
  timestamp: String,           // You can use Date type if your data fits
  unitConsumption: Number
});

const predictionSchema = new mongoose.Schema({
  timestamp: String,           // You can use Date type if your data fits
  unitConsumption: Number
});

// Step 3: Create a Mongoose Model
const Consumption = mongoose.model('Consumption', consumptionSchema);

const Prediction = mongoose.model('Prediction', predictionSchema);

// Function to fetch data from Firebase, convert to CSV, and store locally
const fetchDataForDateRange = async (startDate, endDate) => {
  try {
    console.log(`Fetching data from ${startDate} to ${endDate}`);

    // Firebase query to fetch data between the start and end timestamps
    const ref = db.ref("/"); // Adjust this path to match your data structure
    const snapshot = await ref
      .orderByChild("timestamp")
      .startAt(startDate)
      .endAt(endDate)
      .once('value');
    
    const data = snapshot.val();

    if (data) {
      console.log('Data found:', data);

      // Save data to data.json
      fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
      console.log('Data saved to data.json');
      } else {
          console.log('No data found.');
      }
   
  } catch (error) {
    console.error('Error fetching or converting data:', error.message);
  }
};

async function storeData() {
  try {
    // Read the JSON file
    const data = fs.readFileSync('data.json', 'utf8');
    const jsonData = JSON.parse(data);

    // Step 5: Prepare data for insertion
    const entries = Object.keys(jsonData).map(key => ({
      timestamp: jsonData[key].timestamp,
      unitConsumption: jsonData[key].unitConsumption
    }));

    // Step 6: Insert data into MongoDB
    await Consumption.insertMany(entries);
    console.log('Data stored successfully in MongoDB');

    // Step 7: Fetch the data back from MongoDB
    await fetchData();
  } catch (error) {
    console.error('Error storing data:', error);
  }
}

async function fetchData() {
  try {
    const data = await Consumption.find(); // Fetch all documents in the Consumption collection
    console.log('Fetched Data from MongoDB:');
    console.log(data);

    // Convert the fetched data to a JSON string
    const jsonData = JSON.stringify(data, null, 2); // `null, 2` for pretty printing the JSON

    // Write the JSON data to data.json file
    fs.writeFileSync('data.json', jsonData, 'utf-8');
    console.log('Data has been successfully saved to data.json');

    // No need to use Object.keys here, `data` is already an array
    const dataArray = data.map((entry) => ({
      timestamp: entry.timestamp,
      unitConsumption: entry.unitConsumption
    }));

    // Define the fields for CSV conversion
    const fields = ['timestamp', 'unitConsumption']; // Adjust as needed
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(dataArray); // Use `dataArray` instead of `jsonData`

    // Specify the path to save the CSV file
    const csvFilePath = path.join(__dirname, 'data.csv');

    // Write the CSV file locally
    fs.writeFileSync(csvFilePath, csv);
    console.log(`Data successfully saved in CSV format at: ${csvFilePath}`);

    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Function to execute Python script and wait for its completion
async function runPythonScript() {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['d:\\1.Study\\Sem 7\\Project\\Phase_1\\new.py']);

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code === 0) {
        resolve();  // Resolve the promise if the process completes successfully
      } else {
        reject(new Error(`Python process exited with code ${code}`));  // Reject if there was an error
      }
    });
  });
}

async function predictionstoreData() {
  try {
    // Read the JSON file
    const data = fs.readFileSync('daily_future_predictions.json', 'utf8');
    const jsonData = JSON.parse(data);

    // Step 5: Prepare data for insertion
    const entries = Object.keys(jsonData).map(key => ({
      timestamp: jsonData[key].timestamp,
      unitConsumption: jsonData[key].unitConsumption
    }));

    // Step 6: Insert data into MongoDB
    await Prediction.insertMany(entries);
    console.log('Data stored successfully in MongoDB');

    // Step 7: Fetch the data back from MongoDB
    await fetchData();
  } catch (error) {
    console.error('Error storing data:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

setInterval(() => {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();

  // Condition to trigger the function at 2:30 PM
  if (hours === 19 && minutes === 31) {
      // Test with the date range (e.g., from '2024-08-01' to '2024-08-09')
      fetchDataForDateRange('2023-10-01 00:00:00', '2024-08-31 23:00:00');
      (async () => {
          await connectToMongoDB(); // Ensure connection is established
          await storeData();
          await fetchData();   
          await runPythonScript();
          await predictionstoreData();    
     })();
      
  }
}, 60000);

// Start the Express.js server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

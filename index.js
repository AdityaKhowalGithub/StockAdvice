// Get references to HTML elements
const form = document.querySelector("form");
const symbolInput = document.querySelector("#symbol");
const submitButton = document.querySelector("#submit");
const predictionDiv = document.querySelector("#prediction");
const chartCanvas = document.querySelector("#chart");
const closingPrices = [];

// Add event listener to form submit button
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form from submitting normally
  predictionDiv.style.display = "none"; // Hide prediction div

  const symbol = symbolInput.value.trim().toUpperCase(); // Get stock symbol from user input
  if (symbol.length === 0) {
    alert("Please enter a stock symbol!"); // Show alert message if user input is empty
    return;
  }

  // Make API request to Alpha Vantage to get stock data
  const apiKey = "40NTLCEXGO4GE5Z0";
  const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${apiKey}`;

  fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data["Error Message"]) {
        alert("Invalid stock symbol! Please try again."); // Show alert message if API request returns error
        return;
      }

      // Get the latest closing price from the stock data
      const latestDate = data["Meta Data"]["3. Last Refreshed"];
      const latestPrice = data["Time Series (Daily)"][latestDate]["4. close"];

      // Calculate the average closing price over the past 5 days
      let sum = 0;
      let count = 0;
      for (const date in data["Time Series (Daily)"]) {
        if (count === 5) {
          break;
        }
        sum += parseFloat(data["Time Series (Daily)"][date]["4. close"]);
        count++;
        closingPrices.push(parseFloat(data["Time Series (Daily)"][date]["4. close"]));
      }
      const avgPrice = (sum / count).toFixed(2);
      const chartData = {
        labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
        datasets: [
          {
            label: "Closing Price",
            data: closingPrices,
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1
          }
        ]
      };
      
      const chartOptions = {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false
            }
          }]
        }
      };
      
      const chart = new Chart(chartCanvas, {
        type: "line",
        data: chartData,
        options: chartOptions
      });
      

      // Display the stock prediction results
      const prediction = document.createElement("p");
      prediction.textContent = `Based on the past 5 days of trading, we predict that ${symbol} will close at an average price of $${avgPrice} tomorrow (latest closing price: $${latestPrice}).`;
      predictionDiv.innerHTML = ""; // Clear prediction div
      predictionDiv.appendChild(prediction); // Add prediction to prediction div
      predictionDiv.style.display = "block"; // Show prediction div
    })
    .catch((error) => {
      alert(`An error occurred: ${error}`); // Show alert message if API request fails
    });
});

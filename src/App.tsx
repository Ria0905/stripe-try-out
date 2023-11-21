
import React, { useState, useEffect } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "./components/booking/StripeCheckoutForm";
import "./App.css";

const stripePromise = loadStripe("pk_test_51OEZbdEJMUk0nckMWMQNQrPSFVc6kn2zuWkNFIoFBjK5tuFbtLXDq0IaKs6ex5i3HTqjIbY47MZ40CRCOhlCVbOg00erxkQ41v"); // I use an example API from Sripe documents

const App: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:4242/create-payment-intent", {
      mode: 'no-cors',
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "xl-tshirt" }] }),
    })
    .then((response) => {
      if (!response.ok) {
        // If the server response was not ok, throw an error
        throw new Error(`Network response was not ok, status: ${response.status}`);
      }
      return response.json(); // Now we can safely call .json()
    })




    .then((data) => {
      setClientSecret(data.clientSecret);
    })
  
    .catch((error) => {
      console.error('There was an issue:', error);
    });
  }, []);

  const appearance = {
    theme: 'stripe',
  };

  const options: any = {
    clientSecret,
    appearance,
  };

  return (
    <div className="App">
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default App;

import React, { useEffect, useState, FormEvent } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Stripe, StripeElements, StripeError, StripePaymentElementOptions } from "@stripe/stripe-js";
import { Button, LoadingOverlay, Notification } from "@mantine/core";

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent?.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3002",
      },
    });

    if (
      error &&
      (error.type === "card_error" || error.type === "validation_error") &&
      error.message
    ) {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occurred.");
    }

    setIsLoading(false);
  };

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs" as any,
  };

  return (
    <form
      id="payment-form"
      onSubmit={handleSubmit}
      style={{ position: "relative" }}
    >
      <LoadingOverlay visible={isLoading} />
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <Button type="submit" disabled={isLoading || !stripe || !elements}>
        {isLoading ? "Loading..." : "Pay now"}
      </Button>
      {message && (
        <Notification
          color={message.startsWith("Payment succeeded") ? "green" : "red"}
        >
          {message}
        </Notification>
      )}
    </form>
  );
};

export default CheckoutForm;

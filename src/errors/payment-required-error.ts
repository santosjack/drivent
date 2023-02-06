import { ApplicationError } from "@/protocols";

export function paymentRequiredError(): ApplicationError {
  return {
    name: "PaymentRequiredError",
    message: "You must pay to continue",
  };
}

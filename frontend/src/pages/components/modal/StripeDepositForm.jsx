import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
const StripeDepositForm = ({ amount, onCancel, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect:'if_required'
    });
    if(error){
        setErrorMessage(error.message);
        setIsProcessing(false)
    }else if(paymentIntent && paymentIntent.status === 'succeeded'){
        onSuccess(paymentIntent)
    }
  };
  //  Styling for stripe element
  const paymentElementOptions = {
    layout: {
      type: "accordion",
      defaultCollapsed: false,
      radios: 'if_multiple',
      spacedAccordionItems: false, 
    },
  };
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <div className="p-1">
        <PaymentElement options={paymentElementOptions} />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="w-full border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-100 rounded-xl py-3 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Processing...
            </>
          ) : (
            `Confirm `
          )}
        </button>
      </div>
    </form>
  );
};
export default StripeDepositForm;

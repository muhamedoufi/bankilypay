"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    reference: "",
    amount: "",
    transactionID: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [rawData, setRawData] = useState(null);
  const [success, setSuccess] = useState<{
    message: string;
    details: any;
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"standard" | "direct">(
    "standard"
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (
        !formData.reference ||
        !formData.amount ||
        !formData.transactionID ||
        !formData.phoneNumber
      ) {
        throw new Error("Tous les champs sont obligatoires");
      }

      // Convert amount to number
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Veuillez saisir un montant valide");
      }

      let response;
      if (paymentMethod === "standard") {
        // Standard API endpoint
        response = await fetch(
          `${process.env.NEXT_PUBLIC_DOLIBARR_API_URL}/bankilypay/payment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              DOLAPIKEY: process.env.NEXT_PUBLIC_DOLIBAR_API_KEY || "",
              Accept: "application/json",
            },
            body: JSON.stringify({
              reference: formData.reference,
              amount: amount,
              transactionID: formData.transactionID,
              phoneNumber: formData.phoneNumber,
            }),
          }
        );
      } else {
        // Direct API endpoint
        const endpoint = `${process.env.NEXT_PUBLIC_DOLIBARR_API_URL}/bankilypay/payment/${formData.reference}/${amount}/${formData.transactionID}/${formData.phoneNumber}`;
        response = await fetch(endpoint, {
          method: "GET",
          headers: {
            DOLAPIKEY: process.env.NEXT_PUBLIC_DOLIBAR_API_KEY || "",
          },
        });
      }

      const data = await response.json();
      setRawData(data);

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Erreur lors du traitement du paiement"
        );
      }

      setSuccess({
        message: "Paiement effectué avec succès",
        details: data,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <p className="text-center text-gray-600 mb-6">
        Sélectionnez votre méthode de paiement préférée
      </p>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            type="button"
            onClick={() => setPaymentMethod("standard")}
            className={`flex-1 py-2 px-4 rounded-md border ${
              paymentMethod === "standard"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-gray-50 border-gray-300 text-gray-700"
            }`}
          >
            <span className="font-medium">Paiement POST</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("direct")}
            className={`flex-1 py-2 px-4 rounded-md border ${
              paymentMethod === "direct"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-gray-50 border-gray-300 text-gray-700"
            }`}
          >
            <span className="font-medium">Paiement GET</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded">
          <p className="font-medium">{success.message}</p>
          <div className="mt-2 text-sm space-y-1">
            <p>
              <span className="font-medium">Référence :</span>{" "}
              {formData.reference}
            </p>
            <p>
              <span className="font-medium">Montant :</span>{" "}
              {success.details.amountPaid} MRO
            </p>
            <p>
              <span className="font-medium">Statut :</span>{" "}
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                {success.details.remainingAmount == 0 ? "Complété" : "En cours"}
              </span>
            </p>
            {success.details.remainingAmount != 0 && (
              <p>
                <span className="font-medium">Reste à payé :</span>
                {success.details.remainingAmount} MRO
              </p>
            )}
          </div>
        </div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="reference"
              className="block text-sm font-medium text-gray-700"
            >
              Référence OTP
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 2020"
              required
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              Montant (MRO)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0.0"
                step="0.01"
                className="block w-full pr-12 pl-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-gray-500 sm:text-sm">MRO</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="transactionID"
            className="block text-sm font-medium text-gray-700"
          >
            Identifiant de transaction
          </label>
          <input
            type="text"
            id="transactionID"
            name="transactionID"
            value={formData.transactionID}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="ID unique de la transaction"
            required
          />
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Numéro mobile
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
              +222
            </span>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              pattern="[0-9]{8}"
              maxLength={8}
              className="flex-1 block w-full px-3 py-2 rounded-none rounded-r-md border text-gray-700 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="12345678"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Format: 8 chiffres sans espace (ex: 12345678)
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
              loading
                ? "bg-blue-400"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Traitement en cours...
              </>
            ) : (
              `Valider avec ${
                paymentMethod === "standard" ? "Paiement POST" : "Paiement GET"
              }`
            )}
          </button>
        </div>
      </form>

      {/* Technical Data Toggle */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          {showRawData ? (
            <>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              Masquer les détails techniques
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Afficher les détails techniques
            </>
          )}
        </button>

        {showRawData && rawData && (
          <div className="mt-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
              Données techniques -{" "}
              {paymentMethod === "standard" ? "API POST" : "API GET"}
            </h4>
            <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

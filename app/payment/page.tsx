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
  const [success, setSuccess] = useState<{
    message: string;
    details: any;
  } | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
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
      if (isNaN(amount)) {
        throw new Error("Montant invalide");
      }

      const response = await fetch(
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || "Erreur lors du paiement");
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-6 text-center text-gray-600">
        Effectuer un Paiement
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          <p>{success.message}</p>
          <div className="mt-2 text-sm">
            <p>ID de transaction: {success.details.apiID}</p>
            <p>Montant payé: {success.details.amountPaid} MRO</p>
            <p>Montant restant: {success.details.remainingAmount} MRO</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="mt-1 block w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="transactionID"
            className="block text-sm font-medium text-gray-700"
          >
            ID de transaction Bankily
          </label>
          <input
            type="text"
            id="transactionID"
            name="transactionID"
            value={formData.transactionID}
            onChange={handleChange}
            className="mt-1 block w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            Numéro de téléphone
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-purple-400" : "bg-purple-600 hover:bg-purple-700"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
          >
            {loading ? "Traitement en cours..." : "Valider le Paiement"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-purple-600 hover:text-purple-800"
        >
          ← Retour à l'accueil
        </button>
      </div>
    </div>
  );
}

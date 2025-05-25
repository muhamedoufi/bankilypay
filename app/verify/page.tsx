"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPayment() {
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSucess] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOLIBARR_API_URL}/bankilypay/verify/${transactionId}`,
        {
          headers: {
            DOLAPIKEY: process.env.NEXT_PUBLIC_DOLIBAR_API_KEY || "",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPaymentData(data);

        throw new Error(data.error?.message || "Failed to verify payment");
      }
      setPaymentData(data);
      setSucess(true);

      console.log(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setShowRawData(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Vérifier le statut de paiement
      </h2>

      {paymentData && success ? (
        <div className="space-y-6">
          <div
            className={`border-l-4 px-4 py-3 rounded mb-4 ${
              paymentData.status === "paid"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-yellow-50 border-yellow-500 text-yellow-800"
            }`}
          >
            <h3 className="font-bold text-lg">
              Statut de paiement: {paymentData.status.toUpperCase()}
            </h3>
            {paymentData.status === "paid" ? (
              <div className="mt-3 space-y-2">
                <p>
                  <span className="font-medium">Transaction ID:</span>{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {transactionId}
                  </span>
                </p>

                <p>
                  <span className="font-medium">API Transaction ID:</span>{" "}
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                    {paymentData.apiID}
                  </span>
                </p>
              </div>
            ) : (
              <p className="mt-2">
                Le paiement n'a pas encore été effectué. Veuillez réessayer plus
                tard.
              </p>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => setPaymentData(null)}
              className="text-blue-500"
            >
              Nouvelle vérification
            </button>
            <a
              href="/"
              className="text-pink-600"
              // className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Retourner à l'accueil
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
              <p>{error}</p>
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1"
              htmlFor="transactionId"
            >
              Transaction ID
            </label>
            <input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full p-2 border text-gray-950 border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Entrez l'ID de transaction"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {loading ? "Vérification en cours..." : "Vérifier"}
          </button>
        </form>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showRawData
            ? "Masquer les données brutes"
            : "Afficher les données brutes"}
        </button>

        {showRawData && (
          <div className="mt-3 bg-white p-4 rounded-lg border border-gray-200">
            <pre className="text-xs  text-gray-900 p-3 rounded overflow-x-auto">
              {JSON.stringify(paymentData, null, 2)}
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

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPayment() {
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOLIBAR_API_URL}/bankilypay/verify/${transactionId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message || "Failed to verify payment");
      }

      setPaymentData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-6">Verify Payment Status</h2>

      {paymentData ? (
        <div
          className={`border px-4 py-3 rounded mb-4 ${
            paymentData.status === "paid"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-yellow-100 border-yellow-400 text-yellow-700"
          }`}
        >
          <h3 className="font-bold">
            Payment Status: {paymentData.status.toUpperCase()}
          </h3>
          {paymentData.status === "paid" ? (
            <>
              <p>
                Transaction ID: <strong>{transactionId}</strong>
              </p>
              <p>
                Payment Date:{" "}
                <strong>
                  {new Date(paymentData.payment_date).toLocaleString()}
                </strong>
              </p>
              <p>
                API Transaction ID:{" "}
                <strong>{paymentData.api_transaction_id}</strong>
              </p>
            </>
          ) : (
            <p>
              The payment is still being processed. Please check back later.
            </p>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="transactionId"
            >
              Transaction ID
            </label>
            <input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Payment"}
          </button>
        </form>
      )}
    </div>
  );
}

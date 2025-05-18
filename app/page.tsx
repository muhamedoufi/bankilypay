import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-6">BankilyPay Prototype</h2>

      <div className="grid gap-4">
        <Link
          href="/invoice"
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-center"
        >
          Consulatation de la facture
        </Link>
        <Link
          href="/payment"
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-center"
        >
          Paiement
        </Link>

        <Link
          href="/verify"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded text-center"
        >
          Verify Payment Status
        </Link>
      </div>
    </div>
  );
}

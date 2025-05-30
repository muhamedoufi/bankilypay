"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InfoFacture() {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [donneesFacture, setDonneesFacture] = useState<any>(null);
  const [showRawData, setShowRawData] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [erreur, setErreur] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErreur("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_DOLIBARR_API_URL}/bankilypay/consult/${reference}`,
        {
          headers: {
            DOLAPIKEY: process.env.NEXT_PUBLIC_DOLIBAR_API_KEY || "",
          },
        }
      );
      const data = await response.json();
      setRowData(data);

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            "Échec de la récupération des informations de la facture"
        );
      }

      // if (data.error?.errorCode !== 0) {
      //   throw new Error(
      //     data.error?.errorMessage ||
      //       "Erreur lors de la récupération de la facture"
      //   );
      // }

      setDonneesFacture({
        reference: reference,
        nomSociete: data.data.name,
        telephoneSociete: data.data.phone,
        montant: data.data.amount,
        statut: data.details.status,
        statutPaiement: data.details.payment_status,
        refFacture: data.details.ref,
        date: data.details.date,
        lignes: data.details.lines,
      });
    } catch (err: any) {
      console.log(err);
      setErreur(err.message);
    } finally {
      setLoading(false);
    }
  };

  const reinitialiserRecherche = () => {
    setDonneesFacture(null);
    setReference("");
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-xl font-semibold mb-6">
        Consulter les informations de facture
      </h2>

      {donneesFacture ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Détails de la facture</h3>
          <div className="mb-4">
            <h4 className="font-semibold">Informations de l'entreprise</h4>
            <p>
              Nom : <strong>{donneesFacture.nomSociete}</strong>
            </p>
            <p>
              Téléphone : <strong>{donneesFacture.telephoneSociete}</strong>
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">Informations de paiement</h4>
            <p>
              Référence : <strong>{donneesFacture.reference}</strong>
            </p>
            <p>
              Réf. Facture : <strong>{donneesFacture.refFacture}</strong>
            </p>
            <p>
              Date : <strong>{donneesFacture.date}</strong>
            </p>
            <p>
              Montant :{" "}
              <strong>
                {new Intl.NumberFormat("fr-MR", {
                  style: "currency",
                  currency: "MRU",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(parseFloat(donneesFacture.montant))}
              </strong>
            </p>

            <p>
              Statut de paiement :{" "}
              <strong>
                {donneesFacture.statutPaiement == 1 ? "Payé" : "Impayé"}
              </strong>
            </p>
          </div>
          {donneesFacture.lignes && donneesFacture.lignes.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold">Lignes de facture</h4>
              <ul className="list-disc pl-5">
                {donneesFacture.lignes.map((ligne: any, index: number) => {
                  // Fonction pour formater les nombres
                  const formatNumber = (numStr: string) => {
                    const num = parseFloat(numStr);
                    return Number.isInteger(num)
                      ? num.toString()
                      : num.toFixed(2).replace(/\.?0+$/, "");
                  };

                  return (
                    <li key={index} className="mb-2">
                      {ligne.description && `${ligne.description} - `}
                      {formatNumber(ligne.quantity)} x{" "}
                      {formatNumber(ligne.unit_price)}
                      <br />
                      <span className="text-sm">
                        Total : {formatNumber(ligne.total)}
                        {/* (TVA :{" "}
                        {formatNumber(ligne.vat_rate)}%) */}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
            >
              Retour à l'accueil
            </button>
            <button
              onClick={reinitialiserRecherche}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
            >
              Nouvelle recherche
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {erreur && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {erreur}
            </div>
          )}

          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="reference"
            >
              Référence de paiement
            </label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full p-2 border rounded"
              required
              placeholder="Entrez votre référence de paiement"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? "Recherche en cours..." : "Obtenir les informations"}
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
              {JSON.stringify(rowData, null, 2)}
            </pre>
          </div>
        )}
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
    </div>
  );
}

import React, { useState } from 'react';
import { ArrowRight, Upload, FileText, Bot, Download, CheckCircle, Loader } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';

const trinn = [
  { navn: 'Last opp fil', ikon: Upload },
  { navn: 'Behandle seksjoner', ikon: Bot },
  { navn: 'Last ned ZIP', ikon: Download }
];

export default function FilopplastningsVeiviser() {
  const [nåværendeTrinn, settNåværendeTrinn] = useState(0);
  const [fil, settFil] = useState(null);
  const [parsedeSeksjoner, settParsedeSeksjoner] = useState(null);
  const [nøkkelord, settNøkkelord] = useState([]);
  const [zipFilnavn, settZipFilnavn] = useState(null);
  const [feil, settFeil] = useState(null);
  const [lasterOpp, settLasterOpp] = useState(false);
  const [behandler, settBehandler] = useState(false);

  const håndterFilEndring = (hendelse) => {
    settFil(hendelse.target.files[0]);
    settFeil(null);
  };

  const håndterOpplastingOgParsing = async () => {
    if (!fil) return;

    settLasterOpp(true);
    const formData = new FormData();
    formData.append('file', fil);

    try {
      const respons = await fetch(`${API_BASE_URL}/api/upload-and-parse`, {
        method: 'POST',
        body: formData,
      });

      if (respons.ok) {
        const data = await respons.json();
        settParsedeSeksjoner(data.parsed_sections);
        settNøkkelord(data.keywords);
        settNåværendeTrinn(1);
      } else {
        const feilData = await respons.json();
        console.error('Filopplasting og parsing mislyktes:', respons.status, feilData);
        settFeil(`Filopplasting og parsing mislyktes: ${feilData.error || 'Ukjent feil'}`);
      }
    } catch (feil) {
      console.error('Feil ved opplasting og parsing av fil:', feil);
      settFeil(`Feil ved opplasting og parsing av fil: ${feil.message}`);
    } finally {
      settLasterOpp(false);
    }
  };

  const håndterBehandlingSeksjoner = async () => {
    settBehandler(true);
    try {
      const respons = await fetch(`${API_BASE_URL}/api/process-sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parsed_sections: parsedeSeksjoner,
          keywords: nøkkelord,
          original_filename: fil.name
        }),
      });

      if (respons.ok) {
        const data = await respons.json();
        settZipFilnavn(data.zip_file);
        settNåværendeTrinn(2);
      } else {
        const feilData = await respons.json();
        console.error('Behandling av seksjoner mislyktes:', respons.status, feilData);
        settFeil(`Behandling av seksjoner mislyktes: ${feilData.error || 'Ukjent feil'}`);
      }
    } catch (feil) {
      console.error('Feil ved behandling av seksjoner:', feil);
      settFeil(`Feil ved behandling av seksjoner: ${feil.message}`);
    } finally {
      settBehandler(false);
    }
  };

  const håndterNedlasting = () => {
    if (!zipFilnavn) {
      settFeil('Ingen ZIP-fil tilgjengelig for nedlasting');
      return;
    }
    window.location.href = `${API_BASE_URL}/api/download/${zipFilnavn}`;
    settNåværendeTrinn(3);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Dokumentbehandler</h1>

        <div className="mb-12">
          <div className="flex items-center justify-between">
            {trinn.map((trinn, indeks) => (
              <div key={trinn.navn} className="flex flex-col items-center">
                <div className={`rounded-full transition duration-500 ease-in-out h-16 w-16 flex items-center justify-center border-2 ${
                  indeks <= nåværendeTrinn ? 'border-blue-400 bg-blue-900' : 'border-gray-600 bg-gray-700'
                }`}>
                  <trinn.ikon size={24} className={indeks <= nåværendeTrinn ? 'text-blue-400' : 'text-gray-400'} />
                </div>
                <div className="text-center mt-4">
                  <span className={`text-xs font-medium uppercase ${
                    indeks <= nåværendeTrinn ? 'text-blue-400' : 'text-gray-500'
                  }`}>
                    {trinn.navn}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {feil && (
          <div className="mb-4 p-4 bg-red-600 text-white rounded-md">
            {feil}
          </div>
        )}

        <div className="mt-8 bg-gray-700 p-6 rounded-lg">
          {nåværendeTrinn === 0 && (
            <div>
              <input
                type="file"
                onChange={håndterFilEndring}
                className="mb-4 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
              />
              <button
                onClick={håndterOpplastingOgParsing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                disabled={!fil || lasterOpp}
              >
                {lasterOpp ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    Laster opp og parser...
                  </>
                ) : (
                  <>
                    Last opp og parse <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>
            </div>
          )}

          {nåværendeTrinn === 1 && (
            <div>
              <p className="mb-4 text-gray-300">Fil parset vellykket. Klikk under for å behandle seksjoner.</p>
              <button
                onClick={håndterBehandlingSeksjoner}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
                disabled={behandler}
              >
                {behandler ? (
                  <>
                    <Loader className="animate-spin mr-2" size={20} />
                    Behandler seksjoner...
                  </>
                ) : (
                  <>
                    Behandle seksjoner <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>
            </div>
          )}

          {nåværendeTrinn === 2 && (
            <div>
              <p className="mb-4 text-gray-300">Seksjoner behandlet. Klikk under for å laste ned ZIP-fil.</p>
              <button
                onClick={håndterNedlasting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
              >
                Last ned ZIP <Download className="ml-2" size={20} />
              </button>
            </div>
          )}

          {nåværendeTrinn === 3 && (
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <p className="text-xl font-semibold text-white">Prosess fullført!</p>
              <p className="mt-2 text-gray-300">Filen din er behandlet og ZIP-filen er lastet ned.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
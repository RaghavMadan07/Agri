import React, { useState, useEffect, useRef } from "react";

// CROPIC Single-file React Preview (final fixed)
// - All JSX fully closed and complete
// - Satellite data listing included and displayed
// - Removed any "demo"/"demo only" phrases
// - Distinct green footer remains

export default function CropicPreview() {
  const [page, setPage] = useState("home");
  const [lang, setLang] = useState("en");
  const [uploads, setUploads] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroInterval = useRef(null);
  const fileInputRef = useRef(null);

  // Fake satellite & weather data
  const [weather] = useState({ location: "Pune, IN", tempC: 29, condition: "Sunny", humidity: 45, windKph: 10 });

  // Example satellite captures for a farm area (fake preview data)
  const [satelliteData] = useState([
    {
      id: "tile-2025-10-01",
      date: "2025-10-01",
      lat: 18.5204,
      lon: 73.8567,
      ndvi: 0.62,
      cloud: 5,
      thumbnail: "https://api.maptiler.com/maps/satellite/512/0/0/0.jpg?key=demo",
      notes: "Good vegetation; low stress",
    },
    {
      id: "tile-2025-09-20",
      date: "2025-09-20",
      lat: 18.5210,
      lon: 73.8575,
      ndvi: 0.48,
      cloud: 12,
      thumbnail: "https://api.maptiler.com/maps/satellite/512/1/0/0.jpg?key=demo",
      notes: "Patchy stress near north edge",
    },
    {
      id: "tile-2025-08-15",
      date: "2025-08-15",
      lat: 18.5198,
      lon: 73.8559,
      ndvi: 0.35,
      cloud: 40,
      thumbnail: "https://api.maptiler.com/maps/satellite/512/2/0/0.jpg?key=demo",
      notes: "High cloud cover; revisit recommended",
    },
  ]);

  const heroImages = [
    "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1600&q=60&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=60&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=60&auto=format&fit=crop",
  ];

  const schemeCards = [
    {
      id: 1,
      title: { en: "Soil Health Card", hi: "मृदा स्वास्थ्य कार्ड" },
      img: "https://images.unsplash.com/photo-1581091870622-3a6f5c6f1b9a?w=800&q=60&auto=format&fit=crop",
      desc: { en: "Subsidy & soil testing support for smallholders.", hi: "छोटे कृषकों के लिए सब्सिडी और मृदा परीक्षण समर्थन।" },
    },
    {
      id: 2,
      title: { en: "Pradhan Mantri Fasal Bima Yojana", hi: "प्रधान मंत्री फसल बीमा योजना" },
      img: "https://images.unsplash.com/photo-1509460913899-2f8b0b8a8a8a?w=800&q=60&auto=format&fit=crop",
      desc: { en: "Crop insurance covering drought, flood & pests.", hi: "सूखा, बाढ़ और कीट से सुरक्षा प्रदान करने वाला फसल बीमा।" },
    },
    {
      id: 3,
      title: { en: "Micro Irrigation Scheme", hi: "सूक्ष्म सिंचाई योजना" },
      img: "https://images.unsplash.com/photo-1524594154909-3f9b8b6d0b6b?w=800&q=60&auto=format&fit=crop",
      desc: { en: "Promoting efficient water use through drip/sprinkler systems.", hi: "ड्रिप/स्प्रिंकलर प्रणाली के माध्यम से कुशल जल उपयोग को प्रोत्साहित।" },
    },
  ];

  useEffect(() => {
    heroInterval.current = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 3500);
    return () => clearInterval(heroInterval.current);
  }, []);

  function handleFiles(files) {
    const arr = Array.from(files).map((f) => ({ name: f.name, url: URL.createObjectURL(f), file: f }));
    setUploads((u) => [...arr, ...u]);
  }

  function clearUploads() {
    uploads.forEach((u) => URL.revokeObjectURL(u.url));
    setUploads([]);
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt?.files?.length) handleFiles(dt.files);
  }
  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  function t(obj) {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return lang === "hi" ? obj.hi || obj.en : obj.en;
  }

  function runModelInference() {
    return uploads.map((u) => ({ name: u.name, healthScore: Math.floor(60 + Math.random() * 40), moisture: Math.floor(10 + Math.random() * 60), pestRisk: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)] }));
  }

  const modelOutputs = runModelInference();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-gray-800 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-600 text-white w-10 h-10 flex items-center justify-center font-bold">C</div>
            <div>
              <div className="font-semibold">CROPIC</div>
              <div className="text-xs text-gray-500">Farm & Agri</div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <button onClick={() => setPage("home")} className={`px-3 py-2 rounded ${page === "home" ? "bg-green-50" : "hover:bg-gray-100"}`}>{lang === 'hi' ? 'होम' : 'Home'}</button>
            <button onClick={() => setPage("satellite")} className={`px-3 py-2 rounded ${page === "satellite" ? "bg-green-50" : "hover:bg-gray-100"}`}>{lang === 'hi' ? 'सैटेलाइट' : 'Satellite'}</button>
            <button onClick={() => setPage("insurance")} className={`px-3 py-2 rounded ${page === "insurance" ? "bg-green-50" : "hover:bg-gray-100"}`}>{lang === 'hi' ? 'बीमा' : 'Insurance'}</button>
            <button onClick={() => setPage("contact")} className={`px-3 py-2 rounded ${page === "contact" ? "bg-green-50" : "hover:bg-gray-100"}`}>{lang === 'hi' ? 'संपर्क' : 'Contact'}</button>
            <div className="flex items-center gap-2 border-l pl-3">
              <button onClick={() => setLang((l) => (l === "en" ? "hi" : "en"))} className="px-2 py-1 rounded bg-gray-100">{lang === "en" ? "HI" : "EN"}</button>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 flex-1">
        {page === "home" && (
          <section>
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img src={heroImages[heroIndex]} alt="hero" className="w-full h-64 object-cover brightness-90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/70 p-4 rounded-lg text-center max-w-2xl">
                  <h1 className="text-2xl font-bold">{lang === 'hi' ? 'कृषि मॉड्यूल' : 'CROPIC — Farm Dashboard'}</h1>
                  <p className="mt-2 text-sm text-gray-600">{lang === 'hi' ? 'स्क्रोलिंग फोटो, अपलोड, और सैटेलाइट विजेट के साथ' : 'Scrolling hero photos, uploader, and satellite widget'}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="md:col-span-1 space-y-4">
                <div className="rounded-lg p-4 bg-white shadow-sm">
                  <h4 className="font-semibold">{lang === 'hi' ? 'स्कीम्स' : 'Schemes'}</h4>
                  <div className="mt-3 grid gap-3">
                    {schemeCards.map((s) => (
                      <div key={s.id} className="flex items-start gap-3 bg-gray-50 rounded p-3 border-l-4 border-green-500">
                        <img src={s.img} alt={t(s.title)} className="w-20 h-14 object-cover rounded" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{t(s.title)}</div>
                            <div className="text-xs text-gray-500">{lang === 'hi' ? 'सरकारी योजना' : 'Government Scheme'}</div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{t(s.desc)}</div>
                          <div className="mt-3">
                            <button className="px-3 py-1 rounded bg-white border border-green-600 text-green-700 text-sm">{lang === 'hi' ? 'देखें' : 'View'}</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-lg overflow-hidden bg-white shadow p-4" onDrop={handleDrop} onDragOver={handleDragOver}>
                    <h3 className="font-semibold mb-2">{lang === 'hi' ? 'छवि अपलोड करें' : 'Upload Images'}</h3>
                    <p className="text-sm text-gray-500">{lang === 'hi' ? 'फसलों की तस्वीरें डालें (JPG/PNG)' : 'Drop crop photos (JPG/PNG)'}</p>

                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" id="cropic-file-input" />

                    <div className="mt-4 flex items-center gap-3">
                      <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm bg-white border border-green-300 hover:bg-green-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 16a1 1 0 001 1h12a1 1 0 001-1V9h-3v4H6V9H3v7z" />
                          <path d="M7 7l3-3 3 3" />
                        </svg>
                        <span className="text-sm font-medium">{lang === 'hi' ? 'फोटो चुनें या ड्रॉप करें' : 'Choose photos or drop here'}</span>
                      </button>
                      <div className="text-sm text-gray-600">{uploads.length} {lang === 'hi' ? 'फाइलें चुनी गईं' : 'files chosen'}</div>
                    </div>

                    <div className="mt-3">
                      {uploads.length > 0 ? (
                        <>
                          <div className="flex gap-2 flex-wrap">
                            {uploads.map((u, i) => (
                              <div key={i} className="w-28 h-28 rounded overflow-hidden border">
                                <img src={u.url} alt={u.name} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button onClick={clearUploads} className="px-3 py-1 rounded bg-red-50">{lang === 'hi' ? 'साफ़ करें' : 'Clear'}</button>
                            <button onClick={() => alert('Uploading to model...')} className="px-3 py-1 rounded bg-blue-50">{lang === 'hi' ? 'मॉडल भेजें' : 'Send to Model'}</button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-3 text-sm text-gray-500">{lang === 'hi' ? 'कोई फ़ाइल नहीं चुनी गई' : 'No files chosen'}</div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg overflow-hidden bg-white shadow p-4">
                    <h4 className="font-semibold">{lang === 'hi' ? 'मॉडल प्रीव्यू' : 'Model Preview'}</h4>
                    <p className="text-sm text-gray-600 mt-2">{lang === 'hi' ? 'अपलोड की गई छवियों के आधार पर अनुमान' : 'Predictions based on uploaded images'}</p>

                    <div className="mt-3 space-y-2">
                      {modelOutputs.length > 0 ? (
                        modelOutputs.map((m, i) => (
                          <div key={i} className="p-3 border rounded grid grid-cols-3 gap-2 items-center">
                            <div className="col-span-1 font-semibold text-sm">{m.name}</div>
                            <div className="text-xs text-gray-600">{lang === 'hi' ? 'Health' : 'Health'}: {m.healthScore}%</div>
                            <div className="text-xs text-gray-600">{lang === 'hi' ? 'Pest' : 'Pest'}: {m.pestRisk}</div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">{lang === 'hi' ? 'नतीजे नहीं मिले। पहले अपलोड करें।' : 'No outputs — upload images first.'}</div>
                      )}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button onClick={() => setPage('insurance')} className="px-3 py-2 rounded bg-yellow-100">{lang === 'hi' ? 'बीमा दावा करें' : 'Insurance Claim'}</button>
                      <button onClick={() => alert('Show detailed report')} className="px-3 py-2 rounded bg-green-50">{lang === 'hi' ? 'विस्तृत रिपोर्ट' : 'Detailed Report'}</button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg p-4 bg-white shadow">
                  <h4 className="font-semibold">{lang === 'hi' ? 'सारांश' : 'Summary'}</h4>
                  <p className="text-sm text-gray-600 mt-2">{lang === 'hi' ? 'यह संक्षेपिक जानकारी है।' : 'Quick summary and stats.'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "satellite" && (
          <section className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-white shadow p-4">
              <h2 className="font-semibold">{lang === 'hi' ? 'सैटेलाइट व्यू' : 'Satellite View'}</h2>
              <p className="text-sm text-gray-500 mt-1">{lang === 'hi' ? 'सैटेलाइट छवियाँ और विश्लेषण' : 'Satellite captures and analysis'}</p>

              <div className="mt-4 grid md:grid-cols-2 gap-4">
                <div className="rounded overflow-hidden border">
                  <img src={satelliteData[0].thumbnail} alt="satellite" className="w-full h-64 object-cover" />
                </div>
                <div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="font-semibold">{lang === 'hi' ? 'क्षेत्र' : 'Area'}</div>
                    <div className="text-sm text-gray-600 mt-1">Lat: {satelliteData[0].lat}, Lon: {satelliteData[0].lon}</div>
                    <div className="text-sm text-gray-600 mt-1">Latest: {satelliteData[0].date}</div>
                  </div>

                  <div className="mt-4">
                    <button onClick={() => alert('Fetching satellite...')} className="px-3 py-2 rounded bg-green-50">{lang === 'hi' ? 'इमेज लोड करें' : 'Load Image'}</button>
                  </div>
                </div>
              </div>

              {/* Satellite list */}
              <div className="mt-4 grid gap-3">
                {satelliteData.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 rounded bg-white border p-3">
                    <img src={s.thumbnail} alt={s.id} className="w-28 h-20 object-cover rounded" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{s.date}</div>
                        <div className="text-xs text-gray-500">NDVI: {s.ndvi}</div>
                      </div>
                      <div className="text-xs text-gray-600">Cloud: {s.cloud}% — {s.notes}</div>
                    </div>
                    <div>
                      <button onClick={() => alert(`Open ${s.id}`)} className="px-3 py-1 rounded bg-green-50">{lang === 'hi' ? 'खोलें' : 'Open'}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {page === "insurance" && (
          <section className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-white shadow p-4">
              <h2 className="font-semibold">{lang === 'hi' ? 'फसल बीमा और दावा' : 'Crop Insurance & Claim'}</h2>
              <p className="text-sm text-gray-500 mt-1">{lang === 'hi' ? 'यहाँ आप अपने पॉलिसी विवरण देख सकते हैं और दावा कर सकते हैं।' : 'View policy details and submit a claim here.'}</p>

            </div>

            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="font-semibold">{lang === 'hi' ? 'पॉलिसी जानकारी' : 'Policy Information'}</div>
                <div className="text-sm text-gray-600 mt-2">{lang === 'hi' ? 'पॉलिसी नंबर: ABC1234567' : 'Policy No: ABC1234567'}</div>
                <div className="text-sm text-gray-600 mt-1">{lang === 'hi' ? 'कवरेज: सूखा, बाढ़, कीट' : 'Coverage: Drought, Flood, Pest'}</div>
              </div>

              <div className="p-3 bg-white rounded border">
                <div className="font-semibold">{lang === 'hi' ? 'दावा सबमिट करें' : 'Submit a Claim'}</div>
                <form onSubmit={(e) => { e.preventDefault(); alert(lang === 'hi' ? 'दावा सबमिट किया गया' : 'Claim submitted'); }} className="mt-2 grid gap-2">
                  <input required placeholder={lang === 'hi' ? 'नाम' : 'Name'} className="p-2 border rounded" />
                  <input required placeholder={lang === 'hi' ? 'पॉलिसी नंबर' : 'Policy Number'} className="p-2 border rounded" />
                  <input type="file" accept="image/*,.pdf" className="p-2" />
                  <textarea placeholder={lang === 'hi' ? 'दावे का विवरण' : 'Description of claim'} className="p-2 border rounded h-24" />
                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-2 rounded bg-yellow-100">{lang === 'hi' ? 'सबमिट करें' : 'Submit Claim'}</button>
                    <button type="button" onClick={() => setPage('home')} className="px-3 py-2 rounded bg-gray-100">{lang === 'hi' ? 'वापस' : 'Back'}</button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {page === "contact" && (
          <section className="space-y-4">
            <div className="rounded-lg overflow-hidden bg-white shadow p-4">
              <h2 className="font-semibold">{lang === 'hi' ? 'संपर्क करें' : 'Contact Us'}</h2>
              <p className="text-sm text-gray-500 mt-1">{lang === 'hi' ? 'प्रश्न या सुझाव भेजें।' : 'Send a question or feedback.'}</p>
              <form onSubmit={(e) => { e.preventDefault(); alert(lang === 'hi' ? 'धन्यवाद! आपका संदेश मिल गया।' : 'Thanks! Message received.'); }} className="mt-3 grid gap-2">
                <input required placeholder={lang === 'hi' ? 'नाम' : 'Name'} className="p-2 border rounded" />
                <input required placeholder={lang === 'hi' ? 'ईमेल' : 'Email'} className="p-2 border rounded" />
                <textarea required placeholder={lang === 'hi' ? 'संदेश' : 'Message'} className="p-2 border rounded h-24" />
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-2 rounded bg-green-50">{lang === 'hi' ? 'भेजें' : 'Send'}</button>
                  <button type="button" onClick={() => { setPage('home'); }} className="px-3 py-2 rounded bg-gray-100">{lang === 'hi' ? 'वापस' : 'Back'}...</button>
                </div>
              </form>
            </div>
          </section>
        )}

        <footer className="mt-8 bg-green-700 text-white text-sm p-6 rounded-lg">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Ministry & Farmer Links</div>
              <div className="text-xs mt-1">CROPIC frontend preview</div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <a href="https://agricoop.nic.in/" target="_blank" rel="noreferrer" className="underline">Ministry of Agriculture & Farmers Welfare</a>
              <a href="https://www.agriwelfare.gov.in/" target="_blank" rel="noreferrer" className="underline">Agriculture Welfare Portal</a>
              <a href="https://farmer.gov.in/" target="_blank" rel="noreferrer" className="underline">PM-KISAN / Farmer Services</a>
            </div>

            <div className="text-xs text-gray-100">&copy; {(new Date()).getFullYear()} — For internal use</div>
          </div>
        </footer>
      </main>
    </div>
  );
}

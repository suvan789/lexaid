import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import API from '../api/axios';

const DOC_ICONS = {
  rent_agreement: '🏠', employment_contract: '💼', nda: '🤝',
  affidavit: '📜', legal_notice: '⚠️', partnership_deed: '🤝', loan_agreement: '💰',
};

export default function GeneratorPage() {
  const [step, setStep] = useState(1);
  const [docTypes, setDocTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [signatureImage, setSignatureImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setGeneratedDoc } = useApp();
  const navigate = useNavigate();

  useEffect(() => { fetchDocTypes(); }, []);

  const fetchDocTypes = async () => {
    try {
      const res = await API.get('/api/generator/types');
      setDocTypes(res.data);
    } catch {}
  };

  const handleSelectType = (dt) => {
    setSelectedType(dt);
    
    // Auto-fill current system date for all date fields
    const todayStr = new Date().toISOString().split('T')[0];
    const initial = {};
    dt.required_fields.forEach(field => {
      if (field.includes('date')) {
        initial[field] = todayStr;
      }
    });
    setFormData(initial);
    setSignatureImage(null);
    setStep(2);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result);
        setFormData(prev => ({ ...prev, signature_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatLabel = (field) => {
    return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleGenerate = async () => {
    if (!selectedType) return;
    // Validate required fields
    const missing = selectedType.required_fields.filter(f => !formData[f]?.trim());
    if (missing.length > 0) {
      setError(`Please fill in required fields: ${missing.map(formatLabel).join(', ')}`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/api/generator/generate', {
        doc_type: selectedType.type,
        form_data: {
          ...formData,
          signature_image: signatureImage || formData.signature_image || null
        },
      });
      setGeneratedDoc({
        ...res.data,
        form_data: {
          ...res.data.form_data,
          signature_image: signatureImage
        }
      });
      navigate('/generate/result');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-3xl mx-auto text-center py-20 animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-6 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-semibold text-navy mb-2">AI is drafting your document...</p>
        <p className="text-sm text-gray-400">This may take 15-30 seconds</p>
      </div>
    );
  }

  return (
    <div className="page-container max-w-4xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-navy mb-2">Generate Legal Document</h1>
        <p className="text-gray-500">Create professional legal documents powered by AI</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step >= 1 ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">1</span> Choose Type
        </div>
        <div className="w-8 h-0.5 bg-gray-300"></div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${step >= 2 ? 'bg-navy text-white' : 'bg-gray-200 text-gray-500'}`}>
          <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">2</span> Fill Details
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {docTypes.map((dt) => (
            <button
              key={dt.type}
              onClick={() => handleSelectType(dt)}
              className="bg-white rounded-xl p-5 text-left shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 group"
            >
              <div className="text-3xl mb-3">{DOC_ICONS[dt.type] || '📄'}</div>
              <h3 className="font-semibold text-navy mb-1">{dt.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{dt.description}</p>
              <span className="text-accent text-sm font-medium group-hover:underline">Select →</span>
            </button>
          ))}
        </div>
      )}

      {step === 2 && selectedType && (
        <div className="animate-fade-in">
          <button onClick={() => setStep(1)} className="text-sm text-accent hover:underline mb-4 inline-flex items-center gap-1">
            ← Back to document types
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{DOC_ICONS[selectedType.type] || '📄'}</span>
                <div>
                  <h2 className="text-lg font-bold text-navy">{selectedType.name}</h2>
                  <p className="text-sm text-gray-500">{selectedType.required_fields.length} fields required</p>
                </div>
              </div>
              <div className="text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full font-semibold">
                📅 Date Auto-Filled to Today ({new Date().toISOString().split('T')[0]})
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {selectedType.required_fields.map((field) => (
                <div key={field} className={field === 'statement' || field === 'grievance_details' || field === 'relief_sought' ? 'sm:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {formatLabel(field)} <span className="text-red-400">*</span>
                  </label>
                  {(field === 'statement' || field === 'grievance_details' || field === 'relief_sought') ? (
                    <textarea
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm resize-none"
                      placeholder={`Enter ${formatLabel(field).toLowerCase()}`}
                    />
                  ) : (
                    <input
                      type={field.includes('date') ? 'date' : field.includes('amount') || field.includes('rate') || field.includes('salary') || field.includes('months') || field.includes('days') || field.includes('hours') || field.includes('share') || field.includes('years') || field.includes('age') ? 'number' : 'text'}
                      value={formData[field] || ''}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none text-sm"
                      placeholder={`Enter ${formatLabel(field).toLowerCase()}`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Signature Upload Section */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 mb-6">
              <label className="block text-sm font-semibold text-navy mb-1">
                ✍️ Upload Sender / Authorized Signature (Optional Image)
              </label>
              <p className="text-xs text-gray-500 mb-3">Upload your signature image (PNG/JPG) to place it on the final document & PDF.</p>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-white hover:file:bg-navy-light cursor-pointer"
              />

              {signatureImage && (
                <div className="mt-3 flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-200">
                  <img src={signatureImage} alt="Uploaded Signature" className="h-12 max-w-[160px] object-contain border border-gray-200 p-1 rounded" />
                  <div>
                    <p className="text-xs font-semibold text-green-600">✓ Signature Loaded Successfully</p>
                    <button type="button" onClick={() => setSignatureImage(null)} className="text-xs text-red-500 hover:underline mt-0.5">Remove Signature</button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              className="w-full py-3 bg-navy text-white rounded-xl font-semibold hover:bg-navy-light transition-all shadow-md"
            >
              📝 Generate Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

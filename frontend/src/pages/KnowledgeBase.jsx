import React, { useState, useEffect } from 'react';
import client from '../api/client';
import {
  BookOpen,
  Upload,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await client.get('/api/knowledge/documents');
      setDocuments(res.data.documents || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve knowledge base sources from storage.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError('');
    } else {
      setSelectedFile(null);
      setError('Please select a valid PDF file for ingestion.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await client.post('/api/knowledge/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`Successfully ingested "${selectedFile.name}"! Created ${res.data.chunks} semantic text chunks.`);
      setSelectedFile(null);
      
      // Reset input element
      document.getElementById('file-upload-input').value = '';

      fetchDocuments();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to parse and ingest PDF document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Delete this source document? All corresponding vector database chunks will be destroyed.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await client.delete(`/api/knowledge/${docId}`);
      setSuccess('Document deleted successfully.');
      setDocuments(documents.filter(doc => doc.id !== docId));
      setTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
      setError('Failed to delete document from backend storage.');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">AI Knowledge Base</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Upload manuals, product specs, and FAQs to contextually ground agent AI replies.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-700 dark:text-green-400 text-sm">
          <CheckCircle size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form Box */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ingest Support Document</h3>
            <p className="text-xs text-slate-400 mt-0.5">Upload a PDF manual to segment and vectorize</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-250 cursor-pointer relative bg-slate-50/20 dark:bg-slate-900/10">
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl text-indigo-600 dark:text-indigo-400 inline-block">
                  <Upload size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {selectedFile ? selectedFile.name : 'Select or drag PDF file'}
                  </p>
                  <p className="text-[10px] text-slate-400">PDF documents up to 10MB</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-750 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all duration-200 shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Ingest Document</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Active Documents List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Ingested Sources</h3>
              <p className="text-xs text-slate-400 mt-0.5">Documents supporting current AI responses</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
              <Database size={12} />
              <span>{total} Documents</span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Fetching document indexes...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              No documents active. Upload operational manuals above.
            </div>
          ) : (
            <div className="space-y-3.5">
              {documents.map((doc) => {
                // Documents from the chroma DB listing might have metadata
                const docName = doc.metadata?.source || doc.document || doc.id;
                const pathParts = docName.split(/[\\/]/);
                const fileBaseName = pathParts[pathParts.length - 1];

                return (
                  <div
                    key={doc.id}
                    className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-700/80 rounded-2xl flex items-center justify-between gap-4 group hover:border-slate-200 dark:hover:border-slate-650 transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate" title={docName}>
                          {fileBaseName}
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-md">
                          UUID: {doc.id}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/25 text-rose-500 rounded-xl transition-colors duration-150 shrink-0"
                      title="Remove source"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;

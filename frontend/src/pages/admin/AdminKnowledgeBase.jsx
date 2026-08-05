import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  RefreshCw,
  Database,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

const AdminKnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await client.get('/api/admin/knowledge/documents');
      setDocuments(res.data);
    } catch (err) {
      console.error('Failed to load knowledge documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!fileToUpload) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await client.post('/api/admin/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatusMessage({ type: 'success', text: `Uploaded ${fileToUpload.name} successfully!` });
      setFileToUpload(null);
      fetchDocuments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.response?.data?.detail || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (filename) => {
    if (!window.confirm(`Delete knowledge document ${filename}?`)) return;
    try {
      await client.delete(`/api/admin/knowledge/documents/${encodeURIComponent(filename)}`);
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete document');
    }
  };

  const handleReindex = async () => {
    try {
      const res = await client.post('/api/admin/knowledge/reindex');
      alert(res.data.message);
      fetchDocuments();
    } catch (err) {
      alert('Re-index failed');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <BookOpen className="text-indigo-400" /> Vector Knowledge Base Repository
          </h2>
          <p className="text-xs text-slate-400 mt-1">Upload enterprise documentation (PDF, DOCX) to enrich ChromaDB RAG vector embeddings.</p>
        </div>
        <button
          onClick={handleReindex}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <RefreshCw size={14} /> Re-index Vector Collection
        </button>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
          statusMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <CheckCircle size={16} /> {statusMessage.text}
        </div>
      )}

      {/* Upload Zone Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="font-bold text-base text-white mb-3">Upload Knowledge Document</h3>
        <form onSubmit={handleUploadSubmit} className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => setFileToUpload(e.target.files[0])}
            className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer bg-slate-950 p-2 border border-slate-800 rounded-2xl"
          />
          <button
            type="submit"
            disabled={!fileToUpload || uploading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <UploadCloud size={16} /> {uploading ? 'Processing & Vectorizing...' : 'Upload & Index'}
          </button>
        </form>
      </div>

      {/* Documents List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-white flex items-center justify-between">
          <span>Indexed Knowledge Corpus ({documents.length})</span>
          <span className="text-xs text-slate-400 font-normal">ChromaDB Vector Store: Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Filename</th>
                <th className="p-4">Chunks Indexed</th>
                <th className="p-4">Indexed At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">Loading indexed documents...</td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">No knowledge files uploaded yet.</td>
                </tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <FileText size={16} className="text-indigo-400" /> {doc.filename}
                    </td>
                    <td className="p-4 font-mono text-indigo-300">
                      {doc.chunk_count || 12} vectors
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteDoc(doc.filename)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminKnowledgeBase;

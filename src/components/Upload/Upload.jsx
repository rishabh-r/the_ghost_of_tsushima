import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import './Upload.css';

export default function Upload({ onSubmit, loading }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef();

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  function handleFile(e) {
    const f = e.target.files[0];
    if (f) setFile(f);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!text.trim() && !file) return;

    const formData = new FormData();
    formData.append('name', name.trim());
    if (text.trim()) formData.append('rawInput', text.trim());
    if (file) formData.append('file', file);

    onSubmit(formData);
  }

  return (
    <motion.form
      className="upload-form animate-slideUp"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="upload-field">
        <label className="upload-label" htmlFor="project-name">Project Name</label>
        <input
          id="project-name"
          type="text"
          className="upload-input"
          placeholder="e.g. E-Commerce Platform Requirements"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>

      <div className="upload-field">
        <label className="upload-label" htmlFor="project-requirements">Requirements</label>
        <textarea
          id="project-requirements"
          className="upload-textarea"
          placeholder="Paste your raw requirements, user stories, or feature descriptions here..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
        />
      </div>

      <div className="upload-divider">
        <span className="upload-divider-text">or upload a file</span>
      </div>

      <motion.div
        className={`upload-dropzone ${dragActive ? 'dropzone-active' : ''} ${file ? 'dropzone-has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        animate={dragActive ? { scale: 1.01, y: -2 } : { scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 330, damping: 24 }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.pdf,.docx"
          onChange={handleFile}
          hidden
        />
        {file ? (
          <div className="dropzone-file">
            <span className="dropzone-file-icon">📄</span>
            <span className="dropzone-file-name">{file.name}</span>
            <button
              type="button"
              className="dropzone-file-remove"
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="dropzone-icon">📁</span>
            <span className="dropzone-text">Drop your file here, or click to browse</span>
            <div className="dropzone-formats">
              <span className="format-badge">.txt</span>
              <span className="format-badge">.pdf</span>
              <span className="format-badge">.docx</span>
            </div>
          </>
        )}
      </motion.div>

      <button
        type="submit"
        className="btn-primary magnetic-btn upload-submit"
        disabled={loading || !name.trim() || (!text.trim() && !file)}
      >
        {loading ? (
          <>
            <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Creating Project...
          </>
        ) : (
          <>🚀 Launch Crew</>
        )}
      </button>
    </motion.form>
  );
}

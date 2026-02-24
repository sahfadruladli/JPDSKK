/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  Search, 
  Filter, 
  Ship, 
  Anchor, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  User, 
  ChevronDown,
  MoreVertical,
  Download,
  Mail,
  Send,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LetterRecord, LetterType } from './types';

// Mock Initial Data
const INITIAL_RECORDS: LetterRecord[] = [
  {
    id: '1',
    type: 'Masuk',
    fromTo: 'Jabatan Laut Malaysia',
    reference: 'JLM/KK/2024/001',
    date: '2024-02-15',
    subject: 'Permohonan Kebenaran Berlabuh Kapal MV Aurora',
    relatedFile: 'Fail Berlabuh 2024',
    assignedOfficer: 'En. Ahmad Fauzi',
    createdAt: '2024-02-15T08:30:00Z'
  },
  {
    id: '2',
    type: 'Keluar',
    fromTo: 'Sabah Ports Sdn Bhd',
    reference: 'PPKK/ADM/2024/045',
    date: '2024-02-20',
    subject: 'Notis Penyelenggaraan Dermaga 4',
    relatedFile: 'Penyelenggaraan Dermaga',
    assignedOfficer: 'Pn. Siti Aminah',
    createdAt: '2024-02-20T10:15:00Z'
  },
  {
    id: '3',
    type: 'Masuk',
    fromTo: 'Kementerian Pengangkutan',
    reference: 'MOT/KK/SEC/88',
    date: '2024-02-21',
    subject: 'Garis Panduan Keselamatan Pelabuhan Baru',
    relatedFile: 'Keselamatan Pelabuhan',
    assignedOfficer: 'En. Robert Ling',
    createdAt: '2024-02-21T14:45:00Z'
  }
];

export default function App() {
  const [records, setRecords] = useState<LetterRecord[]>(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [duplicateRecord, setDuplicateRecord] = useState<LetterRecord | null>(null);
  const [pendingRecord, setPendingRecord] = useState<Partial<LetterRecord> | null>(null);
  const [editingRecord, setEditingRecord] = useState<LetterRecord | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<LetterRecord>>({
    type: 'Masuk',
    fromTo: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    relatedFile: '',
    assignedOfficer: ''
  });

  // Stats
  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthRecords = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    return {
      totalIncoming: thisMonthRecords.filter(r => r.type === 'Masuk').length,
      totalOutgoing: thisMonthRecords.filter(r => r.type === 'Keluar').length
    };
  }, [records]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchesSearch = 
        r.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.fromTo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'Semua' || r.type === filterType;
      
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, searchTerm, filterType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkDuplicate = (data: Partial<LetterRecord>) => {
    return records.find(r => 
      r.reference.toLowerCase() === data.reference?.toLowerCase() &&
      r.date === data.date &&
      r.fromTo.toLowerCase() === data.fromTo?.toLowerCase()
    );
  };

  const saveRecord = (data: Partial<LetterRecord>, force = false) => {
    if (!force) {
      const duplicate = checkDuplicate(data);
      if (duplicate) {
        setDuplicateRecord(duplicate);
        setPendingRecord(data);
        setIsModalOpen(true);
        return;
      }
    }

    const newRecord: LetterRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type as LetterType,
      fromTo: data.fromTo || '',
      reference: data.reference || '',
      date: data.date || '',
      subject: data.subject || '',
      relatedFile: data.relatedFile || '',
      assignedOfficer: data.assignedOfficer || '',
      createdAt: new Date().toISOString()
    };

    setRecords(prev => [newRecord, ...prev]);
    resetForm();
    setIsModalOpen(false);
    setDuplicateRecord(null);
    setPendingRecord(null);
  };

  const resetForm = () => {
    setFormData({
      type: 'Masuk',
      fromTo: '',
      reference: '',
      date: new Date().toISOString().split('T')[0],
      subject: '',
      relatedFile: '',
      assignedOfficer: ''
    });
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) return;

    const headers = ['Bil', 'Jenis', 'Daripada/Kepada', 'Rujukan', 'Tarikh', 'Perkara', 'Fail', 'Pegawai'];
    const csvRows = [
      headers.join(','),
      ...filteredRecords.map((r, i) => [
        i + 1,
        r.type,
        `"${r.fromTo.replace(/"/g, '""')}"`,
        `"${r.reference.replace(/"/g, '""')}"`,
        r.date,
        `"${r.subject.replace(/"/g, '""')}"`,
        `"${r.relatedFile.replace(/"/g, '""')}"`,
        `"${r.assignedOfficer.replace(/"/g, '""')}"`
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Surat_PPKK_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateRecord = (officer: string) => {
    if (!editingRecord) return;

    setRecords(prev => prev.map(r => 
      r.id === editingRecord.id 
        ? { ...r, assignedOfficer: officer } 
        : r
    ));
    setIsEditModalOpen(false);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Adakah anda pasti ingin memadam rekod ini?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-navy-900">Sistem Rekod Surat Masuk & Keluar</h2>
            <p className="text-xs text-slate-500">Unit Pentadbiran – Pejabat Pelabuhan Kota Kinabalu</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Carian Surat..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-maritime-accent rounded-full text-sm w-64 transition-all outline-none"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-full cursor-pointer hover:bg-slate-200 transition-colors">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                className="bg-transparent text-xs font-medium outline-none border-none appearance-none pr-4"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="Semua">Semua Jenis</option>
                <option value="Masuk">Surat Masuk</option>
                <option value="Keluar">Surat Keluar</option>
              </select>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Summary Dashboard */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4"
            >
              <div className="bg-blue-50 p-3 rounded-xl">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Surat Masuk (Bulan Ini)</p>
                <h3 className="text-2xl font-bold text-navy-900">{stats.totalIncoming}</h3>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4"
            >
              <div className="bg-emerald-50 p-3 rounded-xl">
                <Send className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Surat Keluar (Bulan Ini)</p>
                <h3 className="text-2xl font-bold text-navy-900">{stats.totalOutgoing}</h3>
              </div>
            </motion.div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Data Entry Form */}
            <section className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-28">
                <div className="bg-navy-900 p-4 flex items-center gap-2">
                  <FilePlus className="w-5 h-5 text-maritime-accent" />
                  <h3 className="text-white font-semibold text-sm">Daftar Rekod Baru</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Surat</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setFormData(p => ({...p, type: 'Masuk'}))}
                        className={`py-2 rounded-lg text-xs font-semibold transition-all ${formData.type === 'Masuk' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Surat Masuk
                      </button>
                      <button 
                        onClick={() => setFormData(p => ({...p, type: 'Keluar'}))}
                        className={`py-2 rounded-lg text-xs font-semibold transition-all ${formData.type === 'Keluar' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        Surat Keluar
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daripada / Kepada</label>
                    <input 
                      type="text" 
                      name="fromTo"
                      value={formData.fromTo}
                      onChange={handleInputChange}
                      placeholder="Nama Agensi / Individu"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maritime-accent/20 focus:border-maritime-accent outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rujukan</label>
                      <input 
                        type="text" 
                        name="reference"
                        value={formData.reference}
                        onChange={handleInputChange}
                        placeholder="No. Rujukan"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maritime-accent/20 focus:border-maritime-accent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarikh Surat</label>
                      <input 
                        type="date" 
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maritime-accent/20 focus:border-maritime-accent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perkara</label>
                    <textarea 
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Tajuk atau ringkasan surat..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maritime-accent/20 focus:border-maritime-accent outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fail Berkaitan</label>
                    <input 
                      type="text" 
                      name="relatedFile"
                      value={formData.relatedFile}
                      onChange={handleInputChange}
                      placeholder="Nama Fail Simpanan"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-maritime-accent/20 focus:border-maritime-accent outline-none transition-all"
                    />
                  </div>

                  <button 
                    onClick={() => saveRecord(formData)}
                    className="w-full py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-navy-800 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-navy-900/10 active:scale-[0.98]"
                  >
                    Simpan Rekod
                  </button>
                </div>
              </div>
            </section>

            {/* Records Table */}
            <section className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-navy-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-maritime-accent" />
                    Senarai Rekod Terkini
                  </h3>
                  <button 
                    onClick={handleExport}
                    className="text-[10px] font-bold text-maritime-accent uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    Eksport Laporan
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Bil</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Jenis</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Rujukan & Tarikh</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Perkara</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Pegawai</th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence mode="popLayout">
                        {filteredRecords.map((record, index) => (
                          <motion.tr 
                            key={record.id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="px-4 py-4 text-xs font-medium text-slate-400">{index + 1}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                                record.type === 'Masuk' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                              }`}>
                                {record.type}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-xs font-bold text-navy-900">{record.reference}</p>
                              <p className="text-[10px] text-slate-400">{new Date(record.date).toLocaleDateString('ms-MY')}</p>
                            </td>
                            <td className="px-4 py-4 max-w-xs">
                              <p className="text-xs font-medium text-slate-700 line-clamp-1">{record.subject}</p>
                              <p className="text-[10px] text-slate-400 italic">{record.fromTo}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-xs font-semibold text-slate-600">{record.assignedOfficer || '-'}</p>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingRecord(record);
                                    setIsEditModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                  title="Tetapkan Pegawai"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteRecord(record.id)}
                                  className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                  title="Padam Rekod"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors">
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Workflow Visual Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-navy-900 mb-6 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-maritime-accent" />
                  Aliran Kerja Pengurusan Rekod
                </h3>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -translate-y-1/2 z-0" />
                  
                  {[
                    { icon: Mail, label: 'Surat Diterima', color: 'bg-blue-500' },
                    { icon: FilePlus, label: 'Direkod Kerani', color: 'bg-indigo-500' },
                    { icon: User, label: 'Tugasan Pegawai', color: 'bg-amber-500' },
                    { icon: CheckCircle2, label: 'Tindakan Selesai', color: 'bg-emerald-500' }
                  ].map((step, i, arr) => (
                    <div key={step.label} className="flex flex-col items-center gap-3 relative z-10 bg-white px-2">
                      <div className={`${step.color} p-3 rounded-full shadow-lg shadow-slate-200`}>
                        <step.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 text-center max-w-[80px] leading-tight uppercase tracking-wider">
                        {step.label}
                      </p>
                      {i < arr.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-slate-300 absolute -right-6 top-6" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Double Entry Modal */}
        <AnimatePresence>
          {isModalOpen && duplicateRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
              >
                <div className="bg-amber-500 p-6 flex flex-col items-center text-white">
                  <div className="bg-white/20 p-3 rounded-full mb-3">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold">Rekod Surat Telah Wujud</h3>
                  <p className="text-xs text-white/80 text-center mt-1">Sistem mengesan maklumat yang sama dalam pangkalan data.</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No. Rujukan</p>
                        <p className="text-sm font-bold text-navy-900">{duplicateRecord.reference}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tarikh</p>
                        <p className="text-sm font-bold text-navy-900">{new Date(duplicateRecord.date).toLocaleDateString('ms-MY')}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perkara</p>
                      <p className="text-sm font-medium text-slate-700 leading-snug">{duplicateRecord.subject}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pegawai</p>
                        <p className="text-xs font-semibold text-slate-600">{duplicateRecord.assignedOfficer || 'Tiada'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="w-full py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-navy-800 transition-all"
                    >
                      Lihat Rekod Sedia Ada
                    </button>
                    <button 
                      onClick={() => pendingRecord && saveRecord(pendingRecord, true)}
                      className="w-full py-3 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                      Teruskan Simpan (Jika perlu)
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Edit Modal (Assign Officer) */}
        <AnimatePresence>
          {isEditModalOpen && editingRecord && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsEditModalOpen(false)}
                className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
              >
                <div className="bg-navy-900 p-6 flex flex-col items-center text-white">
                  <div className="bg-maritime-accent/20 p-3 rounded-full mb-3">
                    <User className="w-8 h-8 text-maritime-accent" />
                  </div>
                  <h3 className="text-lg font-bold">Tetapkan Pegawai</h3>
                  <p className="text-xs text-white/60 text-center mt-1">Sila pilih pegawai yang akan mengambil tindakan terhadap surat ini.</p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Surat Sedang Diedit</p>
                    <p className="text-sm font-bold text-navy-900 truncate">{editingRecord.reference}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{editingRecord.subject}</p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Pegawai</label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-maritime-accent/20 focus:border-maritime-accent outline-none transition-all"
                      placeholder="Masukkan Nama Pegawai..."
                      defaultValue={editingRecord.assignedOfficer}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateRecord((e.target as HTMLInputElement).value);
                        }
                      }}
                      onBlur={(e) => {
                        // Optional: save on blur or just use a button
                      }}
                      id="officer-input"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button 
                      onClick={() => {
                        const input = document.getElementById('officer-input') as HTMLInputElement;
                        handleUpdateRecord(input.value);
                      }}
                      className="flex-1 py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-navy-800 transition-all"
                    >
                      Simpan
                    </button>
                    <button 
                      onClick={() => setIsEditModalOpen(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Watermark Accent */}
        <div className="fixed bottom-0 right-0 p-12 opacity-[0.03] pointer-events-none select-none">
          <Anchor className="w-96 h-96 text-navy-900" />
        </div>
      </main>
    </div>
  );
}

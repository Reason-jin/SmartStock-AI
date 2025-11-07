import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { uploadService } from '../services/uploadService';

export default function UploadPage() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      setError('CSV 또는 Excel 파일만 업로드 가능합니다.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('파일 크기는 50MB를 초과할 수 없습니다.');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await uploadService.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadedFiles((files) => [
          {
            id: result.id,
            name: result.original_filename,
            size: formatFileSize(result.file_size),
            status: result.status,
            date: new Date(result.created_at).toLocaleDateString('ko-KR'),
            rows: result.total_rows,
            columns: result.total_columns,
          },
          ...files,
        ]);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadComplete(true);
        // 업로드 끝나면 대시보드로 자동 이동(데이터 새로 고침 유도)
        setTimeout(() => navigate('/dashboard'), 1000);
      }, 500);

    } catch (err) {
      console.error('Upload error:', err);
      setError('파일 업로드 중 오류가 발생했습니다: ' + (err.response?.data?.detail || err.message));
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleRemoveFile = (id) => {
    setUploadedFiles(files => files.filter(f => f.id !== id));
  };

  const handleUploadAnother = () => {
    setUploadComplete(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-[1200px] px-5 py-16">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">데이터 업로드</h1>
            <p className="text-muted-foreground">
              CSV 또는 Excel 파일을 업로드하여 AI 분석을 시작하세요
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 flex-1">{error}</p>
              <button onClick={() => setError(null)} className="flex-shrink-0">
                <X className="w-5 h-5 text-red-600 hover:text-red-800" />
              </button>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>파일 업로드</CardTitle>
              <CardDescription>
                판매 데이터, 재고 데이터, 또는 과거 수요 데이터를 업로드하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!uploadComplete ? (
                <>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
                    className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      {isUploading ? (
                        <FileSpreadsheet className="h-16 w-16 text-primary animate-pulse" />
                      ) : (
                        <UploadIcon className="h-16 w-16 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-lg font-medium mb-2">
                          {isUploading ? "파일 업로드 중..." : "파일을 드래그하거나 클릭하여 업로드"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          지원 형식: CSV, XLSX, XLS (최대 50MB)
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>업로드 진행률</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2">업로드 완료!</h3>
                    <p className="text-muted-foreground">
                      데이터가 성공적으로 업로드되었습니다.
                      AI 분석을 시작할 수 있습니다.
                    </p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={handleUploadAnother}>
                      다른 파일 업로드
                    </Button>
                    <Button onClick={() => navigate('/dashboard')}>
                      대시보드로 이동
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {!uploadComplete && (
            <Card>
              <CardHeader>
                <CardTitle>데이터 요구사항</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>날짜 컬럼 필수 (YYYY-MM-DD 형식 권장)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>제품 ID 또는 제품명 컬럼 필수</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>판매량, 재고량 등 수치 데이터 포함</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <span>최소 3개월 이상의 과거 데이터 권장</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>업로드 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <AnimatePresence>
                    {uploadedFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.size} • {file.date}
                              {file.rows && ` • ${file.rows}행 ${file.columns}열`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {file.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          <button onClick={() => handleRemoveFile(file.id)}>
                            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Download } from "lucide-react";

export default function Prediction() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // 체크된 파일 저장
  const [predictionResult, setPredictionResult] = useState(null);


  
  const handlePredict = async () => {
    if (!selectedFile) return;
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/prediction/predict",
        { stored_filename: selectedFile.filename } // POST body로 전달
      );
      setPredictionResult(res.data.predictions);
    } catch (err) {
      console.error("예측 요청 실패:", err);
    }
  };


  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/files");
        setFiles(res.data.files);
      } catch (err) {
        console.error("파일 목록 불러오기 실패:", err);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div className="space-y-6">
      {/* 업로드 파일 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>업로드된 파일 목록</CardTitle>
          <CardDescription>backend/uploads 폴더의 파일들이 자동으로 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>선택</TableHead>
                <TableHead>파일명</TableHead>
                <TableHead>크기 (KB)</TableHead>
                <TableHead>다운로드</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.length > 0 ? (
                files.map((file, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <input
                        type="radio"
                        name="selectedFile"
                        checked={selectedFile?.filename === file.filename}
                        onChange={() => setSelectedFile(file)}
                      />
                    </TableCell>
                    <TableCell>{file.filename}</TableCell>
                    <TableCell>{file.size_kb}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`http://localhost:8000${file.url}`, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        다운로드
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    업로드된 파일이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 선택된 파일 표시 */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>선택된 파일</CardTitle>
            <CardDescription>아래는 선택된 파일 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p><strong>파일명:</strong> {selectedFile.filename}</p>
            <p><strong>크기:</strong> {selectedFile.size_kb} KB</p>
            <Button onClick={handlePredict} disabled={!selectedFile}>
              선택 파일 예측
            </Button>
          </CardContent>
        </Card>
      )}
      {predictionResult && (
          <Card>
            <CardHeader>
              <CardTitle>예측 결과</CardTitle>
              <CardDescription>아래는 미리보기입니다 (새로고침시 사라짐!!)</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.entries(predictionResult).map(([productName, preds]) => (
                <div key={productName}>
                  <h4>{productName}</h4>
                  <ul>
                    {preds.map((dayPred, idx) => (
                      <li key={idx}>
                        Day {idx + 1} - 재고: {dayPred[0]}, 가용재고: {dayPred[1]}, 재고예정: {dayPred[2]}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  );
}

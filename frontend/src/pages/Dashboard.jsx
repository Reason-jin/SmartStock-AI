import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Upload, Edit, X, Save, Download } from "lucide-react";
import { analyticsService } from "../services/analyticsService";
import { uploadService } from "../services/uploadService";
import Footer from "../components/Footer";


export default function Dashboard() {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);
  const [kpiData, setKpiData] = useState({
    accuracy: 0,
    wape: 0,
    stock_alerts: 0,
    total_value: 0,
  });
  const [uploadList, setUploadList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ 파일 편집 관련 상태
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, uploads] = await Promise.all([
        analyticsService.getSummary(),
        uploadService.getUploadList(),
      ]);

      setChartData(analyticsData.chart_data);
      setKpiData(analyticsData.kpi);
      setUploadList(uploads.items || uploads);
    } catch (error) {
      console.error("Dashboard 데이터 로딩 실패:", error);
      setError("데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ 파일 내용 불러오기
  const loadFileContent = async (filename) => {
    try {
      setLoadingContent(true);
      const content = await uploadService.getFileContent(filename);
      setFileContent(content);
    } catch (err) {
      console.error("파일 로딩 실패:", err);
      alert("파일을 불러오는데 실패했습니다.");
      setEditDialogOpen(false);
    } finally {
      setLoadingContent(false);
    }
  };

  // ✅ 파일 편집 모달 열기
  const openEditDialog = async (item) => {
    setEditingFile(item);
    setEditDialogOpen(true);
    await loadFileContent(item.stored_filename);
  };

  // ✅ 파일 편집 모달 닫기
  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingFile(null);
    setFileContent("");
  };

  // ✅ 파일 내용 저장
  const saveFileContent = async () => {
    if (!editingFile) return;

    try {
      await uploadService.updateFileContent(editingFile.stored_filename, fileContent);
      alert("파일이 성공적으로 저장되었습니다!");
      closeEditDialog();
      loadDashboardData(); // 목록 새로고침
    } catch (err) {
      console.error("파일 저장 실패:", err);
      alert("파일 저장에 실패했습니다.");
    }
  };

  // ✅ 파일 다운로드
  const downloadFile = async (filename) => {
    try {
      const content = await uploadService.getFileContent(filename);
      const blob = new Blob([content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("다운로드 실패:", err);
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>업로드 내역</CardTitle>
          <CardDescription>최근 업로드된 데이터 파일 목록</CardDescription>
        </CardHeader>
        <CardContent>
          {uploadList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-2 px-4">ID</th>
                    <th className="text-left py-2 px-4">파일명</th>
                    <th className="text-left py-2 px-4">업로드 일시</th>
                    <th className="text-left py-2 px-4">상태</th>
                    <th className="text-left py-2 px-4 text-right">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadList.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/20 transition">
                      <td className="py-2 px-4">{item.id}</td>
                      <td className="py-2 px-4">{item.stored_filename || "이름 없음"}</td>
                      <td className="py-2 px-4">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleString("ko-KR")
                          : "-"}
                      </td>
                      <td className="py-2 px-4">
                        <Badge
                          variant={
                            item.status === "완료"
                              ? "secondary"
                              : item.status === "실패"
                              ? "destructive"
                              : "default"
                          }
                        >
                          {item.status || "진행중"}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/upload/${item.id}`)}
                          >
                            예시 보기
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            수정
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(item.stored_filename)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (!window.confirm("정말 삭제하시겠습니까?")) return;
                              try {
                                await uploadService.deleteUpload(item.stored_filename);
                                alert("삭제 완료!");
                                setUploadList((prev) => 
                                  prev.filter((u) => u.stored_filename !== item.stored_filename)
                                );
                              } catch (err) {
                                console.error(err);
                                alert("삭제 실패");
                              }
                            }}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-4">
              업로드된 파일이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ 파일 편집 다이얼로그 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>파일 수정</DialogTitle>
            <DialogDescription>
              {editingFile?.stored_filename}
            </DialogDescription>
          </DialogHeader>
          
          {loadingContent ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="파일 내용을 입력하세요..."
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog}>
              취소
            </Button>
            <Button onClick={saveFileContent}>
              <Save className="h-4 w-4 mr-2" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Download, Package, AlertCircle, CheckCircle2, Upload, FileSpreadsheet } from "lucide-react";
import { useInventory } from '../context/InventoryContext';
import * as XLSX from "xlsx";

export default function Order() {
  const { inventoryData, setInventoryData, fileName, setFileName } = useInventory();
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData || jsonData.length === 0) {
        alert('파일에 데이터가 없습니다.');
        return;
      }

      // ✅ 파일 구조 검증
      const firstRow = jsonData[0];
      const requiredColumns = ["상품명", "제품명", "product", "Product", "Day", "day", "일차", "날짜", "재고", "stock", "Stock", "가용재고", "available", "Available", "재고예정", "scheduled", "Scheduled"];
      const hasRequiredColumns = requiredColumns.some(col => Object.keys(firstRow).includes(col));

      if (!hasRequiredColumns) {
        alert('⚠️ 업로드한 파일의 구조가 올바르지 않습니다.\n필수 컬럼: 상품명, Day, 재고, 가용재고, 재고예정');
        return;
      }

      const mappedData = jsonData.map(row => {
        const product = row['상품명'] || row['제품명'] || row['product'] || row['Product'];
        const day = row['Day'] || row['day'] || row['일차'] || row['날짜'];
        const stock = row['재고'] || row['stock'] || row['Stock'] || 0;
        const available = row['가용재고'] || row['available'] || row['Available'] || 0;
        const scheduled = row['재고예정'] || row['scheduled'] || row['Scheduled'] || 0;

        return {
          product: String(product || ''),
          day: Number(day) || 0,
          stock: Number(stock) || 0,
          available: Number(available) || 0,
          scheduled: Number(scheduled) || 0
        };
      }).filter(item => item.product);

      if (mappedData.length === 0) {
        alert('⚠️ 이 페이지는 반드시 prediction된 파일만 업로드후 작동합니다 파일구조를 확인해주세요');
        return;
      }

      // ✅ 통과 시에만 Context에 저장
      setInventoryData(mappedData);
      setFileName(file.name);
      alert(`${mappedData.length}개의 재고 데이터가 성공적으로 업로드되었습니다.`);

    } catch (error) {
      console.error('파일 업로드 오류:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
    }

    event.target.value = '';
    };

  // 상품별로 데이터 그룹화 및 발주 추천 계산
  const getRecommendations = () => {
    if (!inventoryData) return [];

    const productMap = {};
    
    inventoryData.forEach(item => {
      if (!productMap[item.product]) {
        productMap[item.product] = {
          stocks: [],
          availables: [],
          scheduleds: []
        };
      }
      productMap[item.product].stocks.push(item.stock);
      productMap[item.product].availables.push(item.available);
      productMap[item.product].scheduleds.push(item.scheduled);
    });

    const recommendations = [];
    let id = 1;

    Object.keys(productMap).forEach(productName => {
      const data = productMap[productName];
      
      // 평균 재고 계산
      const avgStock = data.stocks.reduce((a, b) => a + b, 0) / data.stocks.length;
      const avgAvailable = data.availables.reduce((a, b) => a + b, 0) / data.availables.length;
      const minAvailable = Math.min(...data.availables);
      const maxStock = Math.max(...data.stocks);
      
      // 재고 감소 추세 계산
      const firstStock = data.stocks[0];
      const lastStock = data.stocks[data.stocks.length - 1];
      const stockTrend = ((lastStock - firstStock) / firstStock) * 100;
      
      // 안전재고 기준 설정 (평균 가용재고의 120%)
      const safetyStock = avgAvailable * 1.2;
      
      // 발주량 계산 (안전재고 - 현재 최소 가용재고)
      const orderQuantity = Math.max(0, Math.ceil(safetyStock - minAvailable));
      
      // 우선순위 결정
      let priority = "낮음";
      let reason = "정상 재고 수준";
      
      if (minAvailable < avgAvailable * 0.7) {
        priority = "높음";
        reason = "가용재고 급감 위험";
      } else if (stockTrend < -5) {
        priority = "높음";
        reason = "재고 감소 추세";
      } else if (minAvailable < avgAvailable * 0.85) {
        priority = "중간";
        reason = "안전재고 확보 필요";
      } else if (orderQuantity > 0) {
        priority = "중간";
        reason = "정기 발주 시점";
      }
      
      // 발주가 필요한 경우만 추가
      if (orderQuantity > 0 || priority !== "낮음") {
        const estimatedDays = priority === "높음" ? 2 : priority === "중간" ? 5 : 7;
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
        
        recommendations.push({
          id: id++,
          product: productName,
          category: productName.includes("체중계") ? "헬스케어" : "액세서리",
          currentStock: Math.round(avgStock),
          minAvailable: Math.round(minAvailable),
          recommendedOrder: Math.max(50, orderQuantity),
          reason: reason,
          priority: priority,
          estimatedDelivery: deliveryDate.toISOString().split('T')[0],
          trend: stockTrend.toFixed(1)
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { "높음": 0, "중간": 1, "낮음": 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const recommendations = getRecommendations();

  // 발주서 다운로드 함수
  const handleDownloadOrder = () => {
    if (recommendations.length === 0) {
      alert('다운로드할 발주 추천 데이터가 없습니다.');
      return;
    }

    const headers = ["제품명", "카테고리", "현재재고", "최소가용재고", "추천발주량", "우선순위", "예상입고일", "사유", "재고추세"];
    const rows = recommendations.map(item => [
      item.product,
      item.category,
      item.currentStock,
      item.minAvailable,
      item.recommendedOrder,
      item.priority,
      item.estimatedDelivery,
      item.reason,
      `${item.trend}%`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `발주추천서_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 개별 발주 확정
  const handleConfirmOrder = (id) => {
    const item = recommendations.find(r => r.id === id);
    alert(`${item.product} 발주가 확정되었습니다.\n발주량: ${item.recommendedOrder}개`);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "높음": return "bg-red-100 text-red-800";
      case "중간": return "bg-yellow-100 text-yellow-800";
      case "낮음": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // 평균 입고일 계산
  const calculateAvgDelivery = () => {
    if (recommendations.length === 0) return 0;
    const today = new Date();
    const deliveryDays = recommendations.map(r => {
      const deliveryDate = new Date(r.estimatedDelivery);
      return Math.round((deliveryDate - today) / (1000 * 60 * 60 * 24));
    });
    const avgDays = Math.round(deliveryDays.reduce((a, b) => a + b, 0) / deliveryDays.length);
    return avgDays;
  };

  // 데이터가 없을 때 표시할 초기 화면
  if (!inventoryData) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">발주 추천</h1>
          <p className="text-muted-foreground">
            재고 데이터를 업로드하여 최적의 발주를 추천받으세요
          </p>
        </div>

        {/* 업로드 안내 카드 */}
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileSpreadsheet className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">재고 데이터 업로드</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              엑셀 또는 CSV 파일을 업로드하면 AI가 재고를 분석하여<br />
              최적의 발주 시점과 수량을 추천해드립니다
            </p>
            <label htmlFor="file-upload">
              <Button 
                className="gap-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => document.getElementById('file-upload').click()}
              >
                <Upload className="h-4 w-4" />
                파일 업로드
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* 파일 형식 안내 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">파일 형식 안내</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>필수 컬럼:</strong>
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>상품명 (또는 product)</li>
                  <li>Day (또는 day, 일차)</li>
                  <li>재고 (또는 stock)</li>
                  <li>가용재고 (또는 available)</li>
                  <li>재고예정 (또는 scheduled)</li>
                </ul>
              </div>
              <div className="pt-2">
                <strong>지원 파일 형식:</strong> .xlsx, .xls, .csv
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 데이터가 있을 때 표시할 발주 추천 화면
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">발주 추천</h1>
          <p className="text-muted-foreground">
            재고 데이터 분석 기반 최적 발주 추천 (새로고침시 데이터를 다시 업로드하셔야 합니다)
          </p>
        </div>
        <div className="flex gap-2">
          <label htmlFor="file-upload">
            <Button 
              className="gap-2 bg-green-600 hover:bg-green-700"
              onClick={() => document.getElementById('file-upload').click()}
            >
              <Upload className="h-4 w-4" />
              다시 업로드
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={handleDownloadOrder}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            발주서 다운로드
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">총 추천 발주</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recommendations.length}개</div>
            <p className="text-xs text-muted-foreground mt-1">
              총 {recommendations.reduce((sum, r) => sum + r.recommendedOrder, 0)}개 발주 필요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">긴급 발주</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {recommendations.filter(r => r.priority === "높음").length}개
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              즉시 처리 필요
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">평균 입고 예정</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateAvgDelivery()}일 이내</div>
            <p className="text-xs text-muted-foreground mt-1">
              가중평균 배송 기간
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Table */}
      <Card>
        <CardHeader>
          <CardTitle>발주 추천 목록</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              발주가 필요한 항목이 없습니다. 모든 재고가 안전 수준입니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">제품명</th>
                    <th className="text-left py-3 px-4 font-medium">카테고리</th>
                    <th className="text-left py-3 px-4 font-medium">평균 재고</th>
                    <th className="text-left py-3 px-4 font-medium">최소 가용</th>
                    <th className="text-left py-3 px-4 font-medium">추천 발주량</th>
                    <th className="text-left py-3 px-4 font-medium">우선순위</th>
                    <th className="text-left py-3 px-4 font-medium">예상 입고일</th>
                    <th className="text-left py-3 px-4 font-medium">사유</th>
                    <th className="text-right py-3 px-4 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.product}</td>
                      <td className="py-3 px-4 text-gray-600">{item.category}</td>
                      <td className="py-3 px-4">
                        <span className={item.currentStock < 100 ? "text-orange-600 font-semibold" : ""}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 font-semibold">
                          {item.minAvailable}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-blue-600">{item.recommendedOrder}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{item.estimatedDelivery}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {item.reason}
                        <span className="text-xs text-gray-500 ml-1">
                          (추세: {item.trend}%)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleConfirmOrder(item.id)}
                        >
                          발주 확정
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
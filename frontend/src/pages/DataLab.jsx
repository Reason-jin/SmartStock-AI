import { useState, useRef, useEffect } from "react";
import { useInventory } from '../context/InventoryContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import { 
  Upload, Download, Save, Play, 
  FileSpreadsheet, BarChart3, 
  LineChart as LineChartIcon, ScatterChart as ScatterChartIcon,
  TrendingUp, Code, RefreshCw, CheckCircle
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";

export default function DataLab() {
  const { inventoryData, fileName } = useInventory();
  
  const [sampleData, setSampleData] = useState([]);
  const [sampleColumns, setSampleColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState([]);
  const [groupBy, setGroupBy] = useState("none");
  const [sortBy, setSortBy] = useState("none");
  const [sortOrder, setSortOrder] = useState("asc");
  const [aggregation, setAggregation] = useState("sum");
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [dataSource, setDataSource] = useState("none");
  const [hasUploadedData, setHasUploadedData] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [saveStatus, setSaveStatus] = useState("저장됨");
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (inventoryData && inventoryData.length > 0) {
      setSampleData(inventoryData);
      setHistory([inventoryData]);
      setHistoryIndex(0);
      setDataSource("uploaded");
      setHasUploadedData(true);
    } else {
      setHasUploadedData(false);
    }
  }, [inventoryData]);

  useEffect(() => {
    if (sampleData && sampleData.length > 0) {
      updateColumns(sampleData);
    }
  }, [sampleData]);

  const updateColumns = (data) => {
    if (!data || data.length === 0) return;

    const firstRow = data[0];
    const columns = Object.keys(firstRow).map(key => {
      const values = data.map(row => row[key]);
      const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
      const uniqueValues = new Set(nonNullValues);
      
      let dtype = "string";
      if (nonNullValues.length > 0) {
        const firstValue = nonNullValues[0];
        if (typeof firstValue === 'number') {
          dtype = Number.isInteger(firstValue) ? "int64" : "float64";
        } else if (typeof firstValue === 'string') {
          if (!isNaN(Date.parse(firstValue)) && String(firstValue).includes('-')) {
            dtype = "datetime64";
          }
        }
      }

      return {
        name: key,
        dtype: dtype,
        nulls: values.length - nonNullValues.length,
        unique: uniqueValues.size
      };
    });

    setSampleColumns(columns);
    
    if (selectedColumns.length === 0) {
      const defaultColumns = columns.slice(0, Math.min(3, columns.length)).map(col => col.name);
      setSelectedColumns(defaultColumns);
    }

    const numericCols = columns.filter(col => col.dtype === "float64" || col.dtype === "int64");
    const categoricalCols = columns.filter(col => col.dtype === "string");
    
    if (categoricalCols.length > 0 && !xAxis) {
      setXAxis(categoricalCols[0].name);
    }
    if (numericCols.length > 0 && yAxis.length === 0) {
      setYAxis([numericCols[0].name]);
    }
  };

  const handleLoadUploadedData = () => {
    if (inventoryData && inventoryData.length > 0) {
      setSampleData(inventoryData);
      
      const newHistory = [inventoryData];
      setHistory(newHistory);
      setHistoryIndex(0);
      
      setDataSource("uploaded");
      setSaveStatus("수정됨");
      
      alert(`${fileName || '파일'}의 데이터가 로드되었습니다.\n${inventoryData.length}개의 행이 있습니다.`);
    } else {
      alert('업로드된 데이터가 없습니다. 먼저 발주 추천 페이지에서 파일을 업로드해주세요.');
    }
  };

  const getChartData = () => {
    if (!sampleData || sampleData.length === 0 || yAxis.length === 0 || !xAxis) return [];

    try {
      let processedData = [...sampleData];
      const grouped = {};

      if (groupBy && groupBy !== "none") {
        // 그룹화 처리
        processedData.forEach(row => {
          const xValue = String(row[xAxis] || 'Unknown');
          const groupValue = String(row[groupBy] || 'Unknown');
          const key = `${xValue}___${groupValue}`;
          
          if (!grouped[key]) {
            grouped[key] = {
              [xAxis]: xValue,
              [groupBy]: groupValue,
              count: 0
            };
            yAxis.forEach(col => {
              grouped[key][col] = 0;
            });
          }
          
          grouped[key].count += 1;
          yAxis.forEach(col => {
            const value = parseFloat(row[col]) || 0;
            grouped[key][col] += value;
          });
        });

        // 평균 계산
        if (aggregation === "avg") {
          Object.keys(grouped).forEach(key => {
            yAxis.forEach(col => {
              grouped[key][col] = grouped[key][col] / grouped[key].count;
            });
          });
        } else if (aggregation === "max" || aggregation === "min") {
          // 최대/최소값은 재계산 필요
          const tempGrouped = {};
          processedData.forEach(row => {
            const xValue = String(row[xAxis] || 'Unknown');
            const groupValue = String(row[groupBy] || 'Unknown');
            const key = `${xValue}___${groupValue}`;
            
            if (!tempGrouped[key]) {
              tempGrouped[key] = {
                [xAxis]: xValue,
                [groupBy]: groupValue
              };
              yAxis.forEach(col => {
                tempGrouped[key][col] = aggregation === "max" ? -Infinity : Infinity;
              });
            }
            
            yAxis.forEach(col => {
              const value = parseFloat(row[col]) || 0;
              if (aggregation === "max") {
                tempGrouped[key][col] = Math.max(tempGrouped[key][col], value);
              } else {
                tempGrouped[key][col] = Math.min(tempGrouped[key][col], value);
              }
            });
          });
          Object.assign(grouped, tempGrouped);
        }

        processedData = Object.values(grouped);
      } else {
        // 그룹화 없이 X축 기준 집계
        processedData.forEach(row => {
          const xValue = String(row[xAxis] || 'Unknown');
          
          if (!grouped[xValue]) {
            grouped[xValue] = {
              [xAxis]: xValue,
              count: 0
            };
            yAxis.forEach(col => {
              grouped[xValue][col] = 0;
            });
          }
          
          grouped[xValue].count += 1;
          yAxis.forEach(col => {
            const value = parseFloat(row[col]) || 0;
            grouped[xValue][col] += value;
          });
        });

        // 평균 계산
        if (aggregation === "avg") {
          Object.keys(grouped).forEach(key => {
            yAxis.forEach(col => {
              grouped[key][col] = grouped[key][col] / grouped[key].count;
            });
          });
        } else if (aggregation === "max" || aggregation === "min") {
          // 최대/최소값 재계산
          const tempGrouped = {};
          processedData.forEach(row => {
            const xValue = String(row[xAxis] || 'Unknown');
            
            if (!tempGrouped[xValue]) {
              tempGrouped[xValue] = {
                [xAxis]: xValue
              };
              yAxis.forEach(col => {
                tempGrouped[xValue][col] = aggregation === "max" ? -Infinity : Infinity;
              });
            }
            
            yAxis.forEach(col => {
              const value = parseFloat(row[col]) || 0;
              if (aggregation === "max") {
                tempGrouped[xValue][col] = Math.max(tempGrouped[xValue][col], value);
              } else {
                tempGrouped[xValue][col] = Math.min(tempGrouped[xValue][col], value);
              }
            });
          });
          Object.assign(grouped, tempGrouped);
        }

        processedData = Object.values(grouped);
      }

      // 정렬 처리
      if (sortBy !== "none") {
        processedData.sort((a, b) => {
          let aVal, bVal;
          
          if (sortBy === "x") {
            aVal = a[xAxis];
            bVal = b[xAxis];
          } else if (sortBy === "y") {
            aVal = yAxis.reduce((sum, col) => sum + (parseFloat(a[col]) || 0), 0);
            bVal = yAxis.reduce((sum, col) => sum + (parseFloat(b[col]) || 0), 0);
          } else {
            aVal = parseFloat(a[sortBy]) || 0;
            bVal = parseFloat(b[sortBy]) || 0;
          }

          if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
          }
          
          const comparison = String(aVal).localeCompare(String(bVal));
          return sortOrder === "asc" ? comparison : -comparison;
        });
      }

      return processedData;
    } catch (error) {
      console.error("차트 데이터 생성 오류:", error);
      return [];
    }
  };

  const chartData = getChartData();

  const handleSave = () => {
    setSaveStatus("저장 중...");
    setTimeout(() => {
      setSaveStatus("저장됨");
    }, 500);
  };

  const handleUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length > 0) {
        setSampleData(jsonData);
        
        const newHistory = [jsonData];
        setHistory(newHistory);
        setHistoryIndex(0);
        
        setDataSource("local");
        setSaveStatus("수정됨");
        
        alert(`${file.name} 파일이 로드되었습니다.\n${jsonData.length}개의 행이 있습니다.`);
      }
    } catch (error) {
      console.error("파일 처리 오류:", error);
      alert("파일 처리 중 오류가 발생했습니다.");
    }

    event.target.value = '';
  };

  const handleGeneratePythonScript = () => {
    const dataFileName = dataSource === "uploaded" 
      ? fileName || "inventory_data.csv"
      : "data.csv";

    const yAxisStr = yAxis.length === 1 ? `'${yAxis[0]}'` : JSON.stringify(yAxis);
    const aggregationMap = {
      sum: 'sum()',
      avg: 'mean()',
      max: 'max()',
      min: 'min()'
    };

    const groupByCode = groupBy && groupBy !== "none" 
      ? `['${xAxis}', '${groupBy}']` 
      : `'${xAxis}'`;

    const script = `import pandas as pd
import matplotlib.pyplot as plt

# 데이터 로드
df = pd.read_csv('${dataFileName}')

# 데이터 전처리
df = df.dropna()

# 선택된 컬럼: ${selectedColumns.join(', ')}
selected_df = df[${JSON.stringify(selectedColumns)}]

# 그룹화 및 집계
grouped_df = df.groupby(${groupByCode})[${yAxisStr}].${aggregationMap[aggregation]}.reset_index()

# 정렬${sortBy !== "none" ? `
sort_column = '${sortBy === "x" ? xAxis : sortBy === "y" ? yAxis[0] : sortBy}'
grouped_df = grouped_df.sort_values(sort_column, ascending=${sortOrder === "asc"})` : ''}

# 시각화
plt.figure(figsize=(12, 6))
${chartType === 'bar' ? `grouped_df.plot(x='${xAxis}', y=${yAxisStr}, kind='bar', ax=plt.gca())` : 
  chartType === 'line' ? `grouped_df.plot(x='${xAxis}', y=${yAxisStr}, kind='line', ax=plt.gca())` :
  `plt.scatter(grouped_df['${xAxis}'], grouped_df['${yAxis[0]}'])`}
plt.xlabel('${xAxis}')
plt.ylabel('${yAxis.join(', ')}')
plt.title('데이터 분석 결과 (${aggregation.toUpperCase()})')
plt.xticks(rotation=45)
plt.tight_layout()
plt.legend()
plt.show()

# 결과 저장
grouped_df.to_csv('output.csv', index=False)
print('분석 완료!')
print(f'집계 방법: ${aggregation}')
print(f'처리된 행 수: {len(grouped_df)}')
`;

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analysis_script.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const filteredData = sampleData.map(row => {
      const filteredRow = {};
      selectedColumns.forEach(col => {
        if (row.hasOwnProperty(col)) {
          filteredRow[col] = row[col];
        }
      });
      return filteredRow;
    });

    const headers = selectedColumns.join(',');
    const rows = filteredData.map(row => 
      selectedColumns.map(col => {
        const value = row[col];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleApplyTransformation = () => {
    const transformedData = sampleData.filter(row => 
      Object.values(row).every(val => val !== null && val !== undefined && val !== '')
    );
    
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(transformedData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setSampleData(transformedData);
    setSaveStatus("수정됨");
  };

  const numericColumns = sampleColumns.filter(col => 
    col.dtype === "float64" || col.dtype === "int64"
  );

  const COLORS = ['#335C81', '#2E7D32', '#D32F2F', '#F57C00', '#7B1FA2', '#0288D1'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col h-[calc(100vh-10rem)] gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <Card className="flex-shrink-0">
          <CardContent className="py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">DataLab 워크스페이스</h2>
                <Badge variant={saveStatus === "저장됨" ? "secondary" : "default"} className="text-xs">
                  {saveStatus}
                </Badge>
                {dataSource === "uploaded" && (
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    발주 데이터 연동
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1.5">
                <div className="h-5 w-px bg-border mx-1" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={handleSave}
                  disabled={saveStatus === "저장됨"}
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  저장
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8"
                  onClick={handleUpload}
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  업로드
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {hasUploadedData && dataSource !== "uploaded" && (
          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm text-blue-800">
                발주 추천 페이지에서 업로드한 재고 데이터가 있습니다. 불러오시겠습니까?
              </span>
              <Button 
                size="sm" 
                className="h-7 bg-blue-600 hover:bg-blue-700 ml-4"
                onClick={handleLoadUploadedData}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                데이터 불러오기
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-1 gap-3 min-h-0">
          {showLeftPanel && (
            <Card className="w-64 flex-shrink-0 overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileSpreadsheet className="h-4 w-4" />
                  데이터 관리
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 px-4 pb-4 overflow-auto space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs">데이터셋 정보</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">행 수</span>
                      <span className="font-medium">{sampleData.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">열 수</span>
                      <span className="font-medium">{sampleColumns.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">메모리</span>
                      <span className="font-medium">
                        {(JSON.stringify(sampleData).length / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">결측치</span>
                      <span className="font-medium text-orange-600">
                        {sampleColumns.reduce((sum, col) => sum + col.nulls, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator className="my-2" />

                <div>
                  <h4 className="font-semibold text-xs mb-2">컬럼 정보</h4>
                  <div className="space-y-1.5">
                    {sampleColumns.map((col, idx) => (
                      <div
                        key={idx}
                        className="p-2 border rounded text-xs bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">{col.name}</span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {col.dtype}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>결측: {col.nulls}</span>
                          <span>고유: {col.unique}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
            <Card className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <CardHeader className="py-2.5 px-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm">DataFrame 미리보기</CardTitle>
                    <CardDescription className="text-xs">
                      현재 데이터셋: {dataSource === "uploaded" ? (fileName || "업로드된 데이터") : "로컬 파일"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 p-0 overflow-auto">
                <div className="px-4 pb-3">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10 text-xs">#</TableHead>
                        {sampleColumns.map((col, idx) => (
                          <TableHead key={idx} className="text-xs">
                            <div className="flex flex-col gap-0.5">
                              <span>{col.name}</span>
                              <Badge variant="outline" className="text-[10px] w-fit px-1 py-0">{col.dtype}</Badge>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sampleData.slice(0, 50).map((row, rowIdx) => (
                        <TableRow key={rowIdx}>
                          <TableCell className="text-xs text-muted-foreground">{rowIdx + 1}</TableCell>
                          {sampleColumns.map((col, colIdx) => (
                            <TableCell key={colIdx} className="text-xs">
                              {typeof row[col.name] === 'number' 
                                ? row[col.name].toLocaleString() 
                                : String(row[col.name] || '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-shrink-0">
              <CardHeader className="py-2.5 px-4">
                <CardTitle className="text-sm">시각화 미리보기</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-3">
                <div className="w-full h-64">
                  {chartData.length > 0 && yAxis.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF3" />
                          <XAxis dataKey={xAxis} stroke="#6C757D" style={{ fontSize: '11px' }} />
                          <YAxis stroke="#6C757D" style={{ fontSize: '11px' }} />
                          <Tooltip contentStyle={{ fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          {yAxis.map((col, idx) => (
                            <Bar 
                              key={col} 
                              dataKey={col} 
                              fill={COLORS[idx % COLORS.length]} 
                              name={col}
                            />
                          ))}
                        </BarChart>
                      ) : chartType === "line" ? (
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF3" />
                          <XAxis dataKey={xAxis} stroke="#6C757D" style={{ fontSize: '11px' }} />
                          <YAxis stroke="#6C757D" style={{ fontSize: '11px' }} />
                          <Tooltip contentStyle={{ fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          {yAxis.map((col, idx) => (
                            <Line 
                              key={col}
                              type="monotone" 
                              dataKey={col} 
                              stroke={COLORS[idx % COLORS.length]}
                              strokeWidth={2}
                              name={col}
                            />
                          ))}
                        </LineChart>
                      ) : (
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF3" />
                          <XAxis dataKey={xAxis} stroke="#6C757D" style={{ fontSize: '11px' }} />
                          <YAxis dataKey={yAxis[0]} stroke="#6C757D" style={{ fontSize: '11px' }} />
                          <Tooltip contentStyle={{ fontSize: '12px' }} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Scatter name={yAxis[0]} data={chartData} fill="#335C81" />
                        </ScatterChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      차트 데이터가 없습니다
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {showRightPanel && (
            <Card className="w-72 flex-shrink-0 overflow-hidden flex flex-col">
              <CardHeader className="py-3 px-4 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  분석 설정
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 px-4 pb-4 overflow-auto space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">차트 유형</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Button
                      variant={chartType === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("bar")}
                      className="flex flex-col h-auto py-1.5"
                    >
                      <BarChart3 className="h-3.5 w-3.5 mb-0.5" />
                      <span className="text-[10px]">막대</span>
                    </Button>

                    <Button
                      variant={chartType === "line" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("line")}
                      className="flex flex-col h-auto py-1.5"
                    >
                      <LineChartIcon className="h-3.5 w-3.5 mb-0.5" />
                      <span className="text-[10px]">라인</span>
                    </Button>

                    <Button
                      variant={chartType === "scatter" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("scatter")}
                      className="flex flex-col h-auto py-1.5"
                    >
                      <ScatterChartIcon className="h-3.5 w-3.5 mb-0.5" />
                      <span className="text-[10px]">분산</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label className="text-xs">X축 (카테고리)</Label>
                  <Select value={xAxis} onValueChange={setXAxis}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="X축 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleColumns.map((col) => (
                        <SelectItem key={col.name} value={col.name} className="text-xs">
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Y축 (수치형) - 다중 선택</Label>
                  <div className="border rounded-md p-2 space-y-1 max-h-32 overflow-y-auto bg-background">
                    {numericColumns.length > 0 ? (
                      numericColumns.map((col) => (
                        <label 
                          key={col.name}
                          className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={yAxis.includes(col.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setYAxis([...yAxis, col.name]);
                              } else {
                                setYAxis(yAxis.filter(y => y !== col.name));
                              }
                            }}
                            className="h-3 w-3"
                          />
                          <span>{col.name}</span>
                          <Badge variant="outline" className="text-[10px] ml-auto px-1 py-0">
                            {col.dtype}
                          </Badge>
                        </label>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground">숫자형 컬럼 없음</div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label className="text-xs">집계 방법</Label>
                  <Select value={aggregation} onValueChange={setAggregation}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sum" className="text-xs">합계 (SUM)</SelectItem>
                      <SelectItem value="avg" className="text-xs">평균 (AVG)</SelectItem>
                      <SelectItem value="max" className="text-xs">최대값 (MAX)</SelectItem>
                      <SelectItem value="min" className="text-xs">최소값 (MIN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">그룹화 (색상 구분)</Label>
                  <Select value={groupBy} onValueChange={setGroupBy}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="그룹화 안함" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">그룹화 안함</SelectItem>
                      {sampleColumns
                        .filter(col => col.name !== xAxis)
                        .map((col) => (
                          <SelectItem key={col.name} value={col.name} className="text-xs">
                            {col.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-1.5">
                  <Label className="text-xs">정렬 기준</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs">정렬 안함</SelectItem>
                      <SelectItem value="x" className="text-xs">X축 기준</SelectItem>
                      <SelectItem value="y" className="text-xs">Y축 합계 기준</SelectItem>
                      {numericColumns.map((col) => (
                        <SelectItem key={col.name} value={col.name} className="text-xs">
                          {col.name} 기준
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">정렬 순서</Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button
                      variant={sortOrder === "asc" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOrder("asc")}
                      className="h-7 text-xs"
                    >
                      오름차순 ↑
                    </Button>
                    <Button
                      variant={sortOrder === "desc" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortOrder("desc")}
                      className="h-7 text-xs"
                    >
                      내림차순 ↓
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="bg-muted/30 rounded-md p-2 space-y-1">
                  <h4 className="text-xs font-semibold mb-1">현재 설정</h4>
                  <div className="text-[10px] space-y-0.5 text-muted-foreground">
                    <div>📊 차트: {chartType === "bar" ? "막대" : chartType === "line" ? "라인" : "분산"}</div>
                    <div>📍 X축: {xAxis || "미설정"}</div>
                    <div>📈 Y축: {yAxis.length > 0 ? yAxis.join(", ") : "미설정"}</div>
                    <div>🔢 집계: {aggregation === "sum" ? "합계" : aggregation === "avg" ? "평균" : aggregation === "max" ? "최대" : "최소"}</div>
                    {groupBy && groupBy !== "none" && <div>🎨 그룹: {groupBy}</div>}
                    {sortBy !== "none" && <div>🔄 정렬: {sortBy} ({sortOrder === "asc" ? "오름" : "내림"})</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="flex-shrink-0">
          <CardContent className="py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowLeftPanel(!showLeftPanel)}
                >
                  {showLeftPanel ? "좌측 패널 숨기기" : "좌측 패널 표시"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowRightPanel(!showRightPanel)}
                >
                  {showRightPanel ? "우측 패널 숨기기" : "우측 패널 표시"}
                </Button>
              </div>

              <div className="flex items-center gap-1.5">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleGeneratePythonScript}
                >
                  <Code className="h-3.5 w-3.5 mr-1" />
                  Python 스크립트
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleExportCSV}
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  CSV 내보내기
                </Button>
                <Button 
                  className="bg-primary h-7 text-xs"
                  onClick={handleApplyTransformation}
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  변환 적용
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
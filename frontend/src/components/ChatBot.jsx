import { useState, useEffect, useRef } from "react";
import { useInventory } from '../context/InventoryContext';
import { MessageCircle, X, Send, Loader2, Brain } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

export function ChatBot() {
  const { inventoryData, fileName } = useInventory();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "안녕하세요! SmartStock AI 어시스턴트입니다.\n\n발주 페이지에서 재고 데이터를 업로드하거나, 직접 파일을 업로드해주세요.\n\n예: '현재 가장 급하게 주문해야하는 상품이 뭐지?'" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [analyzedData, setAnalyzedData] = useState(null);
  const scrollRef = useRef(null);

  // ✅ FastAPI 백엔드 URL (환경변수로 관리)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // -------------------------------
  // Order 페이지 데이터 감지 및 분석
  // -------------------------------
  useEffect(() => {
    if (inventoryData && inventoryData.length > 0) {
      if (analyzedData && fileData === inventoryData) return;

      const analysis = analyzeData(inventoryData);
      setAnalyzedData(analysis);
      setFileData(inventoryData);

      if (messages.length <= 1) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `✅ 발주 페이지 데이터 자동 연동 완료!\n\n` +
            `📊 ${analysis.insights.totalItems}개 상품 데이터 로드\n` +
            `📁 파일: ${fileName || '업로드된 데이터'}\n` +
            `⚠️ 주의 필요: ${analysis.insights.lowStock}개\n` +
            `⛔ 품절 위험: ${analysis.insights.outOfStock}개\n\n` +
            `💬 재고 관련 질문을 자유롭게 해주세요!`
        }]);
      }
    }
  }, [inventoryData]);

  // -------------------------------
  // 데이터 분석 함수
  // -------------------------------
  const analyzeData = (data) => {
    if (!data || data.length === 0) return null;

    const firstRow = data[0];
    const columns = Object.keys(firstRow);

    const findColumn = (keywords) => {
      return columns.find(col => 
        keywords.some(kw => col.toLowerCase().includes(kw.toLowerCase()))
      );
    };

    const nameCol = findColumn(['product', '상품명', '제품명', 'name', '품명']);
    const stockCol = findColumn(['stock', '재고', 'inventory', '수량']);
    const availableCol = findColumn(['available', '가용재고', '가용']);
    const scheduledCol = findColumn(['scheduled', '재고예정', '입고예정']);
    const dayCol = findColumn(['day', '일차', '날짜', 'date']);

    const productMap = {};
    
    data.forEach(item => {
      const productName = item[nameCol] || '알 수 없음';
      
      if (!productMap[productName]) {
        productMap[productName] = {
          stocks: [], availables: [], scheduleds: [], days: []
        };
      }
      
      productMap[productName].stocks.push(parseFloat(item[stockCol]) || 0);
      productMap[productName].availables.push(parseFloat(item[availableCol]) || 0);
      productMap[productName].scheduleds.push(parseFloat(item[scheduledCol]) || 0);
      productMap[productName].days.push(item[dayCol] || 0);
    });

    const analysis = Object.keys(productMap).map(productName => {
      const data = productMap[productName];
      const avgStock = data.stocks.reduce((a, b) => a + b, 0) / data.stocks.length;
      const avgAvailable = data.availables.reduce((a, b) => a + b, 0) / data.availables.length;
      const minAvailable = Math.min(...data.availables);
      const maxStock = Math.max(...data.stocks);
      const avgScheduled = data.scheduleds.reduce((a, b) => a + b, 0) / data.scheduleds.length;

      const firstStock = data.stocks[0];
      const lastStock = data.stocks[data.stocks.length - 1];
      const stockTrend = firstStock > 0 ? ((lastStock - firstStock) / firstStock) * 100 : 0;

      const stockRatio = avgAvailable > 0 ? minAvailable / avgAvailable : 0;
      const trendFactor = stockTrend < 0 ? Math.abs(stockTrend) / 10 : 0;
      const urgency = (1 - stockRatio) * 0.7 + trendFactor * 0.3;

      let status = '정상';
      if (minAvailable === 0) status = '품절';
      else if (minAvailable < avgAvailable * 0.7) status = '부족';
      else if (minAvailable < avgAvailable * 0.85) status = '주의';

      return {
        name: productName,
        avgStock: Math.round(avgStock),
        avgAvailable: Math.round(avgAvailable),
        minAvailable: Math.round(minAvailable),
        maxStock: Math.round(maxStock),
        avgScheduled: Math.round(avgScheduled),
        stockTrend: stockTrend.toFixed(1),
        urgency, stockRatio, status,
        dataPoints: data.stocks.length
      };
    });

    return {
      items: analysis,
      insights: {
        totalItems: analysis.length,
        outOfStock: analysis.filter(i => i.minAvailable === 0).length,
        lowStock: analysis.filter(i => i.status === '부족' || i.status === '주의').length,
        avgStockLevel: Math.round(analysis.reduce((sum, i) => sum + i.avgStock, 0) / analysis.length),
        totalScheduled: Math.round(analysis.reduce((sum, i) => sum + i.avgScheduled, 0))
      }
    };
  };

  // -------------------------------
  // ✅ 백엔드 API를 통한 LLM 호출
  // -------------------------------
  const generateAIResponse = async (query) => {
    if (!analyzedData) {
      return '먼저 발주 페이지에서 재고 데이터를 업로드하거나, 직접 파일을 업로드해주세요.';
    }

    const summary = JSON.stringify(analyzedData.insights, null, 2);
    const sample = analyzedData.items.slice(0, 5)
      .map(i => `${i.name}: 평균재고 ${i.avgStock}, 최소가용 ${i.minAvailable}, 상태 ${i.status}`)
      .join('\n');

    const prompt = `
당신은 재고 관리 전문가입니다.
다음은 분석된 재고 데이터 요약입니다.

[재고 인사이트]
${summary}

[대표 상품]
${sample}

데이터 내용 분석 — 컬럼, 샘플 행, 수치 범위, 주요 지표 파악
요약 테이블 생성 — 데이터의 핵심 정보(예: 기간, 상품 수, 예측 컬럼 등)
챗봇용 예상 질의 예시 작성 — "이 상품의 11월 판매량은?", "가장 많이 팔린 상품은?" 같은 질문 형태
지식요약 형태로 정리 — LLM이 학습/검색용으로 사용할 수 있도록 구조화

사용자의 질문에 따라 데이터 기반으로 간결하고 명확히 답변하세요.
사용자 질문: ${query}
    `;

    // ✅ 백엔드 API 호출
    const response = await fetch(`${API_URL}/api/v1/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "너는 SmartStock 재고 분석 AI 어시스턴트야." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        maxTokens: 1000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '서버 응답 오류');
    }

    const data = await response.json();
    return data.response;
  };

  // -------------------------------
  // 메시지 전송 (백엔드 API 호출)
  // -------------------------------
  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await generateAIResponse(currentInput);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI 응답 오류:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ 오류가 발생했습니다: ${error.message}\n\n서버가 실행 중인지 확인해주세요.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // -------------------------------
  // UI 렌더링
  // -------------------------------
  return (
    <>
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[600px] shadow-xl flex flex-col z-50 border-2">
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <div>
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" /> AI 어시스턴트
              </h3>
              <p className="text-xs opacity-90">
                {analyzedData ? `✅ ${analyzedData.insights.totalItems}개 상품 분석됨` : '⚡ 지능형 분석 모드'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 h-8 w-8">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-2 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-gray-600">AI 분석 중...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
              placeholder="질문을 입력하세요..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </>
  );
}
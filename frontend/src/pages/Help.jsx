import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { FileText, MessageCircle, Send, CheckCircle, Download } from "lucide-react";
import Footer from "../components/Footer";

const faqs = [
  {
    question: "데이터는 어떻게 업로드하나요?",
    answer: "대시보드 메뉴에서 '데이터 업로드'를 선택하거나, 파일을 드래그 앤 드롭으로 업로드할 수 있습니다. CSV, Excel 파일을 지원합니다."
  },
  {
    question: "예측 정확도를 높이려면?",
    answer: "최소 3개월 이상의 과거 데이터를 제공하고, 날짜, 제품명, 판매량 등 필수 컬럼을 모두 포함해야 합니다. 데이터가 많을수록 정확도가 향상됩니다."
  },
  {
    question: "발주 추천은 어떻게 작동하나요?",
    answer: "AI가 과거 판매 패턴, 계절성, 트렌드를 분석하여 최적의 발주 시점과 수량을 자동으로 계산합니다."
  },
  {
    question: "데이터 보안은 어떻게 관리되나요?",
    answer: "모든 데이터는 암호화되어 저장되며, 엔터프라이즈급 보안 프로토콜을 적용합니다. GDPR 및 개인정보보호법을 준수합니다."
  }
];

function ChatDialog() {
  const [messages, setMessages] = useState([
    { id: 1, text: "안녕하세요! SmartStock AI 상담원입니다. 무엇을 도와드릴까요?", sender: "bot", time: "지금" }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      time: "방금"
    };
    setMessages([...messages, userMessage]);
    setInputMessage("");

    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        text: "문의 주셔서 감사합니다. 담당자가 곧 답변드리겠습니다!",
        sender: "bot",
        time: "방금"
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          채팅 시작
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>실시간 상담</DialogTitle>
          <DialogDescription>
            문의사항을 남겨주시면 빠르게 답변드리겠습니다
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <ScrollArea className="h-80 w-full rounded-md border p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Help() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  // 가이드 문서 다운로드 핸들러
  const handleDownloadGuide = () => {
    // 파일이 없을 경우 안내 메시지
    const fileUrl = "/documents/smartstock-guide.pdf";
    
    // 파일 존재 여부 확인 후 다운로드
    fetch(fileUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // 파일이 있으면 다운로드
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = 'SmartStock_AI_사용자_가이드.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          // 파일이 없으면 알림
          alert('가이드 문서가 준비 중입니다. 빠른 시일 내에 제공하겠습니다.');
        }
      })
      .catch(() => {
        // 네트워크 에러 등
        alert('가이드 문서가 준비 중입니다. 빠른 시일 내에 제공하겠습니다.');
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    setShowSuccess(true);
    
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });

    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {/* Success Message */}
          {showSuccess && (
            <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
              <Card className="bg-green-50 border-green-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">문의 접수 완료</h4>
                      <p className="text-sm text-green-700 mt-1">
                        문의가 정상적으로 접수되었습니다.<br />
                        담당자 검토 후 회신드리겠습니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">문의하기</h1>
            <p className="text-muted-foreground">
              궁금한 점이 있으시면 언제든지 문의해주세요
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <FileText className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">가이드 문서</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  사용자 매뉴얼
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDownloadGuide}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  문서 보기
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-2">라이브 채팅</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  실시간 상담
                </p>
                <ChatDialog />
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>문의 양식</CardTitle>
              <CardDescription>
                아래 양식을 작성하여 문의사항을 보내주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input 
                      id="name" 
                      placeholder="홍길동"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">제목</Label>
                  <Input 
                    id="subject" 
                    placeholder="문의 제목을 입력하세요"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">메시지</Label>
                  <Textarea
                    id="message"
                    placeholder="문의 내용을 자세히 입력해주세요"
                    className="min-h-32"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  문의 보내기
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle>자주 묻는 질문</CardTitle>
              <CardDescription>
                가장 자주 묻는 질문과 답변입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart3, FileText, Shield } from "lucide-react";

// 정책 다이얼로그 컴포넌트
function PolicyDialog({ type, children }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'terms' ? (
              <>
                <FileText className="w-5 h-5 text-blue-600" />
                서비스 이용약관
              </>
            ) : (
              <>
                <Shield className="w-5 h-5 text-blue-600" />
                개인정보처리방침
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          {type === 'terms' ? (
            <div className="space-y-6 text-gray-700 text-sm">
              <section>
                <h3 className="font-semibold mb-3">제1조 (목적)</h3>
                <p>
                  본 약관은 SmartStock AI(이하 "회사")가 제공하는 AI 기반 수요 예측 플랫폼
                  서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및
                  책임사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-3">제2조 (정의)</h3>
                <p className="mb-2">본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    "서비스"란 회사가 제공하는 AI 기반 수요 예측, 데이터 분석, 발주 추천 등의
                    모든 서비스를 의미합니다.
                  </li>
                  <li>
                    "이용자"란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을
                    말합니다.
                  </li>
                  <li>
                    "회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디(ID)를 부여받은
                    자를 의미합니다.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">제3조 (약관의 효력 및 변경)</h3>
                <p className="mb-2">
                  1. 본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을
                  발생합니다.
                </p>
                <p className="mb-2">
                  2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위 내에서 본 약관을 변경할
                  수 있습니다.
                </p>
                <p>
                  3. 약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 공지합니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-3">제4조 (서비스의 제공 및 변경)</h3>
                <p className="mb-2">회사는 다음과 같은 서비스를 제공합니다:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>AI 기반 수요 예측 및 분석</li>
                  <li>실시간 대시보드 및 리포트</li>
                  <li>자동 발주 추천</li>
                  <li>데이터 업로드 및 관리</li>
                  <li>AI 챗봇 어시스턴트</li>
                  <li>DataLab을 통한 커스텀 분석</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">제5조 (서비스 이용시간)</h3>
                <p className="mb-2">
                  1. 서비스의 이용은 연중무휴 1일 24시간을 원칙으로 합니다.
                </p>
                <p>
                  2. 회사는 시스템 정기점검, 증설 및 교체를 위해 회사가 정한 날이나 시간에
                  서비스를 일시 중단할 수 있습니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-3">제6조 (개인정보의 보호)</h3>
                <p>
                  회사는 관련 법령이 정하는 바에 따라 이용자의 개인정보를 보호하기 위해
                  노력합니다. 개인정보의 보호 및 사용에 대해서는 관련 법령 및 회사의
                  개인정보처리방침이 적용됩니다.
                </p>
              </section>

              <div className="pt-6 border-t">
                <p className="text-xs text-gray-500">시행일자: 2025년 10월 21일</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 text-gray-700 text-sm">
              <section>
                <h3 className="font-semibold mb-3">1. 개인정보의 처리 목적</h3>
                <p className="mb-2">
                  회사는 다음의 목적을 위하여 개인정보를 처리합니다.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>회원 가입 및 관리</li>
                  <li>서비스 제공 및 계약 이행</li>
                  <li>요금 결제 및 정산</li>
                  <li>고객 문의 및 불만 처리</li>
                  <li>서비스 개선 및 신규 서비스 개발</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">2. 개인정보의 처리 및 보유기간</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>회원 정보: 회원 탈퇴 시까지</li>
                  <li>서비스 이용 기록: 3년</li>
                  <li>결제 정보: 5년 (전자상거래법)</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">3. 처리하는 개인정보의 항목</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>필수항목: 이름, 이메일, 전화번호, 회사명</li>
                  <li>자동 수집: IP주소, 쿠키, 서비스 이용 기록</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">4. 개인정보의 제3자 제공</h3>
                <p>
                  회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및
                  제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-3">5. 개인정보의 파기</h3>
                <p className="mb-2">
                  회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을
                  때에는 지체없이 해당 개인정보를 파기합니다.
                </p>
              </section>

              <section>
                <h3 className="font-semibold mb-3">6. 정보주체의 권리·의무</h3>
                <p className="mb-2">
                  정보주체는 회사에 대해 언제든지 다음의 개인정보 보호 관련 권리를 행사할
                  수 있습니다:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>개인정보 열람 요구</li>
                  <li>오류 등이 있을 경우 정정 요구</li>
                  <li>삭제 요구</li>
                  <li>처리정지 요구</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold mb-3">7. 개인정보 보호책임자</h3>
                <div className="ml-4 space-y-1">
                  <p>연락처: privacy@smartstock.ai</p>
                  <p>전화: 1588-0000</p>
                </div>
              </section>

              <div className="pt-6 border-t">
                <p className="text-xs text-gray-500">시행일자: 2025년 10월 21일</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // URL에서 tab 파라미터 확인
  const searchParams = new URLSearchParams(location.search);
  const defaultTab = searchParams.get('tab') || 'login';

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    navigate("/dashboard");
  };

  const handleSignup = (e) => {
    e.preventDefault();
    
    if (!agreeTerms || !agreePrivacy) {
      alert("이용약관 및 개인정보처리방침에 동의해주세요.");
      return;
    }
    
    setIsLoggedIn(true);
    navigate("/upload");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold">SmartStock AI</h1>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>로그인</CardTitle>
                <CardDescription>
                  계정에 로그인하여 시작하세요
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">비밀번호</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="remember" />
                      <label htmlFor="remember" className="text-sm cursor-pointer">
                        로그인 상태 유지
                      </label>
                    </div>
                    <Button type="button" variant="link" className="px-0 h-auto">
                      비밀번호 찾기
                    </Button>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    로그인
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>회원가입</CardTitle>
                <CardDescription>
                  새 계정을 만들어 시작하세요
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignup}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">이름</Label>
                    <Input
                      id="signup-name"
                      placeholder="홍길동"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-company">회사명</Label>
                    <Input
                      id="signup-company"
                      placeholder="회사명을 입력하세요"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">이메일</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">비밀번호</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* 약관 동의 */}
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="agree-terms" 
                        checked={agreeTerms}
                        onCheckedChange={setAgreeTerms}
                      />
                      <div className="flex-1">
                        <label htmlFor="agree-terms" className="text-sm cursor-pointer">
                          <PolicyDialog type="terms">
                            <button type="button" className="text-blue-600 hover:underline">
                              이용약관
                            </button>
                          </PolicyDialog>
                          에 동의합니다 (필수)
                        </label>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="agree-privacy"
                        checked={agreePrivacy}
                        onCheckedChange={setAgreePrivacy}
                      />
                      <div className="flex-1">
                        <label htmlFor="agree-privacy" className="text-sm cursor-pointer">
                          <PolicyDialog type="privacy">
                            <button type="button" className="text-blue-600 hover:underline">
                              개인정보처리방침
                            </button>
                          </PolicyDialog>
                          에 동의합니다 (필수)
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!agreeTerms || !agreePrivacy}
                  >
                    회원가입
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
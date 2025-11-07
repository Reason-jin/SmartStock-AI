import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ScrollArea } from "../components/ui/scroll-area";
import { FileText, Shield, AlertCircle } from "lucide-react";
import Footer from "../components/Footer";

export default function Policy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-12">
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">정책 및 약관</h1>
            <p className="text-muted-foreground">
              SmartStock AI 서비스 이용약관 및 개인정보처리방침
            </p>
          </div>

          <Tabs defaultValue="terms" className="space-y-6">
            <TabsList>
              <TabsTrigger value="terms">이용약관</TabsTrigger>
              <TabsTrigger value="privacy">개인정보처리방침</TabsTrigger>
              <TabsTrigger value="data">데이터 정책</TabsTrigger>
            </TabsList>

            {/* Terms of Service */}
            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    서비스 이용약관
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6 text-gray-700">
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

                      <div className="pt-6 border-t">
                        <p className="text-sm text-gray-500">시행일자: 2025년 1월 1일</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Policy */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    개인정보처리방침
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6 text-gray-700">
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
                        <h3 className="font-semibold mb-3">4. 개인정보 보호책임자</h3>
                        <div className="ml-4 space-y-1">
                          <p>연락처: privacy@smartstock.ai</p>
                          <p>전화: 1588-0000</p>
                        </div>
                      </section>

                      <div className="pt-6 border-t">
                        <p className="text-sm text-gray-500">시행일자: 2025년 1월 1일</p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Policy */}
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                    데이터 처리 정책
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-6 text-gray-700">
                      <section>
                        <h3 className="font-semibold mb-3">1. 데이터 수집 및 사용</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>AI 기반 수요 예측 모델 학습</li>
                          <li>대시보드 및 리포트 생성</li>
                          <li>발주 추천 알고리즘 실행</li>
                          <li>서비스 품질 개선</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-semibold mb-3">2. 데이터 보안</h3>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                          <li>전송 중 데이터 암호화 (TLS/SSL)</li>
                          <li>저장 데이터 암호화 (AES-256)</li>
                          <li>접근 제어 및 인증 시스템</li>
                          <li>정기적인 보안 감사</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="font-semibold mb-3">3. 데이터 소유권</h3>
                        <p>
                          고객이 업로드한 모든 데이터의 소유권은 고객에게 있습니다.
                        </p>
                      </section>

                      <div className="pt-6 border-t">
                        <p className="text-sm text-gray-500">
                          최종 업데이트: 2025년 10월 22일
                        </p>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
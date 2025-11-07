import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">설정</h1>
        <p className="text-muted-foreground">
          계정 설정 및 알림 설정을 관리하세요
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
          <CardDescription>
            프로필 정보를 업데이트하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                홍
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm">
                사진 변경
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                JPG, PNG 파일 (최대 2MB)
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input id="name" defaultValue="홍길동" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" defaultValue="hong@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">회사명</Label>
              <Input id="company" defaultValue="HUNTERS42" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">직책</Label>
              <Input id="position" defaultValue="재고 관리자" />
            </div>
          </div>

          <Button className="bg-primary">
            변경사항 저장
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>알림 설정</CardTitle>
          <CardDescription>
            받고 싶은 알림을 선택하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">이메일 알림</Label>
              <p className="text-sm text-muted-foreground">
                중요한 업데이트를 이메일로 받습니다
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">품절 경고</Label>
              <p className="text-sm text-muted-foreground">
                재고가 부족할 때 알림을 받습니다
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">주간 리포트</Label>
              <p className="text-sm text-muted-foreground">
                매주 월요일 요약 리포트를 받습니다
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">발주 추천</Label>
              <p className="text-sm text-muted-foreground">
                발주가 필요할 때 알림을 받습니다
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card>
        <CardHeader>
          <CardTitle>플랜 정보</CardTitle>
          <CardDescription>
            현재 구독 중인 플랜입니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-semibold">프로 플랜</h4>
                <Badge>현재 플랜</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                ₩99,000 / 월
              </p>
            </div>
            <Button variant="outline">
              플랜 변경
            </Button>
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">다음 결제일</span>
              <span>2025년 11월 21일</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 수단</span>
              <span>신용카드 (****1234)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">위험 구역</CardTitle>
          <CardDescription>
            계정 삭제는 되돌릴 수 없습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            계정 삭제
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
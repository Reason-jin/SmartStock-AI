import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { TrendingUp, BarChart3, Package, Shield } from "lucide-react";
import Footer from "../components/Footer";

const features = [
  {
    icon: TrendingUp,
    title: "AI 기반 수요 예측",
    description: "머신러닝 알고리즘으로 정확한 수요를 예측합니다"
  },
  {
    icon: BarChart3,
    title: "실시간 분석",
    description: "실시간 데이터 분석으로 빠른 의사결정을 지원합니다"
  },
  {
    icon: Package,
    title: "자동 발주 추천",
    description: "최적의 발주 타이밍과 수량을 자동으로 추천합니다"
  },
  {
    icon: Shield,
    title: "데이터 보안",
    description: "엔터프라이즈급 보안으로 데이터를 안전하게 보호합니다"
  }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto max-w-[1200px] px-5 py-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            AI로 재고를 최적화하고
            <br />
            비용을 절감하세요
          </h1>
          <p className="text-xl text-muted-foreground">
            SmartStock AI는 AI 기반 수요 예측과 재고 관리로 
            판매사의 효율성을 극대화합니다
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto max-w-[1200px] px-5 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">핵심 기능</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto max-w-[1200px] px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary mb-2">94.2%</div>
            <p className="text-muted-foreground">평균 예측 정확도</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">30%</div>
            <p className="text-muted-foreground">재고 비용 절감</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary mb-2">1,000+</div>
            <p className="text-muted-foreground">활성 사용자</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
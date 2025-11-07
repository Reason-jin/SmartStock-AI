# SmartStock AI
**데이터를 이해하고, 발주를 제안하는 AI 재고관리 플랫폼**

데이터 업로드 한 번으로 정제 → 예측 → 정책 계산 → 시각화 과정을 자동화하는 AI 재고관리 서비스입니다.  
FastAPI, TensorFlow, React, MySQL을 통합하여 AI가 데이터를 이해하고 사용자에게 실행 가능한 결정을 제공합니다.

---

SmartStock AI는 판매사의 재고 흐름을 예측하고 발주 정책을 자동 계산하여  
Excel 중심 관리의 한계를 극복하도록 설계되었습니다.

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | SmartStock AI |
| 목표 | ERP/WMS 미보유 기업의 재고 불일치 문제를 AI 자동화로 해결 |
| 핵심 가치 | 데이터를 올리면, AI가 이해하고 발주를 제안한다 |
| 담당 역할 | 서비스 기획 · UX 설계 · Open API 질의 인터페이스 기획 |

---

## 서비스 구조
![System Architecture](images/system_architecture.png)

| 구성요소 | 설명 |
|-----------|------|
| Frontend (React) | 데이터 업로드, 시각화, GPT-4 Open API 질의 인터페이스 |
| Backend (FastAPI) | 데이터 정제, 모델 호출, 정책 계산 |
| Model Engine (TensorFlow) | LSTM+CNN 하이브리드 수요예측 모델 |
| Database (MySQL) | 예측 및 정책 데이터 저장 |
| Infra (Docker + MLflow + AWS) | 모델 버전관리 및 컨테이너 기반 배포 |

---

## Dashboard & Live Screens

### Main Page
![Main Page](images/mainpage_hero.png)

### File Upload & Forecast
![Upload Forecast Page](images/upload_forecast_page.png)

### Data Visualization
![Bar Chart](images/datalab_bar_chart.png)
![Line Chart](images/datalab_line_chart.png)
![Scatter Chart](images/datalab_scatter_chart.png)

### Purchase Recommendation
![Purchase Recommendation](images/purchase_recommendation.png)

### System Architecture
![System Architecture](images/system_architecture.png)

---

## 서비스 흐름

| 단계 | 사용자 행동 | 시스템 반응 |
|------|---------------|-------------|
| 1 | CSV/Excel 업로드 | 자동 컬럼 인식, 결측치·이상치 정제 |
| 2 | 미래예측 실행 클릭 | LSTM+CNN 모델로 SKU 단위 예측 |
| 3 | 발주정책 계산 | EOQ·ROP·SS 기반 자동 계산 |
| 4 | 대시보드 확인 | Fill Rate·품절률·가용성 등 KPI 시각화 |
| 5 | Open API 질의 | 자연어로 재고상태·발주시점 질의응답 |

![Upload Forecast Page](images/upload_forecast_page.png)

---

## AI 기반 데이터 처리 및 정책 계산

AI는 데이터를 단순히 분석하지 않고, 사용자가 이해할 수 있는 형태로 설명합니다.

- **전처리** : Linear interpolation / IQR Winsorization  
- **모델 구조** : LSTM + CNN 병렬 구조  
- **학습 입력** : 최근 14일 데이터를 기준으로 한 슬라이딩 윈도우  
- **발주 정책 계산식**

```
SS = z × σ_demand × √L  
ROP = μ_demand × L + SS  
Q = max(0, ROP + 목표재고 − 현재가용재고)
```

| 지표 | 목표 | 결과 |
|------|------|------|
| WAPE | ≤ 15% | 14.2% |
| Fill Rate | ≥ 95% | 96.3% |
| 품절률 | ≤ 2% | 1.8% |

---

## DataLab Visualization
![Bar Chart](images/datalab_bar_chart.png)
![Line Chart](images/datalab_line_chart.png)
![Scatter Chart](images/datalab_scatter_chart.png)

업로드한 예측 데이터를 막대·라인·분산 그래프로 탐색할 수 있으며,  
수요 패턴과 품목별 변동성을 직관적으로 분석할 수 있습니다.

---

## 발주정책 계산 및 시각화
![Purchase Recommendation](images/purchase_recommendation.png)

예측값과 정책 계산 결과를 기반으로 발주 순서, 사유, 우선순위를 자동 표시합니다.  
사용자는 클릭 한 번으로 AI가 제안하는 최적 발주 전략을 확인할 수 있습니다.

---

## Open API 기반 질의응답

“이번주 B상품은 발주해야 할까?”  
→ GPT-4 Open API가 대시보드 데이터를 분석해 답변합니다.

React UI에서 Open API를 통해 사용자는 자연어로 재고 예측, 위험도, 발주 시점을 질의할 수 있습니다.  
현재는 시뮬레이션 수준의 프로토타입으로, 향후 데이터-grounded 질의응답 기능으로 확장 예정입니다.

---

## 성과 및 사용자 가치

| 항목 | 결과 | 의미 |
|------|------|------|
| WAPE 14.2% | 예측 정확도 향상 | SKU 단위 수요 대응 |
| Fill Rate 96.3% | 재고가용성 향상 | 품절·과잉재고 감소 |
| 업무시간 70% 단축 | Excel 대비 | 발주·입고 의사결정 자동화 |
| UX 단순화 | 클릭 3회 내 처리 | 실무 효율 극대화 |

---

## 발전 방향

| 개선 항목 | 접근 방식 | 기대효과 |
|------------|-------------|-----------|
| Copilot 고도화 | GPT-4o + 데이터 grounding | 실시간 질의응답 강화 |
| Cross-SKU 예측 | Transformer / TFT | 상품군 단위 예측 향상 |
| Auto Retraining | Airflow + MLflow | 자동 재학습 |
| SaaS 전환 | Multi-Tenant DB 구조 | 상용 서비스 확장 대응 |

---

## 폴더 구조

```
SmartStock-AI/
 ┣ backend/
 ┣ frontend/
 ┣ images/
 ┃ ┣ mainpage_hero.png
 ┃ ┣ upload_forecast_page.png
 ┃ ┣ datalab_bar_chart.png
 ┃ ┣ datalab_line_chart.png
 ┃ ┣ datalab_scatter_chart.png
 ┃ ┣ purchase_recommendation.png
 ┃ ┗ system_architecture.png
 ┣ docs/
 ┃ ┣ SmartStockAI_Final_Report.pdf
 ┃ ┣ SmartStockAI_User_Guide.pdf
 ┃ ┗ SmartStockAI_Planning_Doc.pdf
 ┗ README.md
```

---

## Project Documents

- [Final Report](docs/SmartStockAI_Final_Report.pdf) — 기술 및 분석 보고서  
- [User Guide](docs/SmartStockAI_User_Guide.pdf) — 대시보드 사용 가이드  
- [Planning Document](docs/SmartStockAI_Planning_Doc.pdf) — 초기 기획 구조 및 기능 정의  

---

SmartStock AI는  
“AI 기술이 실무의 언어로 작동하는 서비스”를 목표로 설계된  
AI 기반 재고예측·발주정책 자동화 플랫폼입니다.  
기술보다 사용자가 AI를 이해하고 활용할 수 있는 구조 설계에 집중했습니다.


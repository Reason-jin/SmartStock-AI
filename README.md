# SmartStock AI  
**“데이터를 이해하고, 발주를 제안하는 AI 재고관리 플랫폼”**

<<<<<<< HEAD
데이터 업로드 한 번으로 정제 → 예측 → 정책 계산 → 시각화 과정을 자동화하는 AI 재고관리 서비스입니다.  
FastAPI, TensorFlow, React, MySQL을 통합하여 AI가 데이터를 이해하고 사용자에게 실행 가능한 결정을 제공합니다.

---

SmartStock AI는 판매사의 재고 흐름을 예측하고 발주 정책을 자동 계산하여  
Excel 중심 관리의 한계를 극복하도록 설계되었습니다.
=======
SmartStock AI는 ERP/WMS 미보유 기업의 **재고 불일치·품절·과잉재고 문제를 AI로 자동화**하기 위해 설계된 플랫폼입니다.  
사용자는 데이터를 업로드하기만 하면, 시스템이 스스로 정제하고 예측하며, 최적 발주 정책을 제안합니다.  
기획 단계부터 FastAPI, TensorFlow, React, MySQL을 하나의 구조로 통합하여  
“데이터 → 인사이트 → 의사결정”의 전체 여정을 자동화했습니다.
>>>>>>> 347d056 (docs: refined final README with full narrative and visuals)

---

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | SmartStock AI |
| 목적 | 판매사의 재고 관리 비효율(수동 입력·엑셀 의존)을 AI 예측·자동정책화로 해결 |
| 핵심 가치 | 데이터를 올리면, AI가 이해하고 발주를 제안한다 |
| 주요 기술 | FastAPI · TensorFlow · React · MySQL · MLflow · Docker |
| 개발 기간 | 2025.10.01 ~ 2025.10.30 |
| 기획 방향 | “AI가 숫자가 아닌, 행동으로 말하게 하자” — 데이터 기반 의사결정 자동화 UX 설계 |

---

## 서비스 구조

![System Architecture](images/system_architecture.png)

SmartStock AI는 단순한 모델 구현을 넘어,  
**AI가 비전문가의 언어로 설명하고 행동하는 구조**를 목표로 설계되었습니다.

| 구성요소 | 역할 |
|-----------|------|
| Frontend (React) | 파일 업로드, 시각화, Open API 질의 인터페이스 |
| Backend (FastAPI) | 데이터 정제, 예측·정책 API 제공 |
| Model Engine (TensorFlow) | LSTM+CNN 하이브리드 수요예측 모델 |
| Database (MySQL) | 예측·발주 정책 결과 저장 |
| Infra (Docker + MLflow + AWS) | 버전관리 및 컨테이너 기반 배포 환경 |

---

## 서비스 흐름

SmartStock AI의 사용자 경험은 **5단계로 구성**됩니다.

| 단계 | 사용자 행동 | 시스템 반응 |
|------|---------------|-------------|
| 1 | Excel/CSV 업로드 | 컬럼 자동 인식, 결측·이상치 정제 |
| 2 | “미래예측 실행” 클릭 | LSTM+CNN 기반 SKU 단위 예측 수행 |
| 3 | “정책 계산” 클릭 | EOQ·ROP·SS 공식 기반 자동 발주정책 산출 |
| 4 | “대시보드 보기” 클릭 | KPI 카드(Fill Rate, 품절률 등) 시각화 |
| 5 | Open API 질의 | GPT-4가 자연어 질의에 실시간 응답 |

![Upload Forecast Page](images/upload_forecast_page.png)

---

## Dashboard Overview

SmartStock AI는 데이터를 시각화하여  
“AI가 판단한 이유”를 사용자가 직접 확인할 수 있도록 설계되었습니다.

### 1️⃣ 메인 페이지  
![Main Page](images/mainpage_hero.png)

> 서비스 소개와 ‘무료 체험 시작’ 버튼을 통해 진입합니다.  
> 한눈에 프로젝트의 목적과 AI 프로세스를 이해할 수 있도록 구성했습니다.

### 2️⃣ 업로드 및 예측 실행  
![Upload Forecast Page](images/upload_forecast_page.png)  
> Excel/CSV 파일을 업로드하면 AI가 컬럼 구조를 자동 인식하고 결측치를 보정합니다.  

### 3️⃣ 데이터 시각화 (DataLab)  
![Bar Chart](images/datalab_bar_chart.png)
![Line Chart](images/datalab_line_chart.png)
![Scatter Chart](images/datalab_scatter_chart.png)
> 예측된 데이터의 추세, 계절성, 변동성을 직관적으로 파악할 수 있습니다.  

### 4️⃣ 발주 정책 및 추천 결과  
![Purchase Recommendation](images/purchase_recommendation.png)
> AI가 EOQ·ROP·SS 계산을 기반으로 **발주 순서와 사유**를 자동 제시합니다.  
> 모든 결과는 KPI 대시보드와 연동되어 의사결정 근거로 바로 확인할 수 있습니다.

---

## AI 기반 데이터 처리 및 정책 계산

AI는 데이터를 단순히 예측하지 않습니다.  
**“왜 이런 결정을 내렸는가”를 설명할 수 있는 구조로 설계**되었습니다.

- **전처리:** Linear interpolation / IQR Winsorization  
- **모델 구조:** LSTM + CNN 병렬 구조  
- **학습 입력:** 최근 14일 데이터를 기준으로 한 슬라이딩 윈도우  
- **정책 계산 공식:**
SS = z × σ_demand × √L
ROP = μ_demand × L + SS
Q = max(0, ROP + 목표재고 − 현재가용재고)

yaml
코드 복사

| 지표 | 목표 | 결과 |
|------|------|------|
| WAPE | ≤ 15% | 14.2% |
| Fill Rate | ≥ 95% | 96.3% |
| 품절률 | ≤ 2% | 1.8% |

---

## Open API 기반 질의응답

> “이번주 B상품은 발주해야 할까?”  
> → GPT-4 Open API가 대시보드 데이터를 분석해 즉시 응답합니다.

사용자는 **자연어 질의**를 통해 재고 상태, 예측 결과, 정책 사유를 질문할 수 있으며,  
AI는 실시간 데이터 기반으로 해석하여 답변합니다.  
현재는 시뮬레이션 프로토타입 단계이며,  
향후 **Data-grounded Copilot** 형태로 확장될 예정입니다.

---

## 성과 및 사용자 가치

| 항목 | 결과 | 의미 |
|------|------|------|
| WAPE 14.2% | 예측 정확도 향상 | SKU 단위 수요 대응 |
| Fill Rate 96.3% | 재고가용성 향상 | 품절·과잉재고 감소 |
| 업무시간 70% 단축 | Excel 대비 | 발주·입고 의사결정 자동화 |
| UX 단순화 | 클릭 3회 내 프로세스 완성 | 비전문가 접근성 향상 |

---

## 발전 방향

| 개선 항목 | 접근 방식 | 기대효과 |
|------------|-------------|-----------|
| Copilot 고도화 | GPT-4o + 실데이터 grounding | 실시간 질의응답 강화 |
| Cross-SKU 예측 | Transformer / TFT | 상품군 단위 상관분석 반영 |
| Auto Retraining | Airflow + MLflow | 자동 재학습 파이프라인 구축 |
| SaaS 전환 | Multi-Tenant 구조 | 중소기업형 구독 서비스화 |

---

## 폴더 구조

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

yaml
코드 복사

---

## Project Documents

- [Final Report](docs/SmartStockAI_Final_Report.pdf) — 기술 및 분석 보고서  
- [User Guide](docs/SmartStockAI_User_Guide.pdf) — 대시보드 사용 가이드  
- [Planning Document](docs/SmartStockAI_Planning_Doc.pdf) — 초기 기획 구조 및 기능 정의  

---

**SmartStock AI**는  
“AI 기술이 실무의 언어로 작동하는 서비스”를 목표로 설계된  
AI 기반 재고예측·발주정책 자동화 플랫폼입니다.  
기술보다 사용자가 AI를 이해하고 활용할 수 있는 **설계 중심 제품**임을 증명했습니다.

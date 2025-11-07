from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from collections import defaultdict
import os

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent/ "uploads"
MODEL_PATH = Path(__file__).resolve().parent.parent / "best_inventory_model.keras"
SCALER_X_PATH = Path(__file__).resolve().parent.parent / "scaler_X.pkl"
SCALER_Y_PATH = Path(__file__).resolve().parent.parent / "scaler_y.pkl"
LE_PATH = Path(__file__).resolve().parent.parent / "label_encoders.pkl"
DOWNLOAD_PATH = Path(__file__).resolve().parent.parent.parent/ "download_prediction"

SEQ_LENGTH = 7
feature_cols = [
    
    '고객사 코드_encoded', '공급업체 코드_encoded', 'SKU_encoded',
    '랙번호_encoded', '브랜드명_encoded', '재고차감 순서',
    '입고예정수량', '입고', '출고', '불량', '재고조정', '재고',
    '가용재고', '출고예정(B2C)', '출하예정(B2B)', '출고대기(B2C)',
    '_주차', '_월', '월_sin', '월_cos', '요일_sin', '요일_cos'
]

# -----------------------------
# 요청 Body 모델
class PredictRequest(BaseModel):
    stored_filename: str

# -----------------------------
@router.post("/predict")
def predict_selected_file(request: PredictRequest):
    stored_filename = request.stored_filename
    file_path = UPLOAD_DIR / stored_filename
    # print(UPLOAD_DIR / stored_filename)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="파일이 존재하지 않습니다.")

    # ======================
    # 1️⃣ 모델/스케일러/인코더 로드
    model = load_model(MODEL_PATH)
    scaler_X = joblib.load(SCALER_X_PATH)
    scaler_y = joblib.load(SCALER_Y_PATH)
    le_dict = joblib.load(LE_PATH)

    # ======================
    # 2️⃣ 데이터 로드
    df = pd.read_excel(file_path)
    df['_일자'] = pd.to_datetime(df['_일자'])
    df = df.sort_values(['SKU', '_일자']).reset_index(drop=True)

    # ======================
    # 3️⃣ 카테고리 인코딩
    cat_columns = ['고객사 코드', '공급업체 코드', 'SKU', '랙번호', '브랜드명']
    for col in cat_columns:
        le = le_dict[col]
        df[col + '_encoded'] = le.transform(df[col].astype(str))

    # ======================
    # 4️⃣ 시계열 특성 생성
    df['요일'] = df['_일자'].dt.dayofweek
    df['일'] = df['_일자'].dt.day
    df['월_sin'] = np.sin(2 * np.pi * df['_월'] / 12)
    df['월_cos'] = np.cos(2 * np.pi * df['_월'] / 12)
    df['요일_sin'] = np.sin(2 * np.pi * df['요일'] / 7)
    df['요일_cos'] = np.cos(2 * np.pi * df['요일'] / 7)

    # ======================
    # 5️⃣ 마지막 시퀀스 생성
    X_seq_dict = {}
    for sku in df['SKU'].unique():
        sku_data = df[df['SKU'] == sku].sort_values('_일자')
        if len(sku_data) >= SEQ_LENGTH:
            X_seq = sku_data.iloc[-SEQ_LENGTH:][feature_cols].values
            X_seq_dict[sku] = X_seq

    # ======================
    # 6️⃣ SKU → 상품명 매핑
    sku_name_map = df.drop_duplicates('SKU')[['SKU', '상품명 (한글)']].set_index('SKU')['상품명 (한글)'].to_dict()

    # ======================
    # 7️⃣ 미래 예측
    results = {}
    for sku, seq in X_seq_dict.items():
        seq_scaled = scaler_X.transform(seq.reshape(-1, seq.shape[1])).reshape(1, SEQ_LENGTH, -1)
        current_seq = seq_scaled.copy()
        predictions_scaled = []

        for _ in range(7):
            pred_scaled = model.predict(current_seq, verbose=0)
            predictions_scaled.append(pred_scaled[0])
            # 다음 시퀀스 업데이트
            current_seq[0, -1, feature_cols.index('재고')] = pred_scaled[0][0]
            current_seq[0, -1, feature_cols.index('가용재고')] = pred_scaled[0][1]
            current_seq[0, -1, feature_cols.index('출고예정(B2C)')] = pred_scaled[0][2]
            current_seq = np.roll(current_seq, -1, axis=1)

        predictions = scaler_y.inverse_transform(np.array(predictions_scaled))
        predictions = np.round(predictions.astype(float), 2)
        predictions = [[float(v) for v in row] for row in predictions]

        results[sku_name_map[sku]] = predictions  # JSON 직렬화 위해 리스트로 변환
        
        
        
        
    output_rows = []

    for product_name, preds in results.items():
        for day_idx, pred in enumerate(preds, 1):
            output_rows.append({
                "상품명": product_name,
                "Day": day_idx,
                "재고": pred[0],
                "가용재고": pred[1],
                "재고예정": pred[2]
        })

    output_df = pd.DataFrame(output_rows)
    numeric_cols = ["재고", "가용재고", "재고예정"]
    output_df[numeric_cols] = output_df[numeric_cols].round(2)

        # ======================
        # 9️⃣ CSV / XLSX 저장
    csv_path = DOWNLOAD_PATH / f"{stored_filename}_prediction.csv"
    xlsx_path = DOWNLOAD_PATH / f"{stored_filename}_prediction.xlsx"

    output_df.to_csv(csv_path, index=False, encoding="utf-8-sig")
    output_df.to_excel(xlsx_path, index=False)

        # ======================
    return {
       "predictions": results,
        "csv_path": str(csv_path),
        "xlsx_path": str(xlsx_path)
    }
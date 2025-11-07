# # backend/app/embed_router.py
# import os
# from fastapi import APIRouter, UploadFile, File, Form, HTTPException
# from fastapi.responses import JSONResponse
# from pathlib import Path
# import pandas as pd
# import numpy as np
# import faiss
# import pickle
# from sentence_transformers import SentenceTransformer
# import openai
# from typing import List

# router = APIRouter(prefix="/embed", tags=["embed"])

# BASE_DIR = Path(__file__).resolve().parent
# UPLOAD_DIR = BASE_DIR / "uploads"
# VECTOR_DIR = BASE_DIR / "vector_store"
# UPLOAD_DIR.mkdir(exist_ok=True)
# VECTOR_DIR.mkdir(exist_ok=True)

# INDEX_PATH = VECTOR_DIR / "faiss_index.bin"
# META_PATH = VECTOR_DIR / "metadata.pkl"

# # 로컬 임베딩 모델 (가볍고 실무에서 널리 사용)
# EMBED_MODEL_NAME = os.environ.get("EMBED_MODEL_NAME", "all-MiniLM-L6-v2")
# EMBED_MODEL = SentenceTransformer(EMBED_MODEL_NAME)

# # OpenAI 설정 (LLM 응답용)
# OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
# if OPENAI_API_KEY:
#     openai.api_key = OPENAI_API_KEY


# def row_to_text(row: pd.Series) -> str:
#     """
#     CSV의 한 행을 검색용 텍스트로 변환합니다.
#     컬럼명:값 | 컬럼명:값 ... 형태로 만들면 검색 컨텍스트로 유용합니다.
#     """
#     parts = []
#     for col in row.index:
#         val = row[col]
#         if pd.isna(val):
#             val = ""
#         parts.append(f"{col}: {val}")
#     return " | ".join(parts)


# def _save_faiss_index(embeddings: np.ndarray):
#     dim = embeddings.shape[1]
#     index = faiss.IndexFlatL2(dim)
#     index.add(embeddings.astype("float32"))
#     faiss.write_index(index, str(INDEX_PATH))


# def _load_faiss_index():
#     if not INDEX_PATH.exists():
#         return None
#     return faiss.read_index(str(INDEX_PATH))


# @router.post("/upload")
# async def upload_and_embed(file: UploadFile = File(...)):
#     """
#     CSV 업로드 → 임베딩 생성 → FAISS 인덱스 + 메타데이터 저장
#     """
#     if not file.filename.lower().endswith(".csv"):
#         raise HTTPException(status_code=400, detail="CSV 파일만 지원합니다.")

#     # 파일 저장
#     save_path = UPLOAD_DIR / file.filename
#     contents = await file.read()
#     save_path.write_bytes(contents)

#     # CSV 읽기 (문자열로 읽어서 NaN -> "")
#     try:
#         df = pd.read_csv(save_path, dtype=str, encoding="utf-8").fillna("")
#     except Exception as e:
#         # fallback: try with python engine (for weird CSVs)
#         try:
#             df = pd.read_csv(save_path, dtype=str, engine="python", encoding="utf-8").fillna("")
#         except Exception as e2:
#             raise HTTPException(status_code=400, detail=f"CSV 파싱 실패: {e} / {e2}")

#     # 각 행을 텍스트로 변환
#     texts = [row_to_text(df.iloc[i]) for i in range(len(df))]

#     # 임베딩 생성 (batch)
#     embeddings = EMBED_MODEL.encode(texts, show_progress_bar=False, convert_to_numpy=True).astype("float32")

#     # 기존 인덱스가 있다면 덧붙이는 방식: (현재는 새로 덮어쓰기)
#     # - 간단하게 새 인덱스로 덮어쓰기 합니다. (원하면 append 로직 추가 가능)
#     _save_faiss_index(embeddings)

#     # 메타데이터 저장: 원본 행(딕셔너리) + 텍스트
#     metadata = {
#         "filename": file.filename,
#         "model_name": EMBED_MODEL_NAME,
#         "rows": [
#             {"index": i, "text": texts[i], "row": df.iloc[i].to_dict()}
#             for i in range(len(df))
#         ]
#     }
#     with open(META_PATH, "wb") as f:
#         pickle.dump(metadata, f)

#     return {"message": "임베딩 생성 완료", "rows": len(texts), "filename": file.filename}


# @router.post("/query")
# async def query_csv(question: str = Form(...), top_k: int = Form(3)):
#     """
#     질문을 받아 임베딩 검색 -> (optionally) OpenAI로 보내 최종 답변 생성 -> 반환
#     """
#     # 사전 조건 확인
#     if not INDEX_PATH.exists() or not META_PATH.exists():
#         return JSONResponse(status_code=400, content={"error": "임베딩이 없습니다. CSV를 먼저 업로드하세요."})

#     # 인덱스/메타 로드
#     index = faiss.read_index(str(INDEX_PATH))
#     with open(META_PATH, "rb") as f:
#         metadata = pickle.load(f)

#     # 질문 임베딩
#     q_emb = EMBED_MODEL.encode([question], convert_to_numpy=True).astype("float32")
#     D, I = index.search(q_emb, top_k)

#     matched = []
#     for idx in I[0]:
#         if idx < len(metadata["rows"]):
#             matched.append(metadata["rows"][idx])

#     # 검색 결과를 프롬프트에 넣음
#     context_text = "\n\n".join([f"Row {m['index']}: {m['text']}" for m in matched])

#     prompt = (
#         "당신은 재고 관리 전문 어시스턴트입니다. 아래 검색된 CSV 행들을 참고하여 "
#         "사용자의 질문에 응답하세요. 숫자(재고수/입고예정 등)가 있으면 명확히 언급하고, "
#         "권장 조치를 간결하게 제시하세요.\n\n"
#         f"=== 검색된 컨텍스트 ===\n{context_text}\n\n"
#         f"=== 사용자 질문 ===\n{question}\n\n"
#         "간결하고 실무적인 한국어로 답변하세요."
#     )

#     # OpenAI가 설정되어 있다면 LLM으로 답변 생성
#     if OPENAI_API_KEY:
#         try:
#             # ChatCompletion (v1) 호환; 사용중인 OpenAI 라이브러리 버전에 맞춰 조정하세요.
#             resp = openai.ChatCompletion.create(
#                 model="gpt-4o-mini",  # 필요 시 변경
#                 messages=[
#                     {"role": "system", "content": "너는 SmartStock 재고 분석 AI 어시스턴트야."},
#                     {"role": "user", "content": prompt},
#                 ],
#                 temperature=0.2,
#                 max_tokens=600,
#             )
#             answer = resp.choices[0].message["content"].strip()
#         except Exception as e:
#             # LLM 호출 실패할 경우 간단 요약 제공
#             answer = f"(LLM 호출 에러: {e})\n검색된 데이터 요약:\n{context_text[:2000]}"
#     else:
#         # API 키가 없다면 검색 결과를 그대로 요약해서 반환
#         answer = "OPENAI_API_KEY가 설정되어 있지 않습니다. 검색된 데이터:\n\n" + context_text

#     return {"answer": answer, "matches": matched}

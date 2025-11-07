from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI
import time
from collections import defaultdict

router = APIRouter()

# ✅ .env 파일에서 직접 읽기 (config.py를 거치지 않음)
from dotenv import load_dotenv
load_dotenv()

# OpenAI 클라이언트 초기화
try:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        print("⚠️ 경고: OPENAI_API_KEY가 설정되지 않았습니다.")
        client = None
    else:
        client = OpenAI(api_key=OPENAI_API_KEY)
        print("✅ OpenAI 클라이언트 초기화 성공")
except Exception as e:
    print(f"❌ OpenAI 클라이언트 초기화 실패: {e}")
    client = None

# Rate Limiting
rate_limit_store = defaultdict(list)
RATE_LIMIT = 50
TIME_WINDOW = 3600


# ========== Pydantic 모델 ==========
class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    temperature: Optional[float] = 0.3
    max_tokens: Optional[int] = 1000


class ChatResponse(BaseModel):
    success: bool
    response: str


# ========== Rate Limiting ==========
def check_rate_limit(client_ip: str) -> bool:
    """시간당 요청 제한 체크"""
    now = time.time()
    
    rate_limit_store[client_ip] = [
        timestamp for timestamp in rate_limit_store[client_ip]
        if now - timestamp < TIME_WINDOW
    ]
    
    if len(rate_limit_store[client_ip]) >= RATE_LIMIT:
        return False
    
    rate_limit_store[client_ip].append(now)
    return True


# ========== API 엔드포인트 ==========
@router.get("/health")
async def chatbot_health():
    """챗봇 서비스 헬스 체크"""
    if not OPENAI_API_KEY:
        return {
            "status": "error",
            "message": "OpenAI API 키가 설정되지 않았습니다.",
            "solution": ".env 파일에 OPENAI_API_KEY를 추가해주세요."
        }
    
    if not client:
        return {
            "status": "error",
            "message": "OpenAI 클라이언트 초기화 실패"
        }
    
    return {
        "status": "ok",
        "message": "챗봇 서비스가 정상 작동 중입니다.",
        "model": "gpt-4o-mini",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "api_key_configured": "✅" if OPENAI_API_KEY else "❌"
    }


@router.post("/chat", response_model=ChatResponse)
async def chat_completion(request: ChatRequest, req: Request):
    """
    AI 챗봇 응답 생성
    
    - **messages**: 대화 메시지 리스트
    - **temperature**: 응답 창의성 (0.0 ~ 2.0)
    - **max_tokens**: 최대 토큰 수
    """
    try:
        # OpenAI 클라이언트 확인
        if not client or not OPENAI_API_KEY:
            raise HTTPException(
                status_code=500,
                detail="OpenAI API 키가 설정되지 않았습니다. .env 파일을 확인해주세요."
            )
        
        # 클라이언트 IP
        client_ip = req.client.host if req.client else "unknown"
        
        # Rate Limiting
        if not check_rate_limit(client_ip):
            raise HTTPException(
                status_code=429,
                detail="요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
            )
        
        # 메시지 검증
        if not request.messages:
            raise HTTPException(
                status_code=400,
                detail="최소 하나 이상의 메시지가 필요합니다."
            )
        
        # 메시지 형식 변환
        messages = [
            {"role": msg.role, "content": msg.content} 
            for msg in request.messages
        ]
        
        # OpenAI API 호출
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        response_content = completion.choices[0].message.content
        
        return ChatResponse(
            success=True,
            response=response_content
        )
    
    except HTTPException:
        raise
    
    except Exception as e:
        error_message = str(e)
        
        if "rate_limit" in error_message.lower():
            raise HTTPException(
                status_code=429, 
                detail="OpenAI API 사용량 한도 초과"
            )
        elif "authentication" in error_message.lower() or "api_key" in error_message.lower():
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API 인증 오류. API 키를 확인해주세요."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"AI 응답 생성 중 오류: {error_message}"
            )


@router.get("/rate-limit-status")
async def get_rate_limit_status(req: Request):
    """Rate limit 상태 확인"""
    client_ip = req.client.host if req.client else "unknown"
    now = time.time()
    
    recent_requests = [
        timestamp for timestamp in rate_limit_store.get(client_ip, [])
        if now - timestamp < TIME_WINDOW
    ]
    
    remaining = max(0, RATE_LIMIT - len(recent_requests))
    
    return {
        "client_ip": client_ip,
        "requests_made": len(recent_requests),
        "rate_limit": RATE_LIMIT,
        "remaining": remaining,
        "time_window_seconds": TIME_WINDOW
    }
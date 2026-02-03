import pdfplumber
import os
import re

def clean_val(val):
    if not val: return ""
    return re.sub(r'[^\d]', '', str(val))

def extract_tax_info(pdf_path):
    info = {
        "품목명": "",
        "사업자번호": "",
        "작성일자": "",
        "공급자": "",
        "공급업체": "100940", # 기본 벤더코드
        "공급가액": "",
        "적요 입력": "",
        "제목": "",
        "붙임": "1. 세금계산서 1부\n2. 기안문서 1부 외",
        "세금계산서 파일명": os.path.splitext(os.path.basename(pdf_path))[0],
        "파일첨부": os.path.basename(pdf_path),
        "문서번호": "2025-0581" # 예시 번호
    }
    
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        text = page.extract_text()
        tables = page.extract_tables()
        
        # 1. 사업자번호 (공급자)
        biz_match = re.search(r'(\d{3}-\d{2}-\d{5})', text)
        if biz_match: info["사업자번호"] = biz_match.group(1)
            
        # 2. 공급자명
        name_match = re.search(r'상\s*호\s*\(?.*?\)?[^A-Za-z0-9가-힣]+([A-Za-z0-9가-힣]+솔루션|[A-Za-z0-9가-힣]+컴퓨터|[A-Za-z0-9가-힣]+시스템)', text)
        if name_match: 
            info["공급자"] = name_match.group(1).strip()
        else:
            if "잇츠비솔루션" in text: info["공급자"] = "(주)잇츠비솔루션"

        # 3. 작성일자 및 공급가액 (테이블에서 찾기)
        for table in tables:
            for row in table:
                row_str = " ".join([str(cell) for cell in row if cell])
                # 작성일자 패턴
                d_m = re.search(r'(\d{4})[년/\s.]+(\d{1,2})[월/\s.]+(\d{1,2})', row_str)
                if d_m and not info["작성일자"]:
                    info["작성일자"] = f"{d_m.group(1)}-{d_m.group(2).zfill(2)}-{d_m.group(3).zfill(2)}"
                
                # 공급가액 패턴 (숫자가 큰 것 위주)
                if "액" in row_str or "가액" in row_str:
                    nums = re.findall(r'[\d,]{5,}', row_str)
                    if nums and not info["공급가액"]:
                        info["공급가액"] = nums[0].replace(",", "")

        # 4. 품목명 (수동 매핑 및 파일명 활용)
        fname = info["세금계산서 파일명"]
        if "IPS" in fname: info["품목명"] = "Twayair IPS 유지보수"
        elif "관제" in fname: info["품목명"] = "원격보안관제 서비스"
        elif "웹방화벽(Cloud)" in fname: info["품목명"] = "웹방화벽(Cloud) 유지보수"
        elif "웹방화벽(IDC)" in fname: info["품목명"] = "웹방화벽(IDC) 유지보수"
        
        if not info["품목명"]:
            # 텍스트에서 품목 추출 시도
            lines = text.split('\n')
            for line in lines:
                if "유지보수" in line or "서비스" in line:
                    info["품목명"] = line.strip()
                    break

        # 제목 및 적요
        month_str = info["작성일자"][5:7] if len(info["작성일자"]) > 7 else "01"
        info["제목"] = f"{info['품목명']} ({info['작성일자'][:4]}년 {month_str}월)"
        info["적요 입력"] = f"{info['품목명']} 비용 ({month_str}월분)"

    return info

pdf_dir = r"c:\Users\twayair\Desktop\Antigravity\segm\202601"
print(f"품목명 | 사업자번호 | 작성일자 | 공급자 | 공급업체 | 공급가액 | 적요 입력 | 제목 | 붙임 | 세금계산서 파일명 | 파일첨부 | 문서번호")

for filename in os.listdir(pdf_dir):
    if filename.endswith(".pdf"):
        path = os.path.join(pdf_dir, filename)
        data = extract_tax_info(path)
        line = f"{data['품목명']} | {data['사업자번호']} | {data['작성일자']} | {data['공급자']} | {data['공급업체']} | {data['공급가액']} | {data['적요 입력']} | {data['제목']} | {data['붙임'].replace('\n', ' ')} | {data['세금계산서 파일명']} | {data['파일첨부']} | {data['문서번호']}"
        print(line)

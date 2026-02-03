import asyncio
import pyperclip
import time
import re
import json
from playwright.async_api import async_playwright

# [TIS Portal 보안 수칙 적용] 사람처럼 보이기 위한 붙여넣기 기능
async def human_paste(page, selector, text, mask=False):
    """
    텍스트를 직접 타이핑하지 않고 클립보드에 복사한 뒤 Ctrl+V로 붙여넣습니다.
    mask=True 설정 시 로그에 실제 텍스트가 표시되지 않습니다.
    """
    pyperclip.copy(text)
    await page.focus(selector)
    await asyncio.sleep(0.5)
    await page.keyboard.press("Control+V")
    await asyncio.sleep(0.5)
    
    log_text = "*" * len(text) if mask else text
    print(f"   - '{log_text}' 값을 붙여넣기 완료했습니다.")

async def run_automation():
    async with async_playwright() as p:
        # 가시 모드로 브라우저 실행
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()

        try:
            # 1. 로그인 페이지 접속
            print("1. 그룹웨어 로그인 페이지 접속 중...")
            await page.goto("https://gw.twayair.com/LoginInfo/", wait_until="networkidle")
            
            # 아이디(smkim6) 및 비밀번호 입력
            print("   - 계정 및 비밀번호 입력 중...")
            await page.wait_for_selector("#txtID", timeout=15000)
            await human_paste(page, "#txtID", "smkim6")
            
            await page.wait_for_selector("#txtPW", timeout=15000)
            await human_paste(page, "#txtPW", "Twayair123!@#", mask=True)

            # 로그인 버튼 클릭
            print("   - 로그인 버튼 클릭 중...")
            await page.click("#btnLogin")
            await asyncio.sleep(1.5)
            
            # 메인 페이지 진입 확인
            print("   - 로그인을 완료해 주세요. (GWIndex 페이지 대기...)")
            try:
                await page.wait_for_url("**/GWIndex/**", timeout=120000)
                print("   - 로그인 완료 확인! (메인 페이지 진입)")
                await asyncio.sleep(2.0)
            except Exception as e:
                print(f"   ⚠️ 대기 중 오류 발생 (무시하고 진행): {e}")

            # 2. ERP 전자결재 메뉴 이동
            print("2. 'ERP전자결재' 메뉴를 찾아 클릭합니다.")
            main_frame_locator = page.frame_locator("frame#con")
            erp_menu_selector = ".nav ul.list li.menu a:has-text('ERP전자결재')"
            
            try:
                await main_frame_locator.locator(erp_menu_selector).wait_for(state="attached", timeout=30000)
                await main_frame_locator.locator(erp_menu_selector).click()
                print("   - 'ERP전자결재' 메뉴 클릭 성공!")
                await asyncio.sleep(2.0)
            except Exception as e:
                print(f"   ⚠️ 'ERP전자결재' 메뉴를 찾지 못했습니다.")

            # 3. 시스템 팝업창 '확인' 버튼 클릭
            print("3. 시스템 팝업창 '확인' 버튼을 클릭합니다.")
            confirm_selector = ".ui-dialog-buttonset button:has-text('확인')"
            
            try:
                confirm_btn = main_frame_locator.locator(confirm_selector)
                await confirm_btn.wait_for(state="attached", timeout=10000)
                await confirm_btn.click()
                print("   - '확인' 버튼 클릭 성공!")
                await asyncio.sleep(5.0)
            except:
                print("   - '확인' 버튼이 보이지 않습니다. (이미 처리되었거나 없음)")

            # 4. 왼쪽 메뉴에서 '일반경비 전표생성'을 클릭
            print("4. 왼쪽 메뉴에서 '일반경비 전표생성'을 클릭합니다.")
            
            menu_frame = None
            for f in page.frames:
                if f.name == "fraLeftMenu" or "LeftMenu.aspx" in f.url:
                    menu_frame = f
                    break
            
            try:
                if menu_frame:
                    print(f"   - '{menu_frame.name}' 프레임에서 메뉴 탐색 중...")
                    # 재무회계 폴더 클릭
                    finance_folder = menu_frame.locator("#NODE3_0_anchor, a:has-text('재무회계')").first
                    await finance_folder.wait_for(state="attached", timeout=15000)
                    await finance_folder.click(force=True)
                    print("   - [Step 1] '재무회계' 폴더 확장 완료")
                    await asyncio.sleep(5.0)

                    # 일반경비 전표생성 클릭
                    target_btn = menu_frame.locator("#NODE3_1_anchor, a:has-text('일반경비 전표생성')").first
                    await target_btn.wait_for(state="attached", timeout=15000)
                    await target_btn.click(force=True)
                    print("   - [Step 2] '일반경비 전표생성' 메뉴 클릭 성공!")
                else:
                    print("   ⚠️ 메뉴 프레임을 찾을 수 없습니다.")
            except Exception as e:
                print(f"   ⚠️ 메뉴 클릭 중 오류: {e}")

            # 5. ERP 시스템 내 '증빙가져오기' 클릭
            print("5. ERP 시스템 내 '증빙가져오기' 단계를 수행합니다.")
            
            # data.json 정보 로드
            try:
                with open("data.json", "r", encoding="utf-8") as f:
                    invoice_data = json.load(f)
                print(f"   - data.json 로드 완료 (총 {len(invoice_data)}건의 데이터)")
            except Exception as e:
                print(f"   ⚠️ data.json 로드 실패: {e}")
                invoice_data = []

            try:
                print("   - ERP 화면 로딩 대기 (5초)...")
                await asyncio.sleep(5)
                
                print("   - 모든 페이지(탭)와 프레임에서 '증빙가져오기' 버튼 검색 시작...")
                found_evidence = False
                
                # 모든 열려있는 탭/창을 확인
                all_pages = context.pages
                print(f"   - 현재 열린 탭 개수: {len(all_pages)}개")
                
                for p_idx, p_obj in enumerate(all_pages):
                    for f_idx, frame in enumerate(p_obj.frames):
                        try:
                            # '증빙가져오기' 검색
                            locators = [
                                frame.locator("a:has-text('증빙가져오기')"),
                                frame.locator("button:has-text('증빙가져오기')"),
                                frame.locator("span:has-text('증빙가져오기')")
                            ]
                            for loc in locators:
                                if await loc.count() > 0:
                                    print(f"     ✅ 버튼 발견! [{frame.name or 'Frame-'+str(f_idx)}] 프레임")
                                    await loc.first.scroll_into_view_if_needed()
                                    await loc.first.click(force=True)
                                    found_evidence = True
                                    print("     🚀 '증빙가져오기' 클릭 완료!")
                                    break
                            if found_evidence: break
                        except:
                            continue
                    if found_evidence: break
                
                if found_evidence:
                    # 6. 증빙 팝업 내 데이터 입력 및 조회
                    print("6. 증빙 팝업 내 데이터를 입력하고 조회합니다.")
                    try:
                        # 팝업이 뜨는 시간을 위해 대기
                        print("   - 팝업 창이 로드될 때까지 대기 중 (5초)...")
                        await asyncio.sleep(5.0)
                        
                        target_popup = None
                        target_frame = None
                        
                        # 팝업 창 찾기 (공급업체 입력칸이 있는 창)
                        for p_obj in context.pages:
                            for frame in p_obj.frames:
                                try:
                                    # 공급업체 입력 필드(WD016A) 존재 여부 확인
                                    input_selector = "#WD016A, input[name='WD016A']"
                                    if await frame.locator(input_selector).count() > 0:
                                        target_popup = p_obj
                                        target_frame = frame
                                        print(f"     ✅ 증빙 팝업 및 프레임 발견! (프레임 명: {frame.name or 'ID미지정'})")
                                        break
                                except: continue
                            if target_frame: break

                        if target_frame and invoice_data:
                            # 첫 번째 데이터(잇츠비솔루션 등)로 테스트 진행
                            target_item = invoice_data[0]
                            vendor_code = target_item.get("공급업체", "100940")
                            
                            print(f"   - [작업 1] 공급업체 코드({vendor_code}) 입력 중...")
                            # 1. 공급업체 코드 입력 후 엔터
                            await target_frame.locator("#WD016A").fill(vendor_code)
                            await target_frame.locator("#WD016A").press("Enter")
                            await asyncio.sleep(1.0)
                            
                            print("   - [작업 2] '전체조회' 버튼 클릭 중...")
                            # 2. 전체조회 클릭 (WD0181)
                            search_btn = target_frame.locator("#WD0181, a:has-text('전체조회'), span:has-text('전체조회')").first
                            await search_btn.click(force=True)
                            await asyncio.sleep(2.0)
                            
                            print("   - [작업 3] 증빙리스트에서 첫 번째 항목 선택 중...")
                            # 3. 증빙리스트에서 첫 번째 체크박스(#WD01BC) 선택
                            # 'Element is outside of the viewport' 오류 해결을 위해 JS에서 직접 클릭을 실행합니다.
                            checkbox = target_frame.locator("#WD01BC, input[name='WD01BC'], span[role='checkbox']").first
                            if await checkbox.count() > 0:
                                # evaluate는 뷰포트(화면 범위) 밖의 요소도 직접 조작할 수 있게 해줍니다.
                                await checkbox.evaluate("el => el.click()")
                                print("     ✅ 첫 번째 증빙 항목 선택 완료! (JS Click 적용)")
                            else:
                                print("     ⚠️ 체크박스(#WD01BC)를 찾을 수 없습니다.")
                            
                            await asyncio.sleep(2.0)
                            
                            print("   - [작업 4] '선택' 버튼 클릭 중...")
                            # 4. '선택' 버튼(#WD015B) 클릭하여 ERP로 전달
                            select_confirm_btn = target_frame.locator("#WD015B, a:has-text('선택')").first
                            if await select_confirm_btn.count() > 0:
                                # 버튼 역시 안전하게 JS 클릭 방식을 사용합니다.
                                await select_confirm_btn.evaluate("el => el.click()")
                                print("     🚀 '선택' 확인 버튼 클릭 완료! (ID: WD015B)")
                            else:
                                print("     ⚠️ '선택' 버튼(#WD015B)을 찾지 못했습니다.")
                        else:
                            print("   ⚠️ 증빙 팝업 프레임을 찾지 못했거나 입력할 데이터가 없습니다.")
                    except Exception as e:
                        print(f"   ⚠️ 팝업 작업 중 오류 발생: {e}")
                else:
                    print("   ⚠️ '증빙가져오기' 버튼을 찾지 못했습니다.")

            except Exception as e:
                print(f"   ⚠️ '증빙가져오기' 단계 오류: {e}")

            print("\n모든 자동화 로직이 완료되었습니다! ✅")
            await asyncio.sleep(30)

        except Exception as e:
            print(f"\n❌ 전역 오류 발생: {e}")
            await asyncio.sleep(10)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run_automation())

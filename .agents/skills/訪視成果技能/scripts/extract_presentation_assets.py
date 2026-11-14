#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
簡報多媒體素材抽取腳本 (Extract Presentation Assets)
用途：
1. 從 PPTX 簡報中提取所有內嵌的高解析度活動相片至 doc_media/
2. 自動利用 Windows PowerPoint COM 或 pypdfium2/pdf2image 將每一張投影片匯出為 slides_img/slide_XX.png
"""

import os
import sys
import zipfile
import shutil

def extract_embedded_media_from_pptx(pptx_path, output_dir="doc_media"):
    """
    PPTX 本質是 ZIP 封裝，內部的 ppt/media/ 資料夾存放所有原始照片
    """
    if not os.path.exists(pptx_path):
        print(f"[ERROR] 找不到簡報檔: {pptx_path}")
        return []

    os.makedirs(output_dir, exist_ok=True)
    extracted_files = []

    with zipfile.ZipFile(pptx_path, 'r') as z:
        for filename in z.namelist():
            if filename.startswith('ppt/media/'):
                base_name = os.path.basename(filename)
                if not base_name:
                    continue
                target_path = os.path.join(output_dir, base_name)
                with z.open(filename) as source, open(target_path, "wb") as target:
                    shutil.copyfileobj(source, target)
                extracted_files.append(target_path)

    print(f"[INFO] 成功從 {pptx_path} 提取 {len(extracted_files)} 張原始活動相片至 {output_dir}/")
    return extracted_files

def export_slides_via_powerpoint(pptx_abs_path, output_dir="slides_img"):
    """
    在 Windows 環境下使用 win32com 呼叫本機 PowerPoint 批次匯出高品質 PNG
    """
    try:
        import win32com.client
    except ImportError:
        print("[WARNING] 未安裝 pywin32，跳過 PowerPoint COM 自動匯出")
        return False

    os.makedirs(output_dir, exist_ok=True)
    powerpoint = win32com.client.Dispatch("PowerPoint.Application")
    presentation = powerpoint.Presentations.Open(pptx_abs_path, WithWindow=False)

    total_slides = presentation.Slides.Count
    print(f"[INFO] 正在匯出 {total_slides} 張投影片至 {output_dir}/ ...")

    for i in range(1, total_slides + 1):
        slide = presentation.Slides(i)
        out_name = f"slide_{i:02d}.png"
        out_path = os.path.abspath(os.path.join(output_dir, out_name))
        slide.Export(out_path, "PNG", 1920, 1080)

    presentation.Close()
    powerpoint.Quit()
    print(f"[SUCCESS] 全數 {total_slides} 張投影片匯出完成！")
    return True

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python extract_presentation_assets.py <presentation.pptx>")
        sys.exit(1)

    pptx_file = os.path.abspath(sys.argv[1])
    extract_embedded_media_from_pptx(pptx_file)
    export_slides_via_powerpoint(pptx_file)

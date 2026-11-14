#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
二維條碼產製腳本 (Generate Showcase QR Codes)
用途：
產製官方完整網址與極簡縮網址的雙軌高解析度 QR Code (500x500 PNG)
優先使用本機 qrcode 模組，若無則自動使用可靠的 QR API 取得圖片。
"""

import sys
import os
import urllib.parse
import urllib.request

def generate_qr(text, output_file, size=500):
    try:
        import qrcode
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=2,
        )
        qr.add_data(text)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img = img.resize((size, size))
        img.save(output_file)
        print(f"[SUCCESS] (local qrcode) 產製成功: {output_file} -> {text}")
        return True
    except ImportError:
        pass

    # Fallback to standard web API
    encoded = urllib.parse.quote(text)
    url = f"https://api.qrserver.com/v1/create-qr-code/?size={size}x{size}&margin=10&data={encoded}"
    print(f"[INFO] 透過 API 下載高清 QR Code: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp, open(output_file, 'wb') as f:
            f.write(resp.read())
        print(f"[SUCCESS] (API fallback) 產製成功: {output_file} -> {text}")
        return True
    except Exception as e:
        print(f"[ERROR] 產製失敗: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python generate_qrcodes_api.py <URL> <output.png> [size]")
        sys.exit(1)

    target_url = sys.argv[1]
    out_img = sys.argv[2]
    sz = int(sys.argv[3]) if len(sys.argv) > 3 else 500
    generate_qr(target_url, out_img, sz)

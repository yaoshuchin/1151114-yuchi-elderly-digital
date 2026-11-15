# -*- coding: utf-8 -*-
"""
Antigravity 全機技能一鍵備份工具 (Universal Skills Backup Script)
用途：自動將全域自訂技能與工作區專案技能打包為帶有時間戳記的 UTF-8 壓縮檔。
"""

import os
import sys
import zipfile
import datetime

# 避免 Windows 繁體中文終端機 cp950 編碼錯誤
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

def backup_skills(target_output_dir="C:/antigravity"):
    os.makedirs(target_output_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    zip_path = os.path.join(target_output_dir, f"Antigravity_Skills_Backup_{timestamp}.zip")

    # 待備份的技能路徑清單
    user_home = os.path.expanduser("~")
    backup_sources = [
        ("全域自訂技能 (Global)", os.path.join(user_home, ".gemini", "config", "skills")),
        ("當前工作區技能 (Workspace)", os.path.abspath(os.path.join(".agents", "skills"))),
        ("內建技能備份 (Builtin)", os.path.join(user_home, ".gemini", "antigravity", "builtin", "skills"))
    ]

    total_files = 0
    print("=" * 60)
    print(">> 開始執行 Antigravity 技能全機備份...")
    print("=" * 60)

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for label, source_dir in backup_sources:
            if not os.path.exists(source_dir):
                print(f"[-] 跳過不存在的路徑 [{label}]: {source_dir}")
                continue

            folder_name = os.path.basename(source_dir)
            parent_tag = "global_skills" if "config" in source_dir else ("workspace_skills" if ".agents" in source_dir else "builtin_skills")
            count = 0

            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    full_file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_file_path, source_dir)
                    arc_name = os.path.join(parent_tag, rel_path)

                    # 啟用 UTF-8 標記避免 Windows / 跨平臺中文檔名亂碼
                    zinfo = zipfile.ZipInfo(arc_name, datetime.datetime.now().timetuple()[:6])
                    zinfo.compress_type = zipfile.ZIP_DEFLATED
                    zinfo.flag_bits |= 0x800  # UTF-8 flag

                    with open(full_file_path, "rb") as f_in:
                        zf.writestr(zinfo, f_in.read())
                    count += 1
                    total_files += 1

            print(f"[+] 已備份 [{label}]: {count} 個檔案 ({source_dir})")

    file_size_kb = os.path.getsize(zip_path) / 1024
    print("=" * 60)
    print("[V] 備份成功完成！")
    print(f">> 壓縮檔位置: {zip_path}")
    print(f">> 檔案總數: {total_files} 個檔案 | 大小: {file_size_kb:.1f} KB")
    print("=" * 60)
    return zip_path

if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "C:/antigravity"
    backup_skills(out_dir)

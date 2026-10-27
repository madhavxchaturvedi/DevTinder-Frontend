import os
import struct
import zlib
from PIL import Image
import xml.etree.ElementTree as ET

def run_tests():
    print("=== Starting Assets Empirical Verification (Binary, Pixel & XML) ===\n")
    tests_passed = 0
    tests_failed = 0

    def assert_eq(actual, expected, message):
        nonlocal tests_passed, tests_failed
        if actual == expected:
            tests_passed += 1
            print(f"✅ PASS: {message} (expected={expected}, actual={actual})")
        else:
            tests_failed += 1
            print(f"❌ FAIL: {message} (expected={expected}, actual={actual})")
            raise AssertionError(f"{message}: expected {expected}, got {actual}")

    def assert_true(cond, message):
        nonlocal tests_passed, tests_failed
        if cond:
            tests_passed += 1
            print(f"✅ PASS: {message}")
        else:
            tests_failed += 1
            print(f"❌ FAIL: {message}")
            raise AssertionError(f"{message}")

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(base_dir, "public")

    # --- TEST 1: Binary Header of favicon-32.png ---
    fav32_path = os.path.join(public_dir, "favicon-32.png")
    assert_true(os.path.exists(fav32_path), "favicon-32.png exists")

    with open(fav32_path, "rb") as f:
        fav32_data = f.read()

    # PNG Signature: \x89PNG\r\n\x1a\n
    assert_eq(fav32_data[:8], b"\x89PNG\r\n\x1a\n", "favicon-32.png PNG magic signature")

    # IHDR Chunk Length (13 bytes)
    ihdr_len = struct.unpack(">I", fav32_data[8:12])[0]
    assert_eq(ihdr_len, 13, "favicon-32.png IHDR chunk length is 13")
    assert_eq(fav32_data[12:16], b"IHDR", "favicon-32.png IHDR chunk identifier")

    # Width and Height (32-bit big-endian unsigned integers)
    w_32, h_32, bit_depth_32, color_type_32, comp_32, filt_32, inter_32 = struct.unpack(">IIBBBBB", fav32_data[16:29])
    assert_eq(w_32, 32, "favicon-32.png binary header width is exactly 32")
    assert_eq(h_32, 32, "favicon-32.png binary header height is exactly 32")
    assert_eq(bit_depth_32, 8, "favicon-32.png bit depth is 8")
    assert_eq(color_type_32, 6, "favicon-32.png color type is 6 (RGBA)")

    # Verify IHDR CRC32
    ihdr_crc = struct.unpack(">I", fav32_data[29:33])[0]
    expected_crc = zlib.crc32(fav32_data[12:29]) & 0xffffffff
    assert_eq(ihdr_crc, expected_crc, "favicon-32.png IHDR CRC32 valid")

    # --- TEST 2: Pixel Inspection of favicon-32.png ---
    img_32 = Image.open(fav32_path)
    assert_eq(img_32.size, (32, 32), "PIL image size is 32x32")
    assert_eq(img_32.mode, "RGBA", "PIL image mode is RGBA")

    # Check 4 corner pixels for squircle transparency (alpha == 0)
    corners_32 = [(0, 0), (31, 0), (0, 31), (31, 31)]
    for pt in corners_32:
        pixel = img_32.getpixel(pt)
        assert_eq(pixel[3], 0, f"favicon-32 corner {pt} is transparent (alpha=0, pixel={pixel})")

    # Also check nearby corner pixels (1, 0), (0, 1)
    sub_corners_32 = [(1, 0), (0, 1), (30, 0), (31, 1), (0, 30), (1, 31), (30, 31), (31, 30)]
    for pt in sub_corners_32:
        pixel = img_32.getpixel(pt)
        assert_eq(pixel[3], 0, f"favicon-32 sub-corner {pt} is transparent (alpha=0, pixel={pixel})")

    # Check inner pixels: center should be opaque
    center_pixel_32 = img_32.getpixel((16, 16))
    assert_true(center_pixel_32[3] > 0, f"favicon-32 center pixel is visible (alpha={center_pixel_32[3]})")


    # --- TEST 3: Binary Header of apple-touch-icon.png ---
    ati_path = os.path.join(public_dir, "apple-touch-icon.png")
    assert_true(os.path.exists(ati_path), "apple-touch-icon.png exists")

    with open(ati_path, "rb") as f:
        ati_data = f.read()

    # PNG Signature: \x89PNG\r\n\x1a\n
    assert_eq(ati_data[:8], b"\x89PNG\r\n\x1a\n", "apple-touch-icon.png PNG magic signature")

    # IHDR Chunk Length
    ihdr_len_ati = struct.unpack(">I", ati_data[8:12])[0]
    assert_eq(ihdr_len_ati, 13, "apple-touch-icon.png IHDR chunk length is 13")
    assert_eq(ati_data[12:16], b"IHDR", "apple-touch-icon.png IHDR chunk identifier")

    # Width and Height
    w_ati, h_ati, bit_depth_ati, color_type_ati, comp_ati, filt_ati, inter_ati = struct.unpack(">IIBBBBB", ati_data[16:29])
    assert_eq(w_ati, 180, "apple-touch-icon.png binary header width is exactly 180")
    assert_eq(h_ati, 180, "apple-touch-icon.png binary header height is exactly 180")
    assert_eq(bit_depth_ati, 8, "apple-touch-icon.png bit depth is 8")
    assert_eq(color_type_ati, 6, "apple-touch-icon.png color type is 6 (RGBA)")

    # Verify IHDR CRC32
    ihdr_crc_ati = struct.unpack(">I", ati_data[29:33])[0]
    expected_crc_ati = zlib.crc32(ati_data[12:29]) & 0xffffffff
    assert_eq(ihdr_crc_ati, expected_crc_ati, "apple-touch-icon.png IHDR CRC32 valid")

    # --- TEST 4: Pixel Inspection of apple-touch-icon.png ---
    img_ati = Image.open(ati_path)
    assert_eq(img_ati.size, (180, 180), "PIL image size is 180x180")
    assert_eq(img_ati.mode, "RGBA", "PIL image mode is RGBA")

    # Check 4 corner pixels for squircle transparency (alpha == 0)
    corners_ati = [(0, 0), (179, 0), (0, 179), (179, 179)]
    for pt in corners_ati:
        pixel = img_ati.getpixel(pt)
        assert_eq(pixel[3], 0, f"apple-touch-icon corner {pt} is transparent (alpha=0, pixel={pixel})")

    # Check squircle border curvature: points (5, 5), (174, 5) etc. should also be transparent due to rx=15 on 64px scale (which scales to ~42px radius on 180px)
    curv_pts = [(5, 5), (174, 5), (5, 174), (174, 174)]
    for pt in curv_pts:
        pixel = img_ati.getpixel(pt)
        assert_eq(pixel[3], 0, f"apple-touch-icon squircle radius corner {pt} is transparent (alpha=0, pixel={pixel})")

    # Check inner pixels: center and inner squircle should be opaque (alpha == 255)
    inner_pt = (90, 90)
    pixel_inner = img_ati.getpixel(inner_pt)
    assert_eq(pixel_inner[3], 255, f"apple-touch-icon inner pixel {inner_pt} is fully opaque (alpha=255)")


    # --- TEST 5: favicon.svg XML Syntax & Validity ---
    fav_svg_path = os.path.join(public_dir, "favicon.svg")
    assert_true(os.path.exists(fav_svg_path), "favicon.svg exists")

    with open(fav_svg_path, "r", encoding="utf-8") as f:
        svg_content = f.read()

    # XML Parsing
    try:
        root = ET.fromstring(svg_content)
        assert_true(True, "favicon.svg parsed successfully with xml.etree.ElementTree (valid XML)")
    except Exception as e:
        assert_true(False, f"favicon.svg XML parsing failed: {e}")

    # Root tag: <svg> (namespace might be present or stripped)
    tag_clean = root.tag.split("}")[-1] if "}" in root.tag else root.tag
    assert_eq(tag_clean, "svg", "Root element tag is svg")
    assert_eq(root.attrib.get("viewBox"), "0 0 64 64", 'Root viewBox is "0 0 64 64"')
    assert_eq(root.attrib.get("role"), "img", 'Root role is "img"')
    assert_eq(root.attrib.get("aria-label"), "OctoPair", 'Root aria-label is "OctoPair"')

    # Children elements
    children = list(root)
    assert_eq(len(children), 2, "Root svg has 2 direct children: rect and g")

    # Rect element
    rect = children[0]
    rect_tag = rect.tag.split("}")[-1] if "}" in rect.tag else rect.tag
    assert_eq(rect_tag, "rect", "First child is <rect>")
    assert_eq(rect.attrib.get("width"), "64", 'rect width="64"')
    assert_eq(rect.attrib.get("height"), "64", 'rect height="64"')
    assert_eq(rect.attrib.get("rx"), "15", 'rect rx="15" (squircle corner radius)')
    assert_eq(rect.attrib.get("fill"), "#ccff00", 'rect fill="#ccff00" (lime accent)')

    # Group element
    g = children[1]
    g_tag = g.tag.split("}")[-1] if "}" in g.tag else g.tag
    assert_eq(g_tag, "g", "Second child is <g>")
    assert_eq(g.attrib.get("transform"), "translate(8.9 6.9) scale(.72)", "g transform is translate(8.9 6.9) scale(.72)")
    assert_eq(g.attrib.get("fill"), "none", 'g fill="none"')
    assert_eq(g.attrib.get("stroke"), "#0a0a0a", 'g stroke="#0a0a0a" (dark mark on lime tile)')
    assert_eq(g.attrib.get("stroke-width"), "7.5", 'g stroke-width="7.5"')
    assert_eq(g.attrib.get("stroke-linecap"), "round", 'g stroke-linecap="round"')
    assert_eq(g.attrib.get("stroke-linejoin"), "round", 'g stroke-linejoin="round"')

    # G children (2 circles and 1 tentacle path)
    g_children = list(g)
    assert_eq(len(g_children), 3, "<g> has 3 children: 2 circles and 1 path")
    
    c1 = g_children[0]
    c1_tag = c1.tag.split("}")[-1] if "}" in c1.tag else c1.tag
    assert_eq(c1_tag, "circle", "g child 1 is circle")
    assert_eq(c1.attrib.get("cx"), "24", 'circle 1 cx="24"')
    assert_eq(c1.attrib.get("cy"), "28", 'circle 1 cy="28"')
    assert_eq(c1.attrib.get("r"), "14", 'circle 1 r="14"')

    c2 = g_children[1]
    c2_tag = c2.tag.split("}")[-1] if "}" in c2.tag else c2.tag
    assert_eq(c2_tag, "circle", "g child 2 is circle")
    assert_eq(c2.attrib.get("cx"), "40", 'circle 2 cx="40"')
    assert_eq(c2.attrib.get("cy"), "28", 'circle 2 cy="28"')
    assert_eq(c2.attrib.get("r"), "14", 'circle 2 r="14"')

    p = g_children[2]
    p_tag = p.tag.split("}")[-1] if "}" in p.tag else p.tag
    assert_eq(p_tag, "path", "g child 3 is path")
    assert_eq(p.attrib.get("d"), "M 40 42 v 5.5 c 0 6 6 10 12 7.5 c 2.5 -1.2 3.2 -4 0 -4.5", "tentacle path d coordinates")
    assert_eq(p.attrib.get("stroke-width"), "6", 'tentacle stroke-width="6"')

    # Ensure no drop-shadow or filters
    assert_true("<filter" not in svg_content, "favicon.svg contains no <filter>")
    assert_true("drop-shadow" not in svg_content, "favicon.svg contains no drop-shadow")


    # --- TEST 6: Obsolete Asset Cleanup ---
    vite_svg_path = os.path.join(public_dir, "vite.svg")
    assert_true(not os.path.exists(vite_svg_path), "vite.svg is deleted and does not exist")


    # --- TEST 7: index.html Head & Tags Verification ---
    index_html_path = os.path.join(base_dir, "index.html")
    with open(index_html_path, "r", encoding="utf-8") as f:
        html_src = f.read()

    assert_true("vite.svg" not in html_src, "index.html has zero references to vite.svg")
    assert_true('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />' in html_src, 'index.html has /favicon.svg link')
    assert_true('<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />' in html_src, 'index.html has /favicon-32.png link')
    assert_true('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />' in html_src, 'index.html has /apple-touch-icon.png link')
    assert_true('<meta name="theme-color" content="#0a0a0a" />' in html_src, 'index.html has theme-color meta tag')
    assert_true('<title>OctoPair — Collaborative Developer IDE & Pair Programming</title>' in html_src, 'index.html has updated title')

    # Dual-key auth redirect check in <head>
    assert_true("octopair_auth_hint" in html_src, "index.html checks octopair_auth_hint")
    assert_true("devtinder_auth_hint" in html_src, "index.html checks devtinder_auth_hint")
    assert_true("octopair_auth" in html_src, "index.html checks octopair_auth")
    assert_true("devtinder_auth" in html_src, "index.html checks devtinder_auth")
    assert_true("auth_hint=true" in html_src, "index.html checks cookie auth_hint=true")

    print(f"\n=== Assets Results: {tests_passed}/{tests_passed + tests_failed} Passed, {tests_failed} Failed ===\n")

if __name__ == "__main__":
    run_tests()

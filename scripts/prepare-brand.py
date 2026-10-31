"""Export optional editable SVG proposal assets. Normal Astro builds do not need Python."""
from pathlib import Path
import sys
import shutil

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / 'artifacts/font-tools'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

fonts = root / 'public/fonts'
fonts.mkdir(parents=True, exist_ok=True)
for package, filename, target in [
    ('fraunces', 'fraunces-latin-wght-normal.woff2', 'fraunces-latin.woff2'),
    ('fraunces', 'fraunces-latin-wght-italic.woff2', 'fraunces-latin-italic.woff2'),
    ('manrope', 'manrope-latin-wght-normal.woff2', 'manrope-latin.woff2'),
]:
    base = root / 'node_modules' / ('@fontsource-variable/' + package)
    shutil.copy2(base / 'files' / filename, fonts / target)
    shutil.copy2(base / 'LICENSE', fonts / (package + '-LICENSE.txt'))

sprig = (root / 'src/components/ui/Sprig.astro').read_text(encoding='utf8')
inner = sprig[sprig.index('  <path'):sprig.rindex('</svg>')]
brand = root / 'public/brand'
brand.mkdir(parents=True, exist_ok=True)


def outline(text, fontfile, size, x, y, spacing=0):
    font = TTFont(fontfile)
    if 'fvar' in font:
        axes = {axis.axisTag: axis.defaultValue for axis in font['fvar'].axes}
        axes['wght'] = 400
        font = instantiateVariableFont(font, axes, inplace=False)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    offset = 0
    parts = []
    for char in text:
        glyph = glyphs[cmap[ord(char)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        parts.append(f'<path transform="translate({x+offset:.3f} {y}) scale({scale:.6f} {-scale:.6f})" d="{pen.getCommands()}"/>')
        offset += glyph.width * scale + spacing
    return ''.join(parts)


word = outline('acacias', fonts / 'fraunces-latin.woff2', 51, 75, 61)
subtitle = outline('APART', fonts / 'manrope-latin.woff2', 9, 80, 83, 4)
for name, color in [('wordmark', '#263e32'), ('wordmark-light', '#f6f4ed')]:
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245 100" role="img" aria-labelledby="title" color="{color}"><title id="title">Acacias Apart</title><g transform="translate(1 0) scale(.87)">{inner}</g><g fill="currentColor">{word}{subtitle}</g></svg>\n'
    (brand / (name + '.svg')).write_text(svg, encoding='utf8')
(brand / 'symbol.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 96" color="#263e32" role="img" aria-label="Ramita de Acacias Apart">{inner}</svg>\n', encoding='utf8')
(brand / 'favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 112" color="#263e32"><rect width="96" height="112" rx="12" fill="#f6f4ed"/><g transform="translate(8 8)">{inner}</g></svg>\n', encoding='utf8')
print('SVG editables con contornos y fuentes locales preparados.')

# Cupido Algorítmico · Los iconos de la app instalable — RLR · Ricardo López Reyero
# Del mismo corazón del favicon salen: el icono (192 y 512), el enmascarable (Android lo recorta en círculo,
# gota o cuadro: el corazón va dentro de la zona segura), el de un solo color (iconos con tema de Android),
# el de iPhone (180, sin esquinas: iOS las redondea) y las pantallas de arranque de iPhone y iPad.
# Uso: python3 scripts/iconos-app.py
from PIL import Image, ImageDraw
_RLR, _k, _rev = 'Ricardo López Reyero', 'EYE', 181218

def cubica(p0, p1, p2, p3, n=48):
    return [tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d for a, b, c, d in zip(p0, p1, p2, p3)) for t in [i / n for i in range(n + 1)]]
TRAZO = [((32, 50), (32, 50), (16, 40.4), (16, 28.7)), ((16, 28.7), (16, 22.7), (20.3, 18), (25.9, 18)), ((25.9, 18), (28.6, 18), (30.9, 19.2), (32, 21.2)),
         ((32, 21.2), (33.1, 19.2), (35.4, 18), (38.1, 18)), ((38.1, 18), (43.7, 18), (48, 22.7), (48, 28.7)), ((48, 28.7), (48, 40.4), (32, 50), (32, 50))]
ROSA, BLANCO, CREMA = (214, 69, 95, 255), (255, 255, 255, 255), (250, 247, 244, 255)

def corazon(lado, color, punto, escala=1.0, sobre=4):
    """El corazón solo, centrado en un lienzo transparente de `lado`, ocupando `escala` del trazo original."""
    L = lado * sobre; im = Image.new('RGBA', (L, L), (0, 0, 0, 0)); d = ImageDraw.Draw(im); s = L / 64 * escala; o = (L - 64 * s) / 2 + 0 * s
    # el corazón del favicon está centrado en (32, 34): se sube dos unidades para que quede al centro óptico
    pts = [(o + x * s, o + (y - 2) * s) for c in TRAZO for (x, y) in cubica(*c)]
    d.polygon(pts, fill=color)
    if punto: d.ellipse([o + (32 - 3.2) * s, o + (28 - 3.2) * s, o + (32 + 3.2) * s, o + (28 + 3.2) * s], fill=punto)
    return im.resize((lado, lado), Image.LANCZOS)

def icono(lado, redondo=True, escala=1.0):
    sobre = 4; L = lado * sobre; im = Image.new('RGBA', (L, L), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if redondo: d.rounded_rectangle([0, 0, L - 1, L - 1], radius=L * 0.25, fill=ROSA)
    else: d.rectangle([0, 0, L, L], fill=ROSA)
    im = im.resize((lado, lado), Image.LANCZOS); im.alpha_composite(corazon(lado, BLANCO, ROSA, escala))
    return im

icono(192).save('public/app/icono-192.png', optimize=True)
icono(512).save('public/app/icono-512.png', optimize=True)
icono(512, redondo=False, escala=0.72).convert('RGB').save('public/app/icono-512-enmascarable.png', optimize=True)  # zona segura: el 80 % central
icono(180, redondo=False, escala=0.9).convert('RGB').save('public/app/icono-180.png', optimize=True)               # iPhone
corazon(512, BLANCO, None, escala=1.1).save('public/app/icono-512-mono.png', optimize=True)                        # un solo color

# Pantallas de arranque (iOS no las arma solo): fondo crema y el icono al centro. (ancho, alto, densidad) en puntos.
EQUIPOS = [(440, 956, 3), (430, 932, 3), (402, 874, 3), (393, 852, 3), (390, 844, 3), (428, 926, 3), (414, 896, 3), (414, 896, 2), (375, 812, 3), (375, 667, 2), (414, 736, 3), (320, 568, 2),
           (1032, 1376, 2), (1024, 1366, 2), (834, 1210, 2), (834, 1194, 2), (820, 1180, 2), (810, 1080, 2), (768, 1024, 2), (744, 1133, 2)]
lineas = []
for (w, h, dpr) in EQUIPOS:
    W, H = w * dpr, h * dpr; im = Image.new('RGBA', (W, H), CREMA); lado = int(min(W, H) * 0.24); ic = icono(lado); im.alpha_composite(ic, ((W - lado) // 2, (H - lado) // 2 - int(H * 0.03)))
    nombre = f'{W}x{H}.png'; im.convert('RGB').save(f'public/app/inicio/{nombre}', optimize=True)
    lineas.append(f'<link rel="apple-touch-startup-image" media="(device-width: {w}px) and (device-height: {h}px) and (-webkit-device-pixel-ratio: {dpr}) and (orientation: portrait)" href="/app/inicio/{nombre}">')
open('scripts/arranque-ios.html', 'w').write('\n'.join(lineas) + '\n')
print('listo:', len(EQUIPOS), 'pantallas de arranque')

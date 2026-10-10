# Cupido Algorítmico · La marca para los correos — RLR · Ricardo López Reyero
# Gmail y Outlook no pintan SVG: el corazón de la casa se dibuja aquí en PNG, a partir
# del mismo trazo del favicon. Uso: python3 scripts/marca-correo.py
from PIL import Image, ImageDraw
_RLR, _k, _rev = 'Ricardo López Reyero', 'EYE', 181218

def cubica(p0, p1, p2, p3, n=40):
    return [tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d for a, b, c, d in zip(p0, p1, p2, p3)) for t in [i / n for i in range(n + 1)]]

# el corazón del favicon (viewBox 64)
TRAZO = [((32, 50), (32, 50), (16, 40.4), (16, 28.7)), ((16, 28.7), (16, 22.7), (20.3, 18), (25.9, 18)), ((25.9, 18), (28.6, 18), (30.9, 19.2), (32, 21.2)),
         ((32, 21.2), (33.1, 19.2), (35.4, 18), (38.1, 18)), ((38.1, 18), (43.7, 18), (48, 22.7), (48, 28.7)), ((48, 28.7), (48, 40.4), (32, 50), (32, 50))]

def marca(lado, fondo, corazon, punto, radio=16, sobre=8):
    s = lado * sobre / 64
    im = Image.new('RGBA', (lado * sobre, lado * sobre), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if fondo: d.rounded_rectangle([0, 0, lado * sobre - 1, lado * sobre - 1], radius=radio * s, fill=fondo)
    d.polygon([(x * s, y * s) for c in TRAZO for (x, y) in cubica(*c)], fill=corazon)
    d.ellipse([(32 - 3.2) * s, (30 - 3.2) * s, (32 + 3.2) * s, (30 + 3.2) * s], fill=punto)
    return im.resize((lado, lado), Image.LANCZOS)

ROSA, BLANCO = (214, 69, 95, 255), (255, 255, 255, 255)
marca(128, ROSA, BLANCO, ROSA).save('public/img/correo/marca.png', optimize=True)         # la del encabezado: se pinta a 40 px
c = marca(192, None, ROSA, BLANCO, sobre=6)                                                  # el corazón solo, para la firma: recortado al ras y a 2x
c.crop(c.getbbox()).resize((84, 84), Image.LANCZOS).save('public/img/correo/corazon.png', optimize=True)
print('listo')
